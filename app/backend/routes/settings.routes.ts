import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const settingsRouter = Router();

settingsRouter.get("/", asyncHandler(settingsController.get));
settingsRouter.patch("/", asyncHandler(settingsController.update));
