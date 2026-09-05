# PROJECT AUDIT REPORT — Carthage-Clean

Date: 2026-08-31
Audit mode: Read-only (no files modified)

---

## 1. Executive Summary

```
Overall Status:  FAILING BUILD (public-site)
Overall Score:   5.5/10

Critical Issues:  1
High Issues:      3
Medium Issues:    8
Low Issues:       8
Informational:    5

Lint:       PASS (2/2 apps)
Typecheck:  FAIL (public-site — 1 TS error)
Tests:      PASS (115/115 in web)
Build:      FAIL (public-site fails due to TS error; web build succeeds)
```

---

## 2. Project Overview

| Attribute           | Value                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**            | Monorepo (Turborepo + pnpm)                                                                                                             |
| **Language**        | TypeScript (strict mode)                                                                                                                |
| **Package Manager** | pnpm 9.15.0                                                                                                                             |
| **Node**            | >= 20                                                                                                                                   |
| **Apps**            | `@carthage-clean/web` (Next.js 15 App Router — internal admin), `@carthage-clean/public-site` (Next.js 15 App Router — public showcase) |
| **Packages**        | `@carthage-clean/config` (tsconfig + prettier), `@carthage-clean/types` (locale constants)                                              |
| **Database**        | PostgreSQL via Drizzle ORM (10 migrations)                                                                                              |
| **Auth**            | Cookie-based sessions, bcryptjs, RBAC (admin/supervisor/agent)                                                                          |
| **Styling**         | Tailwind CSS 3.4 with custom brand palette                                                                                              |
| **Testing**         | Vitest 4.1 + jsdom (115 tests, 16 files)                                                                                                |
| **Linting**         | ESLint 9 (flat config) + Prettier                                                                                                       |
| **Git Hooks**       | Husky 9 + lint-staged                                                                                                                   |

### Architecture

```
carthage-clean/
├── apps/
│   ├── web/                    # Internal operations app (admin/agent portal)
│   │   ├── app/                # Next.js App Router pages + API routes
│   │   ├── components/         # Layout + UI components
│   │   ├── lib/                # Business logic (auth, tours, zones, dashboard, audit)
│   │   ├── db/                 # Drizzle schema + migrations + connection
│   │   └── scripts/            # Bootstrap + env loading
│   └── public-site/            # Public showcase website
│       ├── app/                # Pages (home, about, services, zones, contact, legal)
│       ├── components/         # Header, Footer, UI primitives
│       └── lib/                # Static content data
├── packages/
│   ├── config/                 # Shared tsconfig.base.json + prettier.config.cjs
│   └── types/                  # Locale type + constants
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 3. Architecture Audit

### Strengths

- Clean monorepo structure with Turborepo
- Repository pattern with interface/implementation separation enables fully mocked unit tests
- RBAC enforced at guard level (page components, server actions, API routes)
- Audit logging on every mutation (login, CRUD, workflow transitions)
- Tour state machine (planifiée → en_cours → terminée / annulée) is well-defined
- French-first design with proper locale typing
- Strict TypeScript (strict + noUncheckedIndexedAccess)

### Weaknesses

- Duplicate filtering logic: `filterSortPaginateTours` (JS, `query.ts:117`) duplicates `queryTours` (SQL, `repository.ts:142`) — drift risk
- No database transaction usage anywhere — concurrent operations are unprotected
- `tours.status` column is free `text` rather than a pgEnum, relying solely on code validation
- No middleware-based auth guard — each page/action calls guards individually (inconsistency risk)
- No API rate limiting infrastructure
- `db/index.ts` creates Pool at import time with no error guard

### Technical Debt

- Stale nested `apps/web/apps/web/package.json` (dead artifact)
- Turbo cache files committed (`.turbo/`)
- No streaming for large CSV exports

---

## 4. Validation Results

| Validation | Status | Errors | Warnings | Notes                                                                     |
| ---------- | ------ | ------ | -------- | ------------------------------------------------------------------------- |
| Install    | PASS   | 0      | 0        | `pnpm install --frozen-lockfile` succeeds                                 |
| Lint       | PASS   | 0      | 0        | Both apps lint clean                                                      |
| Typecheck  | FAIL   | 1      | 0        | `apps/public-site` — `lib/content.ts:167` property 'rosle' does not exist |
| Tests      | PASS   | 0      | 0        | 115/115 passed across 16 test files (web only)                            |
| Build      | FAIL   | 1      | 0        | `apps/public-site` fails due to TS error; web builds OK                   |

### Command Details

```
Command: pnpm lint
Status:  PASS
Exit code: 0

