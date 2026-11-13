---
applyTo: "tests/**/*.ts"
---

# Test rules

- Build a fresh `Store` and app in `beforeEach`. Tests must not share state.
- Assert on HTTP status and response body, and on store side effects such as balances.
- Prefer `it.each` tables for validation rules.
- Do not assert on log output or on implementation details such as private helper calls.
- A test that only covers the happy path is incomplete for any endpoint that moves money.
