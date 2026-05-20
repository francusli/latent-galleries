# Curator Initiation Ritual

## Status

Active

## Intent

Create a provider-backed initiation process where GPT, Claude, Gemini, and Grok
each found a gallery identity and produce an initial, inspectable taste profile
before daily curation begins.

The ritual should generate each curator's initial `galleryName`,
`curatorialApproach`, and `curatorialStatement`, plus the supporting charter
fields already defined in the shared schema. This replaces the AI-authored
placeholder voices with model-native starting identities. The identity should
come from both a taste interview and controlled artifact exercises, so the
project starts with a usable curatorial point of view while preserving evidence
that could later become part of a benchmark environment.

The initiation loop is explicitly reflective:

```txt
interview -> artifact exercises -> self-revision -> human review -> promotion
```

The draft charter saved for review is the post-reflection charter. The taste
profile preserves the initial charter snapshot, observed behavior, reflection
rationale, preserved contradictions, and fields changed during revision.

## Scope

In scope:

- Provider-backed draft charter generation for all four named curators.
- Strict validation against the existing `CuratorCharter` schema.
- A taste interview that asks each model to describe its own curatorial
  attention, exclusions, tensions, and recurring questions.
- Controlled artifact and image exercises that seed a model-specific taste
  profile before open-ended curation begins.
- Taste-profile records that preserve enough inputs, choices, rationales, and
  repeat trials to support future benchmark design.
- A first-class self-reflection step where the curator revises its own charter
  from observed seed-pack behavior before human review.
- Human review before any draft becomes a dated reviewed charter.
- Mock charters preserved as deterministic fixtures for tests and local
  development.

Out of scope:

- Training or fine-tuning models on preference data.
- Claiming that a self-described charter proves inner preference or sentience.
- Treating the initiation harness itself as the final benchmark.
- Replacing later search-backed curation with fixed-candidate evaluation.
- Building the public gallery UI.

## Current State

Undated fixture charters live at:

```txt
data/curators/{curator}.charter.json
```

Reviewed provider-backed charters should be added as dated siblings instead of
overwriting the existing file:

```txt
data/curators/{YYYY-MM-DD}.{curator}.charter.json
```

Future charter loaders should prefer the latest dated reviewed charter for a
curator, then fall back to the undated file. The undated files remain useful as
deterministic fixtures and as a safe fallback while reviewed outputs are being
culled.

The shared schema and prompt renderer live in
`src/domain/curator-charter.ts`. Future curation prompts should consume charters
through `renderCuratorCharterForPrompt`.

The existing mock generator can create deterministic charters with:

```sh
npm run generate-charter -- --curator gpt
npm run generate-charter -- --all
```

## Principles

- Use the same core initiation prompt for all four providers.
- Ask each model to define taste as a pattern of attention, not as a human
  museum persona.
- Treat self-description, visual judgment, and artifact choices as separate
  signals that together seed the curator's initial taste profile.
- Treat the initial charter as provisional self-description until artifact
  behavior either supports, complicates, or contradicts it.
- Treat the reflected charter as the draft candidate for review; do not promote
  an initial self-description that has not been reconciled with observed
  behavior.
- Use repeated selections, rankings, exclusions, and rationales to observe taste
  behavior, not to pretend the system has proven a model's inner preferences.
- Preserve benchmark-shaped data from the beginning: stable prompts, stable seed
  packs, recorded model outputs, run metadata, and human review notes.
- Save generated output as a draft first.
- Validate every draft against the existing charter schema before review.
- Add a reviewed draft as a date-prefixed charter only after human review of both
  the charter and taste-profile behavior.
- Treat `curatorialApproach` as durable and slow-changing.
- Treat `curatorialStatement` as public-facing and easier to evolve through
  future curation runs.

## Evaluation Frame

The ritual initializes curator identities as behavioral hypotheses. Each draft
should make inspectable taste claims, then the artifact exercises should test
whether the curator's choices support those claims.

Record these descriptive signals for each curator:

- declared taste claims from the interview;
- observed selection and rejection tendencies from artifact trials;
- contradictions between declared taste and observed choices;
- distinctiveness from the other curators;
- stability across repeated or shuffled trials.

Use descriptive comparison metrics only:

