---
name: payments-code-review
description: How to review and report on pull requests that move money (payments, captures, refunds, payouts, currency conversion). Use when reviewing changes under src/payments/ or anything touching amounts, balances, or idempotency.
---

# Payments code review

The rules themselves live in `.github/copilot-instructions.md` and `.github/instructions/payments.instructions.md`. This skill defines **how** to review and report against them.

## Process

1. Read the pull request description. Note any mismatch between the stated risk checkboxes and what the diff actually does.
2. For each changed endpoint, trace one request end to end: authentication → resource lookup → validation → state change → response and logs.
3. For each state change to an amount or balance, ask: what happens with a negative, zero, fractional, huge, or repeated (retried or concurrent) request?
4. Compare new code with existing helpers (`src/money.ts`, `src/idempotency.ts`, `getPaymentForMerchant`, `logger`). Flag new code that reimplements or bypasses them.
5. List the tests that would have caught each finding.

## Reporting

- One comment per problem, anchored on the line where it should be fixed.
- Start with **Blocking:** (incorrect money movement, security, data exposure) or **Non-blocking:** (maintainability).
- Give a concrete failing input (for example "refund `-5` credits the merchant") and a suggested fix.
- Do not comment on formatting or import order.
