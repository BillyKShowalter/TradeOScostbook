import "server-only";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface ApiFetchOptions extends RequestInit {
  token?: string;
}

// Server-only fetch wrapper around the Express API. Centralizes the
// Authorization header and the error-shape parsing for the backend's
// consistent { error, details? } JSON error responses (see errorHandler.ts).
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiClientError(body?.error ?? "Request failed", response.status, body?.details);
  }

  return body as T;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  billingAddress: string | null;
  notes: string | null;
  createdAt: string;
}

export function listCustomers(token: string) {
  return apiFetch<Customer[]>("/api/v1/customers", { token });
}

export function getCustomer(token: string, id: string) {
  return apiFetch<Customer & { projects: Project[] }>(`/api/v1/customers/${id}`, { token });
}

export const PROJECT_STATUSES = [
  "lead",
  "site_visit",
  "proposal_draft",
  "proposal_sent",
  "accepted",
  "in_production",
  "completed",
  "lost",
  "estimating",
  "proposed",
  "won",
  "active",
  "complete",
] as const;
type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  orgId: string | null;
  customerId: string | null;
  name: string;
  title?: string;
  jobType: string | null;
  siteAddress: string | null;
  projectAddress?: string | null;
  simpleScope: string | null;
  regionId: string | null;
  status: ProjectStatus;
  createdAt: string;
}

export interface SiteVisit {
  id: string;
  transcript: string | null;
  notes: string | null;
  measurementsJson: Record<string, unknown> | null;
  aiQuestionsJson: string[] | null;
  missingInfoJson: string[] | null;
  confidenceScore: number | null;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  fileType: string;
  fileUrl: string;
  fileName: string;
  storagePath: string | null;
  createdAt: string;
}

export function listProjects(token: string) {
  return apiFetch<Project[]>("/api/v1/projects", { token });
}

export interface Estimate {
  id: string;
  projectId: string;
  version: number;
  status: string;
  overheadPct: number;
  profitPct: number;
  targetMarginPct: number | null;
  subtotalCost: number;
  totalPrice: number;
}

export function getProject(token: string, id: string) {
  return apiFetch<
    Project & {
      customer: Customer | null;
      estimates: Estimate[];
      siteVisits: SiteVisit[];
      projectFiles: ProjectFile[];
      proposals: Proposal[];
    }
  >(`/api/v1/projects/${id}`, { token });
}

export interface Proposal {
  id: string;
  projectId: string;
  estimateId: string | null;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected";
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
  sentAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface ProposalPaymentScheduleEntry {
  label: string;
  amountPercent: number;
  notes?: string;
}

export interface ProposalDraftPreview {
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
  paymentSchedule: ProposalPaymentScheduleEntry[];
}

export function getProposal(token: string, id: string) {
  return apiFetch<Proposal>(`/api/v1/proposals/${id}`, { token });
}

export function getProjectProposalDraft(token: string, projectId: string) {
  return apiFetch<ProposalDraftPreview>(`/api/v1/proposals/project-draft/${projectId}`, { token });
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  lineCost: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  estimateId: string | null;
  proposalId: string | null;
  invoiceNumber: number;
  type: "full" | "progress";
  status: "draft" | "sent" | "paid" | "overdue" | "void";
  percentComplete: number | null;
  amount: number;
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export function getInvoice(token: string, id: string) {
  return apiFetch<Invoice & { lineItems: InvoiceLineItem[] }>(`/api/v1/invoices/${id}`, { token });
}

export interface Contract {
  id: string;
  projectId: string;
  proposalId: string;
  status: "pending_signature" | "signed" | "voided";
  termsText: string;
  signerName: string | null;
  signerEmail: string | null;
  signatureDataUrl: string | null;
  signatureIp: string | null;
  signedAt: string | null;
  createdAt: string;
}

export function getContract(token: string, id: string) {
  return apiFetch<Contract>(`/api/v1/contracts/${id}`, { token });
}
