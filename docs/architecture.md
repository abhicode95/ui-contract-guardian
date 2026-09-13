# Architecture

## System flow

```text
                 +----------------------+
                 |      React / TSX     |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 |   AST Contract       |
                 |     Extractor        |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 | Current Component    |
                 |      Contract        |
                 +----------+-----------+
                            |
                 +----------+-----------+
                 |                      |
                 v                      v
       +----------------+     +-------------------+
       | Baseline JSON  |     | Consumer Scanner  |
       +-------+--------+     +---------+---------+
               |                        |
               +-----------+------------+
                           |
                           v
                 +----------------------+
                 |     Diff Engine      |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 |   Impact Analysis    |
                 |                      |
                 | Risk                 |
                 | Blast Radius         |
                 | Recommendation        |
                 +----------+-----------+
                            |
                            v
                 +----------------------+
                 |   Policy Engine      |
                 |                      |
                 | BLOCK / REVIEW /     |
                 | ALLOW                |
                 +----------+-----------+
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
            CLI          Markdown        JSON
              |             |             |
              +-------------+-------------+
                            |
                            v
                    GitHub Actions
```

## Package responsibilities

### `contracts`

Owns the contract model:

- component name
- source path
- prop name
- required/optional state
- supported prop type
- union values

### `analyzer`

Coordinates source scanning, contract extraction, consumer discovery, impact analysis, and policy-aware checking.

### `diff`

Owns the semantic comparison between old and new contracts.

This package should remain independent of CLI presentation.

### `cli`

Provides developer-facing commands:

```text
guardian check
guardian report
guardian json
```

The CLI is responsible for presentation and process exit status, not contract semantics.

### `ui`

Contains the demo component library and consumer fixtures.

## Why separate risk from policy?

A breaking change is a fact.

Whether that fact should block a merge is an organizational policy.

Therefore:

```text
UNION_VALUE_REMOVED
        |
        v
      HIGH risk
        |
        +---- HIGH=BLOCK  -> block
        |
        +---- HIGH=REVIEW -> warn/review
        |
        +---- HIGH=ALLOW  -> allow
```

This separation prevents policy logic from contaminating the diff engine.

## Data flow

A simplified change object:

```ts
{
  kind: "UNION_VALUE_REMOVED",
  severity: "HIGH",
  propName: "variant",
  breaking: true,
  details: {
    removedValue: "danger"
  }
}
```

Impact analysis enriches it with:

```ts
{
  risk: "HIGH",
  mergeDecision: "BLOCK",
  consumers: [...],
  blastRadius: 3,
  recommendation: "..."
}
```

The final result can then be serialized to JSON or rendered as Markdown.

## Production evolution

The current consumer scanner intentionally uses source-pattern matching.

A stronger production implementation would use TypeScript's compiler/type-checker APIs to:

1. Resolve imported component symbols.
2. Follow re-exports.
3. Resolve aliases.
4. Detect JSX references through symbols.
5. Analyze dynamic and spread props where possible.
6. Avoid false positives from similarly named components.

The current design makes that replacement localized to consumer discovery rather than requiring a rewrite of the rest of the pipeline.
