import { type SeedArtifact } from "@/src/domain/curator-initiation";

export const tasteSeedPackV0: SeedArtifact[] = [
  {
    id: "v0-interface-archive-001",
    title: "Archived Menu State From A Failed Community Tool",
    artifactType: "screenshot",
    description:
      "A captured interface from an abandoned coordination tool, with visible affordances and unresolved social assumptions.",
    modalityInputs: ["screenshot path", "short caption", "partial provenance"],
    axes: {
      visualStrength: "medium",
      conceptualStrength: "high",
      technicalNovelty: "medium",
      provenanceVisibility: "partial",
      finish: "rough",
      originality: "original",
      expectedDisagreementPotential: "high",
    },
  },
  {
    id: "v0-polished-empty-002",
    title: "Gloss Landing Page For A Nonexistent AI Studio",
    artifactType: "website",
    description:
      "A visually polished homepage with vague claims, smooth motion, and almost no inspectable artifact behind it.",
    modalityInputs: ["screenshot path", "URL", "metadata hidden"],
    axes: {
      visualStrength: "high",
      conceptualStrength: "low",
      technicalNovelty: "low",
      provenanceVisibility: "hidden",
      finish: "polished",
      originality: "derivative",
      expectedDisagreementPotential: "medium",
    },
  },
  {
    id: "v0-broken-net-art-003",
    title: "Partly Broken Browser Poem With Visible Error States",
    artifactType: "net-art",
    description:
      "A browser-native poem whose broken states create a legible rhythm between failure, interaction, and archival residue.",
    modalityInputs: ["screenshot path", "alt text", "URL"],
    axes: {
      visualStrength: "medium",
      conceptualStrength: "high",
      technicalNovelty: "medium",
      provenanceVisibility: "known",
      finish: "broken",
      originality: "original",
      expectedDisagreementPotential: "high",
    },
  },
  {
    id: "v0-dataset-ritual-004",
    title: "Small Dataset Of Hand-Tagged Domestic Interfaces",
    artifactType: "dataset",
    description:
      "A modest dataset that annotates ordinary smart-home control screens as cultural artifacts instead of product utilities.",
    modalityInputs: ["CSV preview", "README excerpt", "no images"],
    axes: {
      visualStrength: "low",
      conceptualStrength: "medium",
      technicalNovelty: "medium",
      provenanceVisibility: "known",
      finish: "rough",
      originality: "remix",
      expectedDisagreementPotential: "medium",
    },
  },
  {
    id: "v0-near-duplicate-a-005",
    title: "Generated Shrine Variant A",
    artifactType: "generated image",
    description:
      "A generated still of a luminous interface-shrine with strong symmetry and familiar synthetic ornament.",
    modalityInputs: ["image bytes", "caption", "metadata hidden"],
    axes: {
      visualStrength: "high",
      conceptualStrength: "medium",
      technicalNovelty: "low",
      provenanceVisibility: "hidden",
      finish: "polished",
      originality: "unclear",
      expectedDisagreementPotential: "high",
    },
  },
  {
    id: "v0-near-duplicate-b-006",
    title: "Generated Shrine Variant B",
    artifactType: "generated image",
    description:
      "A near-duplicate generated still with weaker composition but stranger interface details and less decorative certainty.",
    modalityInputs: ["image bytes", "caption", "metadata hidden"],
    axes: {
      visualStrength: "medium",
      conceptualStrength: "medium",
      technicalNovelty: "low",
      provenanceVisibility: "hidden",
      finish: "ambiguous",
      originality: "unclear",
      expectedDisagreementPotential: "high",
    },
  },
  {
    id: "v0-tool-affordance-007",
    title: "Tiny Tool For Comparing Revision Ghosts",
    artifactType: "tool",
    description:
      "A small browser tool that reveals deleted and rewritten fragments as a layered visual object.",
    modalityInputs: ["interactive description", "screenshot path", "URL"],
    axes: {
      visualStrength: "medium",
      conceptualStrength: "high",
      technicalNovelty: "high",
      provenanceVisibility: "known",
      finish: "rough",
      originality: "original",
      expectedDisagreementPotential: "medium",
    },
  },
  {
    id: "v0-emotion-bait-008",
    title: "Melancholy AI Memory Montage",
    artifactType: "video still",
    description:
      "A sentimental montage about machine memory that leans on familiar loss imagery without adding much formal pressure.",
    modalityInputs: ["still frame", "caption", "creator hidden"],
    axes: {
      visualStrength: "medium",
      conceptualStrength: "low",
      technicalNovelty: "low",
      provenanceVisibility: "hidden",
      finish: "polished",
      originality: "derivative",
      expectedDisagreementPotential: "medium",
    },
  },
];
