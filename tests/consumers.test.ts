import { mkdtempSync, rmSync, writeFileSync } from "node:fs";

import { tmpdir } from "node:os";

import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { findConsumers } from "@ui-contract-guardian/analyzer";

describe("findConsumers", () => {
  it("finds consumers using a specific union value", () => {
    const directory = mkdtempSync(join(tmpdir(), "guardian-"));

    writeFileSync(
      join(directory, "Checkout.tsx"),
      `
        import { Button } from "./Button";

        export function Checkout() {
          return (
            <Button variant="danger">
              Cancel
            </Button>
          );
        }
      `,
    );

    writeFileSync(
      join(directory, "Admin.tsx"),
      `
        import { Button } from "./Button";

        export function Admin() {
          return (
            <Button variant="primary">
              Continue
            </Button>
          );
        }
      `,
    );

    try {
      const result = findConsumers(directory, "Button", "variant", "danger");

      expect(result.consumers).toHaveLength(1);

      expect(result.consumers[0].filePath).toContain("Checkout.tsx");

      expect(result.consumers[0].propName).toBe("variant");

      expect(result.consumers[0].value).toBe("danger");
    } finally {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  it("finds all consumers using a property", () => {
    const directory = mkdtempSync(join(tmpdir(), "guardian-"));

    writeFileSync(
      join(directory, "A.tsx"),
      `
        <Button variant="primary" />
      `,
    );

    writeFileSync(
      join(directory, "B.tsx"),
      `
        <Button variant="secondary" />
      `,
    );

    try {
      const result = findConsumers(directory, "Button", "variant");

      expect(result.consumers).toHaveLength(2);
    } finally {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  it("returns an empty result when no consumers exist", () => {
    const directory = mkdtempSync(join(tmpdir(), "guardian-"));

    writeFileSync(
      join(directory, "App.tsx"),
      `
        <Button variant="primary" />
      `,
    );

    try {
      const result = findConsumers(directory, "Button", "variant", "danger");

      expect(result.consumers).toHaveLength(0);
    } finally {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    }
  });
});
