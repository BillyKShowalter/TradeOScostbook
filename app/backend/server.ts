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
import { aiEstimateAssistRouter } from "./routes/aiEstimateAssist.routes";
import { proposalGeneratorRouter } from "./routes/proposalGenerator.routes";
import { proposalsRouter } from "./routes/proposals.routes";
import { invoicesRouter } from "./routes/invoices.routes";
import { contractsRouter } from "./routes/contracts.routes";
import { adminDashboardRouter } from "./routes/adminDashboard.routes";
import { customersRouter, projectsRouter } from "./routes/projects.routes";
import { changeOrdersRouter } from "./routes/changeOrders.routes";
import { supplierIntegrationRouter } from "./routes/supplierIntegration.routes";
import { organizationProvisioningRouter } from "./routes/organizationProvisioning.routes";
import { authRouter } from "./routes/auth.routes";
import { projectIntakeRouter } from "./routes/projectIntake.routes";
import { knowledgeRuntimeRouter } from "./routes/knowledgeRuntime.routes";

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

  // Public self-serve signup/login — no bearer token exists yet, that's what
  // these issue. Rate-limited per IP (see authRateLimit) since unlike
  // platform provisioning these are meant to be reachable by anyone.
  app.use("/api/v1/auth", authRouter);

  // requireAuth now verifies bearer JWTs and loads org membership context.
  app.use("/api/v1", requireAuth, databaseSession);

  app.use("/api/v1/cost-database", costDatabaseRouter);
  app.use("/api/v1/labor-rates", laborDatabaseRouter);
  app.use("/api/v1/materials", materialDatabaseRouter);
  app.use("/api/v1/suppliers", supplierDatabaseRouter);
  app.use("/api/v1/equipment", equipmentDatabaseRouter);
  app.use("/api/v1/assemblies", assembliesDatabaseRouter);
  app.use("/api/v1/estimates", estimateEngineRouter);
  app.use("/api/v1/estimates", aiEstimateAssistRouter);
  app.use("/api/v1/proposals", proposalGeneratorRouter);
  app.use("/api/v1/proposals", proposalsRouter);
  app.use("/api/v1/invoices", invoicesRouter);
  app.use("/api/v1/contracts", contractsRouter);
  app.use("/api/v1/admin", adminDashboardRouter);
  app.use("/api/v1/customers", customersRouter);
  app.use("/api/v1/projects", projectsRouter);
  app.use("/api/v1/change-orders", changeOrdersRouter);
  app.use("/api/v1/supplier-integrations", supplierIntegrationRouter);
  app.use("/api/v1/project-intake", projectIntakeRouter);
  app.use("/api/v1/knowledge", knowledgeRuntimeRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
