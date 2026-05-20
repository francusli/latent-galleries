import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  type CuratorCharter,
  type CuratorCharterDraft,
  type CuratorId,
  formatCharterValidationErrors,
  validateCuratorCharter,
} from "@/src/domain/curator-charter";
import {
  type TasteProfile,
  isAcceptedTasteProfile,
  validateTasteProfile,
} from "@/src/domain/curator-initiation";

export type CuratorCharterFileOptions = {
  baseDir?: string;
  now?: Date;
};

export class CuratorCharterFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CuratorCharterFileError";
  }
}

export function getCuratorCharterPath(
  curatorId: CuratorId,
  options: CuratorCharterFileOptions = {},
): string {
  return path.join(getBaseDir(options), "data", "curators", `${curatorId}.charter.json`);
}

export function getCuratorCharterDraftPath(
  curatorId: CuratorId,
  options: CuratorCharterFileOptions = {},
): string {
  return path.join(
    getBaseDir(options),
    "data",
    "curators",
    "drafts",
    `${curatorId}.charter.draft.json`,
  );
}

export function getTasteProfileDraftPath(
  curatorId: CuratorId,
  options: CuratorCharterFileOptions = {},
): string {
  return path.join(
    getBaseDir(options),
    "data",
    "curators",
    "drafts",
    `${curatorId}.taste-profile.json`,
  );
}

export function getReviewedCuratorCharterPath(
  curatorId: CuratorId,
  acceptedDate: string,
  options: CuratorCharterFileOptions = {},
): string {
  return path.join(
    getBaseDir(options),
    "data",
    "curators",
    `${acceptedDate}.${curatorId}.charter.json`,
  );
}

export async function readCuratorCharter(
  curatorId: CuratorId,
  options: CuratorCharterFileOptions = {},
): Promise<CuratorCharter | null> {
  const reviewedPath = await getLatestReviewedCuratorCharterPath(curatorId, options);
  const filePath = reviewedPath ?? getCuratorCharterPath(curatorId, options);
  return readCharterFile(filePath);
}

export async function writeCuratorCharterDraft(
  curatorId: CuratorId,
  draft: CuratorCharterDraft,
  options: CuratorCharterFileOptions = {},
): Promise<CuratorCharter> {
  const existing = await readCharterFile(getCuratorCharterPath(curatorId, options));
  const timestamp = (options.now ?? new Date()).toISOString();
  const charter: CuratorCharter = {
    ...draft,
    curatorId,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  const validation = validateCuratorCharter(charter);

  if (!validation.ok) {
    throw new CuratorCharterFileError(
      `Refusing to write invalid curator charter for ${curatorId}: ${formatCharterValidationErrors(validation.errors)}`,
    );
  }

  const filePath = getCuratorCharterPath(curatorId, options);
  await writeJsonFile(filePath, validation.value);

  return validation.value;
}

export async function writeDraftCuratorCharter(
  curatorId: CuratorId,
  charter: CuratorCharter,
  options: CuratorCharterFileOptions = {},
): Promise<CuratorCharter> {
  const validation = validateCuratorCharter({ ...charter, curatorId });

  if (!validation.ok) {
    throw new CuratorCharterFileError(
      `Refusing to write invalid draft curator charter for ${curatorId}: ${formatCharterValidationErrors(validation.errors)}`,
    );
  }

  const filePath = getCuratorCharterDraftPath(curatorId, options);
  await writeJsonFile(filePath, validation.value);

  return validation.value;
}

export async function writeTasteProfileDraft(
  curatorId: CuratorId,
  profile: TasteProfile,
  options: CuratorCharterFileOptions = {},
): Promise<TasteProfile> {
  const validation = validateTasteProfile({ ...profile, curatorId });

  if (!validation.ok) {
    throw new CuratorCharterFileError(
      `Refusing to write invalid taste profile for ${curatorId}: ${validation.errors.join("; ")}`,
    );
  }

  const filePath = getTasteProfileDraftPath(curatorId, options);
  await writeJsonFile(filePath, validation.value);

  return validation.value;
}

export async function writeReviewedCuratorCharter(
  curatorId: CuratorId,
  charter: CuratorCharter,
  profile: TasteProfile,
  options: CuratorCharterFileOptions = {},
): Promise<CuratorCharter> {
  const charterValidation = validateCuratorCharter({ ...charter, curatorId });
  if (!charterValidation.ok) {
    throw new CuratorCharterFileError(
      `Refusing to write invalid reviewed curator charter for ${curatorId}: ${formatCharterValidationErrors(charterValidation.errors)}`,
    );
  }

  const profileValidation = validateTasteProfile(profile);
  if (!profileValidation.ok) {
    throw new CuratorCharterFileError(
      `Refusing to write reviewed charter because taste profile is invalid for ${curatorId}: ${profileValidation.errors.join("; ")}`,
    );
  }

  if (profileValidation.value.curatorId !== curatorId) {
    throw new CuratorCharterFileError(
      `Refusing to write reviewed charter for ${curatorId} with ${profileValidation.value.curatorId} taste profile`,
    );
  }

  if (!isAcceptedTasteProfile(profileValidation.value)) {
    throw new CuratorCharterFileError(
      `Refusing to write reviewed charter for ${curatorId} without an accepted taste profile`,
    );
  }

  const acceptedDate = profileValidation.value.operatorReview.acceptedDate.slice(0, 10);
  const filePath = getReviewedCuratorCharterPath(curatorId, acceptedDate, options);
  await writeJsonFile(filePath, charterValidation.value);

  return charterValidation.value;
}

async function getLatestReviewedCuratorCharterPath(
  curatorId: CuratorId,
  options: CuratorCharterFileOptions,
): Promise<string | null> {
  const curatorDir = path.join(getBaseDir(options), "data", "curators");
  let entries: string[];
  try {
    entries = await readdir(curatorDir);
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw error;
  }

  const reviewed = entries
    .filter((entry) => /^\d{4}-\d{2}-\d{2}\.[a-z]+\.charter\.json$/.test(entry))
    .filter((entry) => entry.endsWith(`.${curatorId}.charter.json`))
    .sort();

  const latest = reviewed.at(-1);
  return latest ? path.join(curatorDir, latest) : null;
}

async function readCharterFile(filePath: string): Promise<CuratorCharter | null> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }

    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new CuratorCharterFileError(
      `${filePath} contains malformed JSON: ${String(error)}`,
    );
  }

  const validation = validateCuratorCharter(parsed);
  if (!validation.ok) {
    throw new CuratorCharterFileError(
      `${filePath} is not a valid curator charter: ${formatCharterValidationErrors(validation.errors)}`,
    );
  }

  return validation.value;
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function getBaseDir(options: CuratorCharterFileOptions): string {
  return options.baseDir ?? process.cwd();
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
