# OctoPay API — Copilot instructions

OctoPay is a fictional payments API (TypeScript, Express, Vitest) used for code review training.
These rules apply to every change in this repository.

## Review priorities (in order)

1. Correctness of money movement: amounts, currency, rounding, double-spend, idempotency.
2. Security: authorization on every resource, input validation, injection and path traversal, PII and card data exposure.
3. Tests: every behavior change ships with tests covering success, validation failures, and edge cases.
4. Maintainability: clear names, small functions, no dead code.

Skip purely cosmetic comments (formatting, import order, quote style). Prettier and the TypeScript compiler handle those.

## Money

- Store and compute money as **integer minor units** (`amountMinor`) with an explicit `currency`. Use helpers in `src/money.ts`.
- Never use floating-point arithmetic, `parseFloat`, or `toFixed` on amounts. Rates are integer basis points (`applyBasisPoints`).
- Display-only decimal strings from `formatMoney` are allowed in API responses (for example `amountDisplay`). Do not flag these; they must never be parsed back into amounts.
- Never combine amounts in different currencies without an explicit conversion step.

## API conventions

- Every route under `/v1` runs `requireMerchant`. Load resources through a merchant-scoped helper (for example `getPaymentForMerchant`) and return 404, not 403, for other merchants' resources.
- Validate request bodies at the boundary and return `400 invalid_request` through the helpers in `src/errors.ts`.
- Mutating money endpoints (capture, refund, payout) must honor the `Idempotency-Key` header.
- Never return or log full card numbers, CVV, or customer email. Use `logger`, which redacts known keys, and log IDs rather than whole objects.

## Tests

- Use Vitest and Supertest. Put tests in `tests/` and name them `*.test.ts`.
- Each new endpoint needs tests for: happy path, each validation rule, cross-merchant access, and idempotent retry where applicable.
