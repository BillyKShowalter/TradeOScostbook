process.env.AUTH_JWT_SECRET = "test-secret";

const mockTransactionClient = {
  $queryRaw: jest.fn(),
  appUser: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  organizationMembership: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  organization: {
    findUnique: jest.fn(),
  },
  authRefreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  organizationInvite: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userTotpCredential: {
    findUnique: jest.fn(),
  },
};

const mockBasePrisma = {
  $transaction: jest.fn((callback: (tx: typeof mockTransactionClient) => unknown) => callback(mockTransactionClient)),
  appUser: {
    findFirst: jest.fn(),
  },
};

const mockPrisma = {
  organizationInvite: {
    create: jest.fn(),
  },
  userTotpCredential: {
    findUnique: jest.fn(),
  },
};

const mockProvision = jest.fn();

jest.mock("../db/client", () => ({ basePrisma: mockBasePrisma, prisma: mockPrisma }));
jest.mock("../modules/organization-provisioning/service", () => ({
  OrganizationProvisioningService: jest.fn().mockImplementation(() => ({ provision: mockProvision })),
}));

import { hashPassword } from "../backend/auth/password";
import { AuthService } from "../modules/auth/service";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBasePrisma.$transaction.mockImplementation((callback: (tx: typeof mockTransactionClient) => unknown) =>
      callback(mockTransactionClient)
    );
    mockTransactionClient.userTotpCredential.findUnique.mockResolvedValue(null);
  });

  it("signs up a new organization and returns a usable session with refresh token", async () => {
    mockProvision.mockResolvedValue({
      organization: { id: "org-1", name: "Acme Co", regionCode: null },
      owner: { userId: "user-1", membershipId: "membership-1", authSubject: "local:abc", email: "owner@example.com", role: "owner", status: "active" },
    });

    const service = new AuthService();
    const result = await service.signup({
      organizationName: "Acme Co",
      email: "Owner@Example.com",
      password: "super-secret-1",
      fullName: "Owner Person",
    });

    expect(result.organization).toEqual({ id: "org-1", name: "Acme Co" });
    expect(result.role).toBe("owner");
    expect(typeof result.token).toBe("string");
    expect(typeof result.refreshToken).toBe("string");
    expect(mockTransactionClient.authRefreshToken.create).toHaveBeenCalled();
  });

  it("logs in a user with the correct password and an active membership", async () => {
    const passwordHash = await hashPassword("correct-password");
    mockTransactionClient.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "local:abc",
      email: "owner@example.com",
      fullName: "Owner Person",
      isActive: true,
      passwordHash,
    });
    mockTransactionClient.organizationMembership.findFirst.mockResolvedValue({ id: "membership-1", orgId: "org-1", role: "owner" });
    mockTransactionClient.organization.findUnique.mockResolvedValue({ id: "org-1", name: "Acme Co" });

    const service = new AuthService();
    const result = await service.login({ email: "owner@example.com", password: "correct-password" });

    expect(result.user.email).toBe("owner@example.com");
    expect(result.organization).toEqual({ id: "org-1", name: "Acme Co" });
    expect(result.role).toBe("owner");
    expect(result.refreshToken).toBeTruthy();
  });

  it("rejects login with an incorrect password", async () => {
    const passwordHash = await hashPassword("correct-password");
    mockTransactionClient.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "local:abc",
      email: "owner@example.com",
      fullName: null,
      isActive: true,
      passwordHash,
    });

    const service = new AuthService();
    await expect(service.login({ email: "owner@example.com", password: "wrong-password" })).rejects.toThrow("Invalid email or password");
  });

  it("rotates refresh tokens", async () => {
    mockTransactionClient.authRefreshToken.findUnique.mockResolvedValue({
      id: "rt-1",
      orgId: "org-1",
      userId: "user-1",
      membershipId: "membership-1",
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    mockTransactionClient.organizationMembership.findFirst.mockResolvedValue({
      id: "membership-1",
      orgId: "org-1",
      userId: "user-1",
      role: "dispatcher",
      status: "active",
    });
    mockTransactionClient.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "local:abc",
      email: "dispatch@example.com",
      fullName: "Dispatch",
      isActive: true,
    });
    mockTransactionClient.organization.findUnique.mockResolvedValue({ id: "org-1", name: "Acme Co" });

    const service = new AuthService();
    const result = await service.refresh({ refreshToken: "refresh-token" });

    expect(result.role).toBe("dispatcher");
    expect(mockTransactionClient.authRefreshToken.update).toHaveBeenCalled();
    expect(mockTransactionClient.authRefreshToken.create).toHaveBeenCalledTimes(1);
  });

  it("creates password reset tokens without leaking unknown-email status", async () => {
    mockTransactionClient.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "local:abc",
      email: "owner@example.com",
      fullName: "Owner",
      isActive: true,
    });

    const service = new AuthService();
    const result = await service.requestPasswordReset({ email: "owner@example.com" });

    expect(result.success).toBe(true);
    expect(mockTransactionClient.passwordResetToken.create).toHaveBeenCalled();
  });

  it("allows owners to create dispatcher and technician invites", async () => {
    mockPrisma.organizationInvite.create.mockResolvedValue({
      id: "invite-1",
      email: "tech@example.com",
      role: "technician",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const service = new AuthService();
    const result = await service.inviteTeamMember({
      orgId: "org-1",
      invitedByUserId: "owner-1",
      email: "tech@example.com",
      role: "technician",
    });

    expect(result.role).toBe("technician");
    expect(mockPrisma.organizationInvite.create).toHaveBeenCalled();
  });
});
