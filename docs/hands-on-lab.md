# Hands-on lab: assess, improve, test (20 minutes)

Work in pairs. Each pair needs its own pull request:

```bash
scripts/open-scenario-pr.sh payout-batch <your-initials>
```

## 1. Assess (5 min)

Before you read Copilot's review, spend three minutes reviewing the diff yourself. Write down what you find.

Then read Copilot's review. For each Copilot comment, record it in [`triage-log.md`](triage-log.md) as one of:

- **Valid, blocking**: incorrect money movement or a security problem
- **Valid, non-blocking**: maintainability or clarity
- **False positive**: wrong, or contradicts a documented repository standard
- **Unclear**: needs a human with domain context

Also record anything **you** found that Copilot missed.

## 2. Improve (8 min)

Fix the blocking findings. Use any mix of:

- **Commit suggestion** on a Copilot comment
- Copilot Chat or agent mode in your IDE
- Handing the finding to Copilot cloud agent from the review comment

Reply to every Copilot comment you do not act on, with the reason. Unresolved threads block merge.

## 3. Add tests (7 min)

The scenario ships with one happy-path test. Add tests that would have caught each defect you fixed. Follow [`tests.instructions.md`](../.github/instructions/tests.instructions.md).

Push your changes. Copilot reviews the new push automatically. Compare its second review with its first.

## Discussion prompts (45–55 min)

- What did Copilot find that you missed? What did you find that it missed?
- Which false positives would a repository instruction prevent? Draft that instruction.
- Which findings should be a **hard gate** (CI test, CodeQL rule) rather than a review comment?
- Which effort level would you choose for this repository, and why?
