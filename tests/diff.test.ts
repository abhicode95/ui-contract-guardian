import { describe, expect, it } from "vitest";

import type {
  ComponentContract,
  PropContract,
} from "@ui-contract-guardian/contracts";

import { diffContracts } from "@ui-contract-guardian/diff";

function createContract(props: PropContract[]): ComponentContract {
  return {
    name: "ButtonProps",
    filePath: "Button.tsx",
    props,
  };
}

function prop(name: string, options: Partial<PropContract> = {}): PropContract {
  return {
    name,
    required: false,
    type: "string",
    ...options,
  };
}

describe("diffContracts", () => {
  it("detects a property being added", () => {
    const oldContract = createContract([prop("label")]);

    const newContract = createContract([prop("label"), prop("placeholder")]);

    const changes = diffContracts(oldContract, newContract);

    expect(changes).toEqual([
      expect.objectContaining({
        kind: "PROP_ADDED",
        severity: "LOW",
        propName: "placeholder",
        breaking: false,
      }),
    ]);
  });

  it("detects a property being removed", () => {
    const oldContract = createContract([prop("label"), prop("placeholder")]);

    const newContract = createContract([prop("label")]);

    const changes = diffContracts(oldContract, newContract);

    expect(changes).toEqual([
      expect.objectContaining({
        kind: "PROP_REMOVED",
        severity: "HIGH",
        propName: "placeholder",
        breaking: true,
      }),
    ]);
  });

  it("detects an optional property becoming required", () => {
    const oldContract = createContract([
      prop("label", {
        required: false,
      }),
    ]);

    const newContract = createContract([
      prop("label", {
        required: true,
      }),
    ]);

    const changes = diffContracts(oldContract, newContract);

    expect(changes).toEqual([
      expect.objectContaining({
        kind: "PROP_BECAME_REQUIRED",
        severity: "HIGH",
        propName: "label",
        breaking: true,
      }),
    ]);
  });

  it("detects a required property becoming optional", () => {
    const oldContract = createContract([
      prop("label", {
        required: true,
      }),
    ]);

    const newContract = createContract([
      prop("label", {
        required: false,
      }),
    ]);

    const changes = diffContracts(oldContract, newContract);

    expect(changes).toEqual([
      expect.objectContaining({
        kind: "PROP_BECAME_OPTIONAL",
        severity: "LOW",
        propName: "label",
        breaking: false,
      }),
    ]);
  });

  it("detects a property type change", () => {
    const oldContract = createContract([
      prop("count", {
        type: "string",
      }),
    ]);

    const newContract = createContract([
      prop("count", {
        type: "number",
      }),
    ]);

    const changes = diffContracts(oldContract, newContract);

    expect(changes).toEqual([
      expect.objectContaining({
        kind: "TYPE_CHANGED",
        severity: "HIGH",
        propName: "count",
        breaking: true,
      }),
    ]);
  });

  it("detects a union value being added", () => {
    const oldContract = createContract([
      prop("variant", {
        type: "union",
        values: ["primary", "secondary"],
      }),
    ]);

    const newContract = createContract([
      prop("variant", {
        type: "union",
        values: ["primary", "secondary", "danger"],
      }),
    ]);

    const changes = diffContracts(oldContract, newContract);

    expect(changes).toEqual([
      expect.objectContaining({
        kind: "UNION_VALUE_ADDED",
        severity: "LOW",
        propName: "variant",
        breaking: false,
      }),
    ]);
  });

  it("detects a union value being removed", () => {
    const oldContract = createContract([
      prop("variant", {
        type: "union",
        values: ["primary", "secondary", "danger"],
      }),
    ]);

    const newContract = createContract([
      prop("variant", {
        type: "union",
        values: ["primary", "secondary"],
      }),
    ]);

    const changes = diffContracts(oldContract, newContract);

    expect(changes).toEqual([
      expect.objectContaining({
        kind: "UNION_VALUE_REMOVED",
        severity: "HIGH",
        propName: "variant",
        breaking: true,
      }),
    ]);
  });

  it("returns no changes for identical contracts", () => {
    const contract = createContract([
      prop("label"),
      prop("variant", {
        type: "union",
        values: ["primary", "secondary"],
      }),
    ]);

    const changes = diffContracts(contract, contract);

    expect(changes).toEqual([]);
  });
});
