import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  type CuratorCharter,
  renderCuratorCharterForPrompt,
  validateCuratorCharter,
} from "@/src/domain/curator-charter";

const validCharter: CuratorCharter = {
  curatorId: "gpt",
  galleryName: "The Pattern Conservatory",
  curatorialApproach: "I notice systems becoming visible.",
  curatorialStatement: "This gallery collects works that reveal hidden order.",
  preferredMedia: ["interactive essays"],
  guidingQuestions: ["What pattern is visible here?"],
  selectionPrinciples: ["Reveals structure"],
  exclusions: ["Novelty without a durable idea"],
  researchOrientation: "technical",
  criticalVoice: "Lucid and warm.",
  createdAt: "2026-05-18T12:00:00.000Z",
  updatedAt: "2026-05-18T12:00:00.000Z",
  version: "1.0.0",
};

describe("validateCuratorCharter", () => {
  it("accepts a valid curator charter", () => {
    const result = validateCuratorCharter(validCharter);

    assert.equal(result.ok, true);
  });

  it("reports missing fields", () => {
    const result = validateCuratorCharter({});

    assert.equal(result.ok, false);
    assert.match(
      result.errors.map((error) => error.field).join(","),
      /curatorId/,
    );
    assert.match(
      result.errors.map((error) => error.field).join(","),
      /galleryName/,
    );
  });

  it("rejects unknown curator IDs", () => {
    const result = validateCuratorCharter({
      ...validCharter,
      curatorId: "llama",
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors.map((error) => error.field), ["curatorId"]);
  });

  it("rejects unknown research orientations", () => {
    const result = validateCuratorCharter({
      ...validCharter,
      researchOrientation: "cosmic",
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors.map((error) => error.field), [
      "researchOrientation",
    ]);
  });

  it("rejects empty strings", () => {
    const result = validateCuratorCharter({
      ...validCharter,
      galleryName: " ",
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors.map((error) => error.field), ["galleryName"]);
  });

  it("rejects empty arrays", () => {
    const result = validateCuratorCharter({
      ...validCharter,
      selectionPrinciples: [],
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors.map((error) => error.field), [
      "selectionPrinciples",
    ]);
  });
});

describe("renderCuratorCharterForPrompt", () => {
  it("renders all required prompt sections", () => {
    const rendered = renderCuratorCharterForPrompt(validCharter);

    assert.match(rendered, /Current curator charter:/);
    assert.match(rendered, /Gallery name: The Pattern Conservatory/);
    assert.match(rendered, /Curatorial approach: I notice systems becoming visible\./);
    assert.match(
      rendered,
      /Curatorial statement: This gallery collects works that reveal hidden order\./,
    );
    assert.match(rendered, /Preferred media:\n- interactive essays/);
    assert.match(rendered, /Guiding questions:\n- What pattern is visible here\?/);
    assert.match(rendered, /Selection principles:\n- Reveals structure/);
    assert.match(rendered, /Exclusions:\n- Novelty without a durable idea/);
    assert.match(rendered, /Research orientation: technical/);
    assert.match(rendered, /Critical voice: Lucid and warm\./);
  });
});
