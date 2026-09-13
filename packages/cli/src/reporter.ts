import path from "node:path";

import type { CheckResult } from "@ui-contract-guardian/analyzer";

export function generateMarkdownReport(result: CheckResult): string {
  const lines: string[] = [];

  lines.push("# UI Contract Guardian");
  lines.push("");

  if (result.hasBreakingChanges) {
    lines.push("## ❌ Breaking UI contract changes detected");
  } else {
    lines.push("## ✅ No breaking UI contract changes");
  }

  lines.push("");

  lines.push("### Summary");
  lines.push("");

  lines.push(`- Components scanned: **${result.componentsScanned}**`);

  lines.push(`- Components with changes: **${result.componentsWithChanges}**`);

  lines.push(`- Breaking components: **${result.breakingComponents}**`);

  lines.push("");

  for (const componentResult of result.results) {
    if (componentResult.changes.length === 0) {
      continue;
    }

    lines.push(`### ${componentResult.component.name}`);

    lines.push("");

    lines.push("| Severity | Change | Property | Breaking |");

    lines.push("|---|---|---|---|");

    for (const change of componentResult.changes) {
      lines.push(
        `| ${change.severity} | ${change.message} | ${change.propName} | ${
          change.breaking ? "❌" : "✅"
        } |`,
      );
    }

    lines.push("");

    lines.push("#### Impact analysis");
    lines.push("");

    for (const impact of componentResult.impacts) {
      lines.push(`**${impact.risk} risk — ${impact.mergeDecision}**`);

      lines.push("");

      lines.push(`- **Property:** \`${impact.property}\``);

      lines.push(`- **Change:** \`${impact.changeKind}\``);

      lines.push(`- **Blast radius:** ${impact.blastRadius} consumer(s)`);

      if (impact.removedValue) {
        lines.push(`- **Removed value:** \`${impact.removedValue}\``);
      }

      if (impact.addedValue) {
        lines.push(`- **Added value:** \`${impact.addedValue}\``);
      }

      lines.push("");

      if (impact.consumers.length > 0) {
        lines.push("**Affected consumers:**");
        lines.push("");

        for (const consumer of impact.consumers) {
          const relativePath = path.relative(process.cwd(), consumer.filePath);

          lines.push(`- \`${relativePath}:${consumer.line}\``);
        }

        lines.push("");
      } else {
        lines.push("**Affected consumers:** None detected");

        lines.push("");
      }

      lines.push(`- **Impact:** ${impact.impact}`);

      lines.push(`- **Recommendation:** ${impact.recommendation}`);

      lines.push("");
    }
  }

  if (result.hasBreakingChanges) {
    lines.push(
      "> ❌ Merge should be blocked until the breaking contract changes are reviewed.",
    );
  } else {
    lines.push("> ✅ UI contract validation passed.");
  }

  lines.push("");

  return lines.join("\n");
}
