import crypto from "crypto";
import { ApiError } from "../middleware/errorHandler";

export interface AuthClaims {
  sub: string;
  email?: string;
  orgId: string;
  role: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
}

interface JwtHeader {
  alg: "HS256";
  typ: "JWT";
}

function base64UrlEncode(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Buffer {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(base64, "base64");
}

function parseSegment<T>(segment: string, label: string): T {
  try {
    return JSON.parse(base64UrlDecode(segment).toString("utf8")) as T;
  } catch {
    throw new ApiError(401, `Invalid ${label} encoding`);
  }
}

export function signAuthToken(claims: AuthClaims, secret: string): string {
  if (!secret) throw new Error("AUTH_JWT_SECRET is required to sign auth tokens");
  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    ...claims,
    iat: claims.iat ?? iat,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", secret).update(signingInput).digest();
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

export function verifyAuthToken(token: string, secret: string): AuthClaims {
  if (!secret) throw new ApiError(500, "AUTH_JWT_SECRET is not configured");
  const parts = token.split(".");
  if (parts.length !== 3) throw new ApiError(401, "Invalid bearer token");

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseSegment<JwtHeader>(encodedHeader, "JWT header");
  if (header.alg !== "HS256") throw new ApiError(401, "Unsupported JWT algorithm");

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(signingInput).digest();
  const receivedSignature = base64UrlDecode(encodedSignature);
  if (
    receivedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    throw new ApiError(401, "Invalid bearer token signature");
  }

  const payload = parseSegment<Partial<AuthClaims>>(encodedPayload, "JWT payload");
  if (!payload.sub || !payload.orgId || !payload.role) {
    throw new ApiError(401, "JWT payload is missing required claims");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp != null && payload.exp < now) {
    throw new ApiError(401, "Bearer token has expired");
  }

  const expectedIssuer = process.env.AUTH_ISSUER;
  if (expectedIssuer && payload.iss !== expectedIssuer) {
    throw new ApiError(401, "Bearer token issuer mismatch");
  }

  const expectedAudience = process.env.AUTH_AUDIENCE;
  if (expectedAudience) {
    const audiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
    if (!audiences.includes(expectedAudience)) {
      throw new ApiError(401, "Bearer token audience mismatch");
    }
  }

  return payload as AuthClaims;
}

