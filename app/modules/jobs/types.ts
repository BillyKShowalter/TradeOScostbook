import { AuthContext } from "../../backend/auth/context";
import { JobStatus } from "../../domain/contracts";

export const jobPriorities = ["low", "medium", "high", "urgent"] as const;
export type JobPriority = (typeof jobPriorities)[number];

export const jobAssignmentRoles = ["lead", "technician", "helper"] as const;
export type JobAssignmentRole = (typeof jobAssignmentRoles)[number];

export interface JobListFilters {
  orgId: string;
  auth: AuthContext;
  status?: JobStatus;
  priority?: JobPriority;
  projectId?: string;
  customerId?: string;
  technicianId?: string;
  scheduledFrom?: Date;
  scheduledTo?: Date;
  archived?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateJobInput {
  orgId: string;
  actor: AuthContext;
  projectId: string;
  customerId: string;
  serviceAddressId: string;
  title: string;
  description?: string;
  jobType: string;
  priority?: JobPriority;
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  arrivalWindowStart?: Date | null;
  arrivalWindowEnd?: Date | null;
  estimatedDurationMinutes?: number | null;
  technicianIds?: string[];
  equipmentIds?: string[];
  overrideConflict?: boolean;
  overrideReason?: string;
}

export interface UpdateJobInput {
  orgId: string;
  actor: AuthContext;
  projectId?: string;
  customerId?: string;
  serviceAddressId?: string;
  title?: string;
  description?: string;
  jobType?: string;
  priority?: JobPriority;
  equipmentIds?: string[];
}

export interface ScheduleJobInput {
  orgId: string;
  actor: AuthContext;
  scheduledStart: Date;
  scheduledEnd: Date;
  arrivalWindowStart?: Date | null;
  arrivalWindowEnd?: Date | null;
  estimatedDurationMinutes?: number | null;
  overrideConflict?: boolean;
  overrideReason?: string;
}

export interface AddJobAssignmentInput {
  orgId: string;
  actor: AuthContext;
  userId: string;
  assignmentRole: JobAssignmentRole;
  isLead?: boolean;
  overrideConflict?: boolean;
  overrideReason?: string;
}

export interface UpdateJobAssignmentInput {
  orgId: string;
  actor: AuthContext;
  assignmentRole?: JobAssignmentRole;
  isLead?: boolean;
  overrideConflict?: boolean;
  overrideReason?: string;
}

export interface JobTransitionInput {
  orgId: string;
  actor: AuthContext;
  reason?: string;
}

export interface ReopenJobInput extends JobTransitionInput {
  status?: "unscheduled" | "scheduled";
}

export interface JobSummaryDTO {
  id: string;
  jobNumber: string;
  title: string;
  jobType: string;
  status: JobStatus;
  priority: JobPriority;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  archivedAt: string | null;
}

export interface JobAssignmentDTO {
  id: string;
  jobId: string;
  userId: string;
  assignmentRole: JobAssignmentRole;
  isLead: boolean;
  assignedAt: string;
  assignedById: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
}

export interface JobEquipmentDTO {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  status: string;
}

export interface JobTaskDTO {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: string | null;
  completedAt: string | null;
  notes: string | null;
}

export interface JobSiteVisitDTO {
  id: string;
  notes: string | null;
  transcript: string | null;
  detailsJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobNoteDTO {
  id: string;
  body: string;
  authorUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobActivityDTO {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  actorUserId: string | null;
  occurredAt: string;
  metadata: Record<string, unknown> | null;
}

export interface JobDTO extends JobSummaryDTO {
  projectId: string;
  customerId: string;
  serviceAddressId: string;
  description: string;
  arrivalWindowStart: string | null;
  arrivalWindowEnd: string | null;
  estimatedDurationMinutes: number | null;
  actualStart: string | null;
  actualEnd: string | null;
  completedAt: string | null;
  completedById: string | null;
  readyForInvoiceAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    status: string;
  };
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  serviceAddress: {
    id: string;
    label: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string | null;
  };
  assignments: JobAssignmentDTO[];
  equipment: JobEquipmentDTO[];
  tasks: JobTaskDTO[];
  siteVisits: JobSiteVisitDTO[];
  notes: JobNoteDTO[];
  recentActivity: JobActivityDTO[];
}

export interface PaginatedJobsDTO {
  items: JobSummaryDTO[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ScheduleConflictDTO {
  type: "technician_overlap";
  technicianId: string;
  technicianName: string | null;
  conflictingJobId: string;
  conflictingJobNumber: string;
  conflictingJobTitle: string;
  conflictingScheduledStart: string;
  conflictingScheduledEnd: string;
}

export interface ScheduleConflictResultDTO {
  conflicts: ScheduleConflictDTO[];
  overrideAllowed: boolean;
}
