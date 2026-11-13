# AGENTS.md

Standing rules for any AI agent working in this repository (Copilot, Copilot cloud agent, and other tools).

## Commands

- Install: `npm ci`
- Type-check: `npm run typecheck`
- Test: `npm test`
- Run locally: `npm start` (port 3000)

Run type-check and tests before proposing or pushing any change.

## Layout

- `src/money.ts`: integer minor-unit money helpers. Every amount goes through these.
- `src/payments/`: payment, capture, and refund logic (`*Service.ts`) and Express routes (`routes.ts`).
- `src/auth.ts`: demo merchant authentication (`x-merchant-id` header).
- `tests/`: Vitest + Supertest tests.

## Boundaries

- Do not add runtime dependencies without explaining why in the pull request description.
- Do not weaken existing tests to make a change pass.
- Keep pull requests small and focused on a single concern.
