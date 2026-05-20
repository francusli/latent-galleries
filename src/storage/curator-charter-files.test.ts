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
  getCuratorCharterDraftPath,
  getCuratorCharterPath,
  getReviewedCuratorCharterPath,
  getTasteProfileDraftPath,
  readCuratorCharter,
  writeDraftCuratorCharter,
  writeReviewedCuratorCharter,
  writeCuratorCharterDraft,
  writeTasteProfileDraft,
} from "@/src/storage/curator-charter-files";
import {
  createMockInitiationAdapter,
  runCharterInitiation,
} from "@/src/curators/initiation";

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

  it("writes draft charter and taste profile without overwriting the fixture", async () => {
    const baseDir = await createTempDir();
    await writeCuratorCharterDraft("gpt", createMockCuratorCharterDraft("gpt"), {
      baseDir,
      now: new Date("2026-05-18T12:00:00.000Z"),
    });
    const fixturePath = getCuratorCharterPath("gpt", { baseDir });
    const fixtureBefore = await readFile(fixturePath, "utf8");
    const { charter, tasteProfile } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:02:00.000Z"),
    });

    await writeDraftCuratorCharter("gpt", charter, { baseDir });
    await writeTasteProfileDraft("gpt", tasteProfile, { baseDir });

    const fixtureAfter = await readFile(fixturePath, "utf8");
    const draftRaw = await readFile(
      getCuratorCharterDraftPath("gpt", { baseDir }),
      "utf8",
    );
    const profileRaw = await readFile(
      getTasteProfileDraftPath("gpt", { baseDir }),
      "utf8",
    );

    assert.equal(fixtureAfter, fixtureBefore);
    assert.equal(JSON.parse(draftRaw).curatorId, "gpt");
    assert.equal(JSON.parse(profileRaw).operatorReview.decision, "pending");
    assert.ok(
      JSON.parse(profileRaw).reflection.changedFields.includes(
        "selectionPrinciples",
      ),
    );
  });

  it("prefers the latest reviewed dated charter with undated fallback", async () => {
    const baseDir = await createTempDir();
    await writeCuratorCharterDraft("claude", createMockCuratorCharterDraft("claude"), {
      baseDir,
      now: new Date("2026-05-18T12:00:00.000Z"),
    });
    const { charter, tasteProfile } = await runCharterInitiation({
      curatorId: "claude",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:02:00.000Z"),
    });
    const acceptedProfile = {
      ...tasteProfile,
      operatorReview: {
        ...tasteProfile.operatorReview,
        decision: "accepted" as const,
        accepted: true,
        reviewerNotes: "Accepted for test.",
        reasonForAcceptance: "Grounded enough for a dated reviewed charter.",
        distinctivenessAssessment: "Distinct from fixtures in review.",
        groundingAssessment: "Grounded in seed-pack behavior.",
        acceptedDate: "2026-05-19T09:00:00.000Z",
      },
    };

    await writeReviewedCuratorCharter(
      "claude",
      {
        ...charter,
        galleryName: "Reviewed Claude Gallery",
      },
      acceptedProfile,
      { baseDir },
    );

    const loaded = await readCuratorCharter("claude", { baseDir });

    assert.equal(
      getReviewedCuratorCharterPath("claude", "2026-05-19", { baseDir }),
      path.join(baseDir, "data", "curators", "2026-05-19.claude.charter.json"),
    );
    assert.equal(loaded?.galleryName, "Reviewed Claude Gallery");
    assert.match(loaded?.curatorialStatement ?? "", /working memory/);
  });

  it("rejects reviewed charter writes without an accepted taste profile", async () => {
    const baseDir = await createTempDir();
    const { charter, tasteProfile } = await runCharterInitiation({
      curatorId: "gemini",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:02:00.000Z"),
    });

    await assert.rejects(
      writeReviewedCuratorCharter("gemini", charter, tasteProfile, { baseDir }),
      CuratorCharterFileError,
    );
  });

  it("rejects reviewed charter writes with another curator's taste profile", async () => {
    const baseDir = await createTempDir();
    const { charter } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:02:00.000Z"),
    });
    const { tasteProfile } = await runCharterInitiation({
      curatorId: "claude",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:03:00.000Z"),
    });
    const acceptedProfile = {
      ...tasteProfile,
      operatorReview: {
        ...tasteProfile.operatorReview,
        decision: "accepted" as const,
        accepted: true,
        reviewerNotes: "Accepted for test.",
        reasonForAcceptance: "Grounded enough for a dated reviewed charter.",
        distinctivenessAssessment: "Distinct from fixtures in review.",
        groundingAssessment: "Grounded in seed-pack behavior.",
        acceptedDate: "2026-05-19T09:00:00.000Z",
      },
    };

    await assert.rejects(
      writeReviewedCuratorCharter("gpt", charter, acceptedProfile, { baseDir }),
      (error: unknown) =>
        error instanceof CuratorCharterFileError &&
        error.message.includes("gpt") &&
        error.message.includes("claude taste profile"),
    );
  });
});

async function createTempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "latent-galleries-charters-"));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
