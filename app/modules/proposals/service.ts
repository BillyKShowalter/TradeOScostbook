import { prisma } from "../../db/client";
import { ApiError } from "../../backend/middleware/errorHandler";
import { ProposalGeneratorService } from "../proposal-generator/service";
import { ProposalDocument } from "../proposal-generator/types";
import { ProjectIntakeService } from "../project-intake/service";
import { CreateProposalInput, ProposalDTO, ProposalDraftPreviewDTO } from "./types";

interface PaymentScheduleEntry {
  label: string;
  amountPercent: number;
  notes?: string;
}

export class ProposalsService {
  private readonly proposalGenerator = new ProposalGeneratorService();
  private readonly projectIntake = new ProjectIntakeService();

  async create(input: CreateProposalInput): Promise<ProposalDTO> {
    const row = input.estimateId
      ? await this.createFromEstimate(input)
      : await this.createFromProject(input);
    return toDTO(row);
  }

  async listByProject(projectId: string, orgId?: string): Promise<ProposalDTO[]> {
    const rows = await prisma.proposal.findMany({
      where: { projectId, project: orgId ? { orgId } : undefined },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDTO);
  }

  async getById(id: string, orgId?: string): Promise<ProposalDTO> {
    const row = await this.findOrThrow(id, orgId);
    return toDTO(row);
  }

  async previewProjectDraft(projectId: string, orgId?: string, companyName?: string): Promise<ProposalDraftPreviewDTO> {
    const project = await this.getProjectDraftContext(projectId, orgId);
    const latestVisit = project.siteVisits[0];
    const draft = this.projectIntake.buildProposalDraft({
      companyName: companyName ?? project.organization?.name ?? "Your Company",
      customerName: project.customer?.name,
      projectName: project.name,
      simpleScope: project.simpleScope,
      jobType: project.jobType,
      projectAddress: project.siteAddress,
      notes: latestVisit?.notes,
      transcript: latestVisit?.transcript,
      measurements: asRecord(latestVisit?.measurementsJson),
    });

    return {
      companyName: companyName ?? project.organization?.name ?? "Your Company",
      normalizedJobType: draft.normalizedJobType,
      confidenceScore: latestVisit?.confidenceScore ? toNullableNumber(latestVisit.confidenceScore) : null,
      missingInfo: toStringArray(latestVisit?.missingInfoJson),
      aiQuestions: toStringArray(latestVisit?.aiQuestionsJson),
      scopeOfWork: draft.scopeOfWork,
      assumptions: draft.assumptions,
      exclusions: draft.exclusions,
      timeline: draft.timeline,
      priceLow: draft.priceLow,
      priceHigh: draft.priceHigh,
      paymentSchedule: draft.paymentSchedule,
    };
  }

  async update(id: string, input: Omit<CreateProposalInput, "estimateId" | "projectId">, orgId?: string): Promise<ProposalDTO> {
    const existing = await this.findOrThrow(id, orgId);
    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        companyName: input.companyName,
        showLineItemDetail: input.showLineItemDetail,
        scopeOfWork: input.scopeOfWork,
        assumptions: input.assumptions,
        exclusions: input.exclusions,
        timeline: input.timeline,
        priceLow: input.priceLow,
        priceHigh: input.priceHigh,
        finalPrice: input.finalPrice,
        paymentScheduleJson:
          input.paymentScheduleJson === undefined
            ? undefined
            : (this.normalizePaymentSchedule(input.paymentScheduleJson, existing.paymentScheduleJson) as object | undefined),
        termsAndConditions: input.termsAndConditions,
      },
    });
    return toDTO(updated);
  }

  async getPdf(id: string, orgId?: string): Promise<ProposalDocument> {
    const row = await this.findOrThrow(id, orgId);
    if (!row.estimateId) {
      return this.proposalGenerator.generateProjectProposal({ proposalId: id, orgId });
    }
    return this.proposalGenerator.generateProposal({
      estimateId: row.estimateId,
      orgId,
      companyName: row.companyName ?? undefined,
      showLineItemDetail: row.showLineItemDetail,
      termsAndConditions: row.termsAndConditions ?? undefined,
    });
  }

  async send(id: string, orgId?: string): Promise<ProposalDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (row.status !== "draft") throw new ApiError(409, `Proposal ${id} has already been sent`);
    this.normalizePaymentSchedule(row.paymentScheduleJson);
    const updated = await prisma.proposal.update({ where: { id }, data: { status: "sent", sentAt: new Date() } });
    await prisma.project.update({ where: { id: row.projectId }, data: { status: "proposal_sent" } });
    return toDTO(updated);
  }

  async markViewed(id: string, orgId?: string): Promise<ProposalDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (row.status === "draft") throw new ApiError(409, `Proposal ${id} has not been sent yet`);
    if (row.status === "viewed" || row.status === "accepted" || row.status === "rejected") return toDTO(row);
    const updated = await prisma.proposal.update({ where: { id }, data: { status: "viewed", viewedAt: new Date() } });
    return toDTO(updated);
  }

  async accept(id: string, orgId?: string): Promise<ProposalDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (!["sent", "viewed"].includes(row.status)) throw new ApiError(409, `Proposal ${id} cannot be accepted from status ${row.status}`);
    const updated = await prisma.proposal.update({ where: { id }, data: { status: "accepted", respondedAt: new Date() } });
    await prisma.project.update({ where: { id: row.projectId }, data: { status: "accepted" } });
    return toDTO(updated);
  }

  async reject(id: string, orgId?: string): Promise<ProposalDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (!["sent", "viewed"].includes(row.status)) throw new ApiError(409, `Proposal ${id} cannot be rejected from status ${row.status}`);
    const updated = await prisma.proposal.update({ where: { id }, data: { status: "rejected", respondedAt: new Date() } });
    await prisma.project.update({ where: { id: row.projectId }, data: { status: "proposal_draft" } });
    return toDTO(updated);
  }

  async resend(id: string, orgId?: string): Promise<ProposalDTO> {
    const row = await this.findOrThrow(id, orgId);
    if (!["sent", "viewed"].includes(row.status)) {
      throw new ApiError(409, `Proposal ${id} cannot be resent from status ${row.status}`);
    }

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });
    await prisma.project.update({ where: { id: row.projectId }, data: { status: "proposal_sent" } });
    return toDTO(updated);
  }

  async duplicate(id: string, orgId?: string): Promise<ProposalDTO> {
    const row = await this.findOrThrow(id, orgId);
    const duplicated = await prisma.proposal.create({
      data: {
        projectId: row.projectId,
        estimateId: row.estimateId,
        companyName: row.companyName,
        showLineItemDetail: row.showLineItemDetail,
        scopeOfWork: row.scopeOfWork,
        assumptions: row.assumptions,
        exclusions: row.exclusions,
        timeline: row.timeline,
        priceLow: toNullableNumber(row.priceLow),
        priceHigh: toNullableNumber(row.priceHigh),
        finalPrice: toNullableNumber(row.finalPrice),
        paymentScheduleJson: row.paymentScheduleJson as object | undefined,
        termsAndConditions: row.termsAndConditions,
      },
    });
    await prisma.project.update({ where: { id: row.projectId }, data: { status: "proposal_draft" } });
    return toDTO(duplicated);
  }

  private async findOrThrow(id: string, orgId?: string) {
    const row = await prisma.proposal.findFirst({ where: { id, project: orgId ? { orgId } : undefined } });
    if (!row) throw new ApiError(404, `Proposal ${id} not found`);
    return row;
  }

  private async createFromEstimate(input: CreateProposalInput) {
    const estimate = await prisma.estimate.findFirst({ where: { id: input.estimateId, orgId: input.orgId } });
    if (!estimate) throw new ApiError(404, `Estimate ${input.estimateId} not found`);

    return prisma.proposal.create({
      data: {
        projectId: estimate.projectId,
        estimateId: input.estimateId,
        companyName: input.companyName,
        showLineItemDetail: input.showLineItemDetail ?? false,
        scopeOfWork: input.scopeOfWork,
        assumptions: input.assumptions,
        exclusions: input.exclusions,
        timeline: input.timeline,
        priceLow: input.priceLow,
        priceHigh: input.priceHigh,
        finalPrice: input.finalPrice,
        paymentScheduleJson: this.normalizePaymentSchedule(input.paymentScheduleJson) as object | undefined,
        termsAndConditions: input.termsAndConditions,
      },
    });
  }

  private async createFromProject(input: CreateProposalInput) {
    if (!input.projectId) throw new ApiError(400, "projectId is required when estimateId is not provided");

    const project = await this.getProjectDraftContext(input.projectId, input.orgId);

    const latestVisit = project.siteVisits[0];
    const draft = this.projectIntake.buildProposalDraft({
      companyName: input.companyName ?? project.organization?.name ?? "Your Company",
      customerName: project.customer?.name,
      projectName: project.name,
      simpleScope: project.simpleScope,
      jobType: project.jobType,
      projectAddress: project.siteAddress,
      notes: latestVisit?.notes,
      transcript: latestVisit?.transcript,
      measurements: asRecord(latestVisit?.measurementsJson),
    });

    const proposal = await prisma.proposal.create({
      data: {
        projectId: project.id,
        estimateId: null,
        companyName: input.companyName ?? project.organization?.name ?? null,
        showLineItemDetail: input.showLineItemDetail ?? false,
        scopeOfWork: input.scopeOfWork ?? draft.scopeOfWork,
        assumptions: input.assumptions ?? draft.assumptions,
        exclusions: input.exclusions ?? draft.exclusions,
        timeline: input.timeline ?? draft.timeline,
        priceLow: input.priceLow ?? draft.priceLow,
        priceHigh: input.priceHigh ?? draft.priceHigh,
        finalPrice: input.finalPrice ?? null,
        paymentScheduleJson: this.normalizePaymentSchedule(input.paymentScheduleJson, draft.paymentSchedule) as object | undefined,
        termsAndConditions: input.termsAndConditions,
      },
    });
    await prisma.project.update({ where: { id: project.id }, data: { status: "proposal_draft" } });
    return proposal;
  }

  private async getProjectDraftContext(projectId: string, orgId?: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      include: {
        organization: true,
        customer: true,
        siteVisits: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!project) throw new ApiError(404, `Project ${projectId} not found`);
    return project;
  }

  private normalizePaymentSchedule(input: unknown, fallback?: unknown): PaymentScheduleEntry[] | undefined {
    const source = input ?? fallback;
    if (source === undefined || source === null) return undefined;
    if (!Array.isArray(source) || source.length === 0) {
      throw new ApiError(400, "Payment schedule must include at least one milestone");
    }

    const schedule = source.map((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new ApiError(400, `Payment milestone ${index + 1} is invalid`);
      }

      const item = entry as Record<string, unknown>;
      const label = typeof item.label === "string" ? item.label.trim() : "";
      const notes = typeof item.notes === "string" ? item.notes.trim() : undefined;
      const amountPercent = typeof item.amountPercent === "number" ? item.amountPercent : Number(item.amountPercent);

      if (!label) throw new ApiError(400, `Payment milestone ${index + 1} needs a label`);
      if (!Number.isFinite(amountPercent) || amountPercent <= 0) {
        throw new ApiError(400, `Payment milestone ${index + 1} needs a positive percent`);
      }

      return {
        label,
        amountPercent: roundPercent(amountPercent),
        ...(notes ? { notes } : {}),
      };
    });

    const totalPercent = schedule.reduce((sum, entry) => sum + entry.amountPercent, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new ApiError(400, "Payment schedule must total 100%");
    }

    return schedule;
  }
}

