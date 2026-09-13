import fs from "node:fs";
import path from "node:path";

import type { ComponentContract } from "@ui-contract-guardian/contracts";

import { extractComponentContract } from "./extractor";

export function findTsxFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    throw new Error(`Components directory not found: ${directory}`);
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

  if (files.length === 0) {
    throw new Error(`No .tsx components found in: ${directory}`);
  }

  return files.map((filePath) => {
    console.log(`Analyzing component: ${filePath}`);

    try {
      return extractComponentContract(filePath);
    } catch (error) {
      throw new Error(
        `Failed to analyze component: ${filePath}\n${
          error instanceof Error ? error.message : "Unknown analyzer error"
        }`,
      );
    }
  });
}
