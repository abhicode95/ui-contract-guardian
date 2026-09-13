import fs from "node:fs";
import path from "node:path";

import type { ComponentContract } from "@ui-contract-guardian/contracts";

import { diffContracts, type ContractChange } from "@ui-contract-guardian/diff";

import { scanComponents } from "./scanner";

export type ComponentCheckResult = {
  component: ComponentContract;
  changes: ContractChange[];
  hasBreakingChanges: boolean;
  baselinePath: string;
};

export type CheckResult = {
  componentsScanned: number;
  componentsWithChanges: number;
  breakingComponents: number;
  hasBreakingChanges: boolean;
  results: ComponentCheckResult[];
};

export function runCheck(
  componentsDir: string,
  contractsDir: string,
): CheckResult {
  const components = scanComponents(componentsDir);

  let componentsWithChanges = 0;
  let breakingComponents = 0;

  const results: ComponentCheckResult[] = [];

  for (const current of components) {
    const componentName = current.name.replace(/Props$/, "");

    const baselinePath = path.join(contractsDir, `${componentName}.json`);

    console.log(`Checking: ${current.filePath}`);

    console.log(`Baseline: ${baselinePath}\n`);

    if (!fs.existsSync(baselinePath)) {
      console.log(`⚠ No baseline found for ${current.name}.\n`);

      continue;
    }

    const baseline = JSON.parse(
      fs.readFileSync(baselinePath, "utf-8"),
    ) as ComponentContract;

    const changes = diffContracts(baseline, current);

    console.log(`Component: ${current.name}\n`);

    if (changes.length === 0) {
      console.log("✓ No contract changes detected.\n");
    } else {
      componentsWithChanges++;

      let hasBreaking = false;

      for (const change of changes) {
        console.log(
          `[${change.severity}] ` +
            `${change.kind} | ` +
            `${change.propName} | ` +
            `breaking=${change.breaking}`,
        );

        console.log(`  ${change.message}\n`);

        if (change.breaking) {
          hasBreaking = true;
        }
      }

      if (hasBreaking) {
        breakingComponents++;

        console.log("✗ Breaking contract changes detected.\n");
      } else {
        console.log("✓ No breaking contract changes detected.\n");
      }
    }

    results.push({
      component: current,
      changes,
      hasBreakingChanges: changes.some((change) => change.breaking),
      baselinePath,
    });
  }

  return {
    componentsScanned: components.length,
    componentsWithChanges,
    breakingComponents,
    hasBreakingChanges: breakingComponents > 0,
    results,
  };
}
