export const CURATOR_IDS = ["gpt", "claude", "gemini", "grok"] as const;

export type CuratorId = (typeof CURATOR_IDS)[number];

export const RESEARCH_ORIENTATIONS = [
  "broad",
  "niche",
  "historical",
  "technical",
  "visual",
  "cultural",
  "experimental",
] as const;

export type ResearchOrientation = (typeof RESEARCH_ORIENTATIONS)[number];

export type CuratorCharter = {
  curatorId: CuratorId;
  galleryName: string;
  curatorialApproach: string;
  curatorialStatement: string;
  preferredMedia: string[];
  guidingQuestions: string[];
  selectionPrinciples: string[];
  exclusions: string[];
  researchOrientation: ResearchOrientation;
  criticalVoice: string;
  createdAt: string;
  updatedAt: string;
  version: string;
};

export type CuratorCharterDraft = Omit<
  CuratorCharter,
  "createdAt" | "updatedAt"
>;

export type CharterValidationError = {
  field: keyof CuratorCharter;
  message: string;
};

export type CharterValidationResult =
  | { ok: true; value: CuratorCharter }
  | { ok: false; errors: CharterValidationError[] };

export function isCuratorId(value: unknown): value is CuratorId {
  return typeof value === "string" && CURATOR_IDS.includes(value as CuratorId);
}

export function isResearchOrientation(
  value: unknown,
): value is ResearchOrientation {
  return (
    typeof value === "string" &&
    RESEARCH_ORIENTATIONS.includes(value as ResearchOrientation)
  );
}

export function validateCuratorCharter(
  value: unknown,
): CharterValidationResult {
  if (!isRecord(value)) {
    return {
      ok: false,
      errors: [
        {
          field: "curatorId",
          message: "charter must be a JSON object",
        },
      ],
    };
  }

  const errors: CharterValidationError[] = [];

  if (!isCuratorId(value.curatorId)) {
    errors.push({
      field: "curatorId",
      message: `must be one of: ${CURATOR_IDS.join(", ")}`,
    });
  }

  validateNonEmptyString(value, "galleryName", errors);
  validateNonEmptyString(value, "curatorialApproach", errors);
  validateNonEmptyString(value, "curatorialStatement", errors);
  validateNonEmptyStringArray(value, "preferredMedia", errors);
  validateNonEmptyStringArray(value, "guidingQuestions", errors);
  validateNonEmptyStringArray(value, "selectionPrinciples", errors);
  validateNonEmptyStringArray(value, "exclusions", errors);

  if (!isResearchOrientation(value.researchOrientation)) {
    errors.push({
      field: "researchOrientation",
      message: `must be one of: ${RESEARCH_ORIENTATIONS.join(", ")}`,
    });
  }

  validateNonEmptyString(value, "criticalVoice", errors);
  validateIsoDateString(value, "createdAt", errors);
  validateIsoDateString(value, "updatedAt", errors);
  validateNonEmptyString(value, "version", errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: value as CuratorCharter };
}

export function formatCharterValidationErrors(
  errors: CharterValidationError[],
): string {
  return errors.map((error) => `${error.field}: ${error.message}`).join("; ");
}

export function renderCuratorCharterForPrompt(
  charter: CuratorCharter,
): string {
  return [
    "Current curator charter:",
    `Gallery name: ${charter.galleryName}`,
    `Curatorial approach: ${charter.curatorialApproach}`,
    `Curatorial statement: ${charter.curatorialStatement}`,
    "Preferred media:",
    ...renderList(charter.preferredMedia),
    "Guiding questions:",
    ...renderList(charter.guidingQuestions),
    "Selection principles:",
    ...renderList(charter.selectionPrinciples),
    "Exclusions:",
    ...renderList(charter.exclusions),
    `Research orientation: ${charter.researchOrientation}`,
    `Critical voice: ${charter.criticalVoice}`,
  ].join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateNonEmptyString(
  value: Record<string, unknown>,
  field: keyof CuratorCharter,
  errors: CharterValidationError[],
): void {
  if (typeof value[field] !== "string" || value[field].trim().length === 0) {
    errors.push({ field, message: "must be a non-empty string" });
  }
}

function validateIsoDateString(
  value: Record<string, unknown>,
  field: keyof CuratorCharter,
  errors: CharterValidationError[],
): void {
  if (
    typeof value[field] !== "string" ||
    value[field].trim().length === 0 ||
    Number.isNaN(Date.parse(value[field]))
  ) {
    errors.push({ field, message: "must be an ISO timestamp string" });
  }
}

function validateNonEmptyStringArray(
  value: Record<string, unknown>,
  field: keyof CuratorCharter,
  errors: CharterValidationError[],
): void {
  const fieldValue = value[field];

  if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
    errors.push({ field, message: "must be a non-empty string array" });
    return;
  }

  if (
    fieldValue.some(
      (item) => typeof item !== "string" || item.trim().length === 0,
    )
  ) {
    errors.push({
      field,
      message: "must contain only non-empty strings",
    });
  }
}

function renderList(items: string[]): string[] {
  return items.map((item) => `- ${item}`);
}
