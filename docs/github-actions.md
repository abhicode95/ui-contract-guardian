# GitHub Actions Integration

The intended workflow runs Guardian on pull requests and publishes the generated report as a PR comment.

## Flow

```text
Pull Request
     |
     v
GitHub Actions
     |
     +--> npm ci
     |
     +--> npm run guardian:report
     |         |
     |         v
     |     Markdown report
     |
     +--> PR comment update
     |
     +--> policy enforcement
               |
          +----+----+
          |         |
        BLOCK    REVIEW/ALLOW
          |         |
        exit 1    exit 0
```

## Security model

Use `pull_request` for untrusted pull-request code rather than executing it with the elevated write context of `pull_request_target`.

The workflow should keep the permissions surface minimal.

## Expected behavior

### No changes

```text
Guardian passes
CI passes
```

### Breaking change + BLOCK

```text
Guardian detects HIGH risk
Decision = BLOCK
CI fails
```

### Breaking change + REVIEW

```text
Guardian detects HIGH risk
Decision = REVIEW
CI continues
PR report explains the risk
```

## PR comments

The workflow uses a stable marker:

```text
<!-- ui-contract-guardian -->
```

That allows it to update an existing Guardian comment instead of creating a new comment on every push.

## Before publishing

Verify that the repository workflow matches the actual installed GitHub Actions versions and your repository's permission model.
