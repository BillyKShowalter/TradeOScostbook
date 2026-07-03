import { Request, Response } from "express";
import { z } from "zod";
import { AIEstimateAssistService } from "../../modules/ai-estimate-assist/service";
import { requireOrgId } from "../requestContext";

const service = new AIEstimateAssistService();

export const aiEstimateAssistController = {
  async generate(req: Request, res: Response) {
    const schema = z.object({
      scopeOfWork: z.string().trim().optional().default(""),
    });
    const body = schema.parse(req.body);
    res.json(
      await service.generateSuggestions({
        estimateId: req.params.id,
        orgId: requireOrgId(req),
        scopeOfWork: body.scopeOfWork,
      })
    );
  },

  async apply(req: Request, res: Response) {
    const schema = z.object({
      suggestions: z.array(
        z.object({
          id: z.string().min(1),
          kind: z.enum(["assembly", "costItem"]),
          title: z.string().min(1),
          quantity: z.coerce.number().positive(),
          status: z.enum(["pending", "accepted", "rejected"]),
          description: z.string().optional(),
          targetId: z.string().uuid().optional(),
          targetKind: z.enum(["assembly", "costItem"]).optional(),
        })
      ),
    });

    const body = schema.parse(req.body);
    res.json(
      await service.applySuggestions({
        estimateId: req.params.id,
        orgId: requireOrgId(req),
        suggestions: body.suggestions,
      })
    );
  },
};
