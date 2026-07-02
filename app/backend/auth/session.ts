import { Prisma } from "@prisma/client";
import { basePrisma } from "../../db/client";
import { AuthContext } from "./context";
import { AuthClaims } from "./jwt";
import { ApiError } from "../middleware/errorHandler";

export async function resolveAuthContext(claims: AuthClaims): Promise<AuthContext> {
  return basePrisma.$transaction(async (transaction) => {
    await transaction.$queryRaw(Prisma.sql`
      select
        set_config('app.auth_subject', ${claims.sub}, true),
        set_config('app.org_id', ${claims.orgId}, true)
    `);

    const user = await transaction.appUser.findUnique({ where: { authSubject: claims.sub } });
    if (!user || !user.isActive) {
      throw new ApiError(403, "Authenticated user is not provisioned in this organization");
    }

    await transaction.$queryRaw(Prisma.sql`
      select set_config('app.user_id', ${user.id}, true)
    `);

    const membership = await transaction.organizationMembership.findFirst({
      where: { orgId: claims.orgId, userId: user.id, status: "active" },
    });
    if (!membership) {
      throw new ApiError(403, "Authenticated user does not belong to the requested organization");
    }

    return {
      userId: user.id,
      orgId: membership.orgId,
      role: membership.role,
      email: user.email,
    };
  });
}
