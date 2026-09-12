import path from "node:path";

import { scanComponents } from "./scanner";
import { checkContract } from "./checker";

const uiSrcPath = path.resolve(process.cwd(), "packages/ui/src");

const baselineDir = path.resolve(process.cwd(), "packages/contracts/baselines");

console.log("\n=== UI Contract Guardian ===\n");
console.log(`Scanning: ${uiSrcPath}\n`);

const contracts = scanComponents(uiSrcPath);

if (contracts.length === 0) {
  console.log("No components found.");
  process.exit(0);
}

let hasBreakingChanges = false;
let hasChanges = false;

for (const contract of contracts) {
  const componentName = contract.name.replace(/Props$/, "");

  const componentPath = contract.filePath;

  const baselinePath = path.join(baselineDir, `${componentName}.json`);

  console.log(`Checking: ${componentPath}`);
  console.log(`Baseline: ${baselinePath}\n`);

  try {
    const result = checkContract(componentPath, baselinePath);

    console.log(`Component: ${result.current.name}\n`);

    if (result.changes.length === 0) {
      console.log("✓ No contract changes detected.\n");
      continue;
    }

    hasChanges = true;

    for (const change of result.changes) {
      console.log(
        `[${change.severity}] ` +
          `${change.kind} | ` +
          `${change.propName} | ` +
          `breaking=${change.breaking}`,
      );

      console.log(`  ${change.message}\n`);
    }

    if (result.hasBreakingChanges) {
      hasBreakingChanges = true;
      console.log("✗ Breaking contract changes detected.\n");
    } else {
      console.log("✓ No breaking contract changes detected.\n");
    }
  } catch (error) {
    console.error(
      `Failed to check ${componentName}:`,
      error instanceof Error ? error.message : "Unknown error",
    );

    hasBreakingChanges = true;
  }
}

console.log("=== Summary ===");

if (hasBreakingChanges) {
  console.log("✗ Breaking contract changes detected.");
  process.exit(1);
}

if (hasChanges) {
  console.log("✓ Contract changes detected, but none are breaking.");
  process.exit(0);
}

console.log("✓ No contract changes detected.");
process.exit(0);