function toDTO(row: {
  id: string;
  projectId: string;
  estimateId: string | null;
  status: string;
  companyName: string | null;
  showLineItemDetail: boolean;
  scopeOfWork: string | null;
  assumptions: string | null;
  exclusions: string | null;
  timeline: string | null;
  priceLow: unknown;
  priceHigh: unknown;
  finalPrice: unknown;
  paymentScheduleJson: unknown;
  pdfUrl: string | null;
  termsAndConditions: string | null;
  sentAt: Date | null;
  viewedAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
}): ProposalDTO {
  return {
    id: row.id,
    projectId: row.projectId,
    estimateId: row.estimateId,
    status: row.status,
    companyName: row.companyName,
    showLineItemDetail: row.showLineItemDetail,
    scopeOfWork: row.scopeOfWork,
    assumptions: row.assumptions,
    exclusions: row.exclusions,
    timeline: row.timeline,
    priceLow: toNullableNumber(row.priceLow),
    priceHigh: toNullableNumber(row.priceHigh),
    finalPrice: toNullableNumber(row.finalPrice),
    paymentScheduleJson: row.paymentScheduleJson,
    pdfUrl: row.pdfUrl,
    termsAndConditions: row.termsAndConditions,
    sentAt: row.sentAt,
    viewedAt: row.viewedAt,
    respondedAt: row.respondedAt,
    createdAt: row.createdAt,
  };
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && value && "toString" in value) return Number(String(value));
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}
