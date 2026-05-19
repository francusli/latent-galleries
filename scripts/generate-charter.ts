import {
  CURATOR_IDS,
  type CuratorId,
  isCuratorId,
} from "@/src/domain/curator-charter";
import { createMockCuratorCharterDraft } from "@/src/curators/mock-charters";
import {
  getCuratorCharterPath,
  writeCuratorCharterDraft,
} from "@/src/storage/curator-charter-files";

type ParsedArgs =
  | { mode: "all" }
  | { mode: "one"; curatorId: CuratorId };

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const curatorIds = args.mode === "all" ? CURATOR_IDS : [args.curatorId];
  const fileOptions = {
    baseDir: process.env.LATENT_GALLERIES_CHARTER_BASE_DIR,
  };

  for (const curatorId of curatorIds) {
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
  const curatorFlagIndex = args.indexOf("--curator");
  const curatorValue =
    curatorFlagIndex >= 0 ? args[curatorFlagIndex + 1] : undefined;

  if (hasAll && curatorValue !== undefined) {
    fail("Use either --all or --curator <id>, not both.");
  }

  if (hasAll) {
    return { mode: "all" };
  }

  if (curatorValue !== undefined) {
    if (!isCuratorId(curatorValue)) {
      fail(`Unknown curator "${curatorValue}". Supported curators: ${CURATOR_IDS.join(", ")}.`);
    }

    return { mode: "one", curatorId: curatorValue };
  }

  fail(`Usage: npm run generate-charter -- --curator <${CURATOR_IDS.join("|")}> or --all`);
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
