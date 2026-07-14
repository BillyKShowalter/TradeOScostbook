import { prisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { CostDatabaseService } from "../cost-database/service";
import { AssembliesDatabaseService } from "../assemblies-database/service";
import { applyOverhead, sellPrice } from "./formulas";
import { canTransitionEstimateStatus, normalizeEstimateStatus } from "../../domain";
import {
  AddLineItemInput,
  CreateEstimateInput,
  EstimateDTO,
  EstimateLineItemDTO,
  SetPricingModeInput,
} from "./types";

// Estimate Engine module: applies contractor-entered quantities to selected
// cost items/assemblies, then sequences Labor -> Material -> Equipment ->
// Overhead -> Profit per Deliverable 3 ("Estimating Formula Engine").
export class EstimateEngineService {
  private readonly costDatabase = new CostDatabaseService();
  private readonly assembliesDatabase = new AssembliesDatabaseService();

  async create(input: CreateEstimateInput): Promise<EstimateDTO> {
    const project = await prisma.project.findFirst({ where: { id: input.projectId, orgId: input.orgId } });
    if (!project) throw new ApiError(404, `Project ${input.projectId} not found`);

    const priorVersions = await prisma.estimate.count({ where: { projectId: input.projectId } });
    const row = await prisma.estimate.create({
      data: {
        orgId: input.orgId,
        projectId: input.projectId,
        version: priorVersions + 1,
        overheadPct: input.overheadPct ?? 0,
      },
    });
    return toEstimateDTO(row);
  }

  async getById(id: string, orgId?: string): Promise<EstimateDTO & { lineItems: EstimateLineItemDTO[] }> {
    const row = await prisma.estimate.findFirst({ where: { id, orgId }, include: { lineItems: { orderBy: { sortOrder: "asc" } } } });
    if (!row) throw new ApiError(404, `Estimate ${id} not found`);
    return { ...toEstimateDTO(row), lineItems: row.lineItems.map(toLineItemDTO) };
  }

  async listByProject(projectId: string, orgId?: string): Promise<EstimateDTO[]> {
    const rows = await prisma.estimate.findMany({ where: { projectId, orgId }, orderBy: { version: "desc" } });
    return rows.map(toEstimateDTO);
  }

  /** Creates the next project version as a draft, copying line-item snapshots and pricing settings. */
  async duplicateFromVersion(sourceEstimateId: string, orgId?: string): Promise<EstimateDTO & { lineItems: EstimateLineItemDTO[] }> {
    const source = await prisma.estimate.findFirst({
      where: { id: sourceEstimateId, orgId },
      include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    });
    if (!source) throw new ApiError(404, `Estimate ${sourceEstimateId} not found`);

    const priorVersions = await prisma.estimate.count({ where: { projectId: source.projectId } });
    const row = await prisma.estimate.create({
      data: {
        orgId: source.orgId,
        projectId: source.projectId,
        version: priorVersions + 1,
        status: "draft",
        overheadPct: source.overheadPct,
        profitPct: source.profitPct,
        targetMarginPct: source.targetMarginPct,
        subtotalCost: source.subtotalCost,
        totalPrice: source.totalPrice,
        lineItems: {
          create: source.lineItems.map((lineItem) => ({
            costItemId: lineItem.costItemId,
            assemblyId: lineItem.assemblyId,
            description: lineItem.description,
            quantity: lineItem.quantity,
            unitOfMeasure: lineItem.unitOfMeasure,
            unitCost: lineItem.unitCost,
            lineCost: lineItem.lineCost,
            sortOrder: lineItem.sortOrder,
          })),
        },
      },
    });

    return this.getById(row.id, orgId);
  }

  /** Adds a line item, snapshotting its unit cost at the moment it's added. */
  async addLineItem(input: AddLineItemInput): Promise<EstimateLineItemDTO> {
    await this.assertDraft(input.estimateId, input.orgId);
    if (!input.costItemId && !input.assemblyId) {
      throw new ApiError(400, "Either costItemId or assemblyId is required");
    }
    if (input.costItemId && input.assemblyId) {
      throw new ApiError(400, "Provide exactly one of costItemId or assemblyId, not both");
    }

    let unitOfMeasure: string;
    let unitCost: number;
    let description = input.description ?? "";

    if (input.costItemId) {
      const item = await prisma.costItem.findFirst({ where: { id: input.costItemId, orgId: input.orgId } });
      if (!item) throw new ApiError(404, `CostItem ${input.costItemId} not found`);
      const breakdown = await this.costDatabase.getUnitCost(input.costItemId, input.quantity, undefined, input.orgId);
      unitOfMeasure = item.unitOfMeasure;
      unitCost = breakdown.totalUnitCost;
      description = description || item.name;
    } else {
      const assembly = await prisma.assembly.findFirst({ where: { id: input.assemblyId, orgId: input.orgId } });
      if (!assembly) throw new ApiError(404, `Assembly ${input.assemblyId} not found`);
      const result = await this.assembliesDatabase.getAssemblyUnitCost(input.assemblyId as string, undefined, new Set(), input.orgId);
      unitOfMeasure = assembly.unitOfMeasure;
      unitCost = result.unitCost;
      description = description || assembly.name;
    }

    const lineCost = round2(unitCost * input.quantity);
    const maxSortOrder = await prisma.estimateLineItem.aggregate({
      where: { estimateId: input.estimateId },
      _max: { sortOrder: true },
    });

    const row = await prisma.estimateLineItem.create({
      data: {
        estimateId: input.estimateId,
        costItemId: input.costItemId,
        assemblyId: input.assemblyId,
        description,
        quantity: input.quantity,
        unitOfMeasure,
        unitCost,
        lineCost,
        sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1,
      },
    });

    await this.recalculate(input.estimateId, input.orgId);
    return toLineItemDTO(row);
  }

  async removeLineItem(lineItemId: string, orgId?: string): Promise<void> {
    const lineItem = await prisma.estimateLineItem.findUnique({ where: { id: lineItemId }, include: { estimate: true } });
    if (!lineItem) throw new ApiError(404, `EstimateLineItem ${lineItemId} not found`);
    if (orgId && lineItem.estimate.orgId !== orgId) throw new ApiError(404, `EstimateLineItem ${lineItemId} not found`);
    await this.assertDraft(lineItem.estimateId, orgId);
    await prisma.estimateLineItem.delete({ where: { id: lineItemId } });
    await this.recalculate(lineItem.estimateId, orgId);
  }

  async setPricingMode(input: SetPricingModeInput): Promise<EstimateDTO> {
    await this.assertDraft(input.estimateId, input.orgId);
    await prisma.estimate.update({
      where: { id: input.estimateId },
      data: {
        profitPct: input.mode === "markup" ? input.markupPct ?? 0 : 0,
        targetMarginPct: input.mode === "targetMargin" ? input.targetMarginPct : null,
      },
    });
    return this.recalculate(input.estimateId, input.orgId);
  }

  /** Re-sums line items and re-applies overhead + profit. Called after any line item or pricing-mode change. */
  async recalculate(estimateId: string, orgId?: string): Promise<EstimateDTO> {
    const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, orgId }, include: { lineItems: true } });
    if (!estimate) throw new ApiError(404, `Estimate ${estimateId} not found`);

    const jobCost = estimate.lineItems.reduce((sum, li) => sum + Number(li.lineCost), 0);
    const totalCost = applyOverhead(jobCost, 0, Number(estimate.overheadPct));

    const totalPrice =
      estimate.targetMarginPct != null
        ? sellPrice({ totalCost, mode: "targetMargin", targetMarginPct: Number(estimate.targetMarginPct) })
        : sellPrice({ totalCost, mode: "markup", markupPct: Number(estimate.profitPct) });

    const row = await prisma.estimate.update({
      where: { id: estimateId },
      data: { subtotalCost: round2(jobCost), totalPrice },
    });
    return toEstimateDTO(row);
  }

  /** Locks the estimate so its line-item unit_cost snapshots and total never silently change again. */
  async finalize(estimateId: string, orgId?: string): Promise<EstimateDTO> {
    await this.recalculate(estimateId, orgId);
    const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, orgId } });
    if (!estimate) throw new ApiError(404, `Estimate ${estimateId} not found`);
    const currentStatus = normalizeEstimateStatus(estimate.status);
    if (!canTransitionEstimateStatus(currentStatus, "ready")) {
      throw new ApiError(409, `Estimate ${estimateId} cannot transition from ${currentStatus} to ready`);
    }
    const row = await prisma.estimate.update({ where: { id: estimateId }, data: { status: "ready" } });
    return toEstimateDTO(row);
  }

  private async assertDraft(estimateId: string, orgId?: string): Promise<void> {
    const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, orgId } });
    if (!estimate) throw new ApiError(404, `Estimate ${estimateId} not found`);
    if (normalizeEstimateStatus(estimate.status) !== "draft") {
      throw new ApiError(409, `Estimate ${estimateId} is not in draft status and can no longer be modified`);
    }
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toEstimateDTO(row: {
  id: string;
  orgId: string | null;
  projectId: string;
  version: number;
  status: string;
  overheadPct: unknown;
  profitPct: unknown;
  targetMarginPct: unknown;
  subtotalCost: unknown;
  totalPrice: unknown;
}): EstimateDTO {
  return {
    id: row.id,
    orgId: row.orgId,
    projectId: row.projectId,
    version: row.version,
    status: normalizeEstimateStatus(row.status),
    overheadPct: Number(row.overheadPct),
    profitPct: Number(row.profitPct),
    targetMarginPct: row.targetMarginPct != null ? Number(row.targetMarginPct) : null,
    subtotalCost: Number(row.subtotalCost),
    totalPrice: Number(row.totalPrice),
  };
}

function toLineItemDTO(row: {
  id: string;
  estimateId: string;
  costItemId: string | null;
  assemblyId: string | null;
  description: string;
  quantity: unknown;
  unitOfMeasure: string;
  unitCost: unknown;
  lineCost: unknown;
  sortOrder: number;
}): EstimateLineItemDTO {
  return {
    id: row.id,
    estimateId: row.estimateId,
    costItemId: row.costItemId,
    assemblyId: row.assemblyId,
    description: row.description,
    quantity: Number(row.quantity),
    unitOfMeasure: row.unitOfMeasure,
    unitCost: Number(row.unitCost),
    lineCost: Number(row.lineCost),
    sortOrder: row.sortOrder,
  };
}
