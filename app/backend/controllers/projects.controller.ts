import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../db/client";
import { ApiError } from "../middleware/errorHandler";
import { requireOrgId } from "../requestContext";

// Lightweight CRUD for customers/projects. Not one of the 8 specified core
// modules — this is plumbing required so the Estimate Engine has a projectId
// to attach to, since estimates.project_id is not-null in the schema.

const customerSchema = z.object({
  orgId: z.string().uuid().optional(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  billingAddress: z.string().optional(),
});

const projectSchema = z.object({
  orgId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  name: z.string().min(1),
  siteAddress: z.string().optional(),
  regionId: z.string().uuid().optional(),
});

export const customersController = {
  async list(req: Request, res: Response) {
    res.json(await prisma.customer.findMany({ where: { orgId: requireOrgId(req) }, orderBy: { name: "asc" } }));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await prisma.customer.create({ data: { ...customerSchema.parse(req.body), orgId: requireOrgId(req) } }));
  },
  async getById(req: Request, res: Response) {
    const row = await prisma.customer.findFirst({ where: { id: req.params.id, orgId: requireOrgId(req) }, include: { projects: true } });
    if (!row) throw new ApiError(404, `Customer ${req.params.id} not found`);
    res.json(row);
  },
};

export const projectsController = {
  async list(req: Request, res: Response) {
    res.json(await prisma.project.findMany({ where: { orgId: requireOrgId(req) }, orderBy: { createdAt: "desc" } }));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await prisma.project.create({ data: { ...projectSchema.parse(req.body), orgId: requireOrgId(req) } }));
  },
  async getById(req: Request, res: Response) {
    const row = await prisma.project.findFirst({
      where: { id: req.params.id, orgId: requireOrgId(req) },
      include: { customer: true, estimates: { orderBy: { version: "desc" } } },
    });
    if (!row) throw new ApiError(404, `Project ${req.params.id} not found`);
    res.json(row);
  },
  async updateStatus(req: Request, res: Response) {
    const schema = z.object({ status: z.enum(["lead", "estimating", "proposed", "won", "lost", "active", "complete"]) });
    const { status } = schema.parse(req.body);
    const existing = await prisma.project.findFirst({ where: { id: req.params.id, orgId: requireOrgId(req) } });
    if (!existing) throw new ApiError(404, `Project ${req.params.id} not found`);
    res.json(await prisma.project.update({ where: { id: req.params.id }, data: { status } }));
  },
};
