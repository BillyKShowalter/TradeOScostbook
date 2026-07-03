import { PrismaClient } from "@prisma/client";
import {
  getRequestDatabaseClient,
  runWithBackgroundDatabaseSession,
  runWithDatabaseSession,
} from "../db/requestSession";
import { OrganizationProvisioningService } from "../modules/organization-provisioning/service";
import { MaterialDatabaseService } from "../modules/material-database/service";
import { SupplierIntegrationService } from "../modules/supplier-integration/service";
import { runSupplierPriceSyncJob } from "../modules/supplier-integration/worker";
import { AssembliesDatabaseService } from "../modules/assemblies-database/service";
import { ProposalsService } from "../modules/proposals/service";
import { InvoicesService } from "../modules/invoices/service";
import { ContractsService } from "../modules/contracts/service";

const appDatabaseUrl = requiredEnvironment("TEST_DATABASE_URL");
const adminDatabaseUrl = requiredEnvironment("TEST_DATABASE_ADMIN_URL");
const appClient = new PrismaClient({ datasources: { db: { url: appDatabaseUrl } } });
const adminClient = new PrismaClient({ datasources: { db: { url: adminDatabaseUrl } } });

const orgA = "10000000-0000-0000-0000-000000000001";
const orgB = "20000000-0000-0000-0000-000000000002";
const adminUser = "10000000-0000-0000-0000-000000000011";
const viewerUser = "10000000-0000-0000-0000-000000000012";
const otherUser = "20000000-0000-0000-0000-000000000021";
const estimatorUser = "10000000-0000-0000-0000-000000000013";
const adminMembership = "10000000-0000-0000-0000-000000000031";
const viewerMembership = "10000000-0000-0000-0000-000000000032";
const otherMembership = "20000000-0000-0000-0000-000000000041";
const estimatorMembership = "10000000-0000-0000-0000-000000000033";
const divisionA = "10000000-0000-0000-0000-000000000051";
const divisionB = "20000000-0000-0000-0000-000000000052";
const materialA = "10000000-0000-0000-0000-000000000061";
const supplierA = "10000000-0000-0000-0000-000000000071";
const materialForSupplierQueue = "10000000-0000-0000-0000-000000000072";
const projectA = "10000000-0000-0000-0000-000000000081";
const projectB = "20000000-0000-0000-0000-000000000082";
const projectTaskA = "10000000-0000-0000-0000-000000000083";
const estimateA = "10000000-0000-0000-0000-000000000091";
const assemblyForEstimateA = "10000000-0000-0000-0000-000000000092";

