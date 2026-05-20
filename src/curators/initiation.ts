import {
  type CuratorCharter,
  type CuratorId,
} from "@/src/domain/curator-charter";
import {
  INITIATION_PROMPT_VERSION,
  TASTE_SEED_PACK_VERSION,
  type TasteProfile,
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
  const charter = await input.adapter.generateCharter({
    curatorId: input.curatorId,
    prompt,
    now,
  });
  const tasteProfile = createInitialTasteProfile({
    curatorId: input.curatorId,
    provider: input.adapter.provider,
    modelName: input.adapter.modelName,
    temperature: input.adapter.temperature,
    runTimestamp,
  });

  return { charter, tasteProfile };
}

function createInitialTasteProfile(input: {
  curatorId: CuratorId;
  provider: InitiationProvider;
  modelName: string;
  temperature: number | null;
  runTimestamp: string;
}): TasteProfile {
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
    curatorId: input.curatorId,
    provider: input.provider,
    modelName: input.modelName,
    runTimestamp: input.runTimestamp,
    promptVersion: INITIATION_PROMPT_VERSION,
    seedPackVersion: TASTE_SEED_PACK_VERSION,
    temperature: input.temperature,
    interview: {
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
    },
    seedArtifacts: tasteSeedPackV0,
    behavior: {
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
    },
    tasteDimensionsInferred: [
      "systems visibility",
      "archival residue",
      "anti-empty-polish",
      "technical behavior as form",
    ],
    descriptiveComparisonMetrics: {
      selectionOverlap: emptyCuratorMetric(input.curatorId),
      rejectionOverlap: emptyCuratorMetric(input.curatorId),
      rankCorrelationNotes:
        "No cross-curator provider trials have run yet; overlap metrics remain zeroed placeholders.",
      rationaleSpecificity: "medium",
      rationaleVocabularySimilarity: {
        gpt: input.curatorId === "gpt" ? "high" : "low",
        claude: input.curatorId === "claude" ? "high" : "low",
        gemini: input.curatorId === "gemini" ? "high" : "low",
        grok: input.curatorId === "grok" ? "high" : "low",
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
    },
    benchmarkMetadata: {
      promptVersion: INITIATION_PROMPT_VERSION,
      seedPackVersion: TASTE_SEED_PACK_VERSION,
      modelName: input.modelName,
      provider: input.provider,
      temperature: input.temperature,
      runTimestamp: input.runTimestamp,
    },
    operatorReview: {
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
    },
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