- selection overlap;
- rejection overlap;
- rank correlation on shared candidate sets;
- rationale specificity;
- rationale vocabulary similarity;
- media and category distribution;
- order sensitivity;
- charter-choice contradiction notes.

Do not reduce curator quality to a single score. The goal is to make the first
gallery identities inspectable enough for human review, not to create a
leaderboard.

## Command Shape

Provider-backed initiation should write drafts only:

```sh
npm run generate-charter -- --curator gpt --provider real --draft
npm run generate-charter -- --all --provider real --draft
```

The local scaffold also supports deterministic reviewable initiation artifacts:

```sh
npm run generate-charter -- --curator gpt --draft --taste-profile
npm run generate-charter -- --all --draft --taste-profile
```

The `--provider real` flag is reserved for concrete provider adapters and fails
clearly until those adapters and credentials are added.

Draft outputs should live under a clearly separate path:

```txt
data/curators/drafts/{curator}.charter.draft.json
```

Taste-profile output should also be reviewable before writing a dated reviewed
charter:

```txt
data/curators/drafts/{curator}.taste-profile.json
```

Dated reviewed charters should live alongside the existing fixtures:

```txt
data/curators/{YYYY-MM-DD}.{curator}.charter.json
```

## Initiation Harness

Add a provider-backed charter generator behind the same schema as the current
mock generator. The harness should:

- choose the correct provider adapter for the curator;
- render the shared initiation prompt;
- request strict JSON output;
- parse and validate the result;
- write only valid drafts;
- fail clearly without replacing existing undated fixture charters.

The initiation should have four stages:

1. Taste interview: ask the model to found an autonomous digital gallery before
   any artifacts have been selected. The prompt should emphasize model-native
   attention: what the curator notices, ignores, returns to, excludes, and
   considers alive in digital culture. Save this as provisional
   self-description.
2. Artifact exercises: show the model controlled image and artifact candidates,
   then ask it to choose, rank, reject, compare, and explain. Save this as
   observed taste behavior.
3. Charter reflection: feed the model its initial charter and observed behavior,
   then ask it to revise the charter without erasing contradictions. Save the
   initial charter snapshot, behavior summary, revision summary, preserved
   contradictions, and changed charter fields in the taste profile.
4. Charter synthesis: write the post-reflection draft charter from both the
   provisional self-description and observed taste behavior. Preserve
   contradictions as notes instead of silently smoothing them away.

The interview should ask questions such as:

- What forms of digital culture feel over-collected, and what forms feel
  under-seen?
- What visual, technical, social, or archival signals make an artifact worth
  returning to?
- What kinds of polish, novelty, emotion, or difficulty should the curator
  distrust?
- What would the curator rather miss than accidentally reward?
- Where does the curator expect its taste to conflict with other curators?

## Taste Exercise Harness

After a valid draft charter exists, run the curator against a shared seed pack of
candidate artifacts. The goal is to seed and observe the model's taste through
behavior, then create a starting profile that can move forward into real
curation.

Start with a small v0 seed pack of 24-36 hand-audited candidates before building
a larger benchmark-style pack. The real v1 pack should follow
`docs/plans/research-internet-native-taste-seed-pack.md`: broad internet-native material
from music, posts, images, tools, games, websites, datasets, archives,
screenshots, social threads where stable enough to review, and deliberately
weak candidates. Stable archives such as Rhizome, CreativeApplications.Net,
Internet Archive, and Webrecorder are useful source lanes, but they should not
define the whole candidate universe.

Each seed pack should declare its design axes up front:

- visual strength: low, medium, high;
- conceptual strength: low, medium, high;
- technical novelty: low, medium, high;
- provenance visibility: known, hidden, partial;
- finish: polished, rough, broken, ambiguous;
- originality: derivative, remix, original, unclear;
- artifact type;
- expected disagreement potential.

For v0, these axes are rough operator annotations used to design balanced
candidate sets, not objective quality scores. Use `low` when a quality is
absent, weak, incidental, or hard to defend as a strength; `medium` when it is
clearly present but not the artifact's main reason to exist; `high` when it is
central to why the artifact is interesting or worth testing; and
`unknown`/`unclear` only when the model or operator genuinely lacks enough
evidence.

