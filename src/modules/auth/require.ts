import {
  ForbiddenError,
  UnauthorizedError,
  type CurrentUser,
  type Role,
} from "@/domains/identity";

import { getCurrentUser } from "./get-current-user";

/**
 * Returns the current user or throws UnauthorizedError.
 * Use in protected Server Actions, Route Handlers, and Server Components.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

/**
 * Returns the current user or throws.
 * - UnauthorizedError if no session.
 * - ForbiddenError if user's role is not in `roles`, or user has no role yet.
 *
 * `admin` always satisfies any role check.
 */
export async function requireRole(
  roles: readonly Role[],
): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role === "admin") {
    return user;
  }
  if (!user.role || !roles.includes(user.role)) {
    throw new ForbiddenError(
      `Required role: ${roles.join(" | ")}. Actual: ${user.role ?? "none"}.`,
    );
  }
  return user;
}
