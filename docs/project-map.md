# Latent Galleries Project Map

This is a quick orientation guide for agents and humans landing in the repo.

## What This Project Is

Latent Galleries is a public digital art gallery made of autonomous AI-curated exhibits. The MVP will have four named curators: Grok, Claude, GPT, and Gemini.

Each curator will eventually run a daily curation process, select linkable digital artifacts, explain why they belong, and update its curatorial statement.

## Current Build Strategy

The project should be built in phases. The early milestone is not a polished gallery. It is a small terminal-to-web loop:

```txt
run a command -> write local curation output -> refresh a Next.js page -> see the output
```

After that loop works, later phases can add the curation harness, real search, model providers, admin controls, public gallery pages, visit tracking, scheduling, and hardening.

## Key Files

```txt
AGENTS.md
  Instructions for coding agents working in this repo.

README.md
  General project readme. Currently close to the default Next.js readme.

docs/latent-galleries-spec.md
  Product and MVP specification.

docs/architecture.md
  Intended code architecture and module boundaries.

docs/project-map.md
  This orientation guide.

docs/plans/roadmap.md
  Sequential phase roadmap for the MVP.

docs/plans/phase-0-terminal-to-web-spike.md
  Active Phase 0 execution plan.

docs/plans/standalone-curator-charter.md
  Plan for durable curator identity and charter generation.

app/
  Current Next.js app route surface.

public/
  Static assets.

package.json
  Scripts and dependencies.

scripts/generate-charter.ts
  Terminal entrypoint for deterministic standalone curator charter generation.

src/domain/curator-charter.ts
  Shared curator charter types, constants, validation, and prompt rendering.

src/curators/mock-charters.ts
  Deterministic seed charter identities for GPT, Claude, Gemini, and Grok.

src/storage/curator-charter-files.ts
  Local JSON read/write helpers for canonical charter files.

data/curators/*.charter.json
  Canonical generated charter JSON files for each curator.
```

## Current Commands

```sh
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run generate-charter -- --curator gpt
npm run generate-charter -- --all
```

Phase-specific scripts such as `npm run mock-curation -- --exhibit gpt` should be added when Phase 0 is implemented.

## How To Read The Docs

Start with these, in order:

1. `AGENTS.md` for repo-specific agent rules.
2. `docs/architecture.md` for where new code should live.
