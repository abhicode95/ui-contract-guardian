import { mkdtempSync, rmSync, writeFileSync } from "node:fs";

import { tmpdir } from "node:os";

import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { extractComponentContract } from "@ui-contract-guardian/analyzer";

describe("extractComponentContract", () => {
  it("extracts primitive property types", () => {
    const directory = mkdtempSync(join(tmpdir(), "guardian-"));

    const filePath = join(directory, "Input.tsx");

    writeFileSync(
      filePath,
      `
        export interface InputProps {
          placeholder?: string;
          disabled?: boolean;
          count?: number;
        }

        export function Input(
          props: InputProps,
        ) {
          return null;
        }
      `,
    );

    try {
      const contract = extractComponentContract(filePath);

      expect(contract.name).toBe("InputProps");

      expect(contract.props).toEqual(
        expect.arrayContaining([
          {
            name: "placeholder",
            required: false,
            type: "string",
          },
          {
            name: "disabled",
            required: false,
            type: "boolean",
          },
          {
            name: "count",
            required: false,
            type: "number",
          },
        ]),
      );
    } finally {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  it("extracts union values from type aliases", () => {
    const directory = mkdtempSync(join(tmpdir(), "guardian-"));

    const filePath = join(directory, "Button.tsx");

    writeFileSync(
      filePath,
      `
        export type ButtonVariant =
          | "primary"
          | "secondary"
          | "danger";

        export interface ButtonProps {
          variant?: ButtonVariant;
        }

        export function Button(
          props: ButtonProps,
        ) {
          return null;
        }
      `,
    );

    try {
      const contract = extractComponentContract(filePath);

      expect(contract.props).toEqual([
        {
          name: "variant",
          required: false,
          type: "union",
          values: ["primary", "secondary", "danger"],
        },
      ]);
    } finally {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  it("fails on invalid TypeScript syntax", () => {
    const directory = mkdtempSync(join(tmpdir(), "guardian-"));

    const filePath = join(directory, "Broken.tsx");

    writeFileSync(
      filePath,
      `
        export interface BrokenProps {
          !!!invalid
        }
      `,
    );

    try {
      expect(() => extractComponentContract(filePath)).toThrow(
        /TypeScript syntax errors found/,
      );
    } finally {
      rmSync(directory, {
        recursive: true,
        force: true,
      });
    }
  });
});
