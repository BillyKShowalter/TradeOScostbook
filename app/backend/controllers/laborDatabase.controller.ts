import { Request, Response } from "express";
import { z } from "zod";
import { LaborDatabaseService } from "../../modules/labor-database/service";
import { requireOrgId } from "../requestContext";

const service = new LaborDatabaseService();

const createSchema = z.object({
  orgId: z.string().uuid().optional(),
  trade: z.string().min(1),
  baseHourlyRate: z.number().positive(),
  burdenPct: z.number().min(0).optional(),
  regionId: z.string().uuid().optional(),
});

export const laborDatabaseController = {
  async list(req: Request, res: Response) {
    res.json(await service.list(requireOrgId(req)));
  },
  async getById(req: Request, res: Response) {
    res.json(await service.getById(req.params.id, requireOrgId(req)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await service.create({ ...createSchema.parse(req.body), orgId: requireOrgId(req) }));
  },
  async update(req: Request, res: Response) {
    res.json(await service.update(req.params.id, createSchema.partial().parse(req.body), requireOrgId(req)));
  },
  async remove(req: Request, res: Response) {
    await service.delete(req.params.id, requireOrgId(req));
    res.status(204).send();
  },
  async calculate(req: Request, res: Response) {
    const schema = z.object({ laborRateId: z.string().uuid(), quantity: z.coerce.number().positive(), productionRate: z.coerce.number().positive() });
    res.json(await service.calculateLaborCost(schema.parse(req.body), requireOrgId(req)));
  },
};
