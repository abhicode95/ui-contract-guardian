import type { ContractChange } from "@ui-contract-guardian/diff";

import type { ConsumerReference } from "./consumers";
import type { GuardianPolicy } from "./config";

export type ImpactRisk = "HIGH" | "MEDIUM" | "LOW";

export type MergeDecision = "BLOCK" | "REVIEW" | "ALLOW";

export interface ContractImpact {
  component: string;
  property: string;
  changeKind: ContractChange["kind"];
  risk: ImpactRisk;
  impact: string;
  recommendation: string;
  mergeDecision: MergeDecision;
  consumers: ConsumerReference[];
  blastRadius: number;
  removedValue?: string;
  addedValue?: string;
}

export function assessContractImpact(
  component: string,
  change: ContractChange,
  consumers: ConsumerReference[] = [],
  policy: GuardianPolicy,
): ContractImpact {
  const blastRadius = consumers.length;

  switch (change.kind) {
    case "PROP_REMOVED":
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "HIGH",
        impact:
          "Existing consumers that pass this prop " +
          "may fail TypeScript compilation or lose " +
          "expected component behavior.",
        recommendation:
          "Restore the prop or identify and migrate " +
          "all consumers before merging.",
        mergeDecision: policy.HIGH,
        consumers,
        blastRadius,
      };

    case "PROP_BECAME_REQUIRED":
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "HIGH",
        impact:
          "Existing consumers that omit this prop " +
          "may fail type checking or runtime expectations.",
        recommendation:
          "Provide a backward-compatible default or " +
          "update every consumer before merging.",
        mergeDecision: policy.HIGH,
        consumers,
        blastRadius,
      };

    case "TYPE_CHANGED":
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "HIGH",
        impact:
          "Consumers using the previous property type " +
          "may fail type checking or behave incorrectly.",
        recommendation:
          "Preserve the existing type or migrate all " + "affected consumers.",
        mergeDecision: policy.HIGH,
        consumers,
        blastRadius,
      };

    case "UNION_VALUE_REMOVED":
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "HIGH",
        impact:
          "Consumers using the removed value may fail " +
          "TypeScript validation or render an unsupported state.",
        recommendation:
          "Restore the value or migrate every consumer " +
          `using "${change.details?.removedValue}".`,
        mergeDecision: policy.HIGH,
        consumers,
        blastRadius,
        removedValue: change.details?.removedValue,
      };

    case "PROP_ADDED":
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "LOW",
        impact:
          "Existing consumers remain compatible because " +
          "the new prop does not replace an existing contract.",
        recommendation:
          "No migration required. Add consumer usage when needed.",
        mergeDecision: policy.LOW,
        consumers,
        blastRadius,
      };

    case "PROP_BECAME_OPTIONAL":
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "LOW",
        impact:
          "Existing consumers remain compatible because " +
          "the component now accepts fewer required inputs.",
        recommendation: "No migration required.",
        mergeDecision: policy.LOW,
        consumers,
        blastRadius,
      };

    case "UNION_VALUE_ADDED":
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "LOW",
        impact:
          "Existing consumers remain compatible because " +
          "the previous union values are still supported.",
        recommendation:
          "No migration required. Consumers may adopt " +
          `the new "${change.details?.addedValue}" value.`,
        mergeDecision: policy.LOW,
        consumers,
        blastRadius,
        addedValue: change.details?.addedValue,
      };

    default:
      return {
        component,
        property: change.propName,
        changeKind: change.kind,
        risk: "MEDIUM",
        impact: "The contract changed and may affect downstream consumers.",
        recommendation: "Review affected consumers before merging.",
        mergeDecision: policy.MEDIUM,
        consumers,
        blastRadius,
      };
  }
}
