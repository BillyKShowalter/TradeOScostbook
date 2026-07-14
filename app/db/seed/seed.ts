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

  const [user, secondUser, adminUser, dispatcherUser, technicianUser, helperUser, secondDispatcherUser, secondTechnicianUser] = await Promise.all([
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
    prisma.appUser.upsert({
      where: { authSubject: "seed-admin-1" },
      update: { email: "admin@example.com", fullName: "Operations Admin" },
      create: {
        authSubject: "seed-admin-1",
        email: "admin@example.com",
        fullName: "Operations Admin",
      },
    }),
    prisma.appUser.upsert({
      where: { authSubject: "seed-dispatcher-1" },
      update: { email: "dispatch@example.com", fullName: "Dispatch Lead" },
      create: {
        authSubject: "seed-dispatcher-1",
        email: "dispatch@example.com",
        fullName: "Dispatch Lead",
      },
    }),
    prisma.appUser.upsert({
      where: { authSubject: "seed-technician-1" },
      update: { email: "tech1@example.com", fullName: "Maya HVAC" },
      create: {
        authSubject: "seed-technician-1",
        email: "tech1@example.com",
        fullName: "Maya HVAC",
      },
    }),
    prisma.appUser.upsert({
      where: { authSubject: "seed-technician-2" },
      update: { email: "tech2@example.com", fullName: "Luis Helper" },
      create: {
        authSubject: "seed-technician-2",
        email: "tech2@example.com",
        fullName: "Luis Helper",
      },
    }),
    prisma.appUser.upsert({
      where: { authSubject: "seed-dispatcher-2" },
      update: { email: "dispatch2@example.com", fullName: "Second Dispatch" },
      create: {
        authSubject: "seed-dispatcher-2",
        email: "dispatch2@example.com",
        fullName: "Second Dispatch",
      },
    }),
    prisma.appUser.upsert({
      where: { authSubject: "seed-technician-3" },
      update: { email: "tech3@example.com", fullName: "Nina Spark" },
      create: {
        authSubject: "seed-technician-3",
        email: "tech3@example.com",
        fullName: "Nina Spark",
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
          orgId: org.id,
          userId: adminUser.id,
        },
      },
      update: { status: "active", role: "admin" },
      create: {
        orgId: org.id,
        userId: adminUser.id,
        role: "admin",
        status: "active",
      },
    }),
    prisma.organizationMembership.upsert({
      where: {
        orgId_userId: {
          orgId: org.id,
          userId: dispatcherUser.id,
        },
      },
      update: { status: "active", role: "dispatcher" },
      create: {
        orgId: org.id,
        userId: dispatcherUser.id,
        role: "dispatcher",
        status: "active",
      },
    }),
    prisma.organizationMembership.upsert({
      where: {
        orgId_userId: {
          orgId: org.id,
          userId: technicianUser.id,
        },
      },
      update: { status: "active", role: "technician" },
      create: {
        orgId: org.id,
        userId: technicianUser.id,
        role: "technician",
        status: "active",
      },
    }),
    prisma.organizationMembership.upsert({
      where: {
        orgId_userId: {
          orgId: org.id,
          userId: helperUser.id,
        },
      },
      update: { status: "active", role: "technician" },
      create: {
        orgId: org.id,
        userId: helperUser.id,
        role: "technician",
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
    prisma.organizationMembership.upsert({
      where: {
        orgId_userId: {
          orgId: secondOrg.id,
          userId: secondDispatcherUser.id,
        },
      },
      update: { status: "active", role: "dispatcher" },
      create: {
        orgId: secondOrg.id,
        userId: secondDispatcherUser.id,
        role: "dispatcher",
        status: "active",
      },
    }),
    prisma.organizationMembership.upsert({
      where: {
        orgId_userId: {
          orgId: secondOrg.id,
          userId: secondTechnicianUser.id,
        },
      },
      update: { status: "active", role: "technician" },
      create: {
        orgId: secondOrg.id,
        userId: secondTechnicianUser.id,
        role: "technician",
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

  const primaryAddress = await prisma.serviceAddress.create({
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

  const project = await prisma.project.create({
    data: { orgId: org.id, customerId: customer.id, name: "Backyard Drainage Fix", jobType: "Drainage Repair", status: "active" },
  });

  const remodelCustomer = await prisma.customer.create({
    data: { orgId: org.id, name: "Corey Remodel", email: "corey@example.com", phone: "512-555-0149" },
  });
  const remodelAddress = await prisma.serviceAddress.create({
    data: {
      orgId: org.id,
      customerId: remodelCustomer.id,
      label: "Remodel Site",
      addressLine1: "505 Cedar Avenue",
      city: "Austin",
      state: "TX",
      postalCode: "78702",
      isPrimary: true,
    },
  });
  const remodelProject = await prisma.project.create({
    data: { orgId: org.id, customerId: remodelCustomer.id, name: "Kitchen Remodel", jobType: "Remodel", status: "active" },
  });

  const condenser = await prisma.customerEquipment.create({
    data: {
      orgId: org.id,
      customerId: customer.id,
      serviceAddressId: primaryAddress.id,
      name: "Condensing Unit",
      manufacturer: "Carrier",
      model: "24ABC6",
      serialNumber: "CARRIER-001",
      status: "active",
    },
  });
  const furnace = await prisma.customerEquipment.create({
    data: {
      orgId: org.id,
      customerId: customer.id,
      serviceAddressId: primaryAddress.id,
      name: "Gas Furnace",
      manufacturer: "Carrier",
      model: "59TP6",
      serialNumber: "FURNACE-001",
      status: "active",
    },
  });

  const unscheduledJob = await prisma.job.create({
    data: {
      orgId: org.id,
      projectId: project.id,
      customerId: customer.id,
      serviceAddressId: primaryAddress.id,
      jobNumber: "JOB-2026-000001",
      title: "Drain inspection follow-up",
      description: "Return after proposal acceptance to finalize trench access plan.",
      jobType: "Drainage Repair",
      status: "unscheduled",
      priority: "medium",
      createdById: dispatcherUser.id,
    },
  });
  const scheduledJob = await prisma.job.create({
    data: {
      orgId: org.id,
      projectId: project.id,
      customerId: customer.id,
      serviceAddressId: primaryAddress.id,
      jobNumber: "JOB-2026-000002",
      title: "Cooling tune-up",
      description: "Standard maintenance visit with capacitor inspection.",
      jobType: "HVAC Service",
      status: "scheduled",
      priority: "high",
      scheduledStart: new Date("2026-07-16T13:00:00.000Z"),
      scheduledEnd: new Date("2026-07-16T15:00:00.000Z"),
      estimatedDurationMinutes: 120,
      createdById: dispatcherUser.id,
    },
  });
  const dispatchedJob = await prisma.job.create({
    data: {
      orgId: org.id,
      projectId: project.id,
      customerId: customer.id,
      serviceAddressId: primaryAddress.id,
      jobNumber: "JOB-2026-000003",
      title: "No-cool service call",
      description: "Unit not cooling, likely low refrigerant or failed contactor.",
      jobType: "HVAC Service",
      status: "dispatched",
      priority: "urgent",
      scheduledStart: new Date("2026-07-16T15:30:00.000Z"),
      scheduledEnd: new Date("2026-07-16T17:00:00.000Z"),
      estimatedDurationMinutes: 90,
      createdById: dispatcherUser.id,
    },
  });
  const onSiteJob = await prisma.job.create({
    data: {
      orgId: org.id,
      projectId: remodelProject.id,
      customerId: remodelCustomer.id,
      serviceAddressId: remodelAddress.id,
      jobNumber: "JOB-2026-000004",
      title: "Demo and rough-in",
      description: "Active remodel phase with punch-list cleanup in progress.",
      jobType: "Remodel",
      status: "on_site",
      priority: "high",
      scheduledStart: new Date("2026-07-16T14:00:00.000Z"),
      scheduledEnd: new Date("2026-07-16T18:00:00.000Z"),
      actualStart: new Date("2026-07-16T14:05:00.000Z"),
      estimatedDurationMinutes: 240,
      createdById: dispatcherUser.id,
    },
  });
  const completedJob = await prisma.job.create({
    data: {
      orgId: org.id,
      projectId: project.id,
      customerId: customer.id,
      serviceAddressId: primaryAddress.id,
      jobNumber: "JOB-2026-000005",
      title: "Thermostat replacement",
      description: "Completed smart thermostat swap, ready for invoice review.",
      jobType: "HVAC Service",
      status: "completed",
      priority: "medium",
      scheduledStart: new Date("2026-07-15T14:00:00.000Z"),
      scheduledEnd: new Date("2026-07-15T15:00:00.000Z"),
      actualStart: new Date("2026-07-15T14:05:00.000Z"),
      actualEnd: new Date("2026-07-15T14:50:00.000Z"),
      completedAt: new Date("2026-07-15T14:50:00.000Z"),
      completedById: technicianUser.id,
      readyForInvoiceAt: new Date("2026-07-15T15:00:00.000Z"),
      estimatedDurationMinutes: 60,
      createdById: dispatcherUser.id,
    },
  });
  const conflictJob = await prisma.job.create({
    data: {
      orgId: org.id,
      projectId: project.id,
      customerId: customer.id,
      serviceAddressId: primaryAddress.id,
      jobNumber: "JOB-2026-000006",
      title: "Intentional overlap test",
      description: "Seeded schedule conflict for validation and demos.",
      jobType: "HVAC Service",
      status: "scheduled",
      priority: "high",
      scheduledStart: new Date("2026-07-16T14:30:00.000Z"),
      scheduledEnd: new Date("2026-07-16T16:00:00.000Z"),
      estimatedDurationMinutes: 90,
      createdById: dispatcherUser.id,
    },
  });

  await prisma.jobAssignment.createMany({
    data: [
      { orgId: org.id, jobId: scheduledJob.id, userId: technicianUser.id, assignmentRole: "lead", isLead: true, assignedById: dispatcherUser.id },
      { orgId: org.id, jobId: scheduledJob.id, userId: helperUser.id, assignmentRole: "helper", isLead: false, assignedById: dispatcherUser.id },
      { orgId: org.id, jobId: dispatchedJob.id, userId: technicianUser.id, assignmentRole: "lead", isLead: true, assignedById: dispatcherUser.id },
      { orgId: org.id, jobId: onSiteJob.id, userId: helperUser.id, assignmentRole: "lead", isLead: true, assignedById: dispatcherUser.id, acceptedAt: new Date("2026-07-16T13:55:00.000Z") },
      { orgId: org.id, jobId: completedJob.id, userId: technicianUser.id, assignmentRole: "lead", isLead: true, assignedById: dispatcherUser.id, acceptedAt: new Date("2026-07-15T13:45:00.000Z") },
      { orgId: org.id, jobId: conflictJob.id, userId: technicianUser.id, assignmentRole: "lead", isLead: true, assignedById: dispatcherUser.id },
    ],
  });
  await prisma.jobEquipment.createMany({
    data: [
      { jobId: scheduledJob.id, equipmentId: condenser.id },
      { jobId: scheduledJob.id, equipmentId: furnace.id },
      { jobId: completedJob.id, equipmentId: furnace.id },
    ],
  });
  await prisma.projectTask.createMany({
    data: [
      { projectId: project.id, jobId: scheduledJob.id, title: "Change return filter", status: "todo", priority: "medium" },
      { projectId: project.id, jobId: scheduledJob.id, title: "Document refrigerant pressures", status: "in_progress", priority: "high" },
    ],
  });
  await prisma.siteVisit.create({
    data: {
      projectId: project.id,
      jobId: scheduledJob.id,
      notes: "Customer asked us to check the upstairs airflow while onsite.",
    },
  });

  const secondCustomer = await prisma.customer.create({
    data: { orgId: secondOrg.id, name: "Bob Facility Manager", email: "bob@example.com", phone: "317-555-0100" },
  });
  const secondAddress = await prisma.serviceAddress.create({
    data: {
      orgId: secondOrg.id,
      customerId: secondCustomer.id,
      label: "Main Facility",
      addressLine1: "880 Meridian Park",
      city: "Indianapolis",
      state: "IN",
      postalCode: "46240",
      isPrimary: true,
    },
  });
  const secondProject = await prisma.project.create({
    data: { orgId: secondOrg.id, customerId: secondCustomer.id, name: "Panel Upgrade", jobType: "Electrical Service", status: "active" },
  });
  const secondJob = await prisma.job.create({
    data: {
      orgId: secondOrg.id,
      projectId: secondProject.id,
      customerId: secondCustomer.id,
      serviceAddressId: secondAddress.id,
      jobNumber: "JOB-2026-000001",
      title: "Service panel upgrade",
      description: "Separate organization seed proving tenant isolation.",
      jobType: "Electrical Service",
      status: "scheduled",
      priority: "high",
      scheduledStart: new Date("2026-07-17T13:00:00.000Z"),
      scheduledEnd: new Date("2026-07-17T17:00:00.000Z"),
      estimatedDurationMinutes: 240,
      createdById: secondDispatcherUser.id,
    },
  });
  await prisma.jobAssignment.create({
    data: {
      orgId: secondOrg.id,
      jobId: secondJob.id,
      userId: secondTechnicianUser.id,
      assignmentRole: "lead",
      isLead: true,
      assignedById: secondDispatcherUser.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed complete:", {
    organizations: [org.id, secondOrg.id],
    users: [user.id, secondUser.id, adminUser.id, dispatcherUser.id, technicianUser.id, helperUser.id, secondDispatcherUser.id, secondTechnicianUser.id],
    templateAssemblyId: drivewayBaseTemplate.id,
    jobs: [unscheduledJob.id, scheduledJob.id, dispatchedJob.id, onSiteJob.id, completedJob.id, conflictJob.id, secondJob.id],
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
