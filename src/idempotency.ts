import { conflict } from "./errors.js";
import type { Store } from "./store.js";

interface IdempotencyRecord {
  fingerprint: string;
  response: unknown;
}

/**
 * Runs `operation` at most once per merchant, scope, and Idempotency-Key.
 * A retry with the same key and request body replays the stored response.
 * A reused key with a different body is rejected.
 */
export function withIdempotency<T>(
  store: Store,
  merchantId: string,
  scope: string,
  key: string | undefined,
  requestBody: unknown,
  operation: () => T,
): T {
  if (!key) return operation();

  const storeKey = `${merchantId}:${scope}:${key}`;
  const fingerprint = JSON.stringify(requestBody ?? {});
  const existing = store.idempotency.get(storeKey) as IdempotencyRecord | undefined;
  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      throw conflict("Idempotency-Key was reused with a different request");
    }
    return existing.response as T;
  }

  const response = operation();
  store.idempotency.set(storeKey, { fingerprint, response } satisfies IdempotencyRecord);
  return response;
}
