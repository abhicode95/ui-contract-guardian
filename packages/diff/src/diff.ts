import type {
  ComponentContract,
  PropContract,
} from "@ui-contract-guardian/contracts";

import type { ContractChange } from "./types";

function findProp(
  contract: ComponentContract,
  name: string,
): PropContract | undefined {
  return contract.props.find((prop) => prop.name === name);
}

export function diffContracts(
  oldContract: ComponentContract,
  newContract: ComponentContract,
): ContractChange[] {
  const changes: ContractChange[] = [];

  // Check old props
  for (const oldProp of oldContract.props) {
    const newProp = findProp(newContract, oldProp.name);

    if (!newProp) {
      changes.push({
        kind: "PROP_REMOVED",
        severity: "HIGH",
        propName: oldProp.name,
        message: `Prop "${oldProp.name}" was removed.`,
        breaking: true,
      });

      continue;
    }

    if (!oldProp.required && newProp.required) {
      changes.push({
        kind: "PROP_BECAME_REQUIRED",
        severity: "HIGH",
        propName: oldProp.name,
        message: `Prop "${oldProp.name}" became required.`,
        breaking: true,
      });
    }

    if (oldProp.required && !newProp.required) {
      changes.push({
        kind: "PROP_BECAME_OPTIONAL",
        severity: "LOW",
        propName: oldProp.name,
        message: `Prop "${oldProp.name}" became optional.`,
        breaking: false,
      });
    }

    if (oldProp.type !== newProp.type) {
      changes.push({
        kind: "TYPE_CHANGED",
        severity: "HIGH",
        propName: oldProp.name,
        message:
          `Prop "${oldProp.name}" changed type from ` +
          `"${oldProp.type}" to "${newProp.type}".`,
        breaking: true,
      });

      continue;
    }

    if (oldProp.type === "union" && newProp.type === "union") {
      const oldValues = oldProp.values ?? [];

      const newValues = newProp.values ?? [];

      for (const value of oldValues) {
        if (!newValues.includes(value)) {
          changes.push({
            kind: "UNION_VALUE_REMOVED",
            severity: "HIGH",
            propName: oldProp.name,
            message:
              `Value "${value}" was removed ` + `from "${oldProp.name}".`,
            breaking: true,
          });
        }
      }

      for (const value of newValues) {
        if (!oldValues.includes(value)) {
          changes.push({
            kind: "UNION_VALUE_ADDED",
            severity: "LOW",
            propName: oldProp.name,
            message: `Value "${value}" was added ` + `to "${oldProp.name}".`,
            breaking: false,
          });
        }
      }
    }
  }

  for (const newProp of newContract.props) {
    const oldProp = findProp(oldContract, newProp.name);

    if (!oldProp) {
      changes.push({
        kind: "PROP_ADDED",
        severity: "LOW",
        propName: newProp.name,
        message: `Prop "${newProp.name}" was added.`,
        breaking: false,
      });
    }
  }

  return changes;
}
