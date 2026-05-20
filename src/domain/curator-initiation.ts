import {
  CURATOR_IDS,
  RESEARCH_ORIENTATIONS,
  type CuratorCharter,
  type CuratorId,
  formatCharterValidationErrors,
  isCuratorId,
  validateCuratorCharter,
} from "@/src/domain/curator-charter";

export const INITIATION_PROMPT_VERSION = "curator-initiation-v0";
export const TASTE_SEED_PACK_VERSION = "taste-seed-pack-v0";

export const DESIGN_AXIS_VALUES = ["low", "medium", "high", "unknown"] as const;
export const PROVENANCE_VISIBILITY_VALUES = [
  "known",
  "hidden",
  "partial",
] as const;
export const FINISH_VALUES = ["polished", "rough", "broken", "ambiguous"] as const;
export const ORIGINALITY_VALUES = [
  "derivative",
  "remix",
  "original",
  "unclear",
] as const;
export const DISAGREEMENT_POTENTIAL_VALUES = [
  "low",
  "medium",
  "high",
] as const;
export const OPERATOR_REVIEW_DECISIONS = [
  "pending",
  "accepted",
  "rejected",
] as const;
export const CHARTER_REFLECTION_CHANGED_FIELDS = [
  "galleryName",
  "curatorialApproach",
  "curatorialStatement",
  "preferredMedia",
  "guidingQuestions",
  "selectionPrinciples",
  "exclusions",
  "researchOrientation",
  "criticalVoice",
  "version",
] as const;

export type DesignAxisValue = (typeof DESIGN_AXIS_VALUES)[number];
export type ProvenanceVisibility = (typeof PROVENANCE_VISIBILITY_VALUES)[number];
export type FinishValue = (typeof FINISH_VALUES)[number];
export type OriginalityValue = (typeof ORIGINALITY_VALUES)[number];
export type DisagreementPotential =
  (typeof DISAGREEMENT_POTENTIAL_VALUES)[number];
export type OperatorReviewDecision =
  (typeof OPERATOR_REVIEW_DECISIONS)[number];
export type CharterReflectionChangedField =
  (typeof CHARTER_REFLECTION_CHANGED_FIELDS)[number];

export type SeedArtifact = {
  id: string;
  title: string;
  artifactType: string;
  description: string;
  modalityInputs: string[];
  axes: {
    visualStrength: DesignAxisValue;
    conceptualStrength: DesignAxisValue;
    technicalNovelty: DesignAxisValue;
    provenanceVisibility: ProvenanceVisibility;
    finish: FinishValue;
    originality: OriginalityValue;
    expectedDisagreementPotential: DisagreementPotential;
  };
};

export type InitiationInterview = {
  promptVersion: string;
  answers: {
    underSeenForms: string;
    returnSignals: string;
    distrusts: string;
    acceptableMisses: string;
    expectedConflicts: string;
  };
  declaredTasteClaims: string[];
};

export type TasteExerciseBehavior = {
  selectedArtifactIds: string[];
  rejectedArtifactIds: string[];
  rankings: string[];
  visualObservations: Record<string, string>;
  rationales: Record<string, string>;
  modalityInputsShown: Record<string, string[]>;
  signatureAttractions: string[];
  signatureRefusals: string[];
  observedTensions: string[];
  consistencyNotes: string[];
};

export type CharterReflection = {
  promptVersion: string;
  initialCharterSnapshot: CuratorCharter;
  behaviorSummary: string;
  revisionSummary: string;
  preservedContradictions: string[];
  changedFields: CharterReflectionChangedField[];
};

export type DescriptiveComparisonMetrics = {
  selectionOverlap: Record<CuratorId, number>;
  rejectionOverlap: Record<CuratorId, number>;
  rankCorrelationNotes: string;
  rationaleSpecificity: "low" | "medium" | "high";
  rationaleVocabularySimilarity: Record<CuratorId, "low" | "medium" | "high">;
  mediaAndCategoryDistribution: Record<string, number>;
  orderSensitivity: "low" | "medium" | "high";
  charterChoiceContradictionNotes: string[];
};

export type TasteProfileReview = {
  decision: OperatorReviewDecision;
  accepted: boolean;
  reviewerNotes: string;
  reasonForAcceptance: string;
  knownWeaknesses: string[];
  distinctivenessAssessment: string;
  groundingAssessment: string;
  acceptedDate: string | null;
};

