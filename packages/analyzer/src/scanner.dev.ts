import path from "node:path";

import { scanComponents } from "./scanner";
import { generateBaseline } from "./baseline";

const uiSrcPath = path.resolve(process.cwd(), "packages/ui/src");

const baselineDir = path.resolve(process.cwd(), "packages/contracts/baselines");

console.log("=== UI Contract Guardian Scanner ===");
console.log(`\nScanning: ${uiSrcPath}\n`);

const contracts = scanComponents(uiSrcPath);

for (const contract of contracts) {
  console.log(`Component: ${contract.name}`);
  console.log(`File: ${contract.filePath}`);

  const componentName = contract.name.replace(/Props$/, "");

  const outputPath = path.join(baselineDir, `${componentName}.json`);

  generateBaseline(contract.filePath, outputPath);

  console.log("");
}

console.log(`Total contracts: ${contracts.length}`);
