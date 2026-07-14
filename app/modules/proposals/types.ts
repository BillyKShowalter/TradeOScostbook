export interface ProposalDeliveryDTO {
  id: string;
  proposalId: string;
  eventType: string;
  deliveryChannel: string;
  recipientEmail: string | null;
  actorUserId: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: Date;
  createdAt: Date;
}

export interface CreateProposalInput {
  orgId?: string;
  estimateId?: string;
  projectId?: string;
  companyName?: string;
  showLineItemDetail?: boolean;
  scopeOfWork?: string;
  assumptions?: string;
  exclusions?: string;
  timeline?: string;
  priceLow?: number | null;
  priceHigh?: number | null;
  finalPrice?: number | null;
  paymentScheduleJson?: unknown;
  termsAndConditions?: string;
}

export interface ProposalDTO {
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
  priceLow: number | null;
  priceHigh: number | null;
  finalPrice: number | null;
  paymentScheduleJson: unknown;
  pdfUrl: string | null;
  termsAndConditions: string | null;
  sentAt: Date | null;
  viewedAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
  deliveries: ProposalDeliveryDTO[];
}

export interface ProposalDraftPreviewDTO {
  companyName: string;
  normalizedJobType: string | null;
  confidenceScore: number | null;
  missingInfo: string[];
  aiQuestions: string[];
  scopeOfWork: string;
  assumptions: string;
  exclusions: string;
  timeline: string;
  priceLow: number | null;
  priceHigh: number | null;
  paymentSchedule: Array<{ label: string; amountPercent: number; notes?: string }>;
}
