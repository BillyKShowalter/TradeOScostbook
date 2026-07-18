const create = jest.fn();
const list = jest.fn();
const schedule = jest.fn();
const archive = jest.fn();

jest.mock("../modules/jobs/service", () => ({
  JobsService: jest.fn().mockImplementation(() => ({
    create,
    list,
    schedule,
    archive,
    getById: jest.fn(),
    update: jest.fn(),
    reschedule: jest.fn(),
    dispatch: jest.fn(),
    startTravel: jest.fn(),
    arrive: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    complete: jest.fn(),
    cancel: jest.fn(),
    reopen: jest.fn(),
    readyForInvoice: jest.fn(),
    listAssignments: jest.fn(),
    addAssignment: jest.fn(),
    updateAssignment: jest.fn(),
    removeAssignment: jest.fn(),
    acceptAssignment: jest.fn(),
    declineAssignment: jest.fn(),
  })),
}));

jest.mock("../db/client", () => ({
  prisma: {
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { jobsController } from "../backend/controllers/jobs.controller";

describe("jobsController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps create request bodies into service input", async () => {
    create.mockResolvedValue({ id: "job-1" });
    const req = {
      body: {
        projectId: "10000000-0000-0000-0000-000000000001",
        customerId: "10000000-0000-0000-0000-000000000002",
        serviceAddressId: "10000000-0000-0000-0000-000000000003",
        title: "Job Title",
        description: "Description",
        jobType: "HVAC Service",
        priority: "high",
        scheduledStart: "2026-07-16T13:00:00.000Z",
        scheduledEnd: "2026-07-16T15:00:00.000Z",
      },
      orgId: "org-1",
      auth: { userId: "dispatcher-1", orgId: "org-1", role: "dispatcher" },
    } as any;
    const res = responseDouble();

    await jobsController.create(req, res);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: "org-1",
        actor: (req as any).auth,
        title: "Job Title",
        scheduledStart: expect.any(Date),
        scheduledEnd: expect.any(Date),
      })
    );
    expect((res as any).status).toHaveBeenCalledWith(201);
  });

  it("parses list filters for the jobs index", async () => {
    list.mockResolvedValue({ items: [], page: 1, pageSize: 25, total: 0 });
    const req = {
      query: {
        status: "scheduled",
        technicianId: "10000000-0000-0000-0000-000000000003",
        scheduledFrom: "2026-07-16T00:00:00.000Z",
        scheduledTo: "2026-07-17T00:00:00.000Z",
        page: "2",
        pageSize: "10",
      },
      orgId: "org-1",
      auth: { userId: "dispatcher-1", orgId: "org-1", role: "dispatcher" },
    } as any;
    const res = responseDouble();

    await jobsController.list(req, res);

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "scheduled",
        technicianId: "10000000-0000-0000-0000-000000000003",
        scheduledFrom: expect.any(Date),
        scheduledTo: expect.any(Date),
        page: 2,
        pageSize: 10,
      })
    );
  });

  it("converts scheduling payloads into Dates", async () => {
    schedule.mockResolvedValue({ id: "job-1", status: "scheduled" });
    const req = {
      params: { jobId: "job-1" },
      body: {
        scheduledStart: "2026-07-16T13:00:00.000Z",
        scheduledEnd: "2026-07-16T15:00:00.000Z",
        overrideConflict: true,
        overrideReason: "Owner approved",
      },
      orgId: "org-1",
      auth: { userId: "owner-1", orgId: "org-1", role: "owner" },
    } as any;
    const res = responseDouble();

    await jobsController.schedule(req, res);

    expect(schedule).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({
        scheduledStart: expect.any(Date),
        scheduledEnd: expect.any(Date),
        overrideConflict: true,
        overrideReason: "Owner approved",
      })
    );
  });

  it("returns 204 after soft-archiving a job", async () => {
    archive.mockResolvedValue(undefined);
    const req = {
      params: { jobId: "job-1" },
      orgId: "org-1",
      auth: { userId: "dispatcher-1", orgId: "org-1", role: "dispatcher" },
    } as any;
    const res = responseDouble();

    await jobsController.remove(req, res);

    expect(archive).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({
        orgId: "org-1",
        actor: (req as any).auth,
      })
    );
    expect((res as any).status).toHaveBeenCalledWith(204);
    expect((res as any).send).toHaveBeenCalled();
  });
});

function responseDouble() {
  const res = {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res as any;
}
