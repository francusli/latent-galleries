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

src/curation/
  Curation runner and workflow orchestration.

src/curators/
  Curator adapter interface plus provider-specific adapters for GPT, Claude, Gemini, and Grok.

src/search/
  Search service interface plus mock and real search provider implementations.

src/storage/
  Storage interface and implementations, starting with local JSON and later moving to SQLite or another database.

data/
  Local generated development artifacts. This is useful for early phases, not the final production boundary.

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

## Documentation Rules

When implementing a phase plan, keep the active phase document and `docs/plans/roadmap.md` in sync if the change affects future phases.

Architecture decisions that affect where future code should live should be captured here. Execution checklists and phase-specific acceptance criteria should stay in the active phase document.
