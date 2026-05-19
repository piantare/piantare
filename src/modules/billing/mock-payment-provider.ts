import "server-only";

import type {
  ChargeRequest,
  ChargeResult,
  PaymentProvider,
} from "./payment-provider";

/**
 * In-memory mock payment provider. Generates a deterministic-ish reference
 * from the order id so the same order always maps to the same charge.
 *
 * Deliberately stateless: it doesn't track its own ledger — the invoices
 * table is the source of truth.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createCharge(req: ChargeRequest): Promise<ChargeResult> {
    return {
      providerReference: `mock_${req.orderId}`,
      status: "pending",
    };
  }

  async markPaid(): Promise<void> {
    // No-op for the mock: the invoices row is updated by the calling module.
  }
}

let cached: PaymentProvider | null = null;

/**
 * Returns the active payment provider. Today: always MockPaymentProvider.
 * When Stripe / StarkBank land, this becomes a config switch.
 */
export function getPaymentProvider(): PaymentProvider {
  if (!cached) cached = new MockPaymentProvider();
  return cached;
}
