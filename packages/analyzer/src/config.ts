export type PolicyDecision = "BLOCK" | "REVIEW" | "ALLOW";

export type GuardianPolicy = {
  HIGH: PolicyDecision;
  MEDIUM: PolicyDecision;
  LOW: PolicyDecision;
};

export type GuardianConfig = {
  componentsDir: string;
  contractsDir: string;
  policy: GuardianPolicy;
};

export const defaultPolicy: GuardianPolicy = {
  HIGH: "BLOCK",
  MEDIUM: "REVIEW",
  LOW: "ALLOW",
};