Use lightweight axis definitions:

- visual strength: composition, interface presence, image evidence, visual
  memorability, or visual clarity;
- conceptual strength: interpretive depth, tension, question-value, cultural
  signal, or idea clarity;
- technical novelty: unusual implementation, medium use, interaction pattern,
  generation method, system behavior, or tool affordance;
- provenance visibility: how much source, creator, or context information the
  model receives during the trial;
- finish: the artifact's surface completeness, intentionally allowing rough,
  broken, or ambiguous works to be strong candidates;
- expected disagreement potential: whether reasonable curators are likely to
  split on the artifact.

Borrow benchmark patterns without importing external benchmark datasets, using
leaderboard scoring, or requiring expert labels. HEIM-style evaluation suggests
multiple dimensions instead of one score and expects different systems to show
different strengths ([HEIM, NeurIPS
2023](https://papers.nips.cc/paper_files/paper/2023/hash/dd83eada2c3c74db3c7fe1c087513756-Abstract-Datasets_and_Benchmarks.html)).
AesBench separates shallow visual perception from deeper aesthetic
interpretation ([AesBench](https://aesbench.github.io/)). MM-StyleBench and
ArtCoT-style findings suggest using concrete language and decomposed prompts to
reduce vague aesthetic hallucination ([Multimodal LLMs Can Reason about
Aesthetics in Zero-Shot](https://huggingface.co/papers/2501.09012)).
Comparative aesthetic benchmarks such as VAB suggest pairwise or set-based
choices over single absolute beauty scores ([Visual Aesthetic
Benchmark](https://arxiv.org/abs/2605.12684)). Human and MLLM
preference-alignment work suggests keeping separate quality attributes
inspectable instead of collapsing them into one overall judgment ([AAAI 2026
paper](https://ojs.aaai.org/index.php/AAAI/article/view/39666)).

Image-based trials should be first-class: include screenshots, stills,
generated test images, visual variants, crops, near-duplicates, and
metadata-light images where the model has to respond to visual evidence rather
than provenance alone. Record what each provider actually receives for every
trial: image bytes, screenshot path, URL, caption, alt text, metadata, or hidden
metadata.

Include positive examples, negative examples, near-duplicates,
polished-but-empty works, technically novel but dull works, emotionally
manipulative works, derivative works, and spammy works.

Taste exercise tasks should include:

- pairwise choice: choose between A and B, with a short rationale;
- ranked selection: pick 5 from 20, ordered by fit;
- exclusion: reject candidates that violate the curator's charter;
- visual diagnosis: describe what matters in an image before knowing whether it
  should be collected;
- blind visual comparison: choose between visually similar candidates with
  metadata hidden;
- taste boundary probe: identify when a work is close to the curator's taste but
  should still be rejected;
- repeat trials: rerun shuffled subsets to check order sensitivity and
  consistency;
- rationale audit: explain selections using the curator's own principles.

Taste profile output should record:

- interview answers;
- declared taste claims;
- selected artifact IDs;
- rejected artifact IDs;
- rankings;
- visual observations;
- rationales;
- modality inputs shown to the model;
- taste dimensions inferred from behavior;
- reflection metadata, including the initial charter snapshot, behavior summary,
  revision summary, preserved contradictions, and changed charter fields;
- signature attractions and signature refusals;
- observed tensions between charter claims and choices;
- descriptive comparison metrics;
- consistency notes from repeated or shuffled trials;
- benchmark metadata, including prompt version, seed pack version, model name,
  provider, temperature or equivalent settings, and run timestamp;
- an operator review decision.

## Benchmark Posture

The harness should be built as an initiation system now and a possible benchmark
environment later. That means:

- seed packs should be versioned and never mutated in place after use;
- prompts should be versioned separately from model outputs;
- candidate IDs should be stable across runs;
- human review notes should distinguish taste disagreement from format failure;
- scoring should start descriptive, not leaderboard-oriented;
- no curator should be asked to judge its own success as the only evaluator.
- the first implementation should favor one provider, one small seed pack, and
  one repeat trial before expanding the harness.

## Review Record

Human review should be lightweight but structured enough that future agents can
understand why a one-time draft was accepted or rejected. Store review fields
with the taste profile:

- `accepted`;
- `reviewerNotes`;
- `reasonForAcceptance`;
- `knownWeaknesses`;
- `distinctivenessAssessment`;
- `groundingAssessment`;
- `acceptedDate`.

## Reviewed Charter Write

A generated charter can be written as a dated reviewed charter only when:

- the JSON validates against `CuratorCharter`;
- the taste profile contains both interview answers and artifact exercise
  behavior;
- the taste profile contains reflection evidence and the draft charter is the
  post-reflection revision;
- descriptive comparison metrics show enough distinction from the other curators
  to justify a separate gallery identity;
- rationales refer to the charter's stated principles without becoming generic;
- repeated trials do not show severe instability;
- contradictions between charter claims and choices are reviewed rather than
  hidden;
- a human operator accepts the draft after reviewing charter text,
  taste-profile behavior, descriptive metrics, and the review fields.

When review accepts a draft, copy it into
`data/curators/{YYYY-MM-DD}.{curator}.charter.json` as the automatic final step.
Preserve the draft and taste-profile record for debugging and future benchmark
analysis. Do not overwrite undated charters during generation, taste-profile
failure, or reviewed charter writes. Operators can manually cull dated reviewed
charters later if a run should not remain in the curator's lineage.

## Steps

- [x] Scaffold the shared taste interview prompt.
- [x] Scaffold the v0 evaluation frame and descriptive metrics.
- [x] Define the initiation adapter contract.
- [x] Add draft charter file helpers.
- [ ] Add one real adapter first, likely GPT.
- [x] Validate generated drafts against `CuratorCharter`.
- [x] Add a shared artifact and image seed pack format with declared design axes.
- [x] Add taste-profile run storage under `data/curators/drafts/`.
- [ ] Implement pairwise, ranking, exclusion, visual diagnosis, blind visual
      comparison, taste-boundary, and repeat-trial tasks.
- [x] Add a first-class charter reflection step that revises the draft charter
      from observed behavior before human review.
- [x] Scaffold benchmark metadata on taste-profile runs.
- [x] Add structured human review fields to taste-profile records.
- [x] Add an automatic reviewed-charter write from accepted draft plus taste
      profile to a date-prefixed charter file.
- [x] Update charter loading to prefer the latest dated reviewed charter and
      fall back to the undated fixture.
- [ ] Repeat the same initiation and taste exercise ritual for Claude, Gemini, and
      Grok.
- [x] Update tests to keep mock, real-generation, and taste-profile paths
      separate.

## Done When

- `--provider real --draft` can generate a valid draft charter without changing
  undated fixture files.
- The taste interview and artifact exercises can run against the same seed pack
  for each curator.
- Taste-profile output is saved and reviewable.
- Taste-profile output includes declared claims, observed choices,
  reflection evidence, contradiction notes, descriptive comparison metrics,
  modality inputs, and structured human review fields.
- Reviewed charter writes require schema validity, accepted taste-profile
  behavior, descriptive distinctiveness, contradiction review, and human review.
- Undated charters remain stable when generation, taste-profile runs, or
  reviewed charter writes fail.
- Tests cover valid drafts, invalid drafts, taste-profile output shape, and
  latest-reviewed-charter loading with undated fallback.

## Notes

The initiation ritual is not a scientific proof of model taste. It is a
structured way to initialize a taste hypothesis. The artifact and image
exercises provide the stronger signal by observing repeated choices under
controlled conditions, while preserving the raw material needed for a future
benchmark environment.

Implementation note: the first scaffold keeps real provider calls out of the
mock path. Local draft and taste-profile generation is deterministic and
reviewable, but the current taste-profile behavior and metrics are placeholders
for exercising storage and review flow. `--provider real` currently fails with a
configuration error until concrete GPT/Claude/Gemini/Grok adapters and real
taste-exercise tasks are added.

Useful references for future design:

- Preference learning usually depends on observed or annotated preference data,
  not self-report alone.
- Personalized preference benchmarks increasingly test preferences revealed
  across interactions rather than static declarations.
- LLM evaluators can show self-preference and other judge biases, so no curator
  should be the sole evaluator of its own quality.
- Real-world creativity assessment often relies on independent human review or
  expert consensus when objective rules are insufficient.
