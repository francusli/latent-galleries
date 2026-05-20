import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createMockInitiationAdapter,
  runCharterInitiation,
} from "@/src/curators/initiation";
import { createMockCuratorCharterDraft } from "@/src/curators/mock-charters";

describe("runCharterInitiation", () => {
  it("returns the reflected charter as the draft candidate", async () => {
    const { charter, tasteProfile } = await runCharterInitiation({
      curatorId: "gpt",
      adapter: createMockInitiationAdapter(),
      now: new Date("2026-05-18T12:00:00.000Z"),
    });
    const initialDraft = createMockCuratorCharterDraft("gpt");

    assert.notEqual(charter.curatorialStatement, initialDraft.curatorialStatement);
    assert.equal(
      tasteProfile.reflection.initialCharterSnapshot.curatorialStatement,
      initialDraft.curatorialStatement,
    );
    assert.ok(tasteProfile.reflection.changedFields.includes("curatorialStatement"));
    assert.ok(tasteProfile.reflection.changedFields.includes("selectionPrinciples"));
    assert.ok(tasteProfile.reflection.changedFields.includes("criticalVoice"));
    assert.match(
      tasteProfile.reflection.revisionSummary,
      /observed selections and refusals/,
    );
  });
});