Command: pnpm typecheck
Status:  FAIL
Exit code: 2
Errors: apps/public-site lib/content.ts(167,25): error TS2561:
  'rosle' does not exist in type '{ name: string; role: string; initials: string; }'

Command: pnpm test
Status:  PASS
Exit code: 0
Output: 16 test files, 115 tests, all passed, 45.23s

Command: pnpm build
Status:  FAIL
Exit code: 1
Errors: public-site fails (same TS2561 as typecheck)
```

---

## 5. Critical Issues

### CRIT-001: Real Database Password in .env File

```
ID: CRIT-001

Severity: CRITICAL

Category: Security

File: apps/web/.env

Line: 6

Problem:
The .env file contains a real PostgreSQL password in the DATABASE_URL
(URL-encoded). This file exists in the project ZIP / working directory.

Root Cause:
.env was not excluded from the ZIP/package. While .gitignore excludes
.env, the file was shipped in the distribution artifact.

Impact:
Credential exposure. Anyone with the ZIP has full database access.
If the same password is reused elsewhere, the blast radius increases.

Recommended Fix:
1. Rotate the database password immediately
2. Add .env to .zip exclusion rules
3. Create .env.example with placeholder values only
4. Add a pre-commit hook or CI check that rejects .env files

Confidence: HIGH
```

---

## 6. High Priority Issues

### HIGH-001: Predictable Admin Bootstrap Password, No Forced Rotation

```
ID: HIGH-001

Severity: HIGH

Category: Security

File: apps/web/.env

Lines: 9-10

Problem:
Default admin credentials are hardcoded. The bootstrap script creates
this account and there is no mechanism to force a password change on
first login.

Impact:
Predictable credentials for the highest-privilege account.
Combined with no rate limiting (see MEDIUM-004), brute-force is trivial.

Recommended Fix:
1. Generate a random password at bootstrap time, print it once, force change
2. Add mustChangePassword flag to users table
3. Block login until password is changed

Confidence: HIGH
```

### HIGH-002: Agent Dashboard Loads All Tours, Filters in JS

```
ID: HIGH-002

Severity: HIGH

Category: Performance / Security

File: apps/web/lib/dashboard/repository.ts

Lines: 60-67

Problem:
listToursForUserBetween calls queryTours with no user scoping at SQL level,
fetching ALL tours into memory, then filters rows in JS.

Impact:
1. Performance: O(N) memory for all tours regardless of caller
2. Security: full tour data is exposed to the application layer;
   any code path that forgets the filter leaks all tours

Recommended Fix:
Add a SQL-level WHERE clause filtering by agent assignment
(e.g., JOIN tourAgents WHERE userId = ?).

Confidence: HIGH
```

### HIGH-003: Logout Does Not Revoke Server-Side Session

```
ID: HIGH-003

Severity: HIGH

Category: Security

File: apps/web/app/login/actions.ts

Lines: 30-33

Problem:
logoutAction only deletes the cookie client-side. It does not delete the
session row from the database. A stolen token remains valid until expiresAt
(30 days).

Impact:
Session hijacking: a stolen token works from any device/browser for up to
30 days after "logout".

Recommended Fix:
Add deleteSession(tokenHash) to logoutAction that removes the DB row
before deleting the cookie.

Confidence: HIGH
```

---

## 7. Medium Priority Issues

### MEDIUM-001: Type Error Breaks public-site Build

```
ID: MEDIUM-001

