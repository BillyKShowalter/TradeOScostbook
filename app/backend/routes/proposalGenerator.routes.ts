import { Router } from "express";
import { proposalGeneratorController as ctrl } from "../controllers/proposalGenerator.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const proposalGeneratorRouter = Router();

// Estimate id is the resource being turned into a proposal; POST because
// generation can take params (template options) in the body.
proposalGeneratorRouter.post("/:id/generate", asyncHandler(ctrl.generate));
