# Security Policy

## Dependency Vulnerability Scanning

CI runs dependency audits for all three packages on every pull request and push to `main`:

| Package     | Tool        | Command                        | Audit Level |
| ----------- | ----------- | ------------------------------ | ----------- |
| `backend`   | npm audit   | `npm audit --audit-level=high` | high        |
| `frontend`  | npm audit   | `npm audit --audit-level=high` | high        |
| `contracts` | cargo-audit | `cargo audit`                  | all         |

### Current Status

The audit steps currently run with `continue-on-error: true` (non-blocking) because the dependency trees contain pre-existing findings that require triage. Once triaged and resolved or accepted, the steps will be made **blocking** by removing `continue-on-error`.

**Tightening path:**

1. Resolve or override all current findings (see Triage Process below).
2. Remove `continue-on-error: true` from the audit steps in `.github/workflows/ci.yml`.
3. Optionally raise `--audit-level` to `moderate` over time.

## Triage Process

When an audit finding appears in CI:

### 1. Classify the Finding

| Question                                          | Action                                                |
| ------------------------------------------------- | ----------------------------------------------------- |
| Is it in a **production** dependency?             | Prioritize — these ship to users.                     |
| Is it in a **dev** dependency (build tool, etc.)? | Lower priority — not present in production artifacts. |
| Is the vulnerable code path **reachable**?        | If not reachable, document and accept the risk.       |
| Is there a **patch** available?                   | Run `npm audit fix` or update the Cargo dependency.   |

### 2. Remediate

- **Patch available:** Update the dependency immediately.

  ```bash
  # Node.js packages
  npm audit fix
  # or manually update in package.json and npm install

  # Rust crates
  cargo update -p <crate>
  ```

- **No patch available:** Evaluate whether the vulnerable code path is reachable. If not, add an npm `overrides` entry (Node.js) or a `[patch]` section (Cargo) with a note explaining the accepted risk.

- **False positive / Not applicable:** Document the finding in the "Accepted Risks" section below with a justification and review date.

### 3. Verify

After remediation, re-run the audit locally to confirm:

```bash
# Backend / Frontend
cd backend && npm audit --audit-level=high
cd frontend && npm audit --audit-level=high

# Contracts
cd contracts && cargo audit
```

### 4. Make Blocking

Once **all** current findings are resolved or formally accepted:

1. Remove `continue-on-error: true` from the audit steps in `.github/workflows/ci.yml`.
2. From that point forward, any newly introduced high/critical vulnerability will **fail CI**.

## Accepted Risks

| Package    | Advisory | Severity | Justification | Review Date |
| ---------- | -------- | -------- | ------------- | ----------- |
| _none yet_ |          |          |               |             |

> Populate this table as findings are triaged. Review accepted risks quarterly.

## Reporting a Vulnerability

To report a security vulnerability in the application itself (not a dependency), please email the maintainers directly. Do not open a public issue for security vulnerabilities.
