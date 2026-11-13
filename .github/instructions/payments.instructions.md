---
applyTo: "src/payments/**/*.ts"
---

# Payments module rules

These rules apply only to files in `src/payments/`.

- A refund's total (existing refunds + new refund) must never exceed `capturedMinor`. Only `captured` or `partially_refunded` payments are refundable.
- After a refund, update `refundedMinor` and set `status` to `partially_refunded` or `refunded`. Debit the merchant balance in the same operation.
- Do not perform an `await` between reading a balance and writing it back. Read-check-write on balances must be atomic to prevent double payouts.
- Currency conversion must use integer rates (micro-units or basis points), convert between each currency's minor-unit digits (`MINOR_UNIT_DIGITS`), and state the rounding direction explicitly.
- When splitting an amount across recipients, distribute the remainder so the parts always sum to the original amount.
- File access must resolve paths and confirm they stay inside the intended directory.
