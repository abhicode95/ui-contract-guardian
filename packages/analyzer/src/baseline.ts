import fs from "node:fs";
import path from "node:path";

import { extractComponentContract } from "./extractor";

export function generateBaseline(componentPath: string, outputPath: string) {
  console.log(`Analyzing: ${componentPath}`);

  const contract = extractComponentContract(componentPath);

  fs.mkdirSync(path.dirname(outputPath), {
    recursive: true,
  });

  fs.writeFileSync(outputPath, JSON.stringify(contract, null, 2), "utf-8");

  console.log(`Baseline written to: ${outputPath}`);

  return contract;
}
