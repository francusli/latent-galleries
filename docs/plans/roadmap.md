# Latent Galleries Roadmap

This roadmap breaks the MVP into sequential build phases. The early work should focus on proving the autonomous curation loop from a terminal command before investing in the public gallery UI.

The guiding principle is: prove the smallest useful loop first. A terminal script should be able to write curation output to a local file, and a bare Next.js page should be able to read and display that output. Everything else can harden after that loop exists.

## Phase 0: Terminal-To-Web Spike

Goal: create the bare minimum structure needed to run one terminal command and display its output in a minimal Next.js page.

Build:

- Minimal Next.js application scaffold.
- One local npm script, such as `npm run mock-curation -- --exhibit gpt`, backed by a small TypeScript script in the same codebase.
- A local output file, such as `data/mock-curation.csv` or `data/mock-curation.json`, shared by the terminal script and Next.js app.
- The smallest file shape needed for the loop:
  - exhibit slug,
  - exhibit name,
  - run status,
  - artifact title,
  - source URL,
  - curator rationale,
  - created timestamp.
- A mock command that writes one run with 1-3 artifact rows or records.
- A bare page that reads from the local file and renders:
  - exhibit name,
  - latest run status,
  - artifact titles,
  - source URLs,
  - curator rationales.

Key outputs:

- One command can write mock curation output.
- One minimal web page can display the output written by that command.
- The terminal script and website are proven to share the same local artifact.
- The curation code can later be called from scheduled jobs or protected API routes without rewriting it in another language.

Acceptance criteria:

- A fresh local output file can be created from the terminal command.
- Running the mock terminal command creates a visible run and artifacts.
- Refreshing the Next.js page shows the newly written artifacts.
- No database, real search, real model provider, scheduling, auth, admin UI, or full gallery design is required yet.

## Phase 1: Thin Curation Harness

Goal: turn the spike script into a small repeatable harness without expanding beyond the local terminal-to-storage-to-page loop.

Build:

- A clearer terminal command, still likely an npm script, such as `npm run curate -- --exhibit gpt`.
- A lightweight storage decision: keep the local file if it still works, or introduce SQLite once duplicate detection, run history, or statement history starts feeling awkward in a flat file.
- A shared curation runner that:
  - loads exhibit state,
  - loads recent artifacts,
  - gets search queries from a curator adapter,
  - calls a search service,
  - asks the curator to evaluate candidates,
  - validates selected artifacts,
  - stores published artifacts,
  - updates the curatorial statement,
  - writes a curation run log.
- A `MockCuratorAdapter`.
- A `MockSearchService` with deterministic fixture candidates.
- Basic artifact validation.
- Duplicate URL detection within an exhibit.
- Run status handling: `running`, `succeeded`, `failed`, `partial`.

Key outputs:

- One command can simulate a full curation run.
- Storage records runs, selected artifacts, and statement history.
- Failures are visible in curation run logs and on the minimal page.

Acceptance criteria:

- A mock run adds 1-3 artifacts.
- A duplicate URL is rejected.
- A failed mock provider records a failed run.
- One failed exhibit run does not prevent another exhibit from running.
- The same harness can run one exhibit or all exhibits.

## Phase 2: Search Service

Goal: replace fixture search with a real, normalized search layer while keeping it swappable.

Build:

- A `SearchService` interface.
- One real search provider implementation.
- Search result normalization into candidate artifacts:
  - title,
  - URL,
  - source domain,
  - snippet or description,
  - thumbnail when available,
  - publication date when available,
  - artifact type when detectable.
- Search query logging on each curation run.
- Basic blocked-domain support.

Key outputs:

- The terminal harness can run against real web search results.
- Candidate artifacts are stored in curation logs for debugging.

Acceptance criteria:

- Search results are normalized into a stable internal shape.
- Missing or malformed URLs are rejected.
- Candidate metadata is sufficient for model evaluation.
- The search provider can be swapped without changing the curation runner.

## Phase 3: One Real Curator

Goal: connect one real model provider end to end before generalizing to all four.

Recommended starting curator: GPT, because it should be the easiest provider integration to debug first.

Build:

- A `CuratorAdapter` interface.
- A real GPT curator adapter.
- Structured model outputs for:
  - search query generation,
  - candidate evaluation,
  - artifact selection,
  - curatorial statement update.
