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

docs/plans/README.md
  Concise structure guide for agent-friendly plans.

docs/plans/phase-0-terminal-to-web-spike.md
  Active Phase 0 execution plan.

docs/plans/feature-curator-charters.md
  Plan for durable curator identity and charter generation.

docs/plans/feature-curator-initiation-ritual.md
  Plan for provider-backed initial gallery identity generation.

docs/plans/research-internet-native-taste-seed-pack.md
  Plan for replacing the fictional v0 seed pack with a real, broad
  internet-native initiation fixture.

app/
  Current Next.js app route surface.

public/
  Static assets.

package.json
  Scripts and dependencies.

scripts/generate-charter.ts
  Terminal entrypoint for deterministic standalone curator charter generation
  and local initiation draft/taste-profile generation.

src/domain/curator-charter.ts
  Shared curator charter types, constants, validation, and prompt rendering.

src/domain/curator-initiation.ts
  Initiation and reflection prompt constants, seed-pack/taste-profile types,
  validation, and accepted-review checks.

src/curators/initiation.ts
  Initiation adapter contract and local deterministic initiation runner. The
  runner now reflects on seed behavior and returns the revised charter as the
  draft candidate. Real provider adapters still need concrete API integrations.

src/curators/mock-charters.ts
  Deterministic seed charter identities for GPT, Claude, Gemini, and Grok.

src/curators/taste-seed-pack.ts
  V0 placeholder artifact seed pack for taste-profile exercises. Future real
  seed-pack data should move toward `data/seed-packs/`.

src/storage/curator-charter-files.ts
  Local JSON read/write helpers for canonical, draft, taste-profile, and
  reviewed charter files.

data/curators/*.charter.json
  Canonical undated fixture charters plus any accepted dated reviewed charters.

data/curators/drafts/*.json
  Reviewable generated initiation drafts and taste profiles. Draft charters are
  post-reflection revisions, while taste profiles preserve the initial charter
  snapshot and reflection evidence. These generated artifacts should not replace
  undated fixtures.
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
npm run generate-charter -- --curator gpt --draft --taste-profile
```

Phase-specific scripts such as `npm run mock-curation -- --exhibit gpt` should be added when Phase 0 is implemented.

## How To Read The Docs

Start with these, in order:

1. `AGENTS.md` for repo-specific agent rules.
2. `docs/architecture.md` for where new code should live.
