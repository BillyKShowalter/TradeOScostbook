import type { CanonicalRole, SupportedRole } from "../../domain";

export interface AuthContext {
  userId: string;
  orgId: string;
  role: SupportedRole;
  canonicalRole?: CanonicalRole;
  email?: string;
}
