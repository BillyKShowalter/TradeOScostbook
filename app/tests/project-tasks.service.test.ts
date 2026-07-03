const mockPrisma = {
  project: {
    findFirst: jest.fn(),
  },
  projectTask: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("../db/client", () => ({ prisma: mockPrisma }));

import { ProjectTasksService } from "../modules/project-tasks/service";

describe("ProjectTasksService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a project-scoped task", async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: "project-1", orgId: "org-1" });
    mockPrisma.projectTask.create.mockResolvedValue({
      id: "task-1",
      projectId: "project-1",
      title: "Order dumpster",
      status: "todo",
      assignedTo: "Alex",
      dueDate: new Date("2026-07-10T00:00:00.000Z"),
      priority: "high",
      notes: "Needed before demo",
      completedAt: null,
      createdAt: new Date("2026-07-03T12:00:00.000Z"),
      updatedAt: new Date("2026-07-03T12:00:00.000Z"),
    });

    const service = new ProjectTasksService();
    const task = await service.create({
      orgId: "org-1",
      projectId: "project-1",
      title: "Order dumpster",
      assignedTo: "Alex",
      dueDate: new Date("2026-07-10T00:00:00.000Z"),
      priority: "high",
      notes: "Needed before demo",
    });

    expect(task.title).toBe("Order dumpster");
    expect(task.priority).toBe("high");
  });

  it("marks a task completed when the status changes to completed", async () => {
    mockPrisma.projectTask.findFirst.mockResolvedValue({
      id: "task-1",
      projectId: "project-1",
      title: "Order dumpster",
      status: "in_progress",
      assignedTo: "Alex",
      dueDate: null,
      priority: "medium",
      notes: null,
      completedAt: null,
      createdAt: new Date("2026-07-03T12:00:00.000Z"),
      updatedAt: new Date("2026-07-03T12:00:00.000Z"),
    });
    mockPrisma.projectTask.update.mockResolvedValue({
      id: "task-1",
      projectId: "project-1",
      title: "Order dumpster",
      status: "completed",
      assignedTo: "Alex",
      dueDate: null,
      priority: "medium",
      notes: null,
      completedAt: new Date("2026-07-04T08:00:00.000Z"),
      createdAt: new Date("2026-07-03T12:00:00.000Z"),
      updatedAt: new Date("2026-07-04T08:00:00.000Z"),
    });

    const service = new ProjectTasksService();
    const task = await service.update("task-1", { orgId: "org-1", status: "completed" });

    expect(task.status).toBe("completed");
    expect(mockPrisma.projectTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-1" },
        data: expect.objectContaining({
          status: "completed",
          completedAt: expect.any(Date),
        }),
      })
    );
  });
});
