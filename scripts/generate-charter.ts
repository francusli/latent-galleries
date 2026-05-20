import {
  CURATOR_IDS,
  type CuratorId,
  isCuratorId,
} from "@/src/domain/curator-charter";
import { createMockCuratorCharterDraft } from "@/src/curators/mock-charters";
import {
  createMockInitiationAdapter,
  createUnavailableRealInitiationAdapter,
  type InitiationProvider,
  runCharterInitiation,
} from "@/src/curators/initiation";
import {
  getCuratorCharterDraftPath,
  getCuratorCharterPath,
  getTasteProfileDraftPath,
  writeDraftCuratorCharter,
  writeCuratorCharterDraft,
  writeTasteProfileDraft,
} from "@/src/storage/curator-charter-files";

type ParsedArgs =
  | {
      mode: "all";
      provider: InitiationProvider;
      draft: boolean;
      tasteProfile: boolean;
    }
  | {
      mode: "one";
      curatorId: CuratorId;
      provider: InitiationProvider;
      draft: boolean;
      tasteProfile: boolean;
    };

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const curatorIds = args.mode === "all" ? CURATOR_IDS : [args.curatorId];
  const fileOptions = {
    baseDir: process.env.LATENT_GALLERIES_CHARTER_BASE_DIR,
  };

  for (const curatorId of curatorIds) {
    if (args.draft || args.tasteProfile) {
      const adapter =
        args.provider === "mock"
          ? createMockInitiationAdapter()
          : createUnavailableRealInitiationAdapter();
      const { charter, tasteProfile } = await runCharterInitiation({
        curatorId,
        adapter,
      });

      if (args.draft) {
        await writeDraftCuratorCharter(curatorId, charter, fileOptions);
        console.log(
          `Wrote ${curatorId} draft charter to ${getCuratorCharterDraftPath(curatorId, fileOptions)}`,
        );
      }

      if (args.tasteProfile) {
        await writeTasteProfileDraft(curatorId, tasteProfile, fileOptions);
        console.log(
          `Wrote ${curatorId} taste profile to ${getTasteProfileDraftPath(curatorId, fileOptions)}`,
        );
      }

      continue;
    }

    if (args.provider !== "mock") {
      fail("Use --draft when running --provider real so fixture charters are not overwritten.");
    }

    const charter = await writeCuratorCharterDraft(
      curatorId,
      createMockCuratorCharterDraft(curatorId),
      fileOptions,
    );
    const filePath = getCuratorCharterPath(curatorId, fileOptions);
    console.log(`Wrote ${charter.curatorId} charter to ${filePath}`);
  }
}

function parseArgs(args: string[]): ParsedArgs {
  const hasAll = args.includes("--all");
  const draft = args.includes("--draft");
  const tasteProfile = args.includes("--taste-profile");
  const curatorFlagIndex = args.indexOf("--curator");
  const providerFlagIndex = args.indexOf("--provider");
  const curatorValue =
    curatorFlagIndex >= 0 ? args[curatorFlagIndex + 1] : undefined;
  const providerValue =
    providerFlagIndex >= 0 ? args[providerFlagIndex + 1] : undefined;
  const provider = parseProvider(providerValue);

  if (hasAll && curatorValue !== undefined) {
    fail("Use either --all or --curator <id>, not both.");
  }

  if (hasAll) {
    return { mode: "all", provider, draft, tasteProfile };
  }

  if (curatorValue !== undefined) {
    if (!isCuratorId(curatorValue)) {
      fail(`Unknown curator "${curatorValue}". Supported curators: ${CURATOR_IDS.join(", ")}.`);
    }

    return { mode: "one", curatorId: curatorValue, provider, draft, tasteProfile };
  }

  fail(
    `Usage: npm run generate-charter -- --curator <${CURATOR_IDS.join("|")}> or --all [--provider mock|real] [--draft] [--taste-profile]`,
  );
}

function parseProvider(value: string | undefined): InitiationProvider {
  if (value === undefined) {
    return "mock";
  }

  if (value === "mock" || value === "real") {
    return value;
  }

  fail("Provider must be mock or real.");
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
