import { Request, Response } from "express";
import { z } from "zod";
import { AssembliesDatabaseService } from "../../modules/assemblies-database/service";
import { requireOrgId } from "../requestContext";

const service = new AssembliesDatabaseService();

const createSchema = z.object({
  orgId: z.string().uuid().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  unitOfMeasure: z.string().min(1),
  description: z.string().optional(),
  isTemplate: z.boolean().optional(),
});

const addItemSchema = z
  .object({
    costItemId: z.string().uuid().optional(),
    childAssemblyId: z.string().uuid().optional(),
    quantityPerUnit: z.number().positive(),
    sortOrder: z.number().optional(),
  })
  .refine((v) => Boolean(v.costItemId) !== Boolean(v.childAssemblyId), {
    message: "Provide exactly one of costItemId or childAssemblyId",
  });

export const assembliesDatabaseController = {
  async list(req: Request, res: Response) {
    res.json(await service.list(requireOrgId(req)));
  },
  async search(req: Request, res: Response) {
    res.json(await service.search((req.query.q as string) ?? "", requireOrgId(req)));
  },
  async templates(req: Request, res: Response) {
    res.json(await service.listTemplates(requireOrgId(req)));
  },
  async getById(req: Request, res: Response) {
    res.json(await service.getById(req.params.id, requireOrgId(req)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await service.create({ ...createSchema.parse(req.body), orgId: requireOrgId(req) }));
  },
  async update(req: Request, res: Response) {
    res.json(await service.update(req.params.id, createSchema.partial().extend({ isActive: z.boolean().optional() }).parse(req.body), requireOrgId(req)));
  },
  async remove(req: Request, res: Response) {
    await service.delete(req.params.id, requireOrgId(req));
    res.status(204).send();
  },
  async addItem(req: Request, res: Response) {
    const body = addItemSchema.parse(req.body);
    res.status(201).json(await service.addAssemblyItem({ assemblyId: req.params.id, ...body, orgId: requireOrgId(req) }));
  },
  async removeItem(req: Request, res: Response) {
    await service.removeAssemblyItem(req.params.itemId, requireOrgId(req));
    res.status(204).send();
  },
  async getUnitCost(req: Request, res: Response) {
    res.json(await service.getAssemblyUnitCost(req.params.id, req.query.regionId as string | undefined, new Set(), requireOrgId(req)));
  },
};
