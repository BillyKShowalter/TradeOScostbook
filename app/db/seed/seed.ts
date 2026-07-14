import "dotenv/config";
import { prisma } from "../client";
import { signAuthToken } from "../../backend/auth/jwt";

// Seeds a minimal but functional sample dataset: one organization, one
// division/category/subcategory, a labor rate, a material, and a cost item
// that references both — enough to exercise the full estimate -> proposal
// flow described in the README.
async function main() {
  const organizations = await Promise.all([
    prisma.organization.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: { name: "Sample Contracting Co.", regionCode: "US-TX-AUSTIN" },
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Sample Contracting Co.",
        regionCode: "US-TX-AUSTIN",
      },
    }),
    prisma.organization.upsert({
      where: { id: "00000000-0000-0000-0000-000000000002" },
      update: { name: "Second Sample Services", regionCode: "US-IN-INDIANAPOLIS" },
      create: {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Second Sample Services",
        regionCode: "US-IN-INDIANAPOLIS",
      },
    }),
  ]);
  const [org, secondOrg] = organizations;

  const [user, secondUser] = await Promise.all([
    prisma.appUser.upsert({
      where: { authSubject: "seed-user-1" },
      update: { email: "seed@example.com", fullName: "Seed User" },
      create: {
        authSubject: "seed-user-1",
        email: "seed@example.com",
        fullName: "Seed User",
      },
    }),
    prisma.appUser.upsert({
      where: { authSubject: "seed-user-2" },
      update: { email: "seed2@example.com", fullName: "Second Seed User" },
      create: {
        authSubject: "seed-user-2",
        email: "seed2@example.com",
        fullName: "Second Seed User",
      },
    }),
  ]);

  await Promise.all([
    prisma.organizationMembership.upsert({
      where: {
        orgId_userId: {
          orgId: org.id,
          userId: user.id,
        },
      },
      update: { status: "active", role: "owner" },
      create: {
        orgId: org.id,
        userId: user.id,
        role: "owner",
        status: "active",
      },
    }),
    prisma.organizationMembership.upsert({
      where: {
        orgId_userId: {
          orgId: secondOrg.id,
          userId: secondUser.id,
        },
      },
      update: { status: "active", role: "owner" },
      create: {
        orgId: secondOrg.id,
        userId: secondUser.id,
        role: "owner",
        status: "active",
      },
    }),
  ]);

  const division = await prisma.division.create({
    data: { orgId: org.id, code: "02", name: "Sitework", sortOrder: 1 },
  });
  const category = await prisma.category.create({
    data: { divisionId: division.id, code: "02-200", name: "Excavation", sortOrder: 1 },
  });
  const subcategory = await prisma.subcategory.create({
    data: { categoryId: category.id, code: "02-200-10", name: "Residential Excavation", sortOrder: 1 },
  });

  const laborRate = await prisma.laborRate.create({
    data: { orgId: org.id, trade: "Equipment Operator", baseHourlyRate: 32, burdenPct: 28 },
  });

  const material = await prisma.material.create({
    data: { orgId: org.id, name: "Gravel Base, 3/4in", unitOfMeasure: "CY", unitCost: 38, wasteFactorPct: 5, lastPriceUpdate: new Date() },
  });

  const equipment = await prisma.equipment.create({
    data: { orgId: org.id, name: "Mini Excavator, 5T", ownershipCostPerHour: 18, operatingCostPerHour: 12 },
  });

  const excavationCostItem = await prisma.costItem.create({
    data: {
      orgId: org.id,
      subcategoryId: subcategory.id,
      code: "02-200-10-001",
      name: "Excavation Per Cubic Yard",
      unitOfMeasure: "CY",
      productionRate: 20,
      laborRateId: laborRate.id,
      equipmentId: equipment.id,
    },
  });

  const gravelBaseCostItem = await prisma.costItem.create({
    data: {
      orgId: org.id,
      subcategoryId: subcategory.id,
      code: "02-200-10-002",
      name: "Gravel Base, Install",
      unitOfMeasure: "CY",
      productionRate: 10,
      laborRateId: laborRate.id,
      materialId: material.id,
    },
  });

  // A common starting-point assembly so estimators don't have to assemble a
  // driveway base package from scratch every time — see modules/
  // assemblies-database's isTemplate flag.
  const drivewayBaseTemplate = await prisma.assembly.create({
    data: {
      orgId: org.id,
      code: "TPL-DRIVEWAY-BASE",
      name: "Residential Driveway Base Package",
      unitOfMeasure: "CY",
      description: "Excavation plus gravel base install, priced per cubic yard.",
      isTemplate: true,
    },
  });
  await prisma.assemblyItem.createMany({
    data: [
      { assemblyId: drivewayBaseTemplate.id, costItemId: excavationCostItem.id, quantityPerUnit: 1, sortOrder: 1 },
      { assemblyId: drivewayBaseTemplate.id, costItemId: gravelBaseCostItem.id, quantityPerUnit: 1, sortOrder: 2 },
    ],
  });

  const customer = await prisma.customer.create({
    data: { orgId: org.id, name: "Jane Homeowner", email: "jane@example.com" },
  });

  await prisma.serviceAddress.create({
    data: {
      orgId: org.id,
      customerId: customer.id,
      label: "Primary",
      addressLine1: "101 Main Street",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      isPrimary: true,
    },
  });

  await prisma.project.create({
    data: { orgId: org.id, customerId: customer.id, name: "Backyard Drainage Fix", status: "estimating" },
  });

  await prisma.customer.create({
    data: { orgId: secondOrg.id, name: "Bob Facility Manager", email: "bob@example.com", phone: "317-555-0100" },
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete:", {
    organizations: [org.id, secondOrg.id],
    users: [user.id, secondUser.id],
    templateAssemblyId: drivewayBaseTemplate.id,
  });
  if (process.env.AUTH_JWT_SECRET) {
    const token = signAuthToken(
      {
        sub: user.authSubject,
        email: user.email,
        orgId: org.id,
        role: "owner",
        iss: process.env.AUTH_ISSUER ?? "tradeos-costbook",
        aud: process.env.AUTH_AUDIENCE ?? "tradeos-costbook-api",
      },
      process.env.AUTH_JWT_SECRET
    );
    console.log("Dev bearer token:", token);
  }
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
