import "server-only";

/**
 * Minimal payment provider contract. Lets us swap MockPaymentProvider for
 * Stripe / StarkBank later without changing call sites.
 *
 * MVP scope: charges are recorded as `invoices` rows, not actual money
 * movement. `createCharge` returns a synthetic provider reference so the UI
 * can show "invoice generated" status.
 */

export type ChargeRequest = {
  orderId: string;
  amountUsd: number;
  description?: string;
};

export type ChargeResult = {
  providerReference: string;
  status: "pending" | "paid";
};

export interface PaymentProvider {
  readonly name: string;
  createCharge(req: ChargeRequest): Promise<ChargeResult>;
  markPaid(providerReference: string): Promise<void>;
}
