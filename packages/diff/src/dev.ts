import type { ComponentContract } from "@ui-contract-guardian/contracts";

import { diffContracts } from "./diff";

function runTest(
  name: string,
  oldContract: ComponentContract,
  newContract: ComponentContract,
) {
  console.log(`\n=== ${name} ===`);

  const changes = diffContracts(oldContract, newContract);

  if (changes.length === 0) {
    console.log("No changes detected.");
    return;
  }

  for (const change of changes) {
    console.log(
      `[${change.severity}] ` +
        `${change.kind} | ` +
        `${change.propName} | ` +
        `breaking=${change.breaking}`,
    );

    console.log(`  ${change.message}`);
  }
}

const baseContract: ComponentContract = {
  name: "Button",
  filePath: "Button.tsx",
  props: [
    {
      name: "variant",
      required: false,
      type: "union",
      values: ["primary", "secondary", "danger"],
    },
    {
      name: "loading",
      required: false,
      type: "boolean",
    },
  ],
};

runTest("Add optional prop", baseContract, {
  ...baseContract,
  props: [
    ...baseContract.props,
    {
      name: "disabled",
      required: false,
      type: "boolean",
    },
  ],
});

runTest("Optional to required", baseContract, {
  ...baseContract,
  props: [
    {
      name: "variant",
      required: false,
      type: "union",
      values: ["primary", "secondary", "danger"],
    },
    {
      name: "loading",
      required: true,
      type: "boolean",
    },
  ],
});

runTest(
  "Required to optional",
  {
    name: "Button",
    filePath: "Button.tsx",
    props: [
      {
        name: "variant",
        required: false,
        type: "union",
        values: ["primary", "secondary", "danger"],
      },
      {
        name: "loading",
        required: true,
        type: "boolean",
      },
    ],
  },
  {
    name: "Button",
    filePath: "Button.tsx",
    props: [
      {
        name: "variant",
        required: false,
        type: "union",
        values: ["primary", "secondary", "danger"],
      },
      {
        name: "loading",
        required: false,
        type: "boolean",
      },
    ],
  },
);

runTest("Remove union value", baseContract, {
  ...baseContract,
  props: [
    {
      name: "variant",
      required: false,
      type: "union",
      values: ["primary", "secondary"],
    },
    {
      name: "loading",
      required: false,
      type: "boolean",
    },
  ],
});

runTest("Add union value", baseContract, {
  ...baseContract,
  props: [
    {
      name: "variant",
      required: false,
      type: "union",
      values: ["primary", "secondary", "danger", "success"],
    },
    {
      name: "loading",
      required: false,
      type: "boolean",
    },
  ],
});

runTest("Type changed", baseContract, {
  ...baseContract,
  props: [
    {
      name: "variant",
      required: false,
      type: "string",
    },
    {
      name: "loading",
      required: false,
      type: "boolean",
    },
  ],
});
