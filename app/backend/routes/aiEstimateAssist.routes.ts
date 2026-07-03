import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { aiEstimateAssistController as ctrl } from "../controllers/aiEstimateAssist.controller";

export const aiEstimateAssistRouter = Router();

aiEstimateAssistRouter.post("/:id/ai-suggestions", asyncHandler(ctrl.generate));
aiEstimateAssistRouter.post("/:id/ai-suggestions/apply", asyncHandler(ctrl.apply));
