import type { Request, Response } from "express";
import { assignRequestId, parseTrustProxy, securityHeaders } from "../backend/middleware/productionHardening";

function mockResponse() {
  const res = {
    locals: {},
    setHeader: jest.fn(),
  } as unknown as Response;
  return res;
}

describe("parseTrustProxy", () => {
  it("parses booleans, integers, and passthrough values", () => {
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy("true")).toBe(true);
    expect(parseTrustProxy("false")).toBe(false);
    expect(parseTrustProxy("2")).toBe(2);
    expect(parseTrustProxy("loopback")).toBe("loopback");
  });
});

describe("assignRequestId", () => {
  it("reuses a caller-provided request id", () => {
    const req = { header: jest.fn().mockReturnValue("incoming-id") } as unknown as Request;
    const res = mockResponse();
    const next = jest.fn();

    assignRequestId(req, res, next);

    expect(res.locals).toMatchObject({ requestId: "incoming-id" });
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", "incoming-id");
    expect(next).toHaveBeenCalled();
  });
});

describe("securityHeaders", () => {
  const originalHsts = process.env.ENABLE_STRICT_TRANSPORT_SECURITY;

  afterEach(() => {
    process.env.ENABLE_STRICT_TRANSPORT_SECURITY = originalHsts;
  });

  it("applies api-safe headers and no-store cache policy", () => {
    process.env.ENABLE_STRICT_TRANSPORT_SECURITY = "true";

    const req = { path: "/api/v1/projects" } as Request;
    const res = mockResponse();
    const next = jest.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
    expect(res.setHeader).toHaveBeenCalledWith("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(next).toHaveBeenCalled();
  });
});
