import { Request, Response } from "express";
import { z } from "zod";
import { EstimateEngineService } from "../../modules/estimate-engine/service";
import { requireOrgId } from "../requestContext";

const service = new EstimateEngineService();

export const estimateEngineController = {
  async create(req: Request, res: Response) {
    const schema = z.object({ projectId: z.string().uuid(), overheadPct: z.coerce.number().min(0).optional() });
    res.status(201).json(await service.create({ ...schema.parse(req.body), orgId: requireOrgId(req) }));
  },

  async getById(req: Request, res: Response) {
    res.json(await service.getById(req.params.id, requireOrgId(req)));
  },

  async listByProject(req: Request, res: Response) {
    res.json(await service.listByProject(req.params.projectId, requireOrgId(req)));
  },

  async addLineItem(req: Request, res: Response) {
    const schema = z
      .object({
        costItemId: z.string().uuid().optional(),
        assemblyId: z.string().uuid().optional(),
        quantity: z.coerce.number().positive(),
        description: z.string().optional(),
      })
      .refine((v) => Boolean(v.costItemId) !== Boolean(v.assemblyId), {
        message: "Provide exactly one of costItemId or assemblyId",
      });
    const body = schema.parse(req.body);
    res.status(201).json(await service.addLineItem({ estimateId: req.params.id, ...body, orgId: requireOrgId(req) }));
  },

  async removeLineItem(req: Request, res: Response) {
    await service.removeLineItem(req.params.lineItemId, requireOrgId(req));
    res.status(204).send();
  },

  async setPricingMode(req: Request, res: Response) {
    const schema = z.object({
      mode: z.enum(["markup", "targetMargin"]),
      markupPct: z.coerce.number().min(0).optional(),
      targetMarginPct: z.coerce.number().min(0).max(99.99).optional(),
    });
    const body = schema.parse(req.body);
    res.json(await service.setPricingMode({ estimateId: req.params.id, ...body, orgId: requireOrgId(req) }));
  },

  async finalize(req: Request, res: Response) {
    res.json(await service.finalize(req.params.id, requireOrgId(req)));
  },

  async duplicate(req: Request, res: Response) {
    res.status(201).json(await service.duplicateFromVersion(req.params.id, requireOrgId(req)));
  },
};
