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

export interface AuthSession {
  token: string;
  user: { id: string; email: string; fullName: string | null };
  organization: { id: string; name: string };
  role: string;
}

export function signup(input: { organizationName: string; regionCode?: string; email: string; password: string; fullName?: string }) {
  return apiFetch<AuthSession>("/api/v1/auth/signup", { method: "POST", body: JSON.stringify(input) });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthSession>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(input) });
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
  "opportunity",
  "estimate",
  "proposal",
  "contract",
  "active_job",
  "field_execution",
  "change_orders",
  "closeout",
  "warranty",
  "archived",
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
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

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
  detailsJson: {
    arrivalAt?: string;
    departureAt?: string;
    gps?: string;
    customerNotes?: string;
    materialsNeeded?: string[];
    safetyNotes?: string[];
    punchList?: string[];
    voiceNoteStatus?: "not_recorded" | "captured_later";
  } | null;
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
  createdAt?: string;
}

export interface AIEstimateSuggestion {
  id: string;
  kind: "assembly" | "costItem";
  code: string;
  title: string;
  rationale: string;
  quantity: number;
  unit: string;
  confidence: number;
  resolution: {
    status: "resolved" | "unresolved";
    reason: string;
    target: {
      id: string;
      kind: "assembly" | "costItem";
      code: string;
      name: string;
      unitOfMeasure: string;
      matchMethod: "id" | "exact-name" | "contains-name";
      matchScore: number;
    } | null;
  };
}

export function getAIEstimateSuggestions(token: string, estimateId: string, scopeOfWork: string) {
  return apiFetch<{ scopeOfWork: string; suggestions: AIEstimateSuggestion[]; knowledgeMatch: KnowledgeScopeMatch }>(
    `/api/v1/estimates/${estimateId}/ai-suggestions`,
    {
      token,
      method: "POST",
      body: JSON.stringify({ scopeOfWork }),
    }
  );
}

export function applyAIEstimateSuggestions(
  token: string,
  estimateId: string,
  suggestions: Array<{
    id: string;
    kind: "assembly" | "costItem";
    title: string;
    quantity: number;
    status: "pending" | "accepted" | "rejected";
    description?: string;
    targetId?: string;
    targetKind?: "assembly" | "costItem";
  }>
) {
  return apiFetch<{
    applied: Array<{ suggestionId: string; lineItemId: string; title: string; quantity: number }>;
    skipped: Array<{ suggestionId: string; title: string; status: "pending" | "accepted" | "rejected"; reason: string }>;
  }>(`/api/v1/estimates/${estimateId}/ai-suggestions/apply`, {
    token,
    method: "POST",
    body: JSON.stringify({ suggestions }),
  });
}

export interface KnowledgeStats {
  readOnly: true;
  assembliesCount: number;
  costItemsCount: number;
  tradesCount: number;
  schemaCount: number;
  indexedKeywordCount: number;
  sourceFileCount: number;
  loadWarnings: string[];
  sources: {
    exportsDir: string;
    knowledgeDir: string;
    schemasDir: string;
  };
}

export interface KnowledgeTrade {
  id: string;
  name: string;
  itemCount: number;
  status: string;
  coverage: string;
  notes: string;
  keywords: string[];
}

export interface KnowledgeSearchResult {
  id: string;
  type: "assembly" | "costItem";
  name: string;
  category: string;
  trade: string | null;
  unitOfMeasure: string | null;
  description: string;
  confidence: number;
  matchedKeywords: string[];
  rationale: string;
  metadata: Record<string, unknown>;
}

export interface KnowledgeScopeMatch {
  detectedTrade: string | null;
  confidenceScore: number;
  assumptions: string[];
  rationale: string[];
  missingInformation: string[];
  reviewWarnings: string[];
  missingInputs: string[];
  humanReviewWarnings: string[];
  matchedAssemblies: KnowledgeSearchResult[];
  matchedCostItems: KnowledgeSearchResult[];
}

export function getKnowledgeStats(token: string) {
  return apiFetch<KnowledgeStats>("/api/v1/knowledge/stats", { token });
}

export function getKnowledgeTrades(token: string) {
  return apiFetch<KnowledgeTrade[]>("/api/v1/knowledge/trades", { token });
}

export function getKnowledgeMatchScope(token: string, scopeText: string) {
  return apiFetch<KnowledgeScopeMatch>("/api/v1/knowledge/match", {
    token,
    method: "POST",
    body: JSON.stringify({ scopeText }),
  });
}

export function searchKnowledge(token: string, input: { query: string; type?: "assembly" | "costItem" | "all"; trade?: string; limit?: number }) {
  const params = new URLSearchParams();
  params.set("q", input.query);
  if (input.type) params.set("type", input.type);
  if (input.trade) params.set("trade", input.trade);
  if (input.limit) params.set("limit", String(input.limit));

  return apiFetch<KnowledgeSearchResult[]>(`/api/v1/knowledge/search?${params.toString()}`, { token });
}

export function getProject(token: string, id: string) {
  return apiFetch<
    Project & {
      customer: Customer | null;
      estimates: Estimate[];
      siteVisits: SiteVisit[];
      projectFiles: ProjectFile[];
      proposals: Proposal[];
      invoices: Array<Invoice & { lineItems: InvoiceLineItem[] }>;
      contracts: Contract[];
      changeOrders: ChangeOrder[];
      tasks: ProjectTask[];
    }
  >(`/api/v1/projects/${id}`, { token });
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  estimateId: string | null;
  coNumber: number;
  description: string;
  status: "draft" | "approved" | "rejected";
  amount: number;
  scheduleImpactDays: number | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeOrderLineItem {
  id: string;
  changeOrderId: string;
  costItemId: string | null;
  description: string;
  quantity: number;
  unitCost: number;
  lineCost: number;
  sortOrder: number;
}

export function listChangeOrdersByProject(token: string, projectId: string) {
  return apiFetch<ChangeOrder[]>(`/api/v1/change-orders/by-project/${projectId}`, { token });
}

export function getChangeOrder(token: string, id: string) {
  return apiFetch<ChangeOrder & { lineItems: ChangeOrderLineItem[] }>(`/api/v1/change-orders/${id}`, { token });
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  status: "todo" | "in_progress" | "blocked" | "completed";
  assignedTo: string | null;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function listProjectTasks(token: string, projectId: string) {
  return apiFetch<ProjectTask[]>(`/api/v1/projects/${projectId}/tasks`, { token });
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

export function listProposalsByProject(token: string, projectId: string) {
  return apiFetch<Proposal[]>(`/api/v1/proposals/by-project/${projectId}`, { token });
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
  status: "draft" | "sent" | "paid" | "overdue" | "void" | "partially_paid" | "cancelled";
  percentComplete: number | null;
  amount: number;
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export function listInvoicesByProject(token: string, projectId: string) {
  return apiFetch<Invoice[]>(`/api/v1/invoices/by-project/${projectId}`, { token });
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

export function listContractsByProject(token: string, projectId: string) {
  return apiFetch<Contract[]>(`/api/v1/contracts/by-project/${projectId}`, { token });
}

export function getContract(token: string, id: string) {
  return apiFetch<Contract>(`/api/v1/contracts/${id}`, { token });
}
