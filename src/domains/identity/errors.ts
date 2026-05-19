/**
 * Identity — domain errors.
 *
 * Thrown by `modules/auth/require.ts`. Caught by route handlers / Server
 * Actions, which translate to HTTP status or UI states.
 */

export class UnauthorizedError extends Error {
  readonly kind = "Unauthorized" as const;
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly kind = "Forbidden" as const;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function isAuthError(
  err: unknown,
): err is UnauthorizedError | ForbiddenError {
  return err instanceof UnauthorizedError || err instanceof ForbiddenError;
}