Severity: MEDIUM

Category: Build / Bug

File: apps/public-site/lib/content.ts

Line: 167

Problem:
Typo: "rosle" instead of "role" in TEAM array. TS2561 error prevents
typecheck and build for public-site.

Impact:
public-site cannot be typechecked or built. Deployment is blocked.

Recommended Fix:
Change "rosle" to "role".

Confidence: HIGH
```

### MEDIUM-002: CSV Formula Injection

```
ID: MEDIUM-002

Severity: MEDIUM

Category: Security

File: apps/web/lib/tours/query.ts

Lines: 141-147

Problem:
csvEscape() handles quotes, commas, and newlines, but does not sanitize
cells beginning with =, +, -, @. A user-controlled field (name, notes,
cancellationReason) starting with these characters triggers CSV formula
injection when opened in Excel.

Impact:
Spreadsheet formula injection. An attacker with admin access can craft
agent names or notes that execute arbitrary formulas in Excel.

Recommended Fix:
Prefix cells starting with =, +, -, @, \t, \r with a single quote (')
or tab character to neutralize formula execution.

Confidence: HIGH
```

### MEDIUM-003: parseDateOnly Accepts Invalid Calendar Dates

```
ID: MEDIUM-003

Severity: MEDIUM

Category: Bug

File: apps/web/lib/tours/service.ts

Lines: 98-112

Problem:
parseDateOnly validates that month is 1-12 and day is 1-31, but does not
validate per-month limits. "2026-02-31" passes validation and is stored
in the database.

Impact:
Invalid dates stored in DB. Query/filter behavior with Feb 30/31 is
undefined. Data integrity issue.

Recommended Fix:
Use new Date(year, month - 1, day) and verify getMonth()/getDate() match
to validate actual calendar date.

Confidence: HIGH
```

### MEDIUM-004: No Login Rate Limiting

```
ID: MEDIUM-004

Severity: MEDIUM

Category: Security

File: apps/web/app/login/actions.ts

Lines: 10-28

Problem:
loginAction has no rate limiting, account lockout, or delay mechanism.
Combined with account status enumeration ("Compte désactivé" vs
"Identifiants invalides"), brute-force and account enumeration are feasible.

Impact:
Credential stuffing, brute-force attacks, account enumeration.

Recommended Fix:
1. Add uniform error message for all login failures
2. Implement rate limiting (e.g., 5 attempts per minute per IP)
3. Add progressive delay or CAPTCHA after N failures

Confidence: HIGH
```

### MEDIUM-005: Zone Delete Has No FK Check / Error Handling

```
ID: MEDIUM-005

Severity: MEDIUM

Category: Bug / Error Handling

File: apps/web/lib/zones/service.ts

Lines: 185-194

Problem:
deleteZone executes a raw DELETE without checking for dependent tours or
assignments. The schema has onDelete: "restrict" on tours.zoneId, so the
DB throws an uncaught FK constraint error (500 response) with no user-
facing message.

Impact:
Confusing 500 error when trying to delete a zone with tours.

Recommended Fix:
1. Check for dependent tours/assignments before deleting
2. Return a clear error message listing dependencies
3. Or catch the FK error and translate to a user-friendly message

Confidence: HIGH
```

### MEDIUM-006: Unbounded Audit Pagination

```
ID: MEDIUM-006

Severity: MEDIUM

Category: Performance / Bug

File: apps/web/lib/audit/log.ts

Lines: 88-106

Problem:
listAuditLogs has no bounds checking on page/pageSize. page=0 produces
negative offset (SQL error). pageSize=999999 loads unbounded data.

Impact:
SQL errors or memory exhaustion from malicious/accidental parameters.

Recommended Fix:
Clamp page >= 1 and pageSize to a reasonable range (1-100).

Confidence: HIGH
```

### MEDIUM-007: Unbounded Export Query

```
ID: MEDIUM-007

Severity: MEDIUM

Category: Performance

File: apps/web/app/api/admin/tours/export/route.ts

Lines: 30-34

Problem:
The CSV export endpoint uses pageSize: 100000, loading all matching tours
into memory as a single array before generating CSV. No streaming.

Impact:
OOM risk on large datasets. Denial-of-service vector.

Recommended Fix:
Implement streaming CSV export or add a hard row limit.

Confidence: HIGH
```

### MEDIUM-008: deleteZone Not Audited

```
ID: MEDIUM-008

Severity: MEDIUM

Category: Security / Audit

File: apps/web/lib/zones/service.ts

Lines: 185-194

Problem:
deleteZone is the only destructive admin operation without an audit log
entry. create, update, and activate are all audited.

Impact:
Destructive actions cannot be traced.

Recommended Fix:
Add logAuditEvent call before/after delete.

Confidence: HIGH
```

---

## 8. Low Priority Issues

### LOW-001: Placeholder/Invalid Team Data

```
ID: LOW-001

Severity: LOW

Category: Code Quality / Content

File: apps/public-site/lib/content.ts

Lines: 166-169

Problem:
- Line 166: initials don't match name
- Line 167: rosle typo (see MEDIUM-001)
- Line 168: initials don't match name
- Line 169: name "NAME OF HELL" is a placeholder

Impact:
Unprofessional content on public website. Data integrity issue.

Confidence: HIGH
```

### LOW-002: Stale Nested Package.json

```
ID: LOW-002

Severity: LOW

Category: Code Quality

File: apps/web/apps/web/package.json

Problem:
A legacy package.json exists at apps/web/apps/web/ — a nested duplicate
from an earlier project structure. It references outdated dependency
versions.

Impact:
Confusion. Could cause pnpm workspace issues if accidentally detected.

Confidence: HIGH
```

### LOW-003: Dead Duplicate Tour Filtering Logic

```
ID: LOW-003

Severity: LOW

Category: Code Quality / Dead Code

File: apps/web/lib/tours/query.ts

Lines: 117-138

Problem:
filterSortPaginateTours() + matchesFilters() + compareRows() implement
a full JS-based filtering/sorting pipeline that duplicates the SQL-based
queryTours() in repository.ts. Appears unused in production code paths.
Risk of drift between the two implementations.

Impact:
Maintenance burden. Bugs fixed in one may not be fixed in the other.

Confidence: MEDIUM
```

### LOW-004: Password Not Trimmed in Agent Creation

```
ID: LOW-004

Severity: LOW

Category: Code Quality

File: apps/web/lib/auth/agents.ts

Lines: ~222

Problem:
Password input is not trimmed before hashing. Leading/trailing whitespace
in a created password becomes part of the hash. Login does not trim either,
so it's consistent, but users may be confused by invisible characters.

Impact:
User confusion. Not a security issue per se.

Confidence: HIGH
```

### LOW-005: tours.status Is Free Text, Not pgEnum

```
ID: LOW-005

Severity: LOW

Category: Architecture

File: apps/web/db/schema.ts

Line: 85

Problem:
tours.status is declared as text rather than using a pgEnum (like roles
uses roleEnum). Invalid statuses from manual inserts or bad migrations
would bypass type safety via `as TourStatus` casts.

Impact:
Data integrity risk if DB is accessed directly.

Confidence: HIGH
```

### LOW-006: No Max Length Validation on Zone Fields

```
ID: LOW-006

Severity: LOW

Category: Validation

File: apps/web/lib/zones/service.ts

Lines: ~100-105

Problem:
Zone name, code, and description have no maximum length validation.
Overlong strings are stored in the database (all text columns).

Impact:
Potential UI overflow or storage bloat.

Confidence: HIGH
```

### LOW-007: No DB Pool Configuration

```
ID: LOW-007

Severity: LOW

Category: Reliability

File: apps/web/db/index.ts

Line: 5

Problem:
Pool created with only connectionString. No max connections, idle timeout,
or connection timeout configured. If DATABASE_URL is undefined, the pool
is created with undefined and fails silently on first query.

Impact:
Unpredictable connection behavior under load. Silent failure if env missing.

Confidence: HIGH
```

### LOW-008: Turbo Cache Files in Workspace

```
ID: LOW-008

Severity: LOW

Category: Hygiene

File: .turbo/ (entire directory)

Problem:
.turbo/cache contains 20+ build cache entries (60 files). This directory
should not be included in the ZIP.

Impact:
Unnecessary files in distribution.

Confidence: HIGH
```

---

## 9. Security Audit

| Area                | Status     | Notes                                                              |
| ------------------- | ---------- | ------------------------------------------------------------------ |
| SQL Injection       | OK         | Drizzle ORM uses parameterized queries throughout                  |
| XSS                 | OK         | No dangerouslySetInnerHTML; React escapes output                   |
| CSRF                | OK         | sameSite: "lax" + Next.js server action origin checks              |
| Auth Bypass         | OK         | Guards enforced at page/action/API level                           |
| Session Security    | PARTIAL    | httpOnly + 256-bit tokens, but no server-side revocation on logout |
| Password Hashing    | OK         | bcryptjs with 10 salt rounds                                       |
| Rate Limiting       | MISSING    | No login rate limiting or account lockout                          |
| Secret Management   | FAIL       | Real DB password in .env file in ZIP                               |
| CSV Injection       | VULNERABLE | csvEscape does not sanitize formula prefixes                       |
| Access Control      | PARTIAL    | RBAC enforced but no SQL-level tenant scoping for agent tours      |
| Account Enumeration | PRESENT    | Distinct error messages for disabled vs invalid credentials        |

**Overall Security Rating: 4/10**

---

## 10. Testing Audit

```
Tests found:         115 tests across 16 files
Tests executed:      115
Passed:              115
Failed:              0
Skipped:             0
Test framework:      Vitest 4.1.11 (jsdom environment)
Potential flaky:     0 (all tests use in-memory mocks)
Missing tests:       public-site (0 tests), API routes, server actions,
                     middleware, E2E, integration with real DB
```

### Coverage Analysis

- `lib/auth/*`: Well tested (password, session, RBAC, service, bootstrap, agents)
- `lib/tours/*`: Well tested (service, query, workflow)
- `lib/zones/*`: Well tested (service, assignments)
- `lib/dashboard/*`: Partially tested (service only)
- `lib/audit/*`: Partially tested (log + 1 integration test)
- `lib/format`, `lib/locale`: Tested
- `app/` pages: **No tests**
- `components/`: **No tests**
- `app/api/` routes: **No tests**
- `public-site`: **No tests at all**
- `db/schema.ts`: **No migration tests**
- `scripts/`: **No tests**

**Testing Rating: 5/10** (good unit test coverage for business logic; zero UI/integration/E2E coverage)

---

## 11. Performance Audit

| Issue                           | Severity | Description                                      |
| ------------------------------- | -------- | ------------------------------------------------ |
| Unbounded export                | MEDIUM   | CSV export loads up to 100K rows into memory     |
| Full tour scan for agents       | HIGH     | Dashboard loads all tours then filters in JS     |
| No DB connection pooling config | LOW      | Default pool settings, no max/idle config        |
| bcryptjs (pure JS)              | LOW      | Slower than native bcrypt; DoS vector under load |
| No pagination bounds on audit   | MEDIUM   | Unbounded pageSize possible                      |

**Performance Rating: 5/10**

---

## 12. Dependency Audit

| Package     | Version  | Notes                                |
| ----------- | -------- | ------------------------------------ |
| next        | ^15.1.6  | Current stable, OK                   |
| react       | ^19.0.0  | Latest major, OK                     |
| drizzle-orm | ^0.45.2  | Current, OK                          |
| drizzle-kit | ^0.31.10 | Current, OK                          |
| pg          | ^8.23.0  | Current, OK                          |
| bcryptjs    | ^3.0.3   | Current, pure-JS (see perf note)     |
| vitest      | ^4.1.11  | Current, OK                          |
| tailwindcss | ^3.4     | v3 (v4 available but migration risk) |
| typescript  | ^5.7.0   | Current, OK                          |
| turbo       | ^2.3.0   | Current, OK                          |
| husky       | ^9.1.7   | Current, OK                          |
| pnpm        | 9.15.0   | Outdated (11.24.0 available)         |

No peer dependency conflicts. No known critical vulnerabilities detected in dependency tree.
Lockfile present and consistent.

**Dependency Rating: 7/10**

---

## 13. Code Quality Audit

| Dimension       | Rating | Notes                                                                   |
| --------------- | ------ | ----------------------------------------------------------------------- |
| Maintainability | 7/10   | Clean separation, repository pattern, consistent naming                 |
| Readability     | 8/10   | Well-structured, French comments, clear domain model                    |
| Complexity      | 7/10   | Some complex queries in repository.ts but well-organized                |
| Duplication     | 5/10   | Dead duplicate tour filtering logic; no shared UI patterns between apps |
| Typing          | 7/10   | Strict mode + noUncheckedIndexedAccess; some unsafe `as` casts          |
| Error Handling  | 6/10   | Audit errors swallowed (by design); zone delete unhandled FK            |
| Consistency     | 7/10   | Consistent patterns within web app; public-site is simpler and clean    |

**Code Quality Rating: 7/10**

---

## 14. Scores

```
Architecture:    7/10  Clean monorepo, repository pattern, good domain modeling
Code Quality:    7/10  Well-structured, strict TS, some dead code and duplication
Security:        4/10  Real credentials in .env, no rate limiting, CSV injection,
                       no session revocation
Testing:         5/10  Strong unit tests for business logic, zero UI/E2E/integration
Performance:     5/10  Unbounded queries, full table scans for agent dashboard
Maintainability: 7/10  Good separation, some technical debt
DevOps:          5/10  Turbo pipeline works, but no CI/CD, no Docker, no staging env

OVERALL:         5.5/10
```

---

## 15. Prioritized Fix Plan

| Priority | ID         | Issue                           | Why This Order                               |
| -------- | ---------- | ------------------------------- | -------------------------------------------- |
| 1        | CRIT-001   | .env with real DB password      | Credential exposure — immediate risk         |
| 2        | HIGH-001   | Predictable admin password      | Highest-privilege account with default creds |
| 3        | HIGH-003   | Logout doesn't revoke session   | Session hijacking window of 30 days          |
| 4        | HIGH-002   | Agent dashboard loads all tours | Performance + security data leak             |
| 5        | MEDIUM-001 | rosle typo breaks build         | Blocks deployment of public-site             |
| 6        | MEDIUM-004 | No login rate limiting          | Brute-force vulnerability                    |
| 7        | MEDIUM-002 | CSV formula injection           | Spreadsheet attack vector                    |
| 8        | MEDIUM-003 | Invalid calendar dates accepted | Data integrity                               |
| 9        | MEDIUM-005 | Zone delete FK error unhandled  | UX bug, potential 500s                       |
| 10       | MEDIUM-006 | Unbounded audit pagination      | SQL errors, DoS                              |
| 11       | MEDIUM-007 | Unbounded export query          | OOM risk                                     |
| 12       | MEDIUM-008 | deleteZone not audited          | Audit gap                                    |
| 13       | LOW-001    | Placeholder team data           | Public site content                          |
| 14       | LOW-002    | Stale nested package.json       | Hygiene                                      |
| 15       | LOW-003    | Dead duplicate filter logic     | Maintainability                              |
| 16       | LOW-004    | Password not trimmed            | UX consistency                               |
| 17       | LOW-005    | tours.status free text          | Data integrity                               |
| 18       | LOW-006    | No zone field length limits     | Validation                                   |
| 19       | LOW-007    | No DB pool config               | Reliability                                  |
| 20       | LOW-008    | Turbo cache in ZIP              | Hygiene                                      |
