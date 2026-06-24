import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/auth";
import { databaseSession } from "./middleware/databaseSession";
import { adminUiRouter } from "./routes/adminUi.routes";
import { costDatabaseRouter } from "./routes/costDatabase.routes";
import { laborDatabaseRouter } from "./routes/laborDatabase.routes";
import { materialDatabaseRouter } from "./routes/materialDatabase.routes";
import { supplierDatabaseRouter } from "./routes/supplierDatabase.routes";
import { equipmentDatabaseRouter } from "./routes/equipmentDatabase.routes";
import { assembliesDatabaseRouter } from "./routes/assembliesDatabase.routes";
import { estimateEngineRouter } from "./routes/estimateEngine.routes";
import { proposalGeneratorRouter } from "./routes/proposalGenerator.routes";
import { adminDashboardRouter } from "./routes/adminDashboard.routes";
import { customersRouter, projectsRouter } from "./routes/projects.routes";
import { changeOrdersRouter } from "./routes/changeOrders.routes";
import { supplierIntegrationRouter } from "./routes/supplierIntegration.routes";
import { organizationProvisioningRouter } from "./routes/organizationProvisioning.routes";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/admin", adminUiRouter);

  // Platform provisioning uses a separate high-entropy credential because no
  // tenant identity exists until this transaction creates the first owner.
  app.use("/api/v1/platform", organizationProvisioningRouter);

  // requireAuth now verifies bearer JWTs and loads org membership context.
  app.use("/api/v1", requireAuth, databaseSession);

  app.use("/api/v1/cost-database", costDatabaseRouter);
  app.use("/api/v1/labor-rates", laborDatabaseRouter);
  app.use("/api/v1/materials", materialDatabaseRouter);
  app.use("/api/v1/suppliers", supplierDatabaseRouter);
  app.use("/api/v1/equipment", equipmentDatabaseRouter);
  app.use("/api/v1/assemblies", assembliesDatabaseRouter);
  app.use("/api/v1/estimates", estimateEngineRouter);
  app.use("/api/v1/proposals", proposalGeneratorRouter);
  app.use("/api/v1/admin", adminDashboardRouter);
  app.use("/api/v1/customers", customersRouter);
  app.use("/api/v1/projects", projectsRouter);
  app.use("/api/v1/change-orders", changeOrdersRouter);
  app.use("/api/v1/supplier-integrations", supplierIntegrationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
