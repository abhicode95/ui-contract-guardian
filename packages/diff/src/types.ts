import type { PropType } from "@ui-contract-guardian/contracts";

export type ChangeSeverity = "HIGH" | "MEDIUM" | "LOW";

export type ChangeKind =
  | "PROP_REMOVED"
  | "PROP_ADDED"
  | "PROP_BECAME_REQUIRED"
  | "PROP_BECAME_OPTIONAL"
  | "UNION_VALUE_REMOVED"
  | "UNION_VALUE_ADDED"
  | "TYPE_CHANGED";

export interface ContractChangeDetails {
  oldType?: PropType;
  newType?: PropType;

  removedValue?: string;
  addedValue?: string;

  oldRequired?: boolean;
  newRequired?: boolean;
}

export interface ContractChange {
  kind: ChangeKind;

  severity: ChangeSeverity;

  propName: string;

  message: string;

  breaking: boolean;

  details?: ContractChangeDetails;
}
