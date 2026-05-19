# Plan Writing Guide

Plans should help the next agent act quickly without rereading the whole repo.
Keep them concise, concrete, and easy to scan. Prefer a focused one- to two-page
plan over a complete design diary.

Use this shape for new plans and for major plan rewrites:

```md
# Plan Title

## Status
Planned | Active | Implemented | Superseded

## Intent
The outcome this plan is trying to create.

## Scope
What belongs in this work, and what is intentionally out of bounds.

## Current State
The few facts a new agent needs before changing code.

## Steps
- [ ] Concrete task
- [ ] Concrete task
- [ ] Concrete task

## Done When
- Observable acceptance criterion
- Observable acceptance criterion

## Notes
Durable decisions, open questions, or future impact.
```

Guidelines:

- Keep plan text short enough to fit comfortably in context alongside code.
- Put implementation detail in code, tests, or architecture docs, not in the plan.
- Use checklists for execution and prose for intent.
- Keep active plans and `docs/plans/roadmap.md` in sync when scope, sequencing,
  acceptance criteria, or future expectations change.
- After implementation, mark the plan `Implemented` and leave only the decisions
  future agents still need.
