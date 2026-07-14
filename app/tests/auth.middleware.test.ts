const mockPrisma = {
  $transaction: jest.fn(),
  appUser: {
    findUnique: jest.fn(),
  },
  organizationMembership: {
    findFirst: jest.fn(),
  },
};

jest.mock("../db/client", () => ({ prisma: mockPrisma, basePrisma: mockPrisma }));

import { signAuthToken } from "../backend/auth/jwt";
import { requireAuth } from "../backend/middleware/auth";

describe("requireAuth middleware", () => {
  const secret = "test-secret";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_JWT_SECRET = secret;
    process.env.AUTH_ALLOW_HEADER_ORG_ID = "false";
    process.env.AUTH_ISSUER = "tradeos-costbook";
    process.env.AUTH_AUDIENCE = "tradeos-costbook-api";
    mockPrisma.$transaction.mockImplementation(async (callback: (transaction: typeof mockPrisma & { $queryRaw: jest.Mock }) => unknown) =>
      callback({ ...mockPrisma, $queryRaw: jest.fn().mockResolvedValue([]) })
    );
  });

  it("accepts a signed bearer token and loads user/org membership", async () => {
    const token = signAuthToken(
      {
        sub: "auth-sub-1",
        email: "owner@example.com",
        orgId: "org-1",
        role: "owner",
        iss: "tradeos-costbook",
        aud: "tradeos-costbook-api",
      },
      secret
    );

    mockPrisma.appUser.findUnique.mockResolvedValue({
      id: "user-1",
      authSubject: "auth-sub-1",
      email: "owner@example.com",
      isActive: true,
    });
    mockPrisma.organizationMembership.findFirst.mockResolvedValue({
      id: "membership-1",
      orgId: "org-1",
      userId: "user-1",
      role: "owner",
      status: "active",
    });

    const req = {
      header: (name: string) => (name.toLowerCase() === "authorization" ? `Bearer ${token}` : undefined),
    };
    const res = {};

    await new Promise<void>((resolve, reject) => {
      requireAuth(req as never, res as never, (err?: unknown) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    expect((req as { orgId?: string }).orgId).toBe("org-1");
    expect((req as { auth?: { userId: string; orgId: string; role: string; email?: string } }).auth).toEqual({
      userId: "user-1",
      orgId: "org-1",
      role: "owner",
      canonicalRole: "owner",
      email: "owner@example.com",
    });
  });

  it("rejects header-only org scoping when fallback is disabled", async () => {
    const req = {
      header: (name: string) => (name.toLowerCase() === "x-org-id" ? "org-1" : undefined),
    };
    const res = {};
    const next = jest.fn();

    expect(() => requireAuth(req as never, res as never, next)).toThrow("Missing bearer token");
    expect(next).not.toHaveBeenCalled();
  });
});
