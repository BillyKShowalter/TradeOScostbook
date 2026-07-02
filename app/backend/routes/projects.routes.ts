import { Router } from "express";
import { customersController, projectsController } from "../controllers/projects.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const customersRouter = Router();
customersRouter.get("/", asyncHandler(customersController.list));
customersRouter.post("/", asyncHandler(customersController.create));
customersRouter.get("/:id", asyncHandler(customersController.getById));

export const projectsRouter = Router();
projectsRouter.get("/", asyncHandler(projectsController.list));
projectsRouter.post("/", asyncHandler(projectsController.create));
projectsRouter.get("/:id", asyncHandler(projectsController.getById));
projectsRouter.patch("/:id/status", asyncHandler(projectsController.updateStatus));
