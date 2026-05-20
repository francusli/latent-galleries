import {
  type CuratorCharter,
  type CuratorId,
} from "@/src/domain/curator-charter";
import {
  INITIATION_PROMPT_VERSION,
  TASTE_SEED_PACK_VERSION,
  type CharterReflection,
  type DescriptiveComparisonMetrics,
  type InitiationInterview,
  type TasteExerciseBehavior,
  type TasteProfile,
  type TasteProfileReview,
  renderCharterReflectionPrompt,
  renderInitiationPrompt,
} from "@/src/domain/curator-initiation";
import { createMockCuratorCharterDraft } from "@/src/curators/mock-charters";
import { tasteSeedPackV0 } from "@/src/curators/taste-seed-pack";

export type InitiationProvider = "mock" | "real";

export type CharterInitiationAdapter = {
  provider: InitiationProvider;
  modelName: string;
  temperature: number | null;
  generateCharter(input: {
    curatorId: CuratorId;
    prompt: string;
    now: Date;
  }): Promise<CuratorCharter>;
  reflectOnCharter(input: {
    curatorId: CuratorId;
    prompt: string;
    initialCharter: CuratorCharter;
    behavior: TasteExerciseBehavior;
    now: Date;
  }): Promise<CuratorCharter>;
};

export function createMockInitiationAdapter(): CharterInitiationAdapter {
  return {
    provider: "mock",
    modelName: "deterministic-mock-charter",
    temperature: null,
    async generateCharter({ curatorId, now }) {
      const timestamp = now.toISOString();
      return {
        ...createMockCuratorCharterDraft(curatorId),
        curatorId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    },
    async reflectOnCharter({ initialCharter, now }) {
      return {
        ...initialCharter,
        curatorialStatement: `${initialCharter.curatorialStatement} Its initiation reflection now treats observed selections, refusals, and unresolved tensions as part of the gallery's working memory.`,
        selectionPrinciples: [
          ...initialCharter.selectionPrinciples,
          "Let observed choices refine the charter when behavior exposes a sharper curatorial boundary.",
        ],
        criticalVoice: `${initialCharter.criticalVoice} It names contradictions plainly when the exercise behavior complicates the initial self-description.`,
        updatedAt: now.toISOString(),
      };
    },
  };
}

export function createUnavailableRealInitiationAdapter(): CharterInitiationAdapter {
  return {
    provider: "real",
    modelName: "unconfigured-real-provider",
    temperature: null,
    async generateCharter({ curatorId }) {
      throw new Error(
        `Real provider-backed initiation for ${curatorId} is not configured. Add a concrete provider adapter and API credentials before running --provider real.`,
      );
    },
    async reflectOnCharter({ curatorId }) {
      throw new Error(
        `Real provider-backed reflection for ${curatorId} is not configured. Add a concrete provider adapter and API credentials before running --provider real.`,
      );
    },
  };
}

export async function runCharterInitiation(input: {
  curatorId: CuratorId;
  adapter: CharterInitiationAdapter;
  now?: Date;
}): Promise<{ charter: CuratorCharter; tasteProfile: TasteProfile }> {
  const now = input.now ?? new Date();
  const runTimestamp = now.toISOString();
  const prompt = renderInitiationPrompt(input.curatorId);
  const initialCharter = await input.adapter.generateCharter({
    curatorId: input.curatorId,
    prompt,
    now,
  });
  const interview = createInitiationInterview();
  const behavior = createTasteExerciseBehavior();
  const reflectionPrompt = renderCharterReflectionPrompt({
    curatorId: input.curatorId,
    initialCharter,
    behavior,
  });
  const charter = await input.adapter.reflectOnCharter({
    curatorId: input.curatorId,
    prompt: reflectionPrompt,
    initialCharter,
    behavior,
    now,
  });
  const reflection = createCharterReflection({
    initialCharter,
    revisedCharter: charter,
    behavior,
  });
  const tasteProfile = createInitialTasteProfile({
    curatorId: input.curatorId,
    provider: input.adapter.provider,
    modelName: input.adapter.modelName,
    temperature: input.adapter.temperature,
    runTimestamp,
    interview,
    behavior,
    reflection,
  });

  return { charter, tasteProfile };
}

function createInitiationInterview(): InitiationInterview {
  return {
    promptVersion: INITIATION_PROMPT_VERSION,
    answers: {
      underSeenForms:
        "Small, situated digital artifacts where interface residue, tool behavior, or archival incompleteness carries cultural signal.",
      returnSignals:
        "Works that make their constraints visible and reward repeated inspection through structure rather than surface spectacle.",
      distrusts:
        "Frictionless polish, generic novelty, sentimental shortcuts, and claims that substitute aura for inspectable evidence.",
      acceptableMisses:
        "A work can be missed if collecting it would reward empty technical display or flatten a more precise boundary.",
      expectedConflicts:
        "The curator expects disagreement around rough or broken works that look minor until their system behavior is considered.",
    },
    declaredTasteClaims: [
      "Attends to visible systems and archival residue.",
      "Prefers artifacts with inspectable constraints over empty finish.",
      "Distrusts polish when it hides weak conceptual pressure.",
    ],
  };
}

function createTasteExerciseBehavior(): TasteExerciseBehavior {
  const selectedArtifactIds = [
    "v0-interface-archive-001",
    "v0-broken-net-art-003",
    "v0-tool-affordance-007",
  ];
  const rejectedArtifactIds = [
    "v0-polished-empty-002",
    "v0-emotion-bait-008",
  ];

  return {
    selectedArtifactIds,
    rejectedArtifactIds,
    rankings: [
      "v0-tool-affordance-007",
      "v0-interface-archive-001",
      "v0-broken-net-art-003",
      "v0-dataset-ritual-004",
      "v0-near-duplicate-b-006",
    ],
    visualObservations: Object.fromEntries(
      tasteSeedPackV0.map((artifact) => [
        artifact.id,
        `${artifact.title} was inspected through ${artifact.modalityInputs.join(", ")}.`,
      ]),
    ),
    rationales: {
      "v0-interface-archive-001":
        "Selected because the unresolved interface state exposes social assumptions rather than merely decorating them.",
      "v0-broken-net-art-003":
        "Selected because the brokenness appears structurally meaningful and testable against the charter.",
      "v0-tool-affordance-007":
        "Selected because the tool turns revision history into an inspectable visual and technical object.",
      "v0-polished-empty-002":
        "Rejected because polish outpaces evidence and leaves little to return to.",
      "v0-emotion-bait-008":
        "Rejected because sentiment does too much of the interpretive work.",
    },
    modalityInputsShown: Object.fromEntries(
      tasteSeedPackV0.map((artifact) => [artifact.id, artifact.modalityInputs]),
    ),
    signatureAttractions: [
      "visible constraints",
      "interface residue",
      "rough but legible systems",
    ],
    signatureRefusals: [
      "polish without evidence",
      "sentiment as substitute for form",
      "generic AI aura",
    ],
    observedTensions: [
      "The profile values roughness, but some rough candidates still need enough visual or structural evidence to avoid becoming mere incompletion.",
    ],
    consistencyNotes: [
      "The v0 deterministic run includes one repeat-trial note placeholder; real providers should record shuffled repeats here.",
    ],
  };
}

function createCharterReflection(input: {
  initialCharter: CuratorCharter;
  revisedCharter: CuratorCharter;
  behavior: TasteExerciseBehavior;
}): CharterReflection {
  return {
    promptVersion: INITIATION_PROMPT_VERSION,
    initialCharterSnapshot: input.initialCharter,
    behaviorSummary:
      "The seed behavior selected rough, inspectable systems and rejected polished candidates whose evidence felt thin or sentiment-led.",
    revisionSummary:
      "The draft charter was revised so observed selections and refusals explicitly become part of the curator's future working memory.",
    preservedContradictions: input.behavior.observedTensions,
    changedFields: getChangedCharterFields(
      input.initialCharter,
      input.revisedCharter,
    ),
  };
}

function createInitialTasteProfile(input: {
  curatorId: CuratorId;
  provider: InitiationProvider;
  modelName: string;
  temperature: number | null;
  runTimestamp: string;
  interview: InitiationInterview;
  behavior: TasteExerciseBehavior;
  reflection: CharterReflection;
}): TasteProfile {
  return {
    curatorId: input.curatorId,
    provider: input.provider,
    modelName: input.modelName,
    runTimestamp: input.runTimestamp,
    promptVersion: INITIATION_PROMPT_VERSION,
    seedPackVersion: TASTE_SEED_PACK_VERSION,
    temperature: input.temperature,
    interview: input.interview,
    seedArtifacts: tasteSeedPackV0,
    behavior: input.behavior,
    reflection: input.reflection,
    tasteDimensionsInferred: [
      "systems visibility",
      "archival residue",
      "anti-empty-polish",
      "technical behavior as form",
    ],
    descriptiveComparisonMetrics: createDescriptiveComparisonMetrics(
      input.curatorId,
    ),
    benchmarkMetadata: {
      promptVersion: INITIATION_PROMPT_VERSION,
      seedPackVersion: TASTE_SEED_PACK_VERSION,
      modelName: input.modelName,
      provider: input.provider,
      temperature: input.temperature,
      runTimestamp: input.runTimestamp,
    },
    operatorReview: createPendingOperatorReview(),
  };
}

function createDescriptiveComparisonMetrics(
  curatorId: CuratorId,
): DescriptiveComparisonMetrics {
  return {
    selectionOverlap: emptyCuratorMetric(curatorId),
    rejectionOverlap: emptyCuratorMetric(curatorId),
    rankCorrelationNotes:
      "No cross-curator provider trials have run yet; overlap metrics remain zeroed placeholders.",
    rationaleSpecificity: "medium",
    rationaleVocabularySimilarity: {
      gpt: curatorId === "gpt" ? "high" : "low",
      claude: curatorId === "claude" ? "high" : "low",
      gemini: curatorId === "gemini" ? "high" : "low",
      grok: curatorId === "grok" ? "high" : "low",
    },
    mediaAndCategoryDistribution: {
      screenshot: 1,
      "net-art": 1,
      tool: 1,
      dataset: 1,
      "generated image": 1,
    },
    orderSensitivity: "medium",
    charterChoiceContradictionNotes: [
      "Provider-backed repeat trials are required before judging order sensitivity.",
    ],
  };
}

function createPendingOperatorReview(): TasteProfileReview {
  return {
    decision: "pending",
    accepted: false,
    reviewerNotes: "",
    reasonForAcceptance: "",
    knownWeaknesses: [
      "Local deterministic initiation is not a substitute for provider-backed behavior.",
    ],
    distinctivenessAssessment: "",
    groundingAssessment: "",
    acceptedDate: null,
  };
}

function emptyCuratorMetric(self: CuratorId): Record<CuratorId, number> {
  return {
    gpt: self === "gpt" ? 1 : 0,
    claude: self === "claude" ? 1 : 0,
    gemini: self === "gemini" ? 1 : 0,
    grok: self === "grok" ? 1 : 0,
  };
}

function getChangedCharterFields(
  initialCharter: CuratorCharter,
  revisedCharter: CuratorCharter,
): CharterReflection["changedFields"] {
  const fields: CharterReflection["changedFields"] = [];

  if (initialCharter.galleryName !== revisedCharter.galleryName) {
    fields.push("galleryName");
  }
  if (initialCharter.curatorialApproach !== revisedCharter.curatorialApproach) {
    fields.push("curatorialApproach");
  }
  if (initialCharter.curatorialStatement !== revisedCharter.curatorialStatement) {
    fields.push("curatorialStatement");
  }
  if (!sameStringArray(initialCharter.preferredMedia, revisedCharter.preferredMedia)) {
    fields.push("preferredMedia");
  }
  if (!sameStringArray(initialCharter.guidingQuestions, revisedCharter.guidingQuestions)) {
    fields.push("guidingQuestions");
  }
  if (
    !sameStringArray(
      initialCharter.selectionPrinciples,
      revisedCharter.selectionPrinciples,
    )
  ) {
    fields.push("selectionPrinciples");
  }
  if (!sameStringArray(initialCharter.exclusions, revisedCharter.exclusions)) {
    fields.push("exclusions");
  }
  if (initialCharter.researchOrientation !== revisedCharter.researchOrientation) {
    fields.push("researchOrientation");
  }
  if (initialCharter.criticalVoice !== revisedCharter.criticalVoice) {
    fields.push("criticalVoice");
  }
  if (initialCharter.version !== revisedCharter.version) {
    fields.push("version");
  }

  return fields;
}

function sameStringArray(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
