# CI/CD Pipeline Documentation

## Overview

This document describes the CI/CD pipeline for the Carthage-Clean monorepo. The pipeline is built with GitHub Actions and designed for a Turborepo + pnpm monorepo.

## Workflow Files

### `.github/workflows/ci.yml` - Main CI Pipeline

**Triggers:**

- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

| Job         | Description                                          | Runs On       | Timeout | Dependencies          |
| ----------- | ---------------------------------------------------- | ------------- | ------- | --------------------- |
| `setup`     | Checkout, setup Node/pnpm, install deps, cache Turbo | ubuntu-latest | 5 min   | -                     |
| `lint`      | ESLint + Prettier                                    | ubuntu-latest | 5 min   | setup                 |
| `typecheck` | TypeScript compilation check                         | ubuntu-latest | 5 min   | setup                 |
| `test`      | Vitest unit/integration tests                        | ubuntu-latest | 10 min  | setup                 |
| `build`     | Next.js production build                             | ubuntu-latest | 15 min  | lint, typecheck, test |
| `security`  | Secretlint + TruffleHog + .env check                 | ubuntu-latest | 5 min   | setup                 |

**Pipeline Flow:**

```
checkout
    ↓
setup (install deps, cache turbo)
    ↓
┌──────────────┬──────────────┬──────────────┐
│   lint       │  typecheck   │   test       │
└──────────────┴──────────────┴──────────────┘
                    ↓
                build (depends on all)
```

### `.github/workflows/security.yml` - Security Scanning

**Triggers:**

- Weekly schedule (Monday 2 AM UTC)
- Push/PR to `main`
- Manual dispatch

**Jobs:**

| Job                 | Tool                     | Purpose                                    |
| ------------------- | ------------------------ | ------------------------------------------ |
| `dependency-review` | GitHub Dependency Review | Review PR dependencies for vulnerabilities |
| `trufflehog`        | TruffleHog               | Secret scanning in git history             |
| `secretlint`        | Secretlint               | Secret scanning in codebase                |
| `dependency-audit`  | pnpm audit               | Dependency vulnerability audit             |
| `sast`              | CodeQL                   | Static application security testing        |

## Triggers

| Event                      | CI Pipeline | Security Pipeline |
| -------------------------- | ----------- | ----------------- |
| Push to `main`             | ✅          | ✅                |
| Pull Request to `main`     | ✅          | ✅                |
| Weekly schedule (Mon 2 AM) | ❌          | ✅                |
| Manual dispatch            | ❌          | ✅                |

## Branch Protection

**Required status checks for `main`:**

- Lint
- Typecheck
- Tests
- Build
- Security Scan

**Branch Protection Rules:**

- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Do not allow bypassing the above settings

## Jobs Detail

### Setup Job

- Checkout with full history (fetch-depth: 0)
- Node.js 20 (from `engines.node` in package.json)
- pnpm 9.15.0 (from `packageManager` in package.json)
- `pnpm install --frozen-lockfile`
- Cache `.turbo` directory by commit SHA
- Restore Turbo cache from previous runs

### Lint Job

- Runs `pnpm lint` (ESLint + Prettier)
- Runs in parallel with typecheck and test

### Typecheck Job

- Runs `pnpm typecheck` (TypeScript compilation check)
- Runs in parallel with lint and test

### Test Job

- Runs `pnpm test` (Vitest)
- Timeout: 10 minutes
- Sets `NODE_ENV=test`
- Requires `DATABASE_URL` secret for integration tests

### Build Job

- Runs after lint, typecheck, and test pass
- Runs `pnpm build` (Turbo build)
- Timeout: 15 minutes
- Sets `NODE_ENV=production`

### Security Job

- Runs `pnpm exec secretlint "**/*"` to detect secrets
- Checks for committed `.env` files (excluding `.env.example`)
- Runs TruffleHog for verified secrets in git history

## Caching Strategy

### pnpm Cache

- Path: `~/.pnpm-store`
- Key: `pnpm-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}`
- Restore keys: `pnpm-${{ runner.os }}-`

### Turbo Cache

- Path: `.turbo`
- Key: `turbo-${{ runner.os }}-${{ github.sha }}`
- Restore keys: `turbo-${{ runner.os }}-`

