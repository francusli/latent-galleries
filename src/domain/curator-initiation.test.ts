import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createMockInitiationAdapter, runCharterInitiation } from "@/src/curators/initiation";
import {
  renderCharterReflectionPrompt,
  validateTasteProfile,
} from "@/src/domain/curator-initiation";

describe("validateTasteProfile", () => {
  it("accepts a taste profile with reflection evidence", async () => {
    const { tasteProfile } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:00:00.000Z"),
    });

    const result = validateTasteProfile(tasteProfile);

    assert.equal(result.ok, true);
    assert.equal(tasteProfile.reflection.initialCharterSnapshot.curatorId, "gpt");
    assert.ok(tasteProfile.reflection.changedFields.includes("curatorialStatement"));
  });

  it("rejects a taste profile without reflection evidence", async () => {
    const { tasteProfile } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:00:00.000Z"),
    });
    const withoutReflection: Record<string, unknown> = { ...tasteProfile };
    delete withoutReflection.reflection;

    const result = validateTasteProfile(withoutReflection);

    assert.equal(result.ok, false);
    assert.match(result.errors.join("; "), /reflection must be an object/);
  });

  it("rejects malformed reflection revision metadata", async () => {
    const { tasteProfile } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:00:00.000Z"),
    });

    const result = validateTasteProfile({
      ...tasteProfile,
      reflection: {
        ...tasteProfile.reflection,
        changedFields: ["createdAt"],
      },
    });

    assert.equal(result.ok, false);
    assert.match(result.errors.join("; "), /reflection.changedFields/);
  });

  it("rejects a reflection snapshot from another curator", async () => {
    const { tasteProfile } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:00:00.000Z"),
    });

    const result = validateTasteProfile({
      ...tasteProfile,
      reflection: {
        ...tasteProfile.reflection,
        initialCharterSnapshot: {
          ...tasteProfile.reflection.initialCharterSnapshot,
          curatorId: "claude",
        },
      },
    });

    assert.equal(result.ok, false);
    assert.match(result.errors.join("; "), /must match taste profile curatorId/);
  });
});

describe("renderCharterReflectionPrompt", () => {
  it("renders the charter and observed behavior for a strict JSON revision", async () => {
    const { charter, tasteProfile } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:00:00.000Z"),
    });

    const rendered = renderCharterReflectionPrompt({
      curatorId: "gpt",
      initialCharter: tasteProfile.reflection.initialCharterSnapshot,
      behavior: tasteProfile.behavior,
    });

    assert.match(rendered, /Return only strict JSON matching CuratorCharter/);
    assert.match(rendered, /Initial charter JSON:/);
    assert.match(rendered, /Observed taste behavior JSON:/);
    assert.match(rendered, /v0-tool-affordance-007/);
    assert.doesNotMatch(
      tasteProfile.reflection.initialCharterSnapshot.curatorialStatement,
      /working memory/,
    );
    assert.match(charter.curatorialStatement, /working memory/);
  });
});