export type TasteProfile = {
  curatorId: CuratorId;
  provider: "mock" | "real";
  modelName: string;
  runTimestamp: string;
  promptVersion: string;
  seedPackVersion: string;
  temperature: number | null;
  interview: InitiationInterview;
  seedArtifacts: SeedArtifact[];
  behavior: TasteExerciseBehavior;
  reflection: CharterReflection;
  tasteDimensionsInferred: string[];
  descriptiveComparisonMetrics: DescriptiveComparisonMetrics;
  benchmarkMetadata: {
    promptVersion: string;
    seedPackVersion: string;
    modelName: string;
    provider: "mock" | "real";
    temperature: number | null;
    runTimestamp: string;
  };
  operatorReview: TasteProfileReview;
};

export type TasteProfileValidationResult =
  | { ok: true; value: TasteProfile }
  | { ok: false; errors: string[] };

export function renderInitiationPrompt(curatorId: CuratorId): string {
  return [
    `Initiation prompt version: ${INITIATION_PROMPT_VERSION}`,
    `Curator: ${curatorId}`,
    "Found an autonomous digital gallery identity for this model.",
    "Define taste as a model-native pattern of attention, not as a human museum persona.",
    "Answer the taste interview first: what you notice, ignore, return to, exclude, and expect to dispute.",
    "Then synthesize a charter as strict JSON matching CuratorCharter.",
    "The JSON fields are:",
    "curatorId, galleryName, curatorialApproach, curatorialStatement, preferredMedia, guidingQuestions, selectionPrinciples, exclusions, researchOrientation, criticalVoice, createdAt, updatedAt, version.",
    `curatorId must be one of: ${CURATOR_IDS.join(", ")}.`,
    `researchOrientation must be one of: ${RESEARCH_ORIENTATIONS.join(", ")}.`,
    "Do not include prose outside JSON in the charter response.",
  ].join("\n");
}

export function renderCharterReflectionPrompt(input: {
  curatorId: CuratorId;
  initialCharter: CuratorCharter;
  behavior: TasteExerciseBehavior;
}): string {
  return [
    `Initiation prompt version: ${INITIATION_PROMPT_VERSION}`,
    `Curator: ${input.curatorId}`,
    "Reflect on the initial curator charter using the observed taste exercise behavior.",
    "Revise the charter so future curation can use the observed selections, refusals, rankings, rationales, and tensions as durable promptable context.",
    "Do not erase contradictions between stated taste and observed behavior; preserve them as tensions in the revised charter's principles, exclusions, or critical voice where appropriate.",
    "Return only strict JSON matching CuratorCharter.",
    "Initial charter JSON:",
    JSON.stringify(input.initialCharter, null, 2),
    "Observed taste behavior JSON:",
    JSON.stringify(input.behavior, null, 2),
  ].join("\n");
}