### Node.js Cache

- Uses `actions/setup-node` built-in cache
- Cache key: `pnpm-${{ hashFiles('pnpm-lock.yaml') }}`

## Required Secrets

| Secret              | Description                  | Required For                 |
| ------------------- | ---------------------------- | ---------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string | Test job (integration tests) |
| `TURBO_TOKEN`       | Turbo remote cache token     | Build caching                |
| `TURBO_TEAM`        | Turbo team slug              | Build caching                |
| `CODEQL_REPOSITORY` | CodeQL configuration         | Sast job (optional)          |

## Local Validation

Before pushing, run locally:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Troubleshooting

### Build Failures

**TypeScript errors:**

```bash
pnpm typecheck
```

**Linting errors:**

```bash
pnpm lint
# or auto-fix:
pnpm exec eslint . --fix
```

**Test failures:**

```bash
pnpm test
# Run specific test file:
pnpm test lib/auth/service.test.ts
```

**Build failures:**

```bash
pnpm build
# Check specific package:
cd apps/web && pnpm build
```

### Cache Issues

**Clear Turbo cache:**

```bash
rm -rf .turbo
```

**Clear pnpm store:**

```bash
pnpm store prune
```

**GitHub Actions cache:**

- Go to Actions tab → Caches → Delete specific cache entries

### Test Failures in CI

**DATABASE_URL not set:**

- Add `DATABASE_URL` to repository secrets
- Format: `postgresql://user:password@host:port/database`

**Flaky tests:**

- Run tests locally multiple times
- Check for test pollution (shared state)
- Ensure proper cleanup in `beforeEach`/`afterEach`

### Security Scan Failures

**Secretlint found secrets:**

- Remove secret from code
- Rotate compromised credentials
- Use environment variables or secret managers

**TruffleHog found verified secrets:**

- Check git history: `git log --all --full-history -- <file>`
- Use BFG Repo-Cleaner or `git filter-repo` to remove from history
- Rotate the compromised secret immediately

**Dependency vulnerabilities:**

```bash
pnpm audit
pnpm audit --fix
```

## Workflow Triggers

| Event                   | Branch | CI  | Security |
| ----------------------- | ------ | --- | -------- |
| Push                    | main   | ✅  | ✅       |
| Pull Request            | main   | ✅  | ✅       |
| Schedule (Mon 2 AM UTC) | ❌     | ✅  | ✅       |
| Manual                  | ❌     | ✅  | ✅       |

## Performance Optimization

### Parallel Jobs

- lint, typecheck, test run in parallel after setup
- build runs after all validation jobs pass

### Caching

- pnpm store cached between runs
- Turbo build cache restored from previous commits
- Node modules cached by pnpm lockfile hash

### Concurrency Control

- `concurrency.group: ci-${{ github.ref }}`
- `cancel-in-progress: true` - cancels previous runs on same ref

## Monitoring & Observability

### Artifacts

- pnpm audit report (30 days retention)
- Build logs in GitHub Actions UI

### Metrics to Watch

- Build duration trend
- Test duration trend
- Test flakiness rate
- Dependency vulnerability count
- Build success rate

## Version Requirements

| Tool       | Version | Source                           |
| ---------- | ------- | -------------------------------- |
| Node.js    | 20.x    | `engines.node` in package.json   |
| pnpm       | 9.15.0  | `packageManager` in package.json |
| Turbo      | 2.x     | devDependencies                  |
| TypeScript | 5.x     | devDependencies                  |

## Upgrade Process

1. Update `packageManager` in package.json
2. Update `engines.node` in package.json
3. Update `NODE_VERSION` and `PNPM_VERSION` in workflow env
4. Update `actions/setup-node` and `pnpm/action-setup` versions
5. Test locally with new versions
6. Create PR and verify CI passes
7. Merge to main

## Rollback Procedure

If a bad deployment reaches main:

1. Revert the commit on main
2. CI will run on revert commit
3. If CI passes, deploy reverted version
4. If CI fails, investigate and fix before deploying

## Contacts

- Repository: https://github.com/owner/carthage-clean
- CI/CD Config: `.github/workflows/`
- Issues: GitHub Issues tab
