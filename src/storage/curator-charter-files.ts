import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  type CuratorCharter,
  type CuratorCharterDraft,
  type CuratorId,
  formatCharterValidationErrors,
  validateCuratorCharter,
} from "@/src/domain/curator-charter";

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

export async function readCuratorCharter(
  curatorId: CuratorId,
  options: CuratorCharterFileOptions = {},
): Promise<CuratorCharter | null> {
  const filePath = getCuratorCharterPath(curatorId, options);

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

export async function writeCuratorCharterDraft(
  curatorId: CuratorId,
  draft: CuratorCharterDraft,
  options: CuratorCharterFileOptions = {},
): Promise<CuratorCharter> {
  const existing = await readCuratorCharter(curatorId, options);
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
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(validation.value, null, 2)}\n`, "utf8");

  return validation.value;
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
