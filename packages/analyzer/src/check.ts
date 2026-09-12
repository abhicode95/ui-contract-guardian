import path from "node:path";

import { checkContract } from "./checker";

const componentPath = path.resolve(
  process.cwd(),
  "packages/ui/src/Button/Button.tsx",
);

const baselinePath = path.resolve(
  process.cwd(),
  "packages/contracts/baselines/Button.json",
);

console.log("\n=== UI Contract Guardian ===\n");

console.log(`Checking: ${componentPath}`);
console.log(`Baseline: ${baselinePath}\n`);

try {
  const result = checkContract(componentPath, baselinePath);

  console.log(`Component: ${result.current.name}\n`);

  if (result.changes.length === 0) {
    console.log("✓ No contract changes detected.");
    process.exit(0);
  }

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
    console.log("✗ Breaking contract changes detected.");
    process.exit(1);
  }

  console.log("✓ No breaking contract changes detected.");
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unknown error");

  process.exit(1);
}
