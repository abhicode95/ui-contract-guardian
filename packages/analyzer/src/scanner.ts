import fs from "node:fs";
import path from "node:path";

import type { ComponentContract } from "@ui-contract-guardian/contracts";

import { extractComponentContract } from "./extractor";

export function findTsxFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files: string[] = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

export function scanComponents(directory: string): ComponentContract[] {
  const files = findTsxFiles(directory);

  return files
    .map((filePath) => {
      try {
        return extractComponentContract(filePath);
      } catch (error) {
        console.error(`Failed to analyze ${filePath}`, error);

        return null;
      }
    })
    .filter((contract): contract is ComponentContract => contract !== null);
}
