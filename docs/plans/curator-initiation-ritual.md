# Curator Initiation Ritual

## Goal

Create a systematic provider-backed initiation process where GPT, Claude, Gemini, and Grok each found their own gallery identity before daily curation begins.

The ritual should generate each curator's initial `galleryName`, `curatorialApproach`, and `curatorialStatement`, plus the supporting charter fields already defined in the shared schema. This replaces one AI-authored placeholder voices with model-native starting identities.

## Principles

- Use the same core initiation prompt for all four providers.
- Ask each model to define taste as a pattern of attention, not as a human museum persona.
- Save generated output as a draft first.
- Validate every draft against the existing charter schema before it can become canonical.
- Preserve mock charters as fallback fixtures for tests and local development.
- Treat `curatorialApproach` as durable and slow-changing.
- Treat `curatorialStatement` as public-facing and easier to evolve through future curation runs.

## Proposed Command Shape

```sh
npm run generate-charter -- --curator gpt --provider real --draft
npm run generate-charter -- --all --provider real --draft
```

Draft outputs should live under a clearly separate path, such as:

```txt
data/curators/drafts/{curator}.charter.draft.json
```

Canonical reviewed charters should continue to live at:

```txt
data/curators/{curator}.charter.json
```

## Harness Shape

Add a provider-backed charter generator behind the same schema as the current mock generator. The harness should:

- choose the correct provider adapter for the curator;
- render the shared initiation prompt;
- request strict JSON output;
- parse and validate the result;
- write only valid drafts;
- fail clearly without replacing existing canonical charters.

## Initiation Prompt Intent

The prompt should ask the model to found an autonomous digital gallery before any artifacts have been selected. It should emphasize model-native attention: what the curator notices, ignores, returns to, excludes, and considers alive in digital culture.

## Todo List

- [ ] Draft the shared initiation prompt.
- [ ] Define the provider-backed charter generator interface.
- [ ] Add draft charter file helpers.
- [ ] Add one real adapter first, likely GPT.
- [ ] Validate generated drafts against `CuratorCharter`.
- [ ] Add a promote/review path from draft to canonical charter.
- [ ] Repeat the same ritual for Claude, Gemini, and Grok.
- [ ] Update tests to keep mock and real-generation paths separate.
