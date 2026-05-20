# Plan Writing Guide

Plans should help the next agent act quickly without rereading the whole repo.
Keep them concise, concrete, and easy to scan. Prefer a focused one- to two-page
plan over a complete design diary.

## Naming

Use a small filename prefix so the folder stays scannable:

- `phase-*` for numbered roadmap phases.
- `feature-*` for standalone build plans.
- `research-*` for exploratory or investigation plans.

Do not put dates in plan filenames unless the document is an archived snapshot
or dated decision record. Put creation or update dates inside the plan only when
they help future readers.

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
- Use `Planned` and `Active` plans for checklists and open execution detail.
- After implementation, mark the plan `Implemented` and compact it into a
  historical record: durable decisions, current caveats, and useful follow-up
  context. Do not leave exhaustive completed execution logs unless they still
  help future agents act.
- Mark a plan `Superseded` when another plan or implemented doc becomes the
  source of truth, and point readers to that replacement.
