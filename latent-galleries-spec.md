# Latent Galleries MVP Spec

## 1. Summary

Latent Galleries is a public digital art gallery made of four autonomous AI-curated exhibits. Each exhibit is maintained by a named AI model: Grok, Claude, GPT, and Gemini.

The MVP should make AI taste visible through repeated autonomous curation. Each day, every curator searches the web, selects 1-3 linkable digital artifacts, explains why they belong, and updates its curatorial statement. Visitors can browse the exhibits and see simple visitor counts.

The first build should be a Next.js application with real model provider integrations, persistent storage, scheduled curation jobs, public gallery pages, and minimal operator controls for debugging and safety.

## 2. Goals

- Present four distinct AI-curated exhibits: Grok, Claude, GPT, and Gemini.
- Run a daily curation process for each exhibit.
- Add 1-3 artifacts per exhibit per successful daily run.
- Store source links and metadata for every artifact.
- Maintain an evolving curatorial statement for each exhibit.
- Let visitors browse exhibits, artifacts, statements, and visitor counts.
- Track lightweight exhibit and artifact visits as the MVP attention signal.
- Preserve enough logs to understand what each curator did and why.

## 3. Non-Goals For MVP

- Human review before every artifact is published.
- User accounts or authenticated visitor profiles.
- Voting, likes, donation boxes, or other explicit visitor ranking mechanics.
- Full content archival of third-party works.
- A fully deterministic artifact validation layer.
- Benchmark scoring or formal autonomous-environment evaluation.
- Complex admin moderation workflows.
- Native mobile apps.

## 4. Core Product Experience

### Public Gallery Overview

The home page should show:

- The project title and short framing.
- Four exhibit summaries, one for each curator.
- Each exhibit's current curatorial statement.
- The latest artifacts from each exhibit.
- Simple visitor count for each exhibit.

Visitors should be able to move from the overview into a specific exhibit.

### Exhibit Detail Page

Each exhibit page should show:

- Curator name: Grok, Claude, GPT, or Gemini.
- Current curatorial statement.
- Artifact list in reverse chronological order.
- Simple visitor count.
- A clear indication of when the exhibit was last updated.

Each artifact card should show:

- Title.
- Source domain or publication.
- Artifact type.
- Thumbnail when available.
- Date added.
- Curator rationale.
- Outbound link to the original source.

### Visitor Counts

The MVP should not include a like button, vote button, donation box, or login requirement.

Public attention should be represented through passive visitor counts. The system should track exhibit page visits and, if artifact detail pages are built, artifact visits.

Visitor counts should be approximate rather than treated as a formal ranking. To reduce obvious inflation, the implementation should dedupe repeated visits over a short window using a combination of anonymous browser identifier, IP hash, and user agent hash. Visitors should not need to log in to view the gallery.

## 5. Curation Workflow

### Daily Runs

The system should run one daily curation job per exhibit. Each exhibit's job should operate independently, so one failed model or provider should not block the others.

For each exhibit, the daily job should:

1. Load the exhibit's current statement and recent artifacts.
2. Ask the curator model to generate search directions or queries based on its own curatorial point of view.
3. Search the web for candidate digital artifacts.
4. Ask the curator model to evaluate candidates.
5. Select 1-3 artifacts.
6. Store artifact metadata, source links, and curator rationales.
7. Ask the curator model to update the exhibit's curatorial statement.
8. Store a curation run log with inputs, selected artifacts, and any errors.

### Model Integrations

The MVP should use real provider APIs for the named curators:

- Grok exhibit: xAI/Grok API.
- Claude exhibit: Anthropic Claude API.
- GPT exhibit: OpenAI API.
- Gemini exhibit: Google Gemini API.

Provider-specific implementation details should be isolated behind a curator adapter interface so the rest of the app can treat all curators consistently.

### Search

The curation process needs a web search provider or search API. The spec does not require a particular provider, but the implementation should expose search as a replaceable service.

Each curator should be allowed to develop a distinct search strategy. The system should provide a shared search interface, but it should not force all four curators into the same taste profile, topic area, medium, or selection pattern. A curator can search broadly, narrowly, visually, textually, historically, culturally, technically, or experimentally as long as the final selections remain linkable and understandable to visitors.

Search results should produce enough candidate metadata for model evaluation when available:

- Title.
- URL.
- Source domain.
- Snippet or short description.
- Optional thumbnail.
- Optional publication date.
- Artifact type if detectable.

### Artifact Selection Rules

Artifacts can be images, webpages, articles, videos, posts, datasets, or other linkable digital objects.

Artifacts are intentionally broad. The spec should leave room for each model to define what belongs in its exhibit through its curatorial statement, search choices, and rationales. The shared system should enforce basic metadata and safety requirements, not a narrow definition of art or artifact type.

The MVP should store metadata and links, not copied full works. An artifact should not be added if:

- It has no stable URL.
- It duplicates an existing artifact URL in the same exhibit.
- It lacks enough metadata for a visitor to understand what it is.
- The curator cannot provide a rationale.

The MVP can include basic checks for missing fields, duplicate URLs, and blocked domains. More advanced validation belongs to a later phase.

## 6. Data Model

### Exhibit

Represents one curator's exhibit.

Fields:

- `id`
- `slug`
- `name`
- `modelProvider`
- `modelName`
- `currentStatement`
- `lastUpdatedAt`
- `createdAt`
- `updatedAt`

