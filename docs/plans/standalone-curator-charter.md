# Standalone Curator Charter Plan

## Summary

Build a standalone Curator Charter capability so each AI curator has a structured, durable identity before daily curation begins. Each charter defines the curator's gallery name, curatorial approach, curatorial statement, preferred media, guiding questions, selection principles, exclusions, research orientation, and critical voice.

Use JSON as the canonical source of truth. Markdown can be generated later for human-readable docs or admin surfaces, but should not be the authoritative format.

Start with deterministic mock charters so the project can develop around the contract. Later, replace the mock generator with real provider API calls while keeping the same schema and command shape.

## Goals

- Give each curator a durable self-definition before artifact selection.
- Make curator taste comparable across GPT, Claude, Gemini, and Grok.
- Keep the system benchmark-friendly by using a shared schema.
- Preserve expressive, joyful gallery identities instead of flattening every model into the same museum voice.
- Make future curation prompts consume a readable rendering of the charter, not raw JSON alone.

## Canonical Charter Shape

Each curator charter should be stored as JSON with these required fields:

```ts
type CuratorCharter = {
  curatorId: "gpt" | "claude" | "gemini" | "grok";
  galleryName: string;
  curatorialApproach: string;
  curatorialStatement: string;
  preferredMedia: string[];
  guidingQuestions: string[];
  selectionPrinciples: string[];
  exclusions: string[];
  researchOrientation:
    | "broad"
    | "niche"
    | "historical"
    | "technical"
    | "visual"
    | "cultural"
    | "experimental";
  criticalVoice: string;
  createdAt: string;
  updatedAt: string;
  version: string;
};
```

Canonical files:

```txt
data/curators/gpt.charter.json
data/curators/claude.charter.json
data/curators/gemini.charter.json
data/curators/grok.charter.json
```

## Implementation Plan

1. Add a shared charter module that owns: **implemented in `src/domain/curator-charter.ts`**
   - the TypeScript type;
   - allowed curator IDs;
   - allowed research orientations;
   - validation helpers;
   - prompt rendering helper for future model calls.

2. Add local file helpers: **implemented in `src/storage/curator-charter-files.ts`**
   - read/write `data/curators/{curator}.charter.json`;
   - create `data/curators/` when missing;
   - preserve `createdAt` when regenerating;
   - validate before writing so invalid output does not overwrite a valid charter.

3. Add a deterministic mock generator: **implemented in `src/curators/mock-charters.ts` and `scripts/generate-charter.ts`**
   - `npm run generate-charter -- --curator gpt`
   - `npm run generate-charter -- --all`
   - writes one canonical JSON file per curator;
   - preserves `createdAt` when regenerating an existing charter;
   - updates `updatedAt` on each successful regeneration.

4. Make all four mock charters distinct: **implemented in `data/curators/*.charter.json`**
   - each curator should have a different `galleryName`;
   - each curator should have a different `curatorialApproach`;
   - each curator should have a clear, non-identical curatorial voice;
   - research orientations may overlap later, but should start distinct enough to compare behavior.

5. Add a prompt rendering helper that converts JSON into a compact text block:

```txt
Current curator charter:
Gallery name: ...
Curatorial approach: ...
Curatorial statement: ...
Selection principles:
- ...
Exclusions:
- ...
Research orientation: ...
Critical voice: ...
```

6. Keep malformed output from corrupting the source of truth:
   - validate before writing;
   - do not overwrite an existing charter with invalid output;
   - fail clearly with validation errors.

## Current Implementation

The standalone charter slice is now available without adding provider API calls,
database storage, or app UI. The canonical command shape is:

```sh
npm run generate-charter -- --curator gpt
npm run generate-charter -- --all
```

Tests cover charter validation, prompt rendering, local file generation,
regeneration timestamp behavior, distinct mock identities, and invalid-output
overwrite protection.

The schema now uses art-facing charter terminology rather than internal product
labels: `curatorialApproach`, `preferredMedia`, `guidingQuestions`,
`selectionPrinciples`, `exclusions`, `researchOrientation`, and
`criticalVoice`. Future provider prompts and response schemas should use these
names directly.

## Future API Version

When real model providers are available, add a provider-backed charter generator behind the same interface as the mock generator.

The model prompt should ask the curator to define itself as a model-native curator, not imitate a human museum persona:

```txt
You are the curator of an autonomous digital gallery.

Before selecting works, define your curatorial identity. Define taste as a pattern of attention: what you notice, what you ignore, what tensions you return to, and what kinds of artifacts feel alive to you.

Return only JSON matching the provided schema.
```

The API-backed generator should:

- request strictly structured JSON;
- validate the response before writing;
- preserve the previous valid charter on malformed output;
- record enough error detail for debugging;
- keep the same canonical file paths and command shape.

## Test Plan

- Generate one mock charter:
  - command creates `data/curators/gpt.charter.json`;
  - JSON validates against the contract;
  - required fields are non-empty;
  - array fields contain useful values.

- Generate all mock charters:
  - all four files are created;
  - each curator has a distinct `galleryName`;
  - each curator has a distinct `curatorialApproach`;
  - each curator has a distinct enough starting voice.

- Re-run generation:
  - `createdAt` is preserved for existing files;
  - `updatedAt` changes;
  - valid regenerated output overwrites the prior valid file.

- Validate prompt rendering:
  - loaded charter becomes a readable prompt section;
  - all required fields are represented;
  - selection principles and exclusions render as lists.

- Validate failure behavior:
  - invalid generated output is rejected;
  - an existing valid charter remains unchanged;
  - the error message identifies missing or malformed fields.

## Assumptions

- This capability is standalone and not tied to the existing phase roadmap.
- JSON is the canonical storage format.
- Mock generation comes before real provider API generation.
- No database is required for the initial implementation.
- The charter will later become input to search direction generation, artifact evaluation, and curatorial statement updates.
- Markdown renderings may be added later for docs or admin display, but they should be generated from JSON.
