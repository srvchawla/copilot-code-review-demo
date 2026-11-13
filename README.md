# Copilot code review demo: OctoPay API

A small, fictional payments API for a hands-on workshop on **GitHub Copilot code review** and code review best practices. Every feature in the workshop deck appears in this repository, either as a file or as a seeded pull request.

> [!NOTE]
> OctoPay is fictional. The `scenario/*` branches contain **deliberately planted defects** for training. Do not reuse that code.

## How the deck maps to this repository

| Deck topic | Where it lives |
| --- | --- |
| Clear changes | [`.github/pull_request_template.md`](.github/pull_request_template.md): intent, verification, risk |
| Repository-wide standards | [`.github/copilot-instructions.md`](.github/copilot-instructions.md) |
| Path-specific standards | [`.github/instructions/payments.instructions.md`](.github/instructions/payments.instructions.md) (`src/payments/**`), [`tests.instructions.md`](.github/instructions/tests.instructions.md) (`tests/**`) |
| Cross-agent rules | [`AGENTS.md`](AGENTS.md) |
| Review skill | [`.github/skills/payments-review/SKILL.md`](.github/skills/payments-review/SKILL.md): used automatically when relevant |
| Automatic review | [`.github/rulesets/copilot-auto-review.json`](.github/rulesets/copilot-auto-review.json): reviews on open and on every push |
| Review effort (Lite / Balanced / Max) | Chosen per request in the **Reviewers** menu, or as a default in settings |
| Instructions on vs. off | `scripts/open-scenario-pr.sh --no-instructions <scenario>` opens the same change with instructions and skills removed on the head branch |
| Hand-off to Copilot cloud agent | [`.github/workflows/copilot-setup-steps.yml`](.github/workflows/copilot-setup-steps.yml) prepares the agent's environment |
| Quality gates | [`.github/rulesets/main-quality-gates.json`](.github/rulesets/main-quality-gates.json): CI, CodeQL, CODEOWNERS approval, resolved threads |
| CI | [`.github/workflows/ci.yml`](.github/workflows/ci.yml): type-check and tests (`test` check) |
| Human judgment | [`.github/CODEOWNERS`](.github/CODEOWNERS): a human approval is still required |
| False-positive triage | [`docs/triage-log.md`](docs/triage-log.md) |

## Scenarios

Each scenario is a branch with one commit on top of `main`. Pre-opened pull requests (already reviewed) act as a backup if a live review is slow.

| Scenario | Branch | Use it for |
| --- | --- | --- |
| Refund endpoint | `scenario/refund-endpoint` | **Live demo** (15–25 min). A risky change with no tests. |
| Payout batch | `scenario/payout-batch` | **Hands-on lab** (25–45 min). Subtler defects, happy-path test only. |
| Balances endpoint | `scenario/balances-endpoint` | **Contrast** (45–55 min). A clean change: what a low-noise review and an approval assessment look like. |

To open a fresh pull request for any scenario, so Copilot reviews it live:

```bash
scripts/open-scenario-pr.sh refund-endpoint
```

The facilitator answer key is intentionally **not** stored in this repository. Copilot code review gathers full-repository context, and an answer key in the repo would bias its review.

The repository instructions encode this team's standards, such as integer money, atomic balance updates, and merchant scoping. Several seeded defects violate those standards on purpose, so the demo shows **standards-guided review**, which is the point of writing standards down. To see what Copilot finds without them, open the same scenario with `--no-instructions` and compare the two reviews.

## Facilitator setup (about 10 minutes)

1. Create a copy **with Git history** in your org:
   ```bash
   scripts/provision-copy.sh my-org/copilot-code-review-demo --internal
   ```
   Then work from the new copy, so later commands push to it rather than to this repo:
   ```bash
   gh repo clone my-org/copilot-code-review-demo && cd copilot-code-review-demo
   ```
   Don't use **Use this template**: template copies have unrelated branch histories, so the scenario branches can't be opened as pull requests. Managed (EMU) accounts can't fork this public repo either, so the facilitator should provision the copy for them.
2. The provisioning script runs `scripts/setup-repo.sh`. It turns on secret scanning, push protection, Dependabot alerts, and CodeQL default setup, then imports both rulesets. In a private or internal repo, CodeQL and secret scanning need GitHub Code Security and Secret Protection.
3. In **Settings > Copilot > Code review**, pick the default review effort. **Balanced** is the built-in default.
4. Optional: enable **Copilot approvals**, and add an MCP server under **Settings > Copilot > Cloud agent** (used by both the cloud agent and code review).
5. Replace `@srvchawla` in `.github/CODEOWNERS` with a team of participants. Authors can't approve their own pull requests, so pairs should review each other's.
6. Open one scenario pull request ahead of time to warm up Actions runners.

## Demo flow (15–25 min)

1. Open the refund-endpoint pull request. Point out the template: the description states intent, and Copilot reads it.
2. Show `.github/copilot-instructions.md` and `payments.instructions.md`. Copilot reads these from the **head branch**, so a pull request can test changes to its own instructions.
3. Copilot was requested automatically by the ruleset. Show the review-effort picker next to Copilot in **Reviewers**.
4. Walk the overview comment: compact summary, effort level used, and approval assessment.
5. Apply one suggested change with **Commit suggestion**.
6. Hand a larger finding to Copilot cloud agent. It opens a follow-up pull request against this branch.
7. Push a commit. Copilot re-reviews it, and earlier findings unrelated to the new changes are collapsed. Collapsing doesn't resolve them, and a re-review can repeat a comment.
8. Show the other gates on the same pull request: the `test` check, CodeQL results, and the CODEOWNERS requirement.
9. Optional: open `scripts/open-scenario-pr.sh --no-instructions refund-endpoint` and compare the reviews side by side.

## Hands-on lab (25–45 min)

See [`docs/hands-on-lab.md`](docs/hands-on-lab.md).

## Cost and limits

- Each review consumes AI credits. The documented averages are about $0.25 (Lite), $1.50 (Balanced), and $10 (Max), plus Actions minutes for agentic context.
- With **review on push** enabled, every push triggers a review. Turn it off in the ruleset for large classes.
- Copilot can miss issues and can be wrong. Treat it as a reviewer, not a gate.
- By default, Copilot's review doesn't count toward required approvals. If an admin enables **Copilot approvals**, a Copilot approval **can** satisfy the approval rule, so decide deliberately whether that fits your gates. The CODEOWNERS rule here still requires a human code owner.

## Local development

```bash
npm ci
npm run typecheck
npm test
npm start   # http://localhost:3000/healthz
```

Example request:

```bash
curl -s localhost:3000/v1/payments -H 'content-type: application/json' -H 'x-merchant-id: m_acme' \
  -d '{"amountMinor":1999,"currency":"USD","cardNumber":"4111111111111111","customerEmail":"a@example.com"}'
```