Initial exhibit slugs:

- `grok`
- `claude`
- `gpt`
- `gemini`

### Curatorial Statement History

Stores previous statements so the exhibit's point of view can be traced over time.

Fields:

- `id`
- `exhibitId`
- `statement`
- `reasonForUpdate`
- `createdByRunId`
- `createdAt`

### Artifact

Represents one selected digital object.

Fields:

- `id`
- `exhibitId`
- `title`
- `url`
- `sourceDomain`
- `artifactType`
- `description`
- `thumbnailUrl`
- `curatorRationale`
- `metadata`
- `status`
- `addedByRunId`
- `createdAt`
- `updatedAt`

Supported statuses:

- `published`
- `hidden`

### Curation Run

Represents one attempt by one curator to update its exhibit.

Fields:

- `id`
- `exhibitId`
- `provider`
- `modelName`
- `status`
- `searchQueries`
- `candidateArtifacts`
- `selectedArtifactIds`
- `promptVersion`
- `errorMessage`
- `startedAt`
- `completedAt`

Supported statuses:

- `running`
- `succeeded`
- `failed`
- `partial`

### Visit

Represents an anonymous exhibit or artifact visit used for lightweight visitor counts.

Fields:

- `id`
- `targetType`
- `targetId`
- `visitorHash`
- `ipHash`
- `userAgentHash`
- `createdAt`

## 7. Public Routes And APIs

### Pages

- `/` shows the public gallery overview.
- `/exhibits/[slug]` shows one exhibit.
- `/artifacts/[id]` can be added if artifact cards need a dedicated detail page.

### Public APIs

- `GET /api/exhibits`
  - Returns all exhibits, current statements, latest artifacts, and visitor counts.

- `GET /api/exhibits/[slug]`
  - Returns one exhibit, all published artifacts, statement history summary, and visitor count.

- `POST /api/visits`
  - Records an anonymous visit for an exhibit or artifact.
  - Dedupes repeated visits over a short window.
  - Returns the updated approximate visitor count.

### Protected APIs Or Scripts

- `POST /api/admin/curation/run`
  - Manually triggers a curation run for one or all exhibits.
  - Requires an admin secret or equivalent protection.

- `GET /api/admin/curation/runs`
  - Lists recent curation runs for debugging.
  - Requires admin protection.

- `POST /api/admin/artifacts/[id]/hide`
  - Hides a published artifact if needed.
  - Requires admin protection.

## 8. Environment Variables

The implementation should expect these configuration values:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `XAI_API_KEY`
- `SEARCH_API_KEY`
- `ADMIN_SECRET`
- `APP_BASE_URL`

Additional provider-specific values can be added as needed.

## 9. UI Requirements

The interface should feel like a working digital gallery, not a marketing landing page.

Required states:

- Loading state for gallery and exhibit data.
- Empty state for exhibits before their first successful curation run.
- Error state if exhibit data cannot load.
- Visitor counts unavailable state.
- Hidden artifact handling so hidden artifacts do not appear publicly.

Design priorities:

- Make the four curators easy to compare.
- Keep source links visible and trustworthy.
- Make the curator rationale prominent.
- Show visitor counts lightly without making the project feel like a generic leaderboard.
- Avoid copying third-party content beyond metadata, thumbnails, and short descriptions.

## 10. Operator Requirements

The MVP should include enough operational visibility to debug autonomous behavior.

Operators should be able to:

- See recent curation runs and statuses.
- Trigger a curation run manually.
- Identify which artifacts were selected by which run.
- See model/provider errors.
- Hide a problematic artifact.

The operator layer can be minimal and protected. It does not need a polished admin dashboard for the MVP.

## 11. Testing And Acceptance Criteria

### Unit Tests

Cover:

- Artifact validation.
- Duplicate URL detection.
- Visit deduping.
- Exhibit slug lookup.
- Curation result parsing.

### Integration Tests

Cover:

- Successful curation run adds 1-3 artifacts.
- Statement updates after artifacts are added.
- One provider failure does not block other exhibits.
- Duplicate candidate artifacts are rejected.
- Anonymous exhibit visit can be recorded.
- Repeat visits are deduped within the configured window.

### UI Tests

Cover:

- Visitor can view all four exhibits.
- Visitor can open an exhibit page.
- Visitor can see artifact metadata and curator rationales.
- Visitor can see approximate exhibit attention through visitor counts.

### MVP Acceptance Criteria

The MVP is complete when:

- The public site displays four exhibits.
- Each exhibit has a current curatorial statement.
- Each curator can run through the daily workflow.
- A successful run adds 1-3 artifacts with metadata, links, and rationales.
- Approximate exhibit visitor counts are visible publicly.
- Anonymous visit tracking works with basic deduping.
- Operators can inspect recent curation runs.
- Operators can manually rerun curation.
- Operators can hide a problematic artifact.

## 12. Future Work

- Deterministic artifact validation before publication.
- Stronger safety and quality scoring for candidate artifacts.
- Benchmarkable autonomous-environment architecture.
- Statement evolution timeline.
- Public curation run transparency pages.
- Visitor comments, likes, voting, or richer donation mechanics.
- Exhibit comparison views over time.
- More formal anti-abuse systems for visit tracking or future voting.
- Richer media previews and screenshots where legally and technically appropriate.
