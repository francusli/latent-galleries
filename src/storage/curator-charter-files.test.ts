import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  CURATOR_IDS,
  renderCuratorCharterForPrompt,
} from "@/src/domain/curator-charter";
import { createMockCuratorCharterDraft } from "@/src/curators/mock-charters";
import {
  CuratorCharterFileError,
  getCuratorCharterPath,
  readCuratorCharter,
  writeCuratorCharterDraft,
} from "@/src/storage/curator-charter-files";

describe("curator charter files", () => {
  it("reads every canonical curator charter from disk", async () => {
    const charters = await Promise.all(
      CURATOR_IDS.map((curatorId) => readCuratorCharter(curatorId)),
    );

    for (const [index, charter] of charters.entries()) {
      const curatorId = CURATOR_IDS[index];

      assert.ok(charter, `expected ${curatorId} charter to exist`);
      assert.equal(charter.curatorId, curatorId);
      assert.equal(
        getCuratorCharterPath(curatorId),
        path.join(process.cwd(), "data", "curators", `${curatorId}.charter.json`),
      );
      assert.ok(charter.preferredMedia.length >= 3);
      assert.ok(charter.guidingQuestions.length >= 3);
      assert.ok(charter.selectionPrinciples.length >= 3);
      assert.ok(charter.exclusions.length >= 3);

      const prompt = renderCuratorCharterForPrompt(charter);
      assert.match(
        prompt,
        new RegExp(`Gallery name: ${escapeRegExp(charter.galleryName)}`),
      );
      assert.match(
        prompt,
        new RegExp(`Critical voice: ${escapeRegExp(charter.criticalVoice)}`),
      );
    }

    assert.equal(new Set(charters.map((charter) => charter?.galleryName)).size, 4);
    assert.equal(
      new Set(charters.map((charter) => charter?.curatorialApproach)).size,
      4,
    );
  });

  it("creates one valid charter file", async () => {
    const baseDir = await createTempDir();
    const charter = await writeCuratorCharterDraft(
      "gpt",
      createMockCuratorCharterDraft("gpt"),
      { baseDir, now: new Date("2026-05-18T12:00:00.000Z") },
    );

    const loaded = await readCuratorCharter("gpt", { baseDir });

    assert.equal(charter.curatorId, "gpt");
    assert.equal(loaded?.galleryName, "The Pattern Conservatory");
  });

  it("creates all four charter files", async () => {
    const baseDir = await createTempDir();

    await Promise.all(
      CURATOR_IDS.map((curatorId) =>
        writeCuratorCharterDraft(curatorId, createMockCuratorCharterDraft(curatorId), {
          baseDir,
          now: new Date("2026-05-18T12:00:00.000Z"),
        }),
      ),
    );

    const charters = await Promise.all(
      CURATOR_IDS.map((curatorId) => readCuratorCharter(curatorId, { baseDir })),
    );
    const galleryNames = new Set(charters.map((charter) => charter?.galleryName));
    const curatorialApproaches = new Set(
      charters.map((charter) => charter?.curatorialApproach),
    );

    assert.equal(galleryNames.size, CURATOR_IDS.length);
    assert.equal(curatorialApproaches.size, CURATOR_IDS.length);
  });

  it("preserves createdAt and updates updatedAt when regenerating", async () => {
    const baseDir = await createTempDir();

    const first = await writeCuratorCharterDraft(
      "claude",
      createMockCuratorCharterDraft("claude"),
      { baseDir, now: new Date("2026-05-18T12:00:00.000Z") },
    );
    const second = await writeCuratorCharterDraft(
      "claude",
      createMockCuratorCharterDraft("claude"),
      { baseDir, now: new Date("2026-05-18T12:01:00.000Z") },
    );

    assert.equal(second.createdAt, first.createdAt);
    assert.notEqual(second.updatedAt, first.updatedAt);
  });

  it("rejects invalid output without overwriting the existing charter", async () => {
    const baseDir = await createTempDir();
    await writeCuratorCharterDraft("gemini", createMockCuratorCharterDraft("gemini"), {
      baseDir,
      now: new Date("2026-05-18T12:00:00.000Z"),
    });
    const filePath = getCuratorCharterPath("gemini", { baseDir });
    const before = await readFile(filePath, "utf8");

    await assert.rejects(
      writeCuratorCharterDraft(
        "gemini",
        {
          ...createMockCuratorCharterDraft("gemini"),
          galleryName: "",
        },
        { baseDir, now: new Date("2026-05-18T12:01:00.000Z") },
      ),
      CuratorCharterFileError,
    );

    const after = await readFile(filePath, "utf8");
    assert.equal(after, before);
  });

  it("rejects invalid persisted charters when reading", async () => {
    const baseDir = await createTempDir();
    const filePath = getCuratorCharterPath("grok", { baseDir });
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(
      filePath,
      JSON.stringify(
        {
          curatorId: "grok",
          galleryName: "The Glitch Bazaar",
          researchOrientation: "experimental",
        },
        null,
        2,
      ),
      "utf8",
    );

    await assert.rejects(
      readCuratorCharter("grok", { baseDir }),
      (error: unknown) =>
        error instanceof CuratorCharterFileError &&
        error.message.includes("curatorialApproach") &&
        error.message.includes("selectionPrinciples"),
    );
  });
});

async function createTempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "latent-galleries-charters-"));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
