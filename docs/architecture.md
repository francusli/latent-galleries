# Latent Galleries Architecture

This document describes the intended project shape for Latent Galleries. It should help future agents place code in the right layer, keep boundaries clear, and avoid turning early spike work into permanent coupling.

## Guiding Architecture

Latent Galleries should be built around a shared curation core that can be called from multiple entrypoints:

- terminal scripts during the early phases;
- protected admin APIs once operator controls exist;
- scheduled jobs once daily curation is enabled;
- public APIs and pages that read the resulting exhibit data.

The important rule is: curation behavior should live outside React components and outside Next.js route handlers. Pages and route handlers can call shared modules, but they should not own model-provider logic, search orchestration, validation rules, or persistence details.

## Expected Module Shape

The exact folders can evolve, but the project should move toward this shape as implementation grows:

```txt
app/
  Next.js app routes, layouts, UI, and route handlers.

scripts/
  Terminal entrypoints such as mock curation, charter generation, or manual curation.

src/domain/
  Shared domain types, constants, validation, and parsing.
  Curator charter contracts, initiation prompt contracts, taste-profile
  validation, and prompt rendering now live here.

src/curation/
  Curation runner and workflow orchestration.

src/curators/
  Curator adapter interface plus provider-specific adapters for GPT, Claude, Gemini, and Grok.
  Deterministic mock curator charter profiles, initiation adapter contracts, and
  the v0 taste seed pack now live here.

src/search/
  Search service interface plus mock and real search provider implementations.

src/storage/
  Storage interface and implementations, starting with local JSON and later moving to SQLite or another database.
  Local curator charter, draft charter, taste-profile, and reviewed-charter file
  helpers now live here.

data/
  Local generated development artifacts. This is useful for early phases, not the final production boundary.
  Curator charter JSON files are canonical during the standalone charter phase.
  Real versioned seed-pack fixtures should live under `data/seed-packs/` once
  the fictional v0 taste seed pack is replaced.

docs/plans/
  Roadmap and phase plans. The active phase plan should stay in sync with roadmap decisions.
```

## Data Flow

The intended curation flow is:

```txt
terminal script, admin API, or scheduled job
  -> curation runner
  -> storage loads exhibit state and recent artifacts
  -> curator adapter creates search directions
  -> search service returns candidate artifacts
  -> curator adapter evaluates candidates
  -> validation accepts or rejects selections
  -> storage writes artifacts, statement updates, and run logs
  -> public pages and APIs read published exhibit data
```

Phase 0 intentionally uses a smaller version of this flow:

```txt
npm script -> local JSON file -> Next.js page
```

That spike is allowed to be plain and local, but later phases should preserve the same direction: command or job entrypoints write durable curation output, and the web app reads it.

## Layer Responsibilities

### UI And Routes

The `app/` directory should focus on:

- rendering public gallery and exhibit pages;
- displaying loading, empty, and error states;
- exposing public and protected route handlers when those phases arrive;
- calling shared modules rather than owning business logic.

Avoid placing provider calls, search normalization, duplicate detection, or durable storage rules directly in UI components.

### Scripts

The `scripts/` directory should contain thin command-line entrypoints.

Scripts may parse CLI arguments, call shared modules, and print useful status. They should not contain the full curation workflow if that workflow can live in `src/curation/`.

### Domain

The `src/domain/` layer should hold shared contracts such as:

- curator IDs and exhibit slugs;
- artifact, exhibit, run, visit, and charter types;
- status enums;
- validation helpers;
- parsing helpers for structured model output.
- prompt rendering helpers for charter context.

This layer should stay mostly dependency-light so it can be reused by scripts, route handlers, tests, and future jobs.

### Curation

The `src/curation/` layer should own the workflow:

- load exhibit context;
- request search directions;
- call search;
- evaluate candidates;
- validate selected artifacts;
- persist artifacts and statement history;
- record run status and errors.

Provider-specific behavior should be delegated to curator adapters. Search-provider behavior should be delegated to search services. Storage behavior should be delegated to storage modules.

### Curators

The `src/curators/` layer should define a shared `CuratorAdapter` contract and one implementation per provider.

The rest of the app should be able to treat GPT, Claude, Gemini, and Grok consistently. Provider differences belong inside adapters, not in the curation runner.

### Search

The `src/search/` layer should define a replaceable `SearchService`.

The curation runner should receive normalized candidate artifacts, not provider-specific search responses. Search result normalization belongs here.

### Storage

The `src/storage/` layer should hide persistence details.

Early phases can use local JSON files. Later phases can move to SQLite or another database without forcing the curation runner, route handlers, or UI to understand the storage backend.

The standalone charter capability uses local JSON files at
`data/curators/{curator}.charter.json`. Write helpers must validate the full
charter before replacing the existing file so malformed future provider output
does not corrupt the canonical source of truth.

The initiation ritual writes provisional outputs under
`data/curators/drafts/`:

```txt
data/curators/drafts/{curator}.charter.draft.json
data/curators/drafts/{curator}.taste-profile.json
```

The draft charter is the post-reflection charter: initiation records the
curator's initial charter snapshot, seed-pack behavior, reflection rationale,
preserved contradictions, and changed charter fields in the taste profile before
human review. The initial self-description is evidence, not the promoted draft.

Reviewed provider-backed charters are date-prefixed siblings of the undated
fixtures:

```txt
data/curators/{YYYY-MM-DD}.{curator}.charter.json
```

Charter reads prefer the latest dated reviewed charter and fall back to the
undated fixture. Promotion to a reviewed charter requires a valid reflected
charter and an accepted taste profile with structured review fields; draft
generation and taste-profile writes must not overwrite undated fixtures.

## Documentation Rules

Keep docs synchronized selectively:

- Capture module boundaries, storage locations, data flow, and durable structural
  decisions in this architecture doc.
- Capture repo navigation changes in `docs/project-map.md` when files or
  directories are added, removed, renamed, or meaningfully repurposed.
- Capture phase scope, sequencing, acceptance criteria, and future
  implementation expectations in the active phase plan and
  `docs/plans/roadmap.md`.
- Do not update every doc by default for local refactors, copy edits, or small
  implementation details that code and tests already explain.

When implementation makes planned or future guidance real, rewrite stale
"future" language into current-state guidance, mark completed plans
`Implemented`, and prune checklists down to decisions and caveats that still
help future agents.

## Current State

The repo is still in the early scaffold/spike stage:

- Next.js is installed.
- The planning docs exist.
- The durable curation architecture has not been implemented yet, but the
  standalone curator charter contract, mock generator, local JSON storage,
  initiation draft/taste-profile storage, first-class charter reflection,
  reviewed-charter promotion helper, and canonical seed files are in place.
- Phase 0 should still prefer the smallest terminal-to-web loop before adding
  provider integrations, scheduling, admin surfaces, or production storage.