- Prompt versioning.
- Curation result parsing and validation.
- Retry or graceful failure handling for malformed model output.

Key outputs:

- One real curator can run from the terminal command using real search.
- The run produces publishable artifacts, rationales, and an updated statement.

Acceptance criteria:

- A successful real run adds 1-3 artifacts.
- The curator provides a rationale for each selected artifact.
- The statement update is stored in statement history.
- Malformed model output fails clearly without corrupting data.
- Provider errors are captured in run logs.

## Phase 4: Four Provider Adapters

Goal: support all named curators behind the same harness.

Build:

- Claude adapter.
- Gemini adapter.
- Grok adapter.
- Provider-specific model configuration.
- Shared adapter contract tests.
- Per-curator prompt variations that let each model develop its own taste.

Key outputs:

- The terminal command can run any individual curator.
- The terminal command can run all curators independently.

Acceptance criteria:

- Grok, Claude, GPT, and Gemini each run through the same workflow.
- One provider failure does not block the others.
- Each curator can generate distinct search directions.
- All selected artifacts follow the same storage and validation rules.

## Phase 5: Operator Surface

Goal: expose the harness through minimal protected APIs so it can be triggered and inspected outside the terminal. This should come after the terminal command remains useful on its own.

Build:

- `POST /api/admin/curation/run`.
- `GET /api/admin/curation/runs`.
- `POST /api/admin/artifacts/[id]/hide`.
- Admin secret protection.
- A plain internal/debug page if useful.

Key outputs:

- Operators can trigger runs manually.
- Operators can inspect recent curation behavior.
- Operators can hide problematic artifacts.

Acceptance criteria:

- Manual run endpoint can trigger one exhibit or all exhibits.
- Recent runs show status, selected artifacts, search queries, and errors.
- Hidden artifacts do not appear in public responses once the public API exists.

## Phase 6: Public Gallery

Goal: build the visitor-facing gallery once autonomous curation is already producing data.

Build:

- `/` gallery overview.
- `/exhibits/[slug]` exhibit page.
- `GET /api/exhibits`.
- `GET /api/exhibits/[slug]`.
- Loading, empty, and error states.
- Artifact cards with source links and curator rationales.

Key outputs:

- Visitors can browse the four exhibits.
- The gallery reflects actual curation output from the harness.

Acceptance criteria:

- The overview shows all four exhibits.
- Each exhibit page shows its current statement and published artifacts.
- Hidden artifacts are excluded.
- Source links and rationales are visible and clear.

## Phase 7: Visits And Scheduling

Goal: add the lightweight attention signal and daily operation once the product loop is visible.

Build:

- `POST /api/visits`.
- Anonymous visitor identifier.
- IP hash and user-agent hash.
- Short-window deduping.
- Public approximate visitor counts.
- Daily scheduled curation jobs.

Key outputs:

- Exhibits show approximate passive attention.
- Curation can run daily without manual terminal use.

Acceptance criteria:

- Exhibit visits are recorded.
- Repeat visits are deduped within the configured window.
- Public pages show approximate counts.
- Daily runs execute independently per exhibit.

## Phase 8: Hardening

Goal: tighten behavior before treating the MVP as complete.

Build:

- Integration tests for full curation runs.
- UI tests for gallery browsing.
- Better logging around provider and search failures.
- Safer handling for partial runs.
- Deployment configuration.
- Basic production monitoring.

Key outputs:

- The system is testable, deployable, and diagnosable.

Acceptance criteria:

- MVP acceptance criteria from the spec are covered.
- A fresh environment can be set up from documented steps.
- Failed curation runs are understandable without reading raw database rows.

## First Implementation Plan

Start with Phase 0 only.

The first concrete build doc should cover:

- project scaffold choice,
- local file choice, with CSV acceptable for the first flat artifact list and JSON acceptable if nested metadata becomes useful immediately,
- minimal columns or fields for one exhibit run and its artifacts,
- terminal script design for one mock exhibit run, using TypeScript unless a later requirement clearly calls for another runtime,
- how the terminal script writes the local file and the Next.js app reads it,
- the bare page needed to display the latest command output.

Do not start with a polished public gallery shell, provider integrations, admin surfaces, or broad test infrastructure. The first milestone is simply: run a command, write records, refresh a page, see what the command produced.
