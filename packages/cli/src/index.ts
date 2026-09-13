import fs from "node:fs";
import path from "node:path";

import { runCheck, scanComponents } from "@ui-contract-guardian/analyzer";

type Config = {
  componentsDir: string;
  contractsDir: string;
};

const rootDir = process.cwd();

const configPath = path.resolve(rootDir, "ui-contract-guardian.config.json");

function loadConfig(): Config {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Config;

  if (!config.componentsDir) {
    throw new Error("Missing required config: componentsDir");
  }

  if (!config.contractsDir) {
    throw new Error("Missing required config: contractsDir");
  }

  return config;
}

function printHelp() {
  console.log(`
UI Contract Guardian

Usage:
  guardian <command>

Commands:
  baseline    Generate component contract baselines
  check       Check components against baselines
  help        Show this help message

Examples:
  guardian baseline
  guardian check
`);
}

function runBaseline(config: Config) {
  const componentsDir = path.resolve(rootDir, config.componentsDir);

  const contractsDir = path.resolve(rootDir, config.contractsDir);

  console.log("\n=== UI Contract Guardian ===\n");

  console.log(`Generating baselines from: ${componentsDir}\n`);

  if (!fs.existsSync(componentsDir)) {
    throw new Error(`Components directory does not exist: ${componentsDir}`);
  }

  const components = scanComponents(componentsDir);

  if (components.length === 0) {
    console.log("No components found.");
    return;
  }

  fs.mkdirSync(contractsDir, {
    recursive: true,
  });

  for (const component of components) {
    const componentName = component.name.replace(/Props$/, "");

    const outputPath = path.join(contractsDir, `${componentName}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(component, null, 2), "utf-8");

    console.log(`✓ ${component.name} → ${outputPath}`);
  }

  console.log(`\nGenerated ${components.length} contract(s).`);
}

function runCheckCommand(config: Config) {
  const componentsDir = path.resolve(rootDir, config.componentsDir);

  const contractsDir = path.resolve(rootDir, config.contractsDir);

  console.log("\n=== UI Contract Guardian ===\n");

  console.log(`Scanning: ${componentsDir}\n`);

  const result = runCheck(componentsDir, contractsDir);

  console.log("\n=== Summary ===");

  console.log(`Components scanned: ${result.componentsScanned}`);

  console.log(`Components with changes: ${result.componentsWithChanges}`);

  console.log(`Breaking components: ${result.breakingComponents}`);

  if (result.hasBreakingChanges) {
    console.log("\n✗ Breaking contract changes detected.");

    process.exitCode = 1;
    return;
  }

  console.log("\n✓ No breaking contract changes detected.");
}

function main() {
  const command = process.argv[2] ?? "help";

  if (command === "help") {
    printHelp();
    return;
  }

  const config = loadConfig();

  switch (command) {
    case "baseline":
      runBaseline(config);
      break;

    case "check":
      runCheckCommand(config);
      break;

    default:
      console.error(`Unknown command: ${command}\n`);

      printHelp();

      process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error("\n✗ UI Contract Guardian failed.\n");

  console.error(error instanceof Error ? error.message : "Unknown error");

  process.exitCode = 1;
}
