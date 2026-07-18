import { prisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { CostDatabaseService } from "../cost-database/service";
import { round2 } from "../estimate-engine/formulas";
import {
  AddAssemblyItemInput,
  AssemblyDTO,
  AssemblyUnitCostResult,
  CreateAssemblyInput,
  UpdateAssemblyInput,
} from "./types";

// Assemblies Database module: composes multiple cost items (and, recursively,
// other assemblies) into a single sellable unit (Deliverable 4 — assemblies
// and assembly_items tables). Pricing is never duplicated, only referenced —
// see the Architecture doc's Closing recommendation on this point.
export class AssembliesDatabaseService {
  private readonly costDatabase = new CostDatabaseService();

  async list(orgId?: string): Promise<AssemblyDTO[]> {
    const rows = await prisma.assembly.findMany({ where: orgId ? { orgId } : undefined, orderBy: { name: "asc" } });
    return rows.map(toDTO);
  }

  async search(query: string, orgId?: string): Promise<AssemblyDTO[]> {
    const rows = await prisma.assembly.findMany({
      where: {
        orgId,
        isActive: true,
        OR: [{ name: { contains: query, mode: "insensitive" } }, { code: { contains: query, mode: "insensitive" } }],
      },
      take: 50,
    });
    return rows.map(toDTO);
  }

  /** Common starting-point assemblies an org has marked for quick reuse on estimates. */
  async listTemplates(orgId?: string): Promise<AssemblyDTO[]> {
    const rows = await prisma.assembly.findMany({
      where: { orgId, isTemplate: true, isActive: true },
      orderBy: { name: "asc" },
    });
    return rows.map(toDTO);
  }

  async getById(id: string, orgId?: string): Promise<AssemblyDTO> {
    const row = await prisma.assembly.findFirst({ where: { id, orgId } });
    if (!row) throw new ApiError(404, `Assembly ${id} not found`);
    return toDTO(row);
  }

  async create(input: CreateAssemblyInput): Promise<AssemblyDTO> {
    const row = await prisma.assembly.create({
      data: {
        orgId: input.orgId,
        code: input.code,
        name: input.name,
        unitOfMeasure: input.unitOfMeasure,
        description: input.description,
        isTemplate: input.isTemplate ?? false,
      },
    });
    return toDTO(row);
  }

  async update(id: string, input: UpdateAssemblyInput, orgId?: string): Promise<AssemblyDTO> {
    await this.assertExists(id, orgId);
    const row = await prisma.assembly.update({
      where: { id },
      data: {
        code: input.code,
        name: input.name,
        isTemplate: input.isTemplate,
        unitOfMeasure: input.unitOfMeasure,
        description: input.description,
        isActive: input.isActive,
      },
    });
    return toDTO(row);
  }

  async delete(id: string, orgId?: string): Promise<void> {
    await this.assertExists(id, orgId);
    await prisma.assembly.update({ where: { id }, data: { isActive: false } });
  }

  async addAssemblyItem(input: AddAssemblyItemInput) {
    if (!input.costItemId && !input.childAssemblyId) {
      throw new ApiError(400, "Either costItemId or childAssemblyId is required");
    }
    if (input.costItemId && input.childAssemblyId) {
      throw new ApiError(400, "Provide exactly one of costItemId or childAssemblyId, not both");
    }
    await this.assertExists(input.assemblyId, input.orgId);
    if (input.costItemId) {
      const costItem = await prisma.costItem.findFirst({ where: { id: input.costItemId, orgId: input.orgId } });
      if (!costItem) throw new ApiError(404, `CostItem ${input.costItemId} not found`);
    }
    if (input.childAssemblyId) {
      await this.assertExists(input.childAssemblyId, input.orgId);
      await this.assertNoCycle(input.assemblyId, input.childAssemblyId, input.orgId);
    }
    return prisma.assemblyItem.create({
      data: {
        assemblyId: input.assemblyId,
        costItemId: input.costItemId,
        childAssemblyId: input.childAssemblyId,
        quantityPerUnit: input.quantityPerUnit,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  async removeAssemblyItem(assemblyItemId: string, orgId?: string): Promise<void> {
    const row = await prisma.assemblyItem.findFirst({ where: { id: assemblyItemId, assembly: orgId ? { orgId } : undefined } });
    if (!row) throw new ApiError(404, `AssemblyItem ${assemblyItemId} not found`);
    await prisma.assemblyItem.delete({ where: { id: assemblyItemId } });
  }

  /**
   * Recursively resolves an assembly's unit cost by summing its assembly_items,
   * each multiplied by quantity_per_unit, descending into child assemblies.
   * Guards against circular references via a visited-set, matching the
   * cycle guard enforced at write time in addAssemblyItem/assertNoCycle.
   */
  async getAssemblyUnitCost(assemblyId: string, regionId?: string, visited: Set<string> = new Set(), orgId?: string): Promise<AssemblyUnitCostResult> {
    if (visited.has(assemblyId)) {
      throw new ApiError(409, `Circular assembly reference detected at assembly ${assemblyId}`);
    }
    visited.add(assemblyId);

    const items = await prisma.assemblyItem.findMany({
      where: { assemblyId, assembly: orgId ? { orgId } : undefined },
      orderBy: { sortOrder: "asc" },
    });
    let unitCost = 0;

    for (const item of items) {
      const qty = Number(item.quantityPerUnit);
      if (item.costItemId) {
        const breakdown = await this.costDatabase.getUnitCost(item.costItemId, 1, regionId, orgId);
        unitCost += breakdown.totalUnitCost * qty;
      } else if (item.childAssemblyId) {
        const child = await this.getAssemblyUnitCost(item.childAssemblyId, regionId, visited, orgId);
        unitCost += child.unitCost * qty;
      }
    }

    return { unitCost: round2(unitCost), componentCount: items.length };
  }

  private async assertNoCycle(assemblyId: string, proposedChildId: string, orgId?: string): Promise<void> {
    if (assemblyId === proposedChildId) {
      throw new ApiError(409, "An assembly cannot contain itself");
    }
    // Walk the proposed child's descendants; if we encounter assemblyId, adding
    // this edge would create a cycle.
    const stack = [proposedChildId];
    const seen = new Set<string>();
    while (stack.length) {
      const current = stack.pop() as string;
      if (seen.has(current)) continue;
      seen.add(current);
      const children = await prisma.assemblyItem.findMany({
        where: { assemblyId: current, childAssemblyId: { not: null }, assembly: orgId ? { orgId } : undefined },
        select: { childAssemblyId: true },
      });
      for (const c of children) {
        if (c.childAssemblyId === assemblyId) {
          throw new ApiError(409, "Adding this child assembly would create a circular reference");
        }
        if (c.childAssemblyId) stack.push(c.childAssemblyId);
      }
    }
  }

  private async assertExists(id: string, orgId?: string): Promise<void> {
    const exists = await prisma.assembly.findFirst({ where: { id, orgId } });
    if (!exists) throw new ApiError(404, `Assembly ${id} not found`);
  }
}

function toDTO(row: {
  id: string;
  orgId: string | null;
  code: string;
  name: string;
  unitOfMeasure: string;
  description: string | null;
  isTemplate: boolean;
  isActive: boolean;
}): AssemblyDTO {
  return row;
}
