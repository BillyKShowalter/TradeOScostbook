import { prisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { CreateProjectTaskInput, ProjectTaskDTO, ProjectTaskStatus, UpdateProjectTaskInput } from "./types";

export class ProjectTasksService {
  async listByProject(projectId: string, orgId?: string): Promise<ProjectTaskDTO[]> {
    const rows = await prisma.projectTask.findMany({
      where: { projectId, project: orgId ? { orgId } : undefined },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });
    return rows.map(toDTO);
  }

  async getById(id: string, orgId?: string): Promise<ProjectTaskDTO> {
    const row = await prisma.projectTask.findFirst({
      where: { id, project: orgId ? { orgId } : undefined },
    });
    if (!row) throw new ApiError(404, `Project task ${id} not found`);
    return toDTO(row);
  }

  async create(input: CreateProjectTaskInput): Promise<ProjectTaskDTO> {
    const project = await prisma.project.findFirst({ where: { id: input.projectId, orgId: input.orgId } });
    if (!project) throw new ApiError(404, `Project ${input.projectId} not found`);
    if (input.jobId) {
      const job = await prisma.job.findFirst({ where: { id: input.jobId, orgId: input.orgId, projectId: input.projectId, archivedAt: null } });
      if (!job) throw new ApiError(404, `Job ${input.jobId} not found`);
    }

    const row = await prisma.projectTask.create({
      data: {
        projectId: input.projectId,
        jobId: input.jobId ?? null,
        title: input.title,
        assignedTo: input.assignedTo,
        dueDate: input.dueDate,
        priority: input.priority ?? "medium",
        notes: input.notes,
      },
    });
    return toDTO(row);
  }

  async update(id: string, input: UpdateProjectTaskInput): Promise<ProjectTaskDTO> {
    const existing = await prisma.projectTask.findFirst({
      where: { id, project: input.orgId ? { orgId: input.orgId } : undefined },
    });
    if (!existing) throw new ApiError(404, `Project task ${id} not found`);

    const nextStatus = input.status ?? (existing.status as ProjectTaskStatus);
    const row = await prisma.projectTask.update({
      where: { id },
      data: {
        jobId: input.jobId !== undefined ? input.jobId : existing.jobId,
        title: input.title ?? existing.title,
        status: nextStatus,
        assignedTo: input.assignedTo !== undefined ? input.assignedTo : existing.assignedTo,
        dueDate: input.dueDate !== undefined ? input.dueDate : existing.dueDate,
        priority: input.priority ?? existing.priority,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        completedAt: nextStatus === "completed" ? existing.completedAt ?? new Date() : null,
      },
    });
    return toDTO(row);
  }

  async remove(id: string, orgId?: string): Promise<void> {
    const existing = await prisma.projectTask.findFirst({
      where: { id, project: orgId ? { orgId } : undefined },
    });
    if (!existing) throw new ApiError(404, `Project task ${id} not found`);
    await prisma.projectTask.delete({ where: { id } });
  }
}

function toDTO(row: {
  id: string;
  projectId: string;
  jobId: string | null;
  title: string;
  status: string;
  assignedTo: string | null;
  dueDate: Date | null;
  priority: string;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectTaskDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    jobId: row.jobId,
    title: row.title,
    status: row.status as ProjectTaskStatus,
    assignedTo: row.assignedTo,
    dueDate: row.dueDate?.toISOString() ?? null,
    priority: row.priority as ProjectTaskDTO["priority"],
    notes: row.notes,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
