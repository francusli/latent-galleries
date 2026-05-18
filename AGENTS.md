<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions

- When implementing a phase plan, keep the active phase document and `docs/plans/roadmap.md` in sync by recording any future-impacting decisions in both places as part of the same change.
- Keep documentation in sync with code changes. When a change adds, removes, renames, or meaningfully moves project structure, update `docs/architecture.md` and/or `docs/project-map.md` in the same change. When a change affects phase scope, sequencing, acceptance criteria, or future implementation expectations, also update the active phase document and `docs/plans/roadmap.md`.
- Avoid documentation churn for purely local refactors, copy edits, or implementation details that do not change how future agents should navigate, extend, or operate the project.
