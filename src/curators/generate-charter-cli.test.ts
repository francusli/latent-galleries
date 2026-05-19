import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, it } from "node:test";

import {
  CURATOR_IDS,
  validateCuratorCharter,
} from "@/src/domain/curator-charter";
import { getCuratorCharterPath } from "@/src/storage/curator-charter-files";

const execFileAsync = promisify(execFile);
const tsxBin = path.join(process.cwd(), "node_modules", ".bin", "tsx");
const scriptPath = path.join(process.cwd(), "scripts", "generate-charter.ts");

describe("generate-charter CLI", () => {
  it("creates one valid charter in a temp directory", async () => {
    const baseDir = await createTempDir();

    await execFileAsync(tsxBin, [scriptPath, "--curator", "gpt"], {
      env: { ...process.env, LATENT_GALLERIES_CHARTER_BASE_DIR: baseDir },
    });

    const raw = await readFile(getCuratorCharterPath("gpt", { baseDir }), "utf8");
    const validation = validateCuratorCharter(JSON.parse(raw));

    assert.equal(validation.ok, true);
  });

  it("creates all four charters in a temp directory", async () => {
    const baseDir = await createTempDir();

    await execFileAsync(tsxBin, [scriptPath, "--all"], {
      env: { ...process.env, LATENT_GALLERIES_CHARTER_BASE_DIR: baseDir },
    });

    for (const curatorId of CURATOR_IDS) {
      const raw = await readFile(
        getCuratorCharterPath(curatorId, { baseDir }),
        "utf8",
      );
      assert.equal(validateCuratorCharter(JSON.parse(raw)).ok, true);
    }
  });
});

async function createTempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "latent-galleries-charter-cli-"));
}