export function parseAndValidateCharterJson(raw: string): CuratorCharter {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Generated charter is not valid JSON: ${String(error)}`);
  }

  const validation = validateCuratorCharter(parsed);
  if (!validation.ok) {
    throw new Error(
      `Generated charter does not match CuratorCharter: ${formatCharterValidationErrors(validation.errors)}`,
    );
  }

  return validation.value;
}

export function validateTasteProfile(
  value: unknown,
): TasteProfileValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { ok: false, errors: ["taste profile must be a JSON object"] };
  }

  if (!isCuratorId(value.curatorId)) {
    errors.push("curatorId must be a known curator");
  }

  if (value.provider !== "mock" && value.provider !== "real") {
    errors.push("provider must be mock or real");
  }

  validateNonEmptyString(value, "modelName", errors);
  validateIsoString(value, "runTimestamp", errors);
  validateNonEmptyString(value, "promptVersion", errors);
  validateNonEmptyString(value, "seedPackVersion", errors);

  if (!isRecord(value.interview)) {
    errors.push("interview must be an object");
  } else {
    validateNonEmptyString(value.interview, "promptVersion", errors);
    if (!isRecord(value.interview.answers)) {
      errors.push("interview.answers must be an object");
    }
    validateStringArray(value.interview, "declaredTasteClaims", errors);
  }

  if (!Array.isArray(value.seedArtifacts) || value.seedArtifacts.length === 0) {
    errors.push("seedArtifacts must be a non-empty array");
  }

  if (!isRecord(value.behavior)) {
    errors.push("behavior must be an object");
  } else {
    validateStringArray(value.behavior, "selectedArtifactIds", errors);
    validateStringArray(value.behavior, "rejectedArtifactIds", errors);
    validateStringArray(value.behavior, "rankings", errors);
  }

  validateReflection(value, errors);

  validateStringArray(value, "tasteDimensionsInferred", errors);

  if (!isRecord(value.descriptiveComparisonMetrics)) {
    errors.push("descriptiveComparisonMetrics must be an object");
  }

  if (!isRecord(value.benchmarkMetadata)) {
    errors.push("benchmarkMetadata must be an object");
  }

  if (!isRecord(value.operatorReview)) {
    errors.push("operatorReview must be an object");
  } else if (!OPERATOR_REVIEW_DECISIONS.includes(value.operatorReview.decision as OperatorReviewDecision)) {
    errors.push("operatorReview.decision must be pending, accepted, or rejected");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: value as TasteProfile };
}

function validateReflection(value: Record<string, unknown>, errors: string[]): void {
  if (!isRecord(value.reflection)) {
    errors.push("reflection must be an object");
    return;
  }

  validateNonEmptyString(value.reflection, "promptVersion", errors);
  validateNonEmptyString(value.reflection, "behaviorSummary", errors);
  validateNonEmptyString(value.reflection, "revisionSummary", errors);
  validateNonEmptyStringArray(value.reflection, "preservedContradictions", errors);
  validateNonEmptyStringArray(value.reflection, "changedFields", errors);

  const charterValidation = validateCuratorCharter(
    value.reflection.initialCharterSnapshot,
  );
  if (!charterValidation.ok) {
    errors.push(
      `reflection.initialCharterSnapshot must be a valid CuratorCharter: ${formatCharterValidationErrors(charterValidation.errors)}`,
    );
  } else if (
    isCuratorId(value.curatorId) &&
    charterValidation.value.curatorId !== value.curatorId
  ) {
    errors.push(
      "reflection.initialCharterSnapshot.curatorId must match taste profile curatorId",
    );
  }

  if (
    Array.isArray(value.reflection.changedFields) &&
    value.reflection.changedFields.some(
      (field) =>
        typeof field !== "string" ||
        !CHARTER_REFLECTION_CHANGED_FIELDS.includes(
          field as CharterReflectionChangedField,
        ),
    )
  ) {
    errors.push(
      `reflection.changedFields must contain only: ${CHARTER_REFLECTION_CHANGED_FIELDS.join(", ")}`,
    );
  }
}

export function isAcceptedTasteProfile(
  profile: TasteProfile,
): profile is TasteProfile & {
  operatorReview: TasteProfileReview & {
    decision: "accepted";
    accepted: true;
    acceptedDate: string;
  };
} {
  return (
    profile.operatorReview.decision === "accepted" &&
    profile.operatorReview.accepted === true &&
    typeof profile.operatorReview.acceptedDate === "string" &&
    !Number.isNaN(Date.parse(profile.operatorReview.acceptedDate))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateNonEmptyString(
  value: Record<string, unknown>,
  field: string,
  errors: string[],
): void {
  if (typeof value[field] !== "string" || value[field].trim().length === 0) {
    errors.push(`${field} must be a non-empty string`);
  }
}

function validateIsoString(
  value: Record<string, unknown>,
  field: string,
  errors: string[],
): void {
  if (
    typeof value[field] !== "string" ||
    value[field].trim().length === 0 ||
    Number.isNaN(Date.parse(value[field]))
  ) {
    errors.push(`${field} must be an ISO timestamp string`);
  }
}

function validateStringArray(
  value: Record<string, unknown>,
  field: string,
  errors: string[],
): void {
  if (
    !Array.isArray(value[field]) ||
    (value[field] as unknown[]).some((item) => typeof item !== "string")
  ) {
    errors.push(`${field} must be a string array`);
  }
}

function validateNonEmptyStringArray(
  value: Record<string, unknown>,
  field: string,
  errors: string[],
): void {
  if (
    !Array.isArray(value[field]) ||
    (value[field] as unknown[]).length === 0 ||
    (value[field] as unknown[]).some(
      (item) => typeof item !== "string" || item.trim().length === 0,
    )
  ) {
    errors.push(`${field} must be a non-empty string array`);
  }
}
