import fs from "node:fs";
import path from "node:path";

export interface ConsumerReference {
  filePath: string;
  line: number;
  propName: string;
  value?: string;
}

export interface ConsumerSearchResult {
  component: string;
  property: string;
  value?: string;
  consumers: ConsumerReference[];
}

function findTsxFiles(directory: string): string[] {
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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findConsumers(
  sourceDirectory: string,
  component: string,
  propName: string,
  value?: string,
): ConsumerSearchResult {
  const consumers: ConsumerReference[] = [];

  const files = findTsxFiles(sourceDirectory);

  const componentPattern = escapeRegex(component);

  const propPattern = escapeRegex(propName);

  const valuePattern = value ? escapeRegex(value) : null;

  /*
   * Examples detected:
   *
   * <Button variant="danger" />
   * <Button variant={'danger'} />
   * <Button variant={someValue} />
   *
   * This is intentionally a lightweight first-pass
   * consumer scanner. Later we can replace this with
   * a full TypeScript AST reference resolver.
   */

  const pattern = valuePattern
    ? new RegExp(
        `<${componentPattern}\\b[^>]*\\b${propPattern}\\s*=\\s*(?:"${valuePattern}"|'${valuePattern}'|\\{["']${valuePattern}["']\\})`,
        "g",
      )
    : new RegExp(`<${componentPattern}\\b[^>]*\\b${propPattern}\\s*=`, "g");

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");

    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (!pattern.test(line)) {
        pattern.lastIndex = 0;
        return;
      }

      pattern.lastIndex = 0;

      consumers.push({
        filePath,
        line: index + 1,
        propName,
        ...(value ? { value } : {}),
      });
    });
  }

  return {
    component,
    property: propName,
    ...(value ? { value } : {}),
    consumers,
  };
}
