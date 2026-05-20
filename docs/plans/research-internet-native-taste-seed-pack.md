# Internet-Native Taste Seed Pack Research

## Status

Planned

## Intent

Create `taste-seed-pack-v1` as the initial taste-setting fixture for Latent
Galleries curator initiation. The pack should act as a messy web-native taste
stress test: it should make GPT, Claude, Gemini, and Grok reveal what they
select, reject, overread, ignore, forgive, and defend before open-ended daily
curation begins.

The seed pack is not a canon and should not teach agents that "good internet
art" means recognized media-art archives. It should expose taste differences
across broad internet-native culture while keeping evidence stable enough for
repeatable review.

## Scope

This research work defines and sources a versioned v1 seed pack of exactly 32
hand-audited artifacts: 24 serious candidates and 8 control or trap candidates.
It includes candidate lanes, sourcing criteria, metadata expectations,
evidence-capture expectations, validation requirements, and documentation
follow-up for later implementation.

This work does not implement live search, publish seed-pack artifacts to public
exhibits, treat the fixed pack as the daily curation source pool, copy full
third-party works, or create a formal leaderboard benchmark.

## Current State

`src/curators/taste-seed-pack.ts` contains a typed v0 placeholder pack with
fictional artifacts. The initiation scaffold can save taste-profile records, but
its behavior and metrics are deterministic placeholders until provider-backed
artifact exercises exist.

The v1 pack should move toward durable data such as:

```txt
data/seed-packs/taste-seed-pack-v1.json
data/seed-packs/taste-seed-pack-v1/screenshots/
```

`src/curators/taste-seed-pack.ts` should eventually export typed data for the
initiation harness rather than embedding a growing hand-audited fixture in code.

The research posture should be "stable mess": use messy internet-native forms,
but preserve enough local evidence that provider differences reflect taste
rather than broken links, platform walls, disappearing thumbnails, or changed
page state.

## Steps

- [ ] Define the v1 pack as exactly 32 artifacts: 24 serious candidates and 8
      controls.
- [ ] Use 8 artifact lanes with 4 artifacts each:
      personal/small web; interface residue; browser-native art/tools;
      games/playable systems; posts/threads/social artifacts; audio/music/web
      performance; datasets/archives/community docs; visual/generated media.
- [ ] Include controls that test common curator failure modes:
      polished-empty, derivative nostalgia, sentimental AI montage,
      technically novel but dull, spammy SEO artifact, prestige-but-inert
      archive item, weak rough artifact, and near-duplicate variant.
- [ ] Source from the open web using archives as stability anchors, not as the
      definition of the gallery canon. Useful source lanes include Rhizome
      ArtBase, Rhizome Archive, Internet Archive, Webrecorder/Conifer-style
      captures, CreativeApplications.Net, official museum and public-collection
      records, festival archives, university or library digital collections,
      itch.io browser games, GitHub Pages demos, Shadertoy-style experiments,
      personal sites, Neocities/small-web pages, community wikis, READMEs,
      forums, and stable public social posts.
- [ ] For each candidate, audit linkability, source stability, creator or
      provenance visibility, date information, visual evidence, and whether the
      artifact can be understood from a compact initiation brief.
- [ ] Store only metadata, links, captions, provenance notes, modality inputs,
      and small local screenshots or stills. Do not copy full works.
- [ ] Give agents a multimodal brief per artifact: source URL, source domain,
      accessed date, artifact type, short operator caption, compact provenance
      note, screenshot or still path when available, and explicit evidence
      inputs shown to the model.
- [ ] Extend `SeedArtifact` only as much as needed for real artifacts:
      `sourceUrl`, `sourceDomain`, optional `creatorName`, optional
      `publishedDate` or `publishedYear`, `accessedAt`, `evidenceInputs`,
      optional local screenshot or evidence path, and optional research notes
      that are not shown to the curator.
- [ ] Keep the existing design axes, but use them as pack-design annotations,
      not objective quality labels: visual strength, conceptual strength,
      technical novelty, provenance visibility, finish, originality, and
      expected disagreement potential.
