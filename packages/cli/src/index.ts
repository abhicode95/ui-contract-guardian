import fs from "node:fs";
import path from "node:path";

import type { GuardianConfig } from "@ui-contract-guardian/analyzer";
import { runCheck } from "@ui-contract-guardian/analyzer";

import { generateMarkdownReport } from "./reporter";

const command = process.argv[2];

const configPath = path.resolve(
  process.cwd(),
  "ui-contract-guardian.config.json",
);

const reportPath = path.resolve(
  process.cwd(),
  "ui-contract-guardian-report.md",
);

const jsonReportPath = path.resolve(
  process.cwd(),
  "ui-contract-guardian-report.json",
);

function printUsage() {
  console.error(`
UI Contract Guardian

Usage:
  guardian check
  guardian report
  guardian json
`);
}

if (command !== "check" && command !== "report" && command !== "json") {
  printUsage();
  process.exit(1);
}

console.log("\n=== UI Contract Guardian ===\n");

if (!fs.existsSync(configPath)) {
  console.error(`✗ Configuration file not found: ${configPath}`);

  process.exit(1);
}

const config = JSON.parse(
  fs.readFileSync(configPath, "utf-8"),
) as GuardianConfig;

const uiPath = path.resolve(process.cwd(), config.componentsDir);

const contractsPath = path.resolve(process.cwd(), config.contractsDir);

console.log(`Config: ${configPath}`);
console.log(`Scanning: ${uiPath}`);
console.log(`Baselines: ${contractsPath}`);

console.log(
  `Policy: HIGH=${config.policy.HIGH}, ` +
    `MEDIUM=${config.policy.MEDIUM}, ` +
    `LOW=${config.policy.LOW}\n`,
);

try {
  const result = runCheck(uiPath, contractsPath, config.policy);

  // Print detailed impact analysis.
  for (const componentResult of result.results) {
    if (componentResult.impacts.length === 0) {
      continue;
    }

    console.log(
      `\n=== Impact Analysis: ${componentResult.component.name} ===\n`,
    );

    for (const impact of componentResult.impacts) {
      console.log(`[${impact.risk}] ${impact.changeKind}`);

      console.log(`  Property: ${impact.property}`);

      console.log(`  Decision: ${impact.mergeDecision}`);

      console.log(`  Blast radius: ${impact.blastRadius} consumer(s)`);

      if (impact.removedValue) {
        console.log(`  Removed value: ${impact.removedValue}`);
      }

      if (impact.addedValue) {
        console.log(`  Added value: ${impact.addedValue}`);
      }

      if (impact.consumers.length > 0) {
        console.log("\n  Affected consumers:");

        for (const consumer of impact.consumers) {
          const relativePath = path.relative(process.cwd(), consumer.filePath);

          console.log(`    - ${relativePath}:${consumer.line}`);
        }
      } else {
        console.log("\n  Affected consumers: None detected");
      }

      console.log(`\n  Impact: ${impact.impact}`);

      console.log(`  Recommendation: ${impact.recommendation}`);

      console.log("");
    }
  }

  console.log("\n=== Summary ===");

  console.log(`Components scanned: ${result.componentsScanned}`);

  console.log(`Components with changes: ${result.componentsWithChanges}`);

  console.log(`Breaking components: ${result.breakingComponents}`);

  if (command === "report") {
    const markdown = generateMarkdownReport(result);

    fs.writeFileSync(reportPath, markdown, "utf-8");

    console.log(`\n✓ Report generated: ${reportPath}`);
  }

  if (command === "json") {
    const json = JSON.stringify(result, null, 2);

    fs.writeFileSync(jsonReportPath, json, "utf-8");

    console.log(`\n✓ JSON report generated: ${jsonReportPath}`);
  }

  if (result.shouldBlock) {
    console.log("\n✗ UI Contract Guardian blocked the change.");

    process.exit(1);
  }

  if (result.hasBreakingChanges) {
    console.log(
      "\n⚠ Breaking changes detected, but policy allows the merge to continue.",
    );

    process.exit(0);
  }

  console.log("\n✓ No breaking contract changes detected.");

  process.exit(0);
} catch (error) {
  console.error("\n✗ UI Contract Guardian failed.");

  console.error(error instanceof Error ? error.message : "Unknown error");

  process.exit(1);
}
