---
name: payments-code-review
description: Review checklist for pull requests that move money (payments, captures, refunds, payouts, currency conversion). Use when reviewing changes under src/payments/ or anything touching amounts, balances, or idempotency.
---

# Payments code review

When reviewing a change that moves money, work through this checklist and report each problem as a separate review comment with a concrete fix.

1. **Amount type**: Are all amounts integer minor units? Flag `parseFloat`, `toFixed`, `* 100`, division, or decimal literals applied to amounts.
2. **Bounds**: Are amounts positive and safe integers? Can a refund or payout exceed what is available (captured minus refunded, or balance)?
3. **Currency**: Does the code check that currencies match? Is conversion done with integer rates and the correct minor-unit digits (JPY has 0)?
4. **Authorization**: Is every resource loaded through a merchant-scoped helper? Could merchant A act on merchant B's payment?
5. **Idempotency and concurrency**: Does the mutating endpoint honor `Idempotency-Key`? Is there an `await` between a balance read and its write?
6. **Data exposure**: Do logs or responses include card numbers, CVV, email, or whole request bodies?
7. **Tests**: Are there tests for validation failures, cross-merchant access, over-refund or over-payout, and idempotent retry?

Classify each finding as **blocking** (incorrect money movement, security) or **non-blocking** (maintainability). Do not comment on formatting.
