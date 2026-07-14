import { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { ActivityTimelineService } from "../intelligence/service";
import { renderInvoicePdf } from "./pdf";
import { CreateInvoiceInput, InvoiceDTO, InvoiceDeliveryDTO, InvoiceDocument, InvoiceLineItemDTO, InvoiceLineItemInput } from "./types";

export class InvoicesService {
  private readonly activityService = new ActivityTimelineService();

  async create(input: CreateInvoiceInput): Promise<InvoiceDTO> {
    const project = await prisma.project.findFirst({ where: { id: input.projectId, orgId: input.orgId } });
    if (!project) throw new ApiError(404, `Project ${input.projectId} not found`);

    const type = input.type ?? "full";
    if (type === "progress" && (input.percentComplete == null || input.percentComplete <= 0 || input.percentComplete > 100)) {
      throw new ApiError(400, "percentComplete (0-100] is required for progress invoices");
    }

    const lineItems = await this.resolveLineItems(input, type);
    if (lineItems.length === 0) throw new ApiError(400, "Invoice requires lineItems or an estimateId");

    if (input.proposalId) {
      const proposal = await prisma.proposal.findFirst({ where: { id: input.proposalId, projectId: input.projectId } });
      if (!proposal) throw new ApiError(404, `Proposal ${input.proposalId} not found`);
    }

    const amount = lineItems.reduce((sum, li) => sum + li.quantity * li.unitCost, 0);
    const nextNumber = (await prisma.invoice.aggregate({ where: { projectId: input.projectId }, _max: { invoiceNumber: true } }))._max
      .invoiceNumber ?? 0;

    const row = await prisma.invoice.create({
      data: {
        projectId: input.projectId,
        estimateId: input.estimateId,
        proposalId: input.proposalId,
        invoiceNumber: nextNumber + 1,
        type,
        percentComplete: type === "progress" ? input.percentComplete : undefined,
        amount,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        lineItems: {
          create: lineItems.map((li, index) => ({
            description: li.description,
            quantity: li.quantity,
            unitOfMeasure: li.unitOfMeasure,
            unitCost: li.unitCost,
            lineCost: li.quantity * li.unitCost,
            sortOrder: index,
          })),
        },
      },
    });
    await this.recordDeliveryEvent({
      orgId: input.orgId,
      invoiceId: row.id,
      projectId: row.projectId,
      actorUserId: input.actorUserId,
      eventType: "invoice.created",
      metadata: {
        invoiceNumber: row.invoiceNumber,
        type: row.type,
        amount,
      },
    });
    return this.getById(row.id, input.orgId);
  }

  async listByProject(projectId: string, orgId?: string): Promise<InvoiceDTO[]> {
    const rows = await prisma.invoice.findMany({
      where: { projectId, project: orgId ? { orgId } : undefined },
      include: { deliveries: { orderBy: { occurredAt: "desc" } } },
      orderBy: { invoiceNumber: "asc" },
    });
    return rows.map(toDTO);
  }

  async getById(id: string, orgId?: string): Promise<InvoiceDTO & { lineItems: InvoiceLineItemDTO[] }> {
    const row = await prisma.invoice.findFirst({
      where: { id, project: orgId ? { orgId } : undefined },
      include: {
        lineItems: { orderBy: { sortOrder: "asc" } },
        deliveries: { orderBy: { occurredAt: "desc" } },
      },
    });
    if (!row) throw new ApiError(404, `Invoice ${id} not found`);
    return { ...toDTO(row), lineItems: row.lineItems.map(toLineItemDTO) };
  }

  async getPdf(id: string, orgId?: string): Promise<InvoiceDocument> {
    const row = await prisma.invoice.findFirst({
      where: { id, project: orgId ? { orgId } : undefined },
      include: { lineItems: { orderBy: { sortOrder: "asc" } }, project: { include: { customer: true } } },
    });
    if (!row) throw new ApiError(404, `Invoice ${id} not found`);

    const buffer = await renderInvoicePdf(
      {
        invoiceNumber: row.invoiceNumber,
        type: row.type,
        status: row.status,
        amount: Number(row.amount),
        dueDate: row.dueDate,
        createdAt: row.createdAt,
        percentComplete: row.percentComplete ? Number(row.percentComplete) : null,
        project: row.project,
        lineItems: row.lineItems.map((li) => ({
          description: li.description,
          quantity: Number(li.quantity),
          unitOfMeasure: li.unitOfMeasure,
          unitCost: Number(li.unitCost),
          lineCost: Number(li.lineCost),
        })),
      },
      { companyName: "Your Company Name" }
    );

    return {
      buffer,
      filename: `invoice-${row.project.name.replace(/\s+/g, "-").toLowerCase()}-${row.invoiceNumber}.pdf`,
      contentType: "application/pdf",
    };
  }

  async send(id: string, orgId?: string, actorUserId?: string): Promise<InvoiceDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (row.status !== "draft") throw new ApiError(409, `Invoice ${id} has already been sent`);
    const updated = await prisma.invoice.update({ where: { id }, data: { status: "sent", sentAt: new Date() } });
    await this.recordDeliveryEvent({
      orgId: orgId ?? row.project.orgId ?? undefined,
      invoiceId: row.id,
      projectId: row.projectId,
      actorUserId,
      eventType: "invoice.sent",
      recipientEmail: row.project.customer?.email ?? null,
      metadata: { previousStatus: row.status, newStatus: "sent", invoiceNumber: row.invoiceNumber },
    });
    return this.getById(updated.id, orgId);
  }

  async markPaid(id: string, orgId?: string, actorUserId?: string): Promise<InvoiceDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (!["sent", "overdue"].includes(row.status)) throw new ApiError(409, `Invoice ${id} cannot be marked paid from status ${row.status}`);
    const updated = await prisma.invoice.update({ where: { id }, data: { status: "paid", paidAt: new Date() } });
    await this.recordDeliveryEvent({
      orgId: orgId ?? row.project.orgId ?? undefined,
      invoiceId: row.id,
      projectId: row.projectId,
      actorUserId,
      eventType: "invoice.paid",
      recipientEmail: row.project.customer?.email ?? null,
      metadata: { previousStatus: row.status, newStatus: "paid", invoiceNumber: row.invoiceNumber },
    });
    return this.getById(updated.id, orgId);
  }

  async void(id: string, orgId?: string, actorUserId?: string): Promise<InvoiceDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (row.status === "paid") throw new ApiError(409, `Invoice ${id} has already been paid and cannot be voided`);
    const updated = await prisma.invoice.update({ where: { id }, data: { status: "void" } });
    await this.recordDeliveryEvent({
      orgId: orgId ?? row.project.orgId ?? undefined,
      invoiceId: row.id,
      projectId: row.projectId,
      actorUserId,
      eventType: "invoice.voided",
      recipientEmail: row.project.customer?.email ?? null,
      metadata: { previousStatus: row.status, newStatus: "void", invoiceNumber: row.invoiceNumber },
    });
    return this.getById(updated.id, orgId);
  }

  private async findOrThrow(id: string, orgId?: string) {
    const row = await prisma.invoice.findFirst({
      where: { id, project: orgId ? { orgId } : undefined },
      include: {
        deliveries: { orderBy: { occurredAt: "desc" } },
        project: {
          include: {
            customer: {
              select: { email: true },
            },
          },
        },
      },
    });
    if (!row) throw new ApiError(404, `Invoice ${id} not found`);
    return row;
  }

  private async recordDeliveryEvent(input: {
    orgId?: string;
    invoiceId: string;
    projectId: string;
    actorUserId?: string;
    eventType: string;
    recipientEmail?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    if (!input.orgId) {
      throw new ApiError(500, `Invoice ${input.invoiceId} is missing organization scope`);
    }
    await prisma.invoiceDelivery.create({
      data: {
        orgId: input.orgId,
        invoiceId: input.invoiceId,
        eventType: input.eventType,
        deliveryChannel: "app",
        recipientEmail: input.recipientEmail,
        actorUserId: input.actorUserId,
        metadataJson: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    await this.activityService.record({
      orgId: input.orgId,
      entityType: "project",
      entityId: input.projectId,
      eventType: input.eventType,
      title: input.eventType.replace("invoice.", "Invoice ").replaceAll("_", " "),
      actorUserId: input.actorUserId,
      metadata: {
        invoiceId: input.invoiceId,
        recipientEmail: input.recipientEmail ?? null,
        ...(input.metadata ?? {}),
      },
    });
  }

  private async resolveLineItems(input: CreateInvoiceInput, type: string): Promise<InvoiceLineItemInput[]> {
    if (input.lineItems && input.lineItems.length > 0) return input.lineItems;
    if (!input.estimateId) return [];

    const estimate = await prisma.estimate.findFirst({
      where: { id: input.estimateId, orgId: input.orgId, projectId: input.projectId },
      include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    });
    if (!estimate) throw new ApiError(404, `Estimate ${input.estimateId} not found`);

    const scale = type === "progress" ? (input.percentComplete ?? 0) / 100 : 1;
    return estimate.lineItems.map((li) => ({
      description: li.description,
      quantity: Number(li.quantity) * scale,
      unitOfMeasure: li.unitOfMeasure,
      unitCost: Number(li.unitCost),
    }));
  }
}

function toDTO(row: {
  id: string;
  projectId: string;
  estimateId: string | null;
  proposalId: string | null;
  invoiceNumber: number;
  type: string;
  status: string;
  percentComplete: unknown;
  amount: unknown;
  dueDate: Date | null;
  sentAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  deliveries?: Array<{
    id: string;
    eventType: string;
    deliveryChannel: string;
    recipientEmail: string | null;
    actorUserId: string | null;
    metadataJson: Prisma.JsonValue | null;
    occurredAt: Date;
    createdAt: Date;
  }>;
}): InvoiceDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    estimateId: row.estimateId,
    proposalId: row.proposalId,
    invoiceNumber: row.invoiceNumber,
    type: row.type,
    status: row.status,
    percentComplete: row.percentComplete != null ? Number(row.percentComplete) : null,
    amount: Number(row.amount),
    dueDate: row.dueDate,
    sentAt: row.sentAt,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    deliveries: (row.deliveries ?? []).map(toDeliveryDTO),
  };
}

function toLineItemDTO(row: {
  id: string;
  description: string;
  quantity: unknown;
  unitOfMeasure: string;
  unitCost: unknown;
  lineCost: unknown;
  sortOrder: number;
}): InvoiceLineItemDTO {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    unitOfMeasure: row.unitOfMeasure,
    unitCost: Number(row.unitCost),
    lineCost: Number(row.lineCost),
    sortOrder: row.sortOrder,
  };
}

function toDeliveryDTO(row: {
  id: string;
  eventType: string;
  deliveryChannel: string;
  recipientEmail: string | null;
  actorUserId: string | null;
  metadataJson: Prisma.JsonValue | null;
  occurredAt: Date;
  createdAt: Date;
}): InvoiceDeliveryDTO {
  return {
    id: row.id,
    eventType: row.eventType,
    deliveryChannel: row.deliveryChannel,
    recipientEmail: row.recipientEmail,
    actorUserId: row.actorUserId,
    metadata: asRecord(row.metadataJson),
    occurredAt: row.occurredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function asRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}
