# UI Contract Guardian

> Deterministic React/TypeScript UI contract validation with consumer discovery, blast-radius analysis, migration guidance, and configurable CI policy.

UI Contract Guardian protects shared React component APIs from accidental breaking changes.

It extracts component prop contracts from TSX source, compares the current contract against a versioned JSON baseline, identifies breaking changes, finds affected consumers, calculates blast radius, recommends migration actions, and enforces a configurable `BLOCK / REVIEW / ALLOW` policy.

## Why this exists

In a shared UI/design-system codebase, a component change can look small:

```ts
type ButtonVariant = "primary" | "secondary" | "danger";
```

becomes:

```ts
type ButtonVariant = "primary" | "secondary";
```

The TypeScript change itself is obvious. The harder question is:

> **Which consumers are affected, how large is the blast radius, and should CI block the change?**

UI Contract Guardian answers those questions automatically.

## What it detects

- Removed props
- Added props
- Props becoming required
- Props becoming optional
- Union values removed
- Union values added
- Prop type changes

For breaking changes it can additionally report:

- Risk level
- Merge decision
- Affected consumer files and lines
- Blast radius
- Removed/added union values
- Migration recommendation

## Architecture

```text
React / TSX
    |
    v
AST Contract Extractor
    |
    v
Current Component Contract
    |
    +--------------------+
    |                    |
    v                    v
Baseline JSON        Consumer Source
    |                    |
    v                    v
      Diff Engine
           |
           v
     Impact Analysis
           |
           +--> Consumer Discovery
           |
           +--> Blast Radius
           |
           +--> Risk Classification
           |
           +--> Migration Recommendation
           |
           v
      Policy Engine
           |
      +----+----+----+
      |         |    |
    BLOCK    REVIEW ALLOW
      |         |    |
     CI 1     CI 0  CI 0
           |
           v
      CLI / Markdown / JSON
           |
           v
       GitHub Actions
```

## Project structure

```text
ui-contract-guardian/
├── apps/
├── packages/
│   ├── analyzer/
│   │   └── src/
│   │       ├── extractor.ts
│   │       ├── scanner.ts
│   │       ├── consumers.ts
│   │       ├── impact.ts
│   │       ├── check.ts
│   │       └── config.ts
│   ├── cli/
│   │   └── src/
│   │       ├── index.ts
│   │       └── reporter.ts
│   ├── contracts/
│   │   └── baselines/
│   ├── diff/
│   └── ui/
├── tests/
├── docs/
├── .github/
│   └── workflows/
├── ui-contract-guardian.config.json
├── package.json
└── README.md
```

## Quick start

Requirements:

- Node.js
- npm

Install:

```bash
npm ci
```

Run tests:

```bash
npm test
```

Run contract validation:

```bash
npm run guardian:check
```

Generate Markdown output:

```bash
npm run guardian:report
```

Generate machine-readable JSON:

```bash
npm run guardian:json
```

## Configuration

`ui-contract-guardian.config.json`:

```json
{
  "componentsDir": "packages/ui/src",
  "contractsDir": "packages/contracts/baselines",
  "policy": {
    "HIGH": "BLOCK",
    "MEDIUM": "REVIEW",
    "LOW": "ALLOW"
  }
}
```

Risk and merge policy are deliberately separated.

For example:

```text
HIGH + BLOCK  -> CI fails
HIGH + REVIEW -> CI continues with a warning
LOW  + ALLOW  -> CI continues
```

This lets teams choose their enforcement level without changing the analyzer.

## Example

Suppose the baseline supports:

```ts
type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger";
```

and a PR removes `danger`.

UI Contract Guardian reports:

```text
[HIGH] UNION_VALUE_REMOVED | variant | breaking=true
  Value "danger" was removed from "variant".

=== Impact Analysis: ButtonProps ===

[HIGH] UNION_VALUE_REMOVED
  Property: variant
  Decision: BLOCK
  Blast radius: 3 consumer(s)
  Removed value: danger

  Affected consumers:
    - packages/ui/src/consumers/AdminPanel.tsx:4
    - packages/ui/src/consumers/Checkout.tsx:4
    - packages/ui/src/consumers/ErrorState.tsx:4

  Recommendation:
    Restore the value or migrate every consumer using "danger".

✗ UI Contract Guardian blocked the change.
```

The important output is not simply "breaking change."

It connects:

```text
contract change -> consumers -> blast radius -> recommendation -> policy
```

## Testing

The current suite covers:

- Contract diff behavior
- Impact analysis
- Consumer discovery
- Analyzer behavior

Expected result:

```text
Test Files  4 passed (4)
Tests       20 passed (20)
```

## CI integration

The project is designed to run in GitHub Actions on pull requests.

The workflow:

1. Installs dependencies.
2. Runs the Guardian report.
3. Publishes/updates a PR comment.
4. Enforces the configured policy.
5. Fails the workflow when the policy produces `BLOCK`.

See:

- `docs/github-actions.md`
- `.github/workflows/ui-contract-guardian.yml`

## Design decisions

### Deterministic analysis first

The core decision engine is deterministic rather than AI-dependent.

That means the same source and baseline produce the same result.

AI can be added later for explanation, but it should not be responsible for deciding whether a known breaking API change is safe.

### Lightweight consumer discovery in v1

Consumer discovery currently uses deterministic TSX source scanning.

This is intentionally a v1 tradeoff:

- simple
- fast
- explainable
- easy to run in CI

A production evolution would use TypeScript symbol resolution to distinguish aliases, re-exports, namespace usage, and more complex JSX patterns.

### Versioned baselines

The baseline is a serialized representation of the component API.

That makes contract changes reviewable and enables CI comparison between the expected and current public surface.

## Current limitations

This is a focused v1, not a full TypeScript compiler replacement.

Known limitations include:

- Consumer discovery is source-pattern based rather than full symbol resolution.
- Component extraction focuses on the supported TypeScript prop patterns.
- Baseline generation/version management can be expanded.
- JSON output currently contains filesystem paths that can be normalized for portability.
- More advanced generic/inherited prop resolution can be added later.

These are deliberate extension points rather than reasons to add infrastructure prematurely.

## Roadmap

Potential future work:

1. TypeScript symbol-aware consumer resolution
2. Better baseline lifecycle/versioning
3. GitHub Checks annotations
4. SARIF output
5. Optional AI-generated explanations
6. Historical contract-change analytics

The core deterministic pipeline should remain the source of truth.

## Interview summary

> I built UI Contract Guardian because shared React component changes often fail at the consumer boundary rather than inside the component itself. The tool parses TSX contracts, diffs them against baselines, discovers affected consumers, calculates blast radius, generates migration guidance, and applies configurable CI policy. The interesting engineering decision was separating deterministic risk detection from policy enforcement so teams can choose whether a risk should block, require review, or be allowed.

## License

Add the license you intend to use before publishing the repository.
