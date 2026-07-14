export interface SignupInput {
  organizationName: string;
  regionCode?: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface SupabaseBootstrapInput {
  organizationName: string;
  regionCode?: string;
  authSubject: string;
  email: string;
  fullName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshSessionInput {
  refreshToken: string;
}

export interface RequestPasswordResetInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface InviteTeamMemberInput {
  orgId: string;
  invitedByUserId: string;
  email: string;
  role: string;
}

export interface AcceptInviteInput {
  token: string;
  password: string;
  fullName?: string;
}

export interface AuthSessionResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
  organization: {
    id: string;
    name: string;
  };
  role: string;
}

export interface PasswordResetRequestResult {
  success: true;
  resetToken?: string;
}

export interface InviteTeamMemberResult {
  inviteId: string;
  email: string;
  role: string;
  expiresAt: Date;
  inviteToken?: string;
}
