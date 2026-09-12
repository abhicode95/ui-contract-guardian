import path from "node:path";

import { generateBaseline } from "./baseline";

const componentPath = path.resolve(
  process.cwd(),
  "packages/ui/src/Button/Button.tsx",
);

const outputPath = path.resolve(
  process.cwd(),
  "packages/contracts/baselines/Button.json",
);

generateBaseline(componentPath, outputPath);
