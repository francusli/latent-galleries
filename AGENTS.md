<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions

- Use `docs/plans/README.md` as the concise structure guide for new plans or major plan rewrites.
- Keep documentation in sync with code changes, but update only the docs whose job changed:
  - Update `docs/architecture.md` when a change affects module boundaries, storage locations, data flow, or other durable structural decisions.
  - Update `docs/project-map.md` when a change adds, removes, renames, or meaningfully repurposes files/directories that future agents need for repo navigation.
  - Update `docs/plans/roadmap.md` and the active phase document when a change affects phase scope, sequencing, acceptance criteria, or future implementation expectations.
- When implementing planned work, clean up stale planning language in the same change. Replace "future", "should move toward", or "once this exists" wording with current-state guidance when the implementation now exists. Mark completed plans `Implemented` and prune execution checklists down to durable decisions, remaining caveats, and useful follow-up context.
- Remove or supersede roadmap, project-map, architecture, or plan references that no longer help future agents navigate, extend, or operate the project.
- Avoid documentation churn for purely local refactors, copy edits, small implementation details, or changes that are fully explained by code and tests.
