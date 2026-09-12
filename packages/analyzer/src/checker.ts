import fs from "node:fs";

import type { ComponentContract } from "@ui-contract-guardian/contracts";

import { extractComponentContract } from "./extractor";
import { diffContracts } from "../../diff/src/diff";

export interface ContractCheckResult {
  baseline: ComponentContract;
  current: ComponentContract;
  changes: ReturnType<typeof diffContracts>;
  hasBreakingChanges: boolean;
}

export function checkContract(
  componentPath: string,
  baselinePath: string,
): ContractCheckResult {
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component file not found: ${componentPath}`);
  }

  if (!fs.existsSync(baselinePath)) {
    throw new Error(`Baseline file not found: ${baselinePath}`);
  }

  // Extract the current contract directly from source code.
  const current = extractComponentContract(componentPath);

  // Read the previously approved contract.
  const baseline = JSON.parse(
    fs.readFileSync(baselinePath, "utf-8"),
  ) as ComponentContract;

  // Compare approved contract against current source.
  const changes = diffContracts(baseline, current);

  const hasBreakingChanges = changes.some((change) => change.breaking);

  return {
    baseline,
    current,
    changes,
    hasBreakingChanges,
  };
}
