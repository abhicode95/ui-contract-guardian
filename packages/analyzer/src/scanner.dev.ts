import path from "node:path";

import { findTsxFiles } from "./scanner";

const uiPath = path.resolve(process.cwd(), "packages/ui/src");

console.log("\n=== UI Contract Guardian Scanner ===\n");

console.log(`Scanning: ${uiPath}\n`);

const files = findTsxFiles(uiPath);

if (files.length === 0) {
  console.log("No TSX files found.");
  process.exit(0);
}

for (const file of files) {
  console.log(`Found: ${file}`);
}

console.log(`\nTotal components/files: ${files.length}`);