describe("live organization row-level security", () => {
  beforeAll(async () => {
    await adminClient.organization.createMany({
      data: [
        { id: orgA, name: "Org A" },
        { id: orgB, name: "Org B" },
      ],
    });
    await adminClient.appUser.createMany({
      data: [
        { id: adminUser, authSubject: "rls-admin", email: "rls-admin@example.com" },
        { id: viewerUser, authSubject: "rls-viewer", email: "rls-viewer@example.com" },
        { id: otherUser, authSubject: "rls-other", email: "rls-other@example.com" },
        { id: estimatorUser, authSubject: "rls-estimator", email: "rls-estimator@example.com" },
      ],
    });
    await adminClient.organizationMembership.createMany({
      data: [
        { id: adminMembership, orgId: orgA, userId: adminUser, role: "admin", status: "active" },
        { id: viewerMembership, orgId: orgA, userId: viewerUser, role: "viewer", status: "active" },
        { id: otherMembership, orgId: orgB, userId: otherUser, role: "owner", status: "active" },
        { id: estimatorMembership, orgId: orgA, userId: estimatorUser, role: "estimator", status: "active" },
      ],
    });
    await adminClient.division.createMany({
      data: [
        { id: divisionA, orgId: orgA, code: "A", name: "Org A Division" },
        { id: divisionB, orgId: orgB, code: "B", name: "Org B Division" },
      ],
    });
    await adminClient.supplier.create({
      data: { id: supplierA, orgId: orgA, name: "Acme Building Supply" },
    });
    await adminClient.material.create({
      data: {
        id: materialA,
        orgId: orgA,
        name: "Ready Mix Concrete",
        unitOfMeasure: "CY",
        unitCost: 150,
        wasteFactorPct: 0,
      },
    });
    await adminClient.material.create({
      data: {
        id: materialForSupplierQueue,
        orgId: orgA,
        name: "Rebar, #4",
        unitOfMeasure: "LF",
        unitCost: 150,
        wasteFactorPct: 0,
        supplierId: supplierA,
      },
    });
    await adminClient.organizationMembershipAudit.create({
      data: {
        orgId: orgA,
        membershipId: viewerMembership,
        userId: viewerUser,
        action: "created",
        actorUserId: adminUser,
        actorRole: "admin",
        afterState: { membershipId: viewerMembership, role: "viewer", status: "active" },
      },
    });
    await adminClient.project.createMany({
      data: [
        { id: projectA, orgId: orgA, name: "Org A Project" },
        { id: projectB, orgId: orgB, name: "Org B Project" },
      ],
    });
    await adminClient.projectTask.create({
      data: {
        id: projectTaskA,
        projectId: projectA,
        title: "Initial mobilization",
        status: "todo",
        priority: "medium",
      },
    });
    await adminClient.assembly.create({
      data: { id: assemblyForEstimateA, orgId: orgA, code: "RLS-TEST-ASM", name: "RLS Test Assembly", unitOfMeasure: "CY" },
    });
    await adminClient.estimate.create({
      data: {
        id: estimateA,
        orgId: orgA,
        projectId: projectA,
        lineItems: {
          create: [{ assemblyId: assemblyForEstimateA, description: "Excavation", quantity: 10, unitOfMeasure: "CY", unitCost: 20, lineCost: 200 }],
        },
        subtotalCost: 200,
        totalPrice: 200,
      },
    });
  });

  afterAll(async () => {
    await Promise.all([appClient.$disconnect(), adminClient.$disconnect()]);
  });

  it("allows same-organization reads", async () => {
    const rows = await inSession(adminUser, orgA, "admin", async () => {
      return currentTransaction().division.findMany({ orderBy: { code: "asc" } });
    });

    expect(rows.map((row) => row.id)).toEqual([divisionA]);
  });

  it("hides cross-organization reads", async () => {
    const row = await inSession(adminUser, orgA, "admin", async () => {
      return currentTransaction().division.findUnique({ where: { id: divisionB } });
    });

    expect(row).toBeNull();
  });

  it("enforces project task visibility and write permissions", async () => {
    const visibleTasks = await inSession(adminUser, orgA, "admin", async () =>
      currentTransaction().projectTask.findMany({ orderBy: { createdAt: "asc" } })
    );
    expect(visibleTasks.map((row) => row.id)).toEqual([projectTaskA]);

    const hiddenTask = await inSession(otherUser, orgB, "owner", async () =>
      currentTransaction().projectTask.findUnique({ where: { id: projectTaskA } })
    );
    expect(hiddenTask).toBeNull();

    await expect(
      inSession(viewerUser, orgA, "viewer", async () =>
        currentTransaction().projectTask.create({
          data: {
            projectId: projectA,
            title: "Viewer blocked task",
            status: "todo",
            priority: "low",
          },
        })
      )
    ).rejects.toThrow();
  });

  it("rejects cross-organization writes", async () => {
    await expect(
      inSession(adminUser, orgA, "admin", async () => {
        return currentTransaction().division.create({
          data: { orgId: orgB, code: "BLOCKED", name: "Cross-org write" },
        });
      })
    ).rejects.toThrow();
  });

  it("rejects viewer writes", async () => {
    await expect(
      inSession(viewerUser, orgA, "viewer", async () => {
        return currentTransaction().division.create({
          data: { orgId: orgA, code: "VIEWER", name: "Viewer write" },
        });
      })
    ).rejects.toThrow();
  });

  it("allows admins to inspect membership history", async () => {
    const rows = await inSession(adminUser, orgA, "admin", async () => {
      return currentTransaction().organizationMembershipAudit.findMany({
        where: { membershipId: viewerMembership },
      });
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ orgId: orgA, action: "created", actorRole: "admin" });
  });

  it("provisions a new organization and initial owner atomically", async () => {
    const result = await new OrganizationProvisioningService().provision({
      organizationName: "Provisioned Org",
      regionCode: "US-IN-INDIANAPOLIS",
      owner: {
        authSubject: "provisioned-owner",
        email: "PROVISIONED-OWNER@example.com",
        fullName: "Provisioned Owner",
      },
    });

    expect(result.organization.name).toBe("Provisioned Org");
    expect(result.owner).toMatchObject({ email: "provisioned-owner@example.com", role: "owner", status: "active" });
    expect(await adminClient.organizationMembership.count({ where: { orgId: result.organization.id } })).toBe(1);
    expect(await adminClient.organizationMembershipAudit.count({ where: { orgId: result.organization.id } })).toBe(1);

    const visibleOrganization = await inSession(result.owner.userId, result.organization.id, "owner", async () => {
      return currentTransaction().organization.findUnique({ where: { id: result.organization.id } });
    });
    expect(visibleOrganization?.name).toBe("Provisioned Org");
  });

  it("derives background job scope and role from active membership", async () => {
    const rows = await runWithBackgroundDatabaseSession(
      appClient,
      { jobName: "pricing-refresh", orgId: orgA, userId: viewerUser },
      async () => currentTransaction().division.findMany()
    );

    expect(rows.map((row) => row.id)).toEqual([divisionA]);
    await expect(
      runWithBackgroundDatabaseSession(
        appClient,
        { jobName: "pricing-refresh", orgId: orgA, userId: viewerUser },
        async () => currentTransaction().division.create({
          data: { orgId: orgA, code: "JOB", name: "Background viewer write" },
        })
      )
    ).rejects.toThrow();
  });

  it("runs a supplier price sync worker through the background-session helper and enforces queue review permissions", async () => {
    const fetchFeed = jest.fn().mockResolvedValue([{ materialId: materialForSupplierQueue, proposedUnitCost: 175 }]);

    // A viewer-role background identity may run the job but its proposal is
    // blocked at insert time by the supplier_price_updates write policy.
    await expect(
      runSupplierPriceSyncJob(
        { orgId: orgA, userId: viewerUser, supplierId: supplierA },
        new SupplierIntegrationService(fetchFeed)
      )
    ).rejects.toThrow();

    // An estimator can write (enqueue) but cannot administer (approve/reject).
    const syncResult = await runSupplierPriceSyncJob(
      { orgId: orgA, userId: estimatorUser, supplierId: supplierA },
      new SupplierIntegrationService(fetchFeed)
    );
    expect(syncResult).toEqual({ proposed: 1, skipped: 0 });

    const queued = await inSession(adminUser, orgA, "admin", async () =>
      currentTransaction().supplierPriceUpdate.findFirst({ where: { materialId: materialForSupplierQueue, status: "pending" } })
    );
    expect(queued).toMatchObject({ proposedUnitCost: expect.anything(), status: "pending" });
    if (!queued) throw new Error("expected a queued supplier price update");

    await expect(
      inSession(estimatorUser, orgA, "estimator", async () =>
        new SupplierIntegrationService().approve(queued.id, orgA, { userId: estimatorUser, orgId: orgA, role: "estimator" })
      )
    ).rejects.toThrow();

    const approved = await inSession(adminUser, orgA, "admin", async () =>
      new SupplierIntegrationService().approve(queued.id, orgA, { userId: adminUser, orgId: orgA, role: "admin" })
    );
    expect(approved.status).toBe("approved");

    const material = await inSession(adminUser, orgA, "admin", async () =>
      currentTransaction().material.findUnique({ where: { id: materialForSupplierQueue } })
    );
    expect(Number(material?.unitCost)).toBe(175);

    const audits = await inSession(adminUser, orgA, "admin", async () =>
      currentTransaction().materialPriceAudit.findMany({ where: { materialId: materialForSupplierQueue, source: "supplier-feed" } })
    );
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ oldUnitCost: expect.anything(), actorRole: "admin" });
  });

  it("enforces supplier write permissions and protects suppliers with price update history from deletion", async () => {
    await expect(
      inSession(viewerUser, orgA, "viewer", async () =>
        currentTransaction().supplier.create({ data: { orgId: orgA, name: "Viewer-created supplier" } })
      )
    ).rejects.toThrow();

    const created = await inSession(adminUser, orgA, "admin", async () =>
      currentTransaction().supplier.create({ data: { orgId: orgA, name: "New Co" } })
    );
    expect(created.name).toBe("New Co");

    // supplierA has price update history from the worker test above — the
    // material/supplier foreign keys on supplier_price_updates are ON DELETE
    // RESTRICT, the same protection material_price_audits gives materials.
    await expect(
      inSession(adminUser, orgA, "admin", async () => currentTransaction().supplier.delete({ where: { id: supplierA } }))
    ).rejects.toThrow();

    await inSession(adminUser, orgA, "admin", async () => currentTransaction().supplier.delete({ where: { id: created.id } }));
  });

  it("scopes common assembly templates to the owning organization and enforces viewer write denial", async () => {
    await expect(
      inSession(viewerUser, orgA, "viewer", async () =>
        new AssembliesDatabaseService().create({
          orgId: orgA,
          code: "TPL-VIEWER",
          name: "Viewer-created template",
          unitOfMeasure: "EA",
          isTemplate: true,
        })
      )
    ).rejects.toThrow();

    const created = await inSession(adminUser, orgA, "admin", async () =>
      new AssembliesDatabaseService().create({
        orgId: orgA,
        code: "TPL-DRIVEWAY",
        name: "Residential Driveway Base Package",
        unitOfMeasure: "CY",
        isTemplate: true,
      })
    );
    expect(created.isTemplate).toBe(true);

    const templatesForOrgA = await inSession(adminUser, orgA, "admin", async () =>
      new AssembliesDatabaseService().listTemplates(orgA)
    );
    expect(templatesForOrgA.map((row) => row.id)).toContain(created.id);

    const templatesForOrgB = await inSession(otherUser, orgB, "owner", async () =>
      new AssembliesDatabaseService().listTemplates(orgB)
    );
    expect(templatesForOrgB.map((row) => row.id)).not.toContain(created.id);
  });

  it("persists price changes for admins while hiding audit history from viewers", async () => {
    await inSession(adminUser, orgA, "admin", async () => {
      await new MaterialDatabaseService().update(
        materialA,
        { unitCost: 165 },
        orgA,
        { actor: { userId: adminUser, orgId: orgA, role: "admin" }, source: "manual" }
      );
    });

    const adminRows = await inSession(adminUser, orgA, "admin", async () =>
      currentTransaction().materialPriceAudit.findMany({ where: { materialId: materialA } })
    );
    const viewerRows = await inSession(viewerUser, orgA, "viewer", async () =>
      currentTransaction().materialPriceAudit.findMany({ where: { materialId: materialA } })
    );

    expect(adminRows).toHaveLength(1);
    expect(adminRows[0]).toMatchObject({ materialName: "Ready Mix Concrete", source: "manual", actorRole: "admin" });
    expect(Number(adminRows[0].oldUnitCost)).toBe(150);
    expect(Number(adminRows[0].newUnitCost)).toBe(165);
    expect(viewerRows).toEqual([]);
  });

  it("enforces project-inherited RLS on proposals, invoices, and contracts end to end", async () => {
    await expect(
      inSession(viewerUser, orgA, "viewer", async () => new ProposalsService().create({ orgId: orgA, estimateId: estimateA }))
    ).rejects.toThrow();

    const proposal = await inSession(adminUser, orgA, "admin", async () =>
      new ProposalsService().create({ orgId: orgA, estimateId: estimateA, termsAndConditions: "Net 30" })
    );
    expect(proposal.status).toBe("draft");

    // Cross-org: a session scoped to orgB must not see a proposal that
    // belongs to an orgA project, even by direct id lookup.
    const crossOrgLookup = await inSession(otherUser, orgB, "owner", async () =>
      currentTransaction().proposal.findUnique({ where: { id: proposal.id } })
    );
    expect(crossOrgLookup).toBeNull();

    const sent = await inSession(adminUser, orgA, "admin", async () => new ProposalsService().send(proposal.id, orgA));
    expect(sent.status).toBe("sent");
    const accepted = await inSession(adminUser, orgA, "admin", async () => new ProposalsService().accept(proposal.id, orgA));
    expect(accepted.status).toBe("accepted");

    await expect(
      inSession(viewerUser, orgA, "viewer", async () =>
        new InvoicesService().create({
          orgId: orgA,
          projectId: projectA,
          lineItems: [{ description: "Deposit", quantity: 1, unitOfMeasure: "EA", unitCost: 1000 }],
        })
      )
    ).rejects.toThrow();

    const invoice = await inSession(adminUser, orgA, "admin", async () =>
      new InvoicesService().create({
        orgId: orgA,
        projectId: projectA,
        proposalId: proposal.id,
        lineItems: [{ description: "Deposit", quantity: 1, unitOfMeasure: "EA", unitCost: 1000 }],
      })
    );
    expect(invoice.amount).toBe(1000);

    const invoiceCrossOrgLookup = await inSession(otherUser, orgB, "owner", async () =>
      currentTransaction().invoice.findUnique({ where: { id: invoice.id } })
    );
    expect(invoiceCrossOrgLookup).toBeNull();

    await expect(
      inSession(viewerUser, orgA, "viewer", async () => new ContractsService().create({ orgId: orgA, proposalId: proposal.id }))
    ).rejects.toThrow();

    const contract = await inSession(adminUser, orgA, "admin", async () =>
      new ContractsService().create({ orgId: orgA, proposalId: proposal.id })
    );
    expect(contract.status).toBe("pending_signature");

    const signed = await inSession(adminUser, orgA, "admin", async () =>
      new ContractsService().sign(contract.id, { orgId: orgA, signerName: "Jane Doe", signerEmail: "jane@example.com" })
    );
    expect(signed.status).toBe("signed");
    expect(signed.signerName).toBe("Jane Doe");

    const contractCrossOrgLookup = await inSession(otherUser, orgB, "owner", async () =>
      currentTransaction().contract.findUnique({ where: { id: contract.id } })
    );
    expect(contractCrossOrgLookup).toBeNull();
  });
});

function inSession<T>(userId: string, orgId: string, role: string, operation: () => Promise<T>): Promise<T> {
  return runWithDatabaseSession(appClient, { userId, orgId, role }, operation, "integration-test");
}

function currentTransaction() {
  const transaction = getRequestDatabaseClient();
  if (!transaction) throw new Error("Expected an active request database transaction");
  return transaction;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for RLS integration tests`);
  return value;
}
