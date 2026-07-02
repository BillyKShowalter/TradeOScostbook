import { Router } from "express";
import { adminUiController } from "../controllers/adminUi.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { adminPricingUiController } from "../controllers/adminPricingUi.controller";

export const adminUiRouter = Router();

adminUiRouter.get("/", asyncHandler(adminPricingUiController.show));
adminUiRouter.get("/pricing-history", asyncHandler(adminPricingUiController.show));
adminUiRouter.post("/pricing-history", asyncHandler(adminPricingUiController.submit));
adminUiRouter.get("/assets/admin.css", asyncHandler(adminPricingUiController.stylesheet));
adminUiRouter.get("/member-history", asyncHandler(adminUiController.showMembershipHistoryForm));
adminUiRouter.post("/member-history", asyncHandler(adminUiController.submitMembershipHistoryForm));
