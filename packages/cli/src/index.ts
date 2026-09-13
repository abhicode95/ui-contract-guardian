import fs from "node:fs";
import path from "node:path";

import { runCheck } from "@ui-contract-guardian/analyzer";

import { generateMarkdownReport } from "./reporter";

const command = process.argv[2];

const uiPath = path.resolve(process.cwd(), "packages/ui/src");

const contractsPath = path.resolve(
  process.cwd(),
  "packages/contracts/baselines",
);

const reportPath = path.resolve(
  process.cwd(),
  "ui-contract-guardian-report.md",
);

function printUsage() {
  console.error(`
UI Contract Guardian

Usage:
  guardian check
  guardian report
`);
}

if (command !== "check" && command !== "report") {
  printUsage();
  process.exit(1);
}

console.log("\n=== UI Contract Guardian ===\n");

console.log(`Scanning: ${uiPath}`);
console.log(`Baselines: ${contractsPath}\n`);

try {
  const result = runCheck(uiPath, contractsPath);

  console.log("\n=== Summary ===");

  console.log(`Components scanned: ${result.componentsScanned}`);

  console.log(`Components with changes: ${result.componentsWithChanges}`);

  console.log(`Breaking components: ${result.breakingComponents}`);

  if (command === "report") {
    const markdown = generateMarkdownReport(result);

    fs.writeFileSync(reportPath, markdown, "utf-8");

    console.log(`\n✓ Report generated: ${reportPath}`);
  }

  if (result.hasBreakingChanges) {
    console.log("\n✗ Breaking contract changes detected.");

    process.exit(1);
  }

  console.log("\n✓ No breaking contract changes detected.");

  process.exit(0);
} catch (error) {
  console.error("\n✗ UI Contract Guardian failed.");

  console.error(error instanceof Error ? error.message : "Unknown error");

  process.exit(1);
}
