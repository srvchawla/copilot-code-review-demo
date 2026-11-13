import type { Payment, Refund } from "./payments/types.js";

/** In-memory persistence. Swap for a real database in production. */
export class Store {
  readonly payments = new Map<string, Payment>();
  readonly refunds = new Map<string, Refund>();
  /** Idempotency records keyed by `${merchantId}:${scope}:${key}`. Use `withIdempotency`. */
  readonly idempotency = new Map<string, unknown>();
  /** Merchant balances in minor units, keyed by `${merchantId}:${currency}`. */
  readonly balances = new Map<string, number>();
}