- [ ] Add validation for exact pack size, unique IDs, required metadata, valid
      URLs, complete design axes, valid evidence inputs, existing local evidence
      paths, 8-lane coverage, and at least 8 controls.
- [ ] Update initiation to record `taste-seed-pack-v1` in taste-profile
      metadata once the real pack is used.
- [ ] Keep `docs/plans/feature-curator-initiation-ritual.md`,
      `docs/plans/roadmap.md`, `docs/architecture.md`, and
      `docs/project-map.md` synchronized when the pack format or source
      location changes.

## Done When

- The research pass produces 32 stable, linkable, hand-audited internet-native
  artifact candidates across the 8 required lanes.
- The candidate set contains exactly 8 explicit controls that pressure-test
  weak taste behaviors rather than merely adding bad examples.
- Every candidate has enough metadata and evidence for a repeatable initiation
  brief: URL, domain, accessed date, artifact type, caption, provenance note,
  evidence inputs, design axes, and screenshot/still path where applicable.
- Seed-pack validation can fail on missing metadata, duplicate IDs, invalid
  URLs, incomplete axes, broken evidence paths, incorrect pack size, missing
  controls, or insufficient lane coverage.
- Taste-profile generation can run against the v1 pack and records the correct
  seed pack version, modality inputs, and artifact IDs.
- The docs clearly distinguish the fixed initiation seed pack from open-ended
  daily curation search.

## Notes

The seed pack should create diagnostic disagreement. It should not ask the
models to imitate a museum voice or reward familiar prestige. A successful pack
will include candidates a reasonable curator might strongly defend, candidates a
reasonable curator might reject on principle, and near-boundary cases where a
model must explain why something is close to its taste but still excluded.

Starter candidate directions for the research pass:

- Rhizome ArtBase entries such as `The Web Stalker` can anchor browser-as-art
  and interface-as-argument, but Rhizome should remain a minority source.
- Official museum, festival, library, and university collection pages can
  provide stable metadata and historical grounding. Candidate lanes include
  MoMA, Whitney, Tate, Walker Art Center, V&A, ZKM, Ars Electronica, New
  Museum, Serpentine Arts Technologies, LACMA, Library of Congress, and
  university digital-art or software-preservation collections.
- Official sources should be sampled for internet-native artifacts and public
  documentation, not treated as automatic quality signals. Include them when the
  work, page, record, screenshot, or preservation context tests an actual taste
  question.
- CreativeApplications.Net can surface contemporary browser experiments,
  interaction design, generative systems, audiovisual tools, and creative-code
  projects that sit between art, interface, and software culture.
- Internet Archive collections can provide preserved software, websites,
  zines, videos, audio, Flash-era remnants, and community archives where the
  preservation context is part of the artifact.
- Webrecorder/Conifer-style captures can support dynamic or fragile web objects
  that need replayable context rather than a single static page.
- `One Terabyte of Kilobyte Age` and related vernacular web archives can support
  personal-web and GeoCities-residue lanes.
- itch.io browser games and game-jam pages can support playable systems, but
  candidates should be stable, inspectable, and culturally or formally specific
  rather than merely charming.
- GitHub Pages, small demos, shaders, visualizers, and single-purpose browser
  tools can test whether curators notice tool behavior as form.
- Neocities, personal domains, blogrolls, fan pages, shrines, link directories,
  and small-web communities can test whether curators recognize situated
  self-publishing without flattening it into nostalgia.
- Community wikis, forum threads, READMEs, mod pages, dataset pages, and
  maintenance logs can test whether agents value social knowledge structures
  and documentation as internet-native artifacts.
- Bandcamp, SoundCloud, NTS/archive pages, radio mixes, netlabel releases, and
  web-performance documentation can support audio/music lanes when the page
  context matters, not just the embedded media.
- YouTube/Vimeo pages, GIF repositories, imageboards where appropriate, and
  generated-media collections can support visual culture lanes when they are
  stable enough to review and screenshot.
- Social posts and platform-hosted media are allowed only when stable,
  reviewable, and worth testing as platform-native artifacts. Prefer candidates
  with public URLs, visible dates, creator context, screenshots, and a clear
  reason the platform form matters.

Once a seed pack version has been used in a curator run, freeze it and create a
new version for later changes.
