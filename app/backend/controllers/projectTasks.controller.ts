import { Request, Response } from "express";
import { z } from "zod";
import { requireOrgId } from "../requestContext";
import { ProjectTasksService } from "../../modules/project-tasks/service";
import { projectTaskPriorities, projectTaskStatuses } from "../../modules/project-tasks/types";

const service = new ProjectTasksService();

const createSchema = z.object({
  title: z.string().min(1),
  assignedTo: z.string().trim().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(projectTaskPriorities).optional(),
  notes: z.string().trim().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(projectTaskStatuses).optional(),
  assignedTo: z.string().trim().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.enum(projectTaskPriorities).optional(),
  notes: z.string().trim().nullable().optional(),
});

export const projectTasksController = {
  async listByProject(req: Request, res: Response) {
    res.json(await service.listByProject(req.params.id, requireOrgId(req)));
  },

  async create(req: Request, res: Response) {
    const body = createSchema.parse(req.body);
    res.status(201).json(
      await service.create({
        orgId: requireOrgId(req),
        projectId: req.params.id,
        title: body.title,
        assignedTo: body.assignedTo || undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        priority: body.priority,
        notes: body.notes || undefined,
      })
    );
  },

  async update(req: Request, res: Response) {
    const body = updateSchema.parse(req.body);
    res.json(
      await service.update(req.params.taskId, {
        orgId: requireOrgId(req),
        title: body.title,
        status: body.status,
        assignedTo: body.assignedTo,
        dueDate: body.dueDate === undefined ? undefined : body.dueDate === null ? null : new Date(body.dueDate),
        priority: body.priority,
        notes: body.notes,
      })
    );
  },

  async remove(req: Request, res: Response) {
    await service.remove(req.params.taskId, requireOrgId(req));
    res.status(204).send();
  },
};
