/**
 * Organization domain errors.
 *
 * Thrown by modules/onboarding and any module that needs to enforce
 * org-membership invariants. Captured at the UI boundary.
 */

export class OrganizationNotFoundError extends Error {
  readonly code = "ORG_NOT_FOUND";
  constructor(message = "Organização não encontrada.") {
    super(message);
    this.name = "OrganizationNotFoundError";
  }
}

export class DuplicateOrgKindError extends Error {
  readonly code = "ORG_DUPLICATE_KIND";
  constructor(
    message = "Você já possui uma organização desse tipo. No MVP, é permitido um por tipo.",
  ) {
    super(message);
    this.name = "DuplicateOrgKindError";
  }
}

export class NotAMemberError extends Error {
  readonly code = "ORG_NOT_A_MEMBER";
  constructor(message = "Você não é membro desta organização.") {
    super(message);
    this.name = "NotAMemberError";
  }
}
