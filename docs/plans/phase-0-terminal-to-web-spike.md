# Phase 0: Terminal-To-Web Spike

## Objective

Prove the smallest useful Latent Galleries loop:

- one terminal command writes mock curation output to a local file;
- one minimal Next.js page reads that same file;
- refreshing the page shows what the command produced.

This phase is a spike. Keep the implementation plain, local, and easy to replace.

## Current Repo State

- The repo currently contains planning/spec docs only.
- There is no application scaffold yet.
- Phase 0 should create the first runnable Next.js + TypeScript app structure.

## Non-Goals

Do not add these in Phase 0:

- database storage;
- real search;
- real model/provider integrations;
- scheduled jobs;
- auth;
- admin UI;
- moderation flows;
- polished public gallery design;
- multi-exhibit orchestration beyond one mock command target.

## Shared JSON Shape

Use JSON for the local artifact because it maps cleanly to nested artifact records.

Default file path:

```txt
data/mock-curation.json
```

Minimum shape:

```ts
type MockCurationOutput = {
  exhibitSlug: string;
  exhibitName: string;
  status: "succeeded";
  createdAt: string;
  artifacts: MockArtifact[];
};

type MockArtifact = {
  title: string;
  sourceUrl: string;
  curatorRationale: string;
};
```

Phase 0 only needs the `gpt` exhibit to work, but the script should accept an `--exhibit` argument so later phases can expand the same command shape.

## Implementation Checklist

- [ ] Scaffold a minimal Next.js + TypeScript app in the repo root.
- [ ] Add basic package scripts for local development and checks.
- [ ] Add a mock curation npm script callable as:

```sh
npm run mock-curation -- --exhibit gpt
```

- [ ] Create a small TypeScript script that parses `--exhibit`.
- [ ] Have the script create `data/` if missing.
- [ ] Have the script write `data/mock-curation.json`.
- [ ] Make the script write one run with 1-3 mock artifacts.
- [ ] Include a fresh `createdAt` timestamp on each run.
- [ ] Create a minimal page that reads `data/mock-curation.json`.
- [ ] Render the exhibit name.
- [ ] Render the latest run status.
- [ ] Render artifact titles.
- [ ] Render source URLs as outbound links.
- [ ] Render curator rationales.
- [ ] Add simple empty-state behavior when the local output file does not exist yet.
- [ ] Keep styling minimal and readable.
- [ ] Avoid introducing abstractions meant for later phases unless needed by Phase 0.

## Test Checklist

- [ ] Run the mock curation command from a fresh repo state.
- [ ] Confirm `data/mock-curation.json` is created.
- [ ] Confirm the JSON contains one run and 1-3 artifacts.
- [ ] Start the Next.js dev server.
- [ ] Confirm the page renders exhibit name, status, titles, links, and rationales.
- [ ] Rerun the mock curation command.
- [ ] Refresh the page and confirm the rendered timestamp/output updates.
- [ ] Run the scaffolded lint command if available.
- [ ] Run the scaffolded typecheck/build command if available.

## Acceptance Criteria

- A fresh local output file can be created from the terminal command.
- Running the mock terminal command creates a visible run and artifacts.
- Refreshing the Next.js page shows the newly written artifacts.
- The terminal script and page share the same local JSON artifact.
- The curation script remains TypeScript-based so later jobs or protected API routes can reuse the same implementation direction.
- No database, real search, real model provider, scheduling, auth, admin UI, or full gallery design is added.

## Agent Notes

- Prefer the simplest implementation that proves the loop.
- Treat this file as the execution source of truth for Phase 0.
- Check off checklist items as they are completed.
- Keep changes scoped to Phase 0 even if later roadmap phases suggest tempting improvements.
- If a setup tool asks for defaults, choose minimal TypeScript/Next.js defaults and document any meaningful deviation.
