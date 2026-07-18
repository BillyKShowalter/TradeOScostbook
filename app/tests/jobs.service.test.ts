const runInDatabaseTransaction = jest.fn((_client, operation: (tx: unknown) => unknown) => operation(mockDb));

jest.mock("../db/requestSession", () => ({
  getRequestDatabaseClient: jest.fn(),
  runInDatabaseTransaction,
}));

jest.mock("../modules/intelligence/service", () => ({
  ActivityTimelineService: jest.fn().mockImplementation(() => ({
    list: jest.fn().mockResolvedValue([]),
  })),
}));

const mockDb = {
  job: {
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  project: {
    findFirst: jest.fn(),
  },
  customer: {
    findFirst: jest.fn(),
  },
  serviceAddress: {
    findFirst: jest.fn(),
  },
  organizationMembership: {
    findMany: jest.fn(),
  },
  jobAssignment: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  jobEquipment: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  activityEvent: {
    create: jest.fn(),
  },
  comment: {
    findMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

import { JobsService } from "../modules/jobs/service";

const scheduledJob = {
  id: "job-1",
  orgId: "org-1",
  projectId: "project-1",
  customerId: "customer-1",
  serviceAddressId: "address-1",
  jobNumber: "JOB-2026-000001",
  title: "AC tune-up",
  description: "Seasonal maintenance",
  jobType: "HVAC Service",
  status: "scheduled",
  priority: "high",
  scheduledStart: new Date("2026-07-16T13:00:00.000Z"),
  scheduledEnd: new Date("2026-07-16T15:00:00.000Z"),
  arrivalWindowStart: null,
  arrivalWindowEnd: null,
  estimatedDurationMinutes: 120,
  actualStart: null,
  actualEnd: null,
  completedAt: null,
  completedById: null,
  readyForInvoiceAt: null,
  createdById: "dispatcher-1",
  createdAt: new Date("2026-07-14T12:00:00.000Z"),
  updatedAt: new Date("2026-07-14T12:00:00.000Z"),
  archivedAt: null,
  project: { id: "project-1", name: "Project One", status: "active" },
  customer: { id: "customer-1", name: "Customer One", email: "customer@example.com", phone: "555-0100" },
  serviceAddress: {
    id: "address-1",
    label: "Primary",
    addressLine1: "123 Main St",
    addressLine2: null,
    city: "Indianapolis",
    state: "IN",
    postalCode: "46201",
    country: "US",
  },
  assignments: [],
  equipmentLinks: [],
  tasks: [],
  siteVisits: [],
};

describe("JobsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockDb.project.findFirst.mockResolvedValue({
      id: "project-1",
      orgId: "org-1",
      customerId: "customer-1",
      name: "Project One",
      status: "active",
    });
    mockDb.customer.findFirst.mockResolvedValue({
      id: "customer-1",
      orgId: "org-1",
      name: "Customer One",
      email: "customer@example.com",
      phone: "555-0100",
      deletedAt: null,
    });
    mockDb.serviceAddress.findFirst.mockResolvedValue({
      id: "address-1",
      orgId: "org-1",
      customerId: "customer-1",
      label: "Primary",
      addressLine1: "123 Main St",
      addressLine2: null,
      city: "Indianapolis",
      state: "IN",
      postalCode: "46201",
      country: "US",
      deletedAt: null,
    });
    mockDb.organizationMembership.findMany.mockResolvedValue([
      {
        orgId: "org-1",
        userId: "tech-1",
        role: "technician",
        status: "active",
        user: { id: "tech-1", email: "tech@example.com", fullName: "Tech One", isActive: true },
      },
    ]);
    mockDb.jobAssignment.findMany.mockResolvedValue([]);
    mockDb.job.count.mockResolvedValue(0);
    mockDb.job.create.mockResolvedValue(scheduledJob);
    mockDb.job.findFirst.mockResolvedValue(scheduledJob);
    mockDb.comment.findMany.mockResolvedValue([]);
  });

  it("creates a scheduled job and seeds technician assignments", async () => {
    const service = new JobsService(mockDb as never);

    const job = await service.create({
      orgId: "org-1",
      actor: { userId: "dispatcher-1", orgId: "org-1", role: "dispatcher" },
      projectId: "project-1",
      customerId: "customer-1",
      serviceAddressId: "address-1",
      title: "AC tune-up",
      description: "Seasonal maintenance",
      jobType: "HVAC Service",
      priority: "high",
      scheduledStart: new Date("2026-07-16T13:00:00.000Z"),
      scheduledEnd: new Date("2026-07-16T15:00:00.000Z"),
      estimatedDurationMinutes: 120,
      technicianIds: ["tech-1"],
    });

    expect(job.status).toBe("scheduled");
    expect(mockDb.job.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobNumber: "JOB-2026-000001",
          status: "scheduled",
          priority: "high",
        }),
      })
    );
    expect(mockDb.jobAssignment.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            userId: "tech-1",
            assignmentRole: "lead",
            isLead: true,
          }),
        ],
      })
    );
  });

  it("blocks dispatcher conflict overrides without owner/admin permission", async () => {
    mockDb.jobAssignment.findMany.mockResolvedValue([
      {
        userId: "tech-1",
        user: { fullName: "Tech One" },
        jobId: "job-99",
        job: {
          jobNumber: "JOB-2026-000099",
          title: "Conflicting Job",
          scheduledStart: new Date("2026-07-16T13:30:00.000Z"),
          scheduledEnd: new Date("2026-07-16T14:30:00.000Z"),
        },
      },
    ]);
    const service = new JobsService(mockDb as never);

    await expect(
      service.create({
        orgId: "org-1",
        actor: { userId: "dispatcher-1", orgId: "org-1", role: "dispatcher" },
        projectId: "project-1",
        customerId: "customer-1",
        serviceAddressId: "address-1",
        title: "Conflicting dispatch",
        jobType: "HVAC Service",
        scheduledStart: new Date("2026-07-16T13:00:00.000Z"),
        scheduledEnd: new Date("2026-07-16T15:00:00.000Z"),
        technicianIds: ["tech-1"],
        overrideConflict: true,
        overrideReason: "Force it through",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Only owners and admins can override schedule conflicts",
    });
  });

  it("rejects assignment of non-technician memberships", async () => {
    mockDb.job.findFirst.mockResolvedValue({ ...scheduledJob, description: "", priority: "medium" });
    mockDb.organizationMembership.findMany.mockResolvedValue([
      {
        orgId: "org-1",
        userId: "dispatcher-2",
        role: "dispatcher",
        status: "active",
        user: { id: "dispatcher-2", email: "dispatcher2@example.com", fullName: "Dispatch Two", isActive: true },
      },
    ]);

    const service = new JobsService(mockDb as never);

    await expect(
      service.addAssignment("job-1", {
        orgId: "org-1",
        actor: { userId: "dispatcher-1", orgId: "org-1", role: "dispatcher" },
        userId: "dispatcher-2",
        assignmentRole: "technician",
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "User dispatcher-2 is not an active technician",
    });
  });

  it("lets an assigned technician complete an on-site job", async () => {
    mockDb.job.findFirst.mockResolvedValue({
      ...scheduledJob,
      description: "",
      priority: "medium",
      status: "on_site",
      actualStart: new Date("2026-07-16T13:10:00.000Z"),
    });
    mockDb.jobAssignment.findFirst.mockResolvedValue({ id: "assignment-1" });
    mockDb.job.update.mockResolvedValue({
      ...scheduledJob,
      status: "completed",
      actualEnd: new Date("2026-07-16T15:05:00.000Z"),
      completedAt: new Date("2026-07-16T15:05:00.000Z"),
      completedById: "tech-1",
    });

    const service = new JobsService(mockDb as never);

    const job = await service.complete("job-1", {
      orgId: "org-1",
      actor: { userId: "tech-1", orgId: "org-1", role: "technician" },
    });

    expect(job.status).toBe("completed");
    expect(mockDb.job.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "completed",
          completedById: "tech-1",
          completedAt: expect.any(Date),
        }),
      })
    );
  });
});
