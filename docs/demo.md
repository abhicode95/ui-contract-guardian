# Demo Script

Use this script when demonstrating UI Contract Guardian to an interviewer or recruiter.

## 1. Start from a clean repository

```bash
npm test
npm run guardian:check
```

Expected:

```text
Test Files  4 passed (4)
Tests       20 passed (20)

Components scanned: 2
Components with changes: 0
Breaking components: 0

✓ No breaking contract changes detected.
```

## 2. Introduce a realistic breaking change

In `packages/ui/src/Button/Button.tsx`, remove:

```ts
| "danger"
```

from the `ButtonVariant` union.

Do not modify the consumers.

## 3. Run Guardian

```bash
npm run guardian:check
```

Expected behavior:

```text
[HIGH] UNION_VALUE_REMOVED | variant | breaking=true

=== Impact Analysis: ButtonProps ===

[HIGH] UNION_VALUE_REMOVED
  Property: variant
  Decision: BLOCK
  Blast radius: 3 consumer(s)
  Removed value: danger
```

The affected consumers should include the project's existing demo fixtures.

## 4. Explain the difference from a normal type-check

A normal compiler error tells you that code is incompatible.

Guardian adds:

```text
What changed?
        +
Who uses it?
        +
How many consumers?
        +
How risky is it?
        +
What should the developer do?
        +
Should CI block it?
```

## 5. Demonstrate policy

Set:

```json
"HIGH": "REVIEW"
```

Run:

```bash
npm run guardian:check
```

The risk remains:

```text
HIGH
```

but the merge decision becomes:

```text
REVIEW
```

and the CLI allows the process to continue.

Restore:

```json
"HIGH": "BLOCK"
```

before finishing the demo.

## 6. Restore clean state

Restore:

```ts
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger";
```

Then:

```bash
npm test
npm run guardian:check
```

Finish with a clean run.
