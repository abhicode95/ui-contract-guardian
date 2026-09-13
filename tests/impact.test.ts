import { describe, expect, it } from "vitest";

import {
  assessContractImpact,
  defaultPolicy,
} from "@ui-contract-guardian/analyzer";

import type { ContractChange } from "@ui-contract-guardian/diff";

function change(overrides: Partial<ContractChange>): ContractChange {
  return {
    kind: "PROP_ADDED",
    severity: "LOW",
    propName: "loading",
    message: "Prop added.",
    breaking: false,
    ...overrides,
  };
}

describe("assessContractImpact", () => {
  it("blocks removed props", () => {
    const result = assessContractImpact(
      "Button",
      change({
        kind: "PROP_REMOVED",
        severity: "HIGH",
        propName: "loading",
        breaking: true,
      }),
      [],
      defaultPolicy,
    );

    expect(result.risk).toBe("HIGH");

    expect(result.mergeDecision).toBe("BLOCK");

    expect(result.recommendation).toContain("migrate");
  });

  it("blocks requiredness changes", () => {
    const result = assessContractImpact(
      "Button",
      change({
        kind: "PROP_BECAME_REQUIRED",
        severity: "HIGH",
        propName: "variant",
        breaking: true,
      }),
      [],
      defaultPolicy,
    );

    expect(result.risk).toBe("HIGH");

    expect(result.mergeDecision).toBe("BLOCK");
  });

  it("blocks type changes", () => {
    const result = assessContractImpact(
      "Input",
      change({
        kind: "TYPE_CHANGED",
        severity: "HIGH",
        propName: "count",
        breaking: true,
        details: {
          oldType: "string",
          newType: "number",
        },
      }),
      [],
      defaultPolicy,
    );

    expect(result.risk).toBe("HIGH");

    expect(result.mergeDecision).toBe("BLOCK");
  });

  it("blocks removed union values", () => {
    const result = assessContractImpact(
      "Button",
      change({
        kind: "UNION_VALUE_REMOVED",
        severity: "HIGH",
        propName: "variant",
        breaking: true,
        details: {
          removedValue: "danger",
        },
      }),
      [],
      defaultPolicy,
    );

    expect(result.removedValue).toBe("danger");

    expect(result.risk).toBe("HIGH");

    expect(result.mergeDecision).toBe("BLOCK");
  });

  it("allows added props", () => {
    const result = assessContractImpact(
      "Button",
      change({
        kind: "PROP_ADDED",
        severity: "LOW",
        propName: "icon",
        breaking: false,
      }),
      [],
      defaultPolicy,
    );

    expect(result.risk).toBe("LOW");

    expect(result.mergeDecision).toBe("ALLOW");
  });

  it("allows added union values", () => {
    const result = assessContractImpact(
      "Button",
      change({
        kind: "UNION_VALUE_ADDED",
        severity: "LOW",
        propName: "variant",
        breaking: false,
        details: {
          addedValue: "success",
        },
      }),
      [],
      defaultPolicy,
    );

    expect(result.addedValue).toBe("success");

    expect(result.mergeDecision).toBe("ALLOW");
  });
});
