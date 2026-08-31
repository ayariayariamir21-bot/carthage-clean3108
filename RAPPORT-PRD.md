# CARTHAGE-CLEAN — MVP PRODUCT REQUIREMENTS DOCUMENT (PRD)

|                       |                                                                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document              | Final MVP PRD (consolidates STEP 2.1 analysis, STEP 2.2 MVP definition, STEP 2.3 backlog)                                                            |
| Status                | Pending product-owner approval                                                                                                                       |
| Owner                 | To be assigned — current product owner is unknown                                                                                                    |
| Classification legend | **CONFIRMED** = validated & approved · **PROPOSED** = suggested, not yet approved · **TO BE CONFIRMED** = requires product owner / stakeholder input |

> Note on project context: the original project analysis (RAPPORT-ANALYSE.md) explicitly states that objectives, deliverables, constraints, deadlines, budget, team and stakeholders are **missing**. Those gaps are preserved in §12 and marked TO BE CONFIRMED. No assumption about them is silently made in this document.

---

## 1. Product Overview

- **Product name:** Carthage-Clean
- **Purpose:** A web platform for the Municipality of Carthage to plan, execute and verify urban street-cleaning operations and to replace manual/paper follow-up with one accountable digital record.
- **Problem being solved:** Cleaning operations are organized per geo-sector (zone) and carried out by field operatives (agents), but today there is no reliable digital record of who was scheduled to clean what, when a pass was performed, and which planned cleanings were missed or blocked. Decision-makers therefore lack trustworthy, up-to-date visibility into execution vs. plan, and agents lack a simple daily task list.
- **Product vision:** Within a small pilot, the platform lets an operations administrator define zones, register cleaning agents, plan recurring cleaning tours, and track execution in real time — proving the operational baseline before citizen-facing features are added.

Status of this section: **CONFIRMED** (grounded in the approved MVP scope) except for the formal stakeholder objectives, which remain TO BE CONFIRMED (§12).

---

## 2. Target Users

### 2.1 Operations administrator

- **Role:** municipal staff member who runs the cleanliness service (operations management).
- **Responsibilities:** create/manage zones; register agents; create and adjust cleaning tours; monitor execution; handle blocked or overdue tours; consult the dashboard.
- **Main needs:** plan work in minutes; see the real state of execution at a glance; trace what was done, by whom, when.
- **Permissions (high level):** all platform functions — agents, zones, tours, dashboard; cannot be performed by agents.
- Status: **CONFIRMED**.

### 2.2 Cleaning agent (agent de propreté)

- **Role:** field operative performing the cleaning passes.
- **Responsibilities:** consult their daily assignments; perform the cleaning; record completion or block a tour with a reason.
- **Main needs:** a simple, mobile-friendly "today's work" list; record an action in under a minute; only see their own work.
- **Permissions (high level):** read their own tours (today + history of their own actions); mark done / blocked. No access to admin screens, other agents' data, or planning.
- Status: **CONFIRMED**.

### 2.3 Supervisor / team-leader

- Status: **TO BE CONFIRMED** — a third role (independent verification layer) was proposed in STEP 2.2. Included in the roadmap, not in the MVP, pending whether team leaders require a dedicated workflow.

### 2.4 Citizen

- Status: **OUT OF MVP** — citizen report submissions are future scope (§4).

---

## 3. MVP Scope

What is included in the MVP (approved in STEP 2.2, feature list):

| Feature                                                               | Priority  | MVP |
| --------------------------------------------------------------------- | --------- | --- |
| Authentication (email + password)                                     | MUST HAVE | Yes |
| Roles Admin / Agent (two-role RBAC)                                   | MUST HAVE | Yes |
| Zone management (create / list)                                       | MUST HAVE | Yes |
| Agent management (register / list)                                    | MUST HAVE | Yes |
| Cleaning-tour creation (zone, agent, date, daily/weekly recurrence)   | MUST HAVE | Yes |
| "Today's work" view for agents                                        | MUST HAVE | Yes |
| Tour completion / blocked recording (with reason)                     | MUST HAVE | Yes |
| Basic status dashboard (done / pending / overdue / blocked, per zone) | MUST HAVE | Yes |
| Audit trail on tour status changes (actor + timestamp)                | MUST HAVE | Yes |
| French user interface                                                 | MUST HAVE | Yes |

- MVP is **admin + agent**, web only (responsive).
- Priority mapping: items above are P0. Items retained as P1 (valuable, shortly after the core vertical slice) are listed in §5.2 and §15 roadmap.

---

## 4. Out of Scope (explicitly postponed)

- Citizen report portal (public submission + follow-up) — future.
- Real-time GPS tracking of agents — future.
- Native mobile applications (responsive web only).
- Map / GIS visualization of zones.
- Photo proof on completion.
- SMS / email notifications.
- Supervisor role and multi-level verification workflows.
- SSO / advanced identity; self-service account creation.
- Equipment, waste-bin, vehicle asset management; budget, payroll, procurement.
- Advanced reporting, analytics and exports.
- Full French/Arabic/English localization (see §10).

---

## 5. Functional Requirements

Every requirement is specific and testable. Status is per the classification legend.

### 5.1 P0 functional requirements (MVP)

| ID     | Requirement                                                                                                                                                                                                                                                | Status    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-001 | The system provides a login page accepting a registered email and password. On success, the user is signed in; on failure, an error is shown and no session is created.                                                                                    | CONFIRMED |
| FR-002 | Any signed-in user can end their session (logout). After logout, the user cannot reach protected pages even via the browser back button.                                                                                                                   | CONFIRMED |
| FR-003 | Every URL except the login page requires an authenticated session; anonymous and expired-session visitors are redirected to login.                                                                                                                         | CONFIRMED |
| FR-004 | On first deployment, the system seeds two roles (Admin, Agent) and one admin account using provided credentials, with a forced password change at first login. Initialization is idempotent (no duplicates).                                               | CONFIRMED |
| FR-005 | Access control is enforced server-side for every route and query: agents see only their own tours and cannot access admin pages; admins access everything. Direct requests to admin URLs by an agent return 403/redirect and no data.                      | CONFIRMED |
| FR-006 | An admin can create a login account for an agent with temporary credentials; the agent must change the password on first login.                                                                                                                            | CONFIRMED |
| FR-007 | An admin can register an agent with first name, last name, phone and zone. Missing required fields are rejected with a clear message.                                                                                                                      | CONFIRMED |
| FR-008 | An admin can list all agents with name, phone, zone and active status, with pagination.                                                                                                                                                                    | CONFIRMED |
| FR-009 | An admin can create a zone with a unique name; duplicate names are rejected.                                                                                                                                                                               | CONFIRMED |
| FR-010 | An admin can list all zones with name and active status.                                                                                                                                                                                                   | CONFIRMED |
| FR-011 | An admin can create a cleaning tour with zone, agent, start date, repetition (none / daily / weekly) and end date. One tour instance is generated for each planned date and appears in the admin and agent schedules. A tour without an agent is rejected. | CONFIRMED |
| FR-012 | An agent sees a "Today's work" list containing only their own tours for the current day (zone + status). If none, a clear "no work today" message is shown.                                                                                                | CONFIRMED |
| FR-013 | An agent can mark a pending tour "done"; the status change stores the acting user and a timestamp and removes the tour from the pending list.                                                                                                              | CONFIRMED |
| FR-014 | An agent can mark a pending tour "blocked" and select a predefined reason (e.g. inaccessible zone, equipment failure); the status change stores the reason, the acting user and a timestamp, and the reason is visible afterwards.                         | CONFIRMED |
| FR-015 | An admin can list tours and filter by zone, agent, date range and status; each result shows zone, agent, scheduled date, status and completion time where applicable.                                                                                      | CONFIRMED |
| FR-016 | The admin dashboard shows counts of done, pending, overdue and blocked tours for today (a tour whose scheduled date passed without a status change is "overdue"), broken down per zone.                                                                    | CONFIRMED |
| FR-017 | Every tour status change (done, blocked, and later reschedule/cancel) is recorded with actor and timestamp, forming an immutable audit trail.                                                                                                              | CONFIRMED |
| FR-018 | All interface labels, buttons and messages are displayed in French for the MVP.                                                                                                                                                                            | CONFIRMED |

### 5.2 P1 functional requirements (post vertical-slice, priority P1)

| ID     | Requirement                                                                                                                                                                                         | Status                 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR-101 | A signed-out user with a registered email can request a password reset; a one-time link is sent to that email. Expired or reused links are rejected; the old password stops working after a change. | CONFIRMED (in backlog) |
| FR-102 | An admin can edit an agent's phone and zone; changed zone affiliation applies to future tours.                                                                                                      | CONFIRMED (in backlog) |
| FR-103 | An admin can deactivate an agent: the agent can no longer sign in and is not selectable for new tours, but their data is preserved and shown as "inactive".                                         | CONFIRMED (in backlog) |
| FR-104 | An admin can rename a zone; the new name is reflected everywhere the zone is referenced.                                                                                                            | CONFIRMED (in backlog) |
| FR-105 | Zones referenced by agents or tours cannot be hard-deleted — only deactivated; deactivated zones are not selectable for new tours or agents.                                                        | CONFIRMED (in backlog) |
| FR-106 | An admin can reschedule or reassign an overdue/blocked tour (new date/agent) while keeping a reference to the original issue.                                                                       | CONFIRMED (in backlog) |
| FR-107 | An admin can edit or cancel a pending tour; cancelled tours are excluded from schedules and marked "cancelled" in the list.                                                                         | CONFIRMED (in backlog) |
| FR-108 | An admin can add dated, authored follow-up notes on a blocked tour; the full note history is visible.                                                                                               | CONFIRMED (in backlog) |
| FR-109 | The dashboard shows a per-zone weekly completion rate (done / planned) for the last 4 weeks; weeks with no planned tours show "no data", not 0 %.                                                   | CONFIRMED (in backlog) |

---

## 6. User Workflows (critical end-to-end)

```text
Workflow 1 — Plan a cleaning tour
User    → Admin opens zone management, creates/selects a zone
Action  → Creates a tour with an agent, start date and repetition
System  → Generates the planned instances and publishes them to the schedules
Result  → Plan is recorded: who cleans what, where, when

Workflow 2 — Execute and verify a tour
User    → Agent opens "Today's work"
Action  → Performs the cleaning, marks the tour done (or blocked + reason)
System  → Records status, actor and timestamp; updates the admin dashboard
Result  → Execution is traceable and attributable

Workflow 3 — Follow up on missed or blocked tours
User    → Admin opens the dashboard, sees overdue/blocked tours
Action  → Reschedules, reassigns or logs a follow-up action
System  → Keeps the audit trail of the change
Result  → Exceptions are handled and the loop is closed
```

---

## 7. User Stories (approved backlogs)

### 7.1 P0 backlog (MVP)

| ID       | Epic                | User story                                                                                                                                       |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AUTH-001 | Authentication      | As an administrator, I want to log in with my email and password so that I can securely access the platform                                      |
| AUTH-002 | Authentication      | As a user, I want to log out so that my session is terminated                                                                                    |
| AUTH-003 | Authentication      | As an administrator, I want protected pages to be blocked for anonymous visitors so that municipal data is not exposed                           |
| ROL-001  | Roles & users       | As a system, I want Admin and Agent roles and a first admin account to be created on first deployment so that the platform is usable immediately |
| ROL-002  | Roles & users       | As an admin, I want role-based access so that agents see only their own work and only admins manage the platform                                 |
| ROL-003  | Roles & users       | As an admin, I want to create a login account for each agent so that agents can sign in                                                          |
| AGT-001  | Agents              | As an admin, I want to register a cleaning agent (name, phone, zone) so that the workforce is inventoried                                        |
| AGT-002  | Agents              | As an admin, I want to list all agents so that I can consult the workforce at a glance                                                           |
| ZON-001  | Zones               | As an admin, I want to create a cleanliness zone with a name so that work can be organized per sector                                            |
| ZON-002  | Zones               | As an admin, I want to list all zones so that I can consult the municipality sectors                                                             |
| CLE-001  | Cleaning operations | As an admin, I want to create a cleaning tour (zone, agent, date, daily/weekly recurrence) so that cleaning passes are planned and scheduled     |
| CLE-002  | Cleaning operations | As an agent, I want to see my "Today's work" list so that I know what to clean                                                                   |
| CLE-003  | Cleaning operations | As an agent, I want to mark a tour as done so that execution is recorded with a timestamp                                                        |
| CLE-004  | Cleaning operations | As an agent, I want to mark a tour as blocked with a reason so that problems are escalated                                                       |
| CLE-005  | Cleaning operations | As an admin, I want to list tours with filters (zone, agent, date, status) so that I can follow execution                                        |
| DSH-001  | Dashboard           | As an admin, I want a daily status dashboard (done / pending / overdue / blocked, per zone) so that I can monitor execution vs. plan             |
| LOC-001  | Localisation        | As an admin, I want the entire interface in French so that municipal staff can use it                                                            |

### 7.2 P1 backlog (following the vertical slice)

| ID       | Epic                | User story                                                                                             |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| AUTH-004 | Authentication      | As a user, I want to reset a forgotten password so that I can regain access                            |
| AGT-003  | Agents              | As an admin, I want to edit an agent's details and zone so that data stays accurate                    |
| AGT-004  | Agents              | As an admin, I want to deactivate an agent so that they appear in no new assignments and cannot log in |
| ZON-003  | Zones               | As an admin, I want to rename a zone so that the naming stays accurate                                 |
| ZON-004  | Zones               | As an admin, I want to deactivate a zone (no hard delete) so that referenced data is kept consistent   |
| CLE-006  | Cleaning operations | As an admin, I want to reschedule or reassign an overdue/blocked tour so that missed work is recovered |
| CLE-007  | Cleaning operations | As an admin, I want to edit or cancel a not-yet-executed tour so that plans stay accurate              |
| CLE-008  | Cleaning operations | As an admin, I want to add a follow-up note on a blocked tour so that the issue history is recorded    |
| DSH-002  | Dashboard           | As an admin, I want a weekly completion rate per zone so that I can spot trends                        |

---

## 8. Acceptance Criteria

### 8.1 P0 — Authentication (AUTH-001…003, FR-001…003)

```text
AUTH-001 (login)
Given a registered account with valid credentials
When the user submits the login form with the correct email and password
Then the user is signed in and redirected to their home page (admin → dashboard)

Given any login attempt with a wrong email or wrong password
When the user submits the form
Then an error message is displayed and no session is created

Given a successful login
When the user navigates to any platform page
Then the authenticated user is identifiable by the system (for audit trail)

AUTH-002 (logout)
Given a signed-in user
When the user clicks "Se déconnecter"
Then the session is destroyed and the user is redirected to the login page

Given a user who logged out
When they press the browser's back button
Then they do not regain access to the protected page; a login is required

AUTH-003 (protected routes)
Given an unauthenticated visitor
When they request any URL other than the login page
Then they are redirected to the login page and the requested data is not returned

Given an authenticated user with an expired/invalid session
When they request a protected page
Then they are redirected to the login page
```

### 8.2 P0 — Roles & users (ROL-001…003, FR-004…006)

```text
ROL-001 (bootstrap)
Given a fresh deployment of the platform
When the system initializes
Then the roles "Admin" and "Agent" exist and one admin account (seeded credentials, password change required at first login) can sign in

Given the initialization has already run
When the system starts again
Then roles and the first admin are not duplicated

ROL-002 (role-based access)
Given a signed-in agent
When they browse the platform
Then they see only their own tours and never the agent, zone, tour-management or dashboard pages

Given a signed-in admin
When they browse the platform
Then they can access agent, zone, tour-management and dashboard pages

Given an agent who directly requests an admin URL
When the page loads
Then access is denied (403 or redirect) and the admin data is not returned

ROL-003 (agent accounts)
Given a signed-in admin, one existing zone and an agent profile
When the admin creates the agent account
Then the agent can sign in with the generated temporary credentials

Given an account created with temporary credentials
When the agent signs in for the first time
Then they are required to set a new password before accessing the platform
```

### 8.3 P0 — Agents & zones (AGT-001…002, ZON-001…002, FR-007…010)

```text
AGT-001 (register agent)
Given a signed-in admin and at least one zone
When the admin creates an agent with first name, last name, phone and a zone
Then the agent appears in the agent list and can be assigned to tours

Given a submission missing a required field (name or zone)
When the admin submits the form
Then an error message shows the missing field and no agent is created

AGT-002 (list agents)
Given agents registered in the system
When the admin opens the agent list
Then every agent is shown with name, phone, zone and active status

Given a list with more results than the page can hold
When the admin navigates the list
Then pagination works without data loss

ZON-001 (create zone)
Given a signed-in admin
When the admin creates a zone with a unique name
Then the zone appears in the zone list and is selectable when creating tours and registering agents

Given a zone name that already exists
When the admin submits the form
Then an error message is shown and no duplicate zone is created

ZON-002 (list zones)
Given zones registered in the system
When the admin opens the zone list
Then every zone is shown with its name and active status
```

### 8.4 P0 — Cleaning operations (CLE-001…005, FR-011…015)

```text
CLE-001 (create tour)
Given a signed-in admin, at least one zone and one agent
When the admin creates a tour with a zone, an agent, a start date and a repetition (daily or weekly) and an end date
Then one tour instance is generated for each planned date and appears in the schedules of the admin and the assigned agent

Given a tour with no agent selected
When the admin submits the tour
Then the tour is not saved and the missing agent is pointed out

Given a single-occurrence tour (no repetition)
When the tour is saved
Then exactly one instance exists for the chosen date

CLE-002 (today's work)
Given a signed-in agent with tours assigned for today
When the agent opens "Travaux du jour"
Then all their tours for today are listed, each with the zone name and status

Given an agent with no tour today
When the agent opens "Travaux du jour"
Then a clear "no work today" message is displayed

Given another agent's tour
When the agent opens "Travaux du jour"
Then that tour is never shown (own-tours only)

CLE-003 (mark done)
Given a tour with status "pending" on today's list
When the agent confirms "marked done"
Then the tour status becomes "done", and the agent's identity and a timestamp are stored

Given a tour marked "done"
When the agent opens the list again
Then the tour no longer appears as pending and shows status "done"

CLE-004 (mark blocked)
Given a tour with status "pending" on today's list
When the agent selects "blocked" and a predefined reason (e.g. inaccessible zone, equipment failure)
Then the tour status becomes "blocked" with the reason, the agent's identity and a timestamp

Given a tour with status "blocked"
When the agent opens the list again
Then the block reason is visible on the tour

CLE-005 (admin tour list)
Given tours in the system
When the admin opens the tour list
Then each tour shows zone, agent, scheduled date, status and completion time where applicable

Given the admin applies one or more filters (zone, agent, date range, status)
When the list is refreshed
Then only the matching tours are shown
```

### 8.5 P0 — Dashboard & language (DSH-001, LOC-001, FR-016…018)

```text
DSH-001 (daily dashboard)
Given tours planned today
When the admin opens the dashboard
Then the total counts of done, pending, blocked and overdue tours are displayed

Given tours attached to multiple zones
When the admin opens the dashboard
Then the same four counts are broken down per zone

Given a tour whose scheduled date has passed without a status change
When the dashboard is rendered
Then that tour is counted as "overdue"

LOC-001 (French interface)
Given any page of the platform
When it is rendered
Then all labels, messages and buttons are displayed in French (e.g. "Se connecter", "Travaux du jour", "Marquer fait")

Given a validation error
When it is displayed
Then the message is shown in French and is understandable

FR-017 (audit trail)
Given any status change on a tour (done, blocked, rescheduled, cancelled)
When the change is saved
Then the acting user's identity and a timestamp are stored in the tour's history
```

### 8.6 P1 acceptance criteria

```text
AUTH-004 (password reset)
Given a signed-out user whose email is registered
When they request a password reset
Then a one-time reset link is sent to that email

Given a valid reset link
When the user sets a new password
Then they can sign in with the new password and the old one no longer works

Given an expired or already-used reset link
When the user follows it
Then no password change is applied and an error is shown

AGT-003 (edit agent)
Given an existing agent
When the admin changes their phone or zone and saves
Then the agent list reflects the change

Given an agent whose zone changes
When future tours are generated
Then new tours are assigned to the new zone

AGT-004 (deactivate agent)
Given an active agent
When the admin deactivates them
Then the agent can no longer sign in and is no longer selectable for new tours

Given a deactivated agent
When the admin filters the agent list
Then the agent still appears with status "inactive" (data is not deleted)

ZON-003 (rename zone)
Given an existing zone
When the admin renames it and saves
Then the new name is shown everywhere the zone is referenced

ZON-004 (deactivate zone)
Given a zone referenced by agents or tours
When the admin asks to delete it
Then deletion is refused and only deactivation is offered

Given a deactivated zone
When new tours or agents are created
Then the zone is not selectable

CLE-006 (reschedule/reassign)
Given a tour with status "overdue" or "blocked"
When the admin changes its date or agent
Then the tour is updated with the new date/agent and keeps a reference to the original issue

Given a rescheduled tour
When the new date arrives
Then it appears on the assigned agent's "Today's work" list

CLE-007 (edit/cancel)
Given a tour with status "pending" and a future date
When the admin edits its zone/agent/date
Then the changes are reflected in both admin and agent views

Given a pending tour
When the admin cancels it
Then the tour is marked "cancelled", removed from both schedules and shown as such in the tour list

CLE-008 (follow-up note)
Given a blocked tour
When the admin adds a note (e.g. "2nd attempt planned") and saves
Then the note is stored with the admin's name and a timestamp

Given a blocked tour with notes
When it is viewed later
Then the full history of notes is visible

DSH-002 (weekly trend)
Given recorded tour execution over several weeks
When the admin opens the dashboard
Then a completion rate (done / planned) per zone for the last 4 weeks is displayed

Given a week with no planned tours in a zone
When the trend is rendered
Then that week shows "no data" rather than 0 %
```

---

## 9. Non-Functional Requirements

Only requirements justified by the project are listed; unknown items are marked TO BE CONFIRMED.

| ID      | Category             | Requirement                                                                                                     | Status                      |
| ------- | -------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| NFR-001 | Security             | Passwords are stored hashed; sessions are server-side; no secrets are committed to the repository               | CONFIRMED                   |
| NFR-002 | Security             | Authorization is enforced server-side on every request (a crafted request must not expose another agent's data) | CONFIRMED                   |
| NFR-003 | Security             | Failed-login throttling to deter brute force                                                                    | PROPOSED                    |
| NFR-004 | Availability         | Platform usable during municipal working hours, target 99 % availability                                        | PROPOSED                    |
| NFR-005 | Performance          | Admin creates a tour in < 5 min; agent records a completion in < 60 s                                           | PROPOSED (targets)          |
| NFR-006 | Mobile/field usage   | Responsive web UI usable on common smartphones                                                                  | PROPOSED                    |
| NFR-007 | Offline operation    | If pilot agents lack reliable connectivity, a confirmation or offline mechanism is required                     | TO BE CONFIRMED             |
| NFR-008 | Auditability         | Every tour status change stores actor + timestamp, immutable history                                            | CONFIRMED                   |
| NFR-009 | Internationalisation | MVP interface is French; Arabic decision pending                                                                | CONFIRMED / TO BE CONFIRMED |
| NFR-010 | Accessibility        | Forms keyboard-navigable; readable contrast (basic WCAG)                                                        | PROPOSED                    |
| NFR-011 | Data retention       | Backup and retention period under municipal data rules                                                          | TO BE CONFIRMED             |
| NFR-012 | Scale                | Target pilot size (number of zones, agents, tours per day)                                                      | TO BE CONFIRMED             |

---

## 10. Languages

The existing codebase has typed locale support for **French, Arabic and English** (scaffold). This document does **not** assume complete functional internationalization is implemented.

- **MVP language requirement:** the UI must be delivered in **French** for the MVP (NFR-009, FR-018). This is the demo and administration language. — **CONFIRMED**
- **Arabic:** proposed for field agents; whether it is required for the pilot depends on whether pilot agents are Arabic-only. If confirmed, Arabic becomes a P0 requirement (LOC-002). — **TO BE CONFIRMED**
- **English:** proposed for a later phase; not part of the MVP. — **PROPOSED**
- User-entered data (zone names, notes) language: Arabic/French mix acceptable in MVP — **TO BE CONFIRMED**.

---

## 11. MVP Success Criteria

Measurable criteria. All numerical targets are **proposed targets** and must be validated by the product owner before the pilot starts. A checkmark column is left for the owner.

| Criteria                                                                                 | Target                                                                   | Status                            |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------- |
| Tour execution recorded digitally during the pilot (baseline: no digital tracking today) | 100 % of planned MVP tours recorded over a 4-week pilot                  | PROPOSED                          |
| Agent adoption (pilot team)                                                              | 100 % of pilot agents active daily; ≥ 80 % onboarded in week 1           | PROPOSED                          |
| Tour creation latency                                                                    | Admin creates a tour in < 5 minutes                                      | PROPOSED                          |
| Agent check-in latency                                                                   | Agent records completion in < 60 seconds                                 | PROPOSED                          |
| Traceability                                                                             | ≥ 90 % of completions recorded within 24 h of execution                  | PROPOSED                          |
| Reliability                                                                              | 0 data loss; ≥ 99 % availability during working hours                    | PROPOSED                          |
| User perception                                                                          | ≥ 70 % of pilot users rate the tool "useful"; ≥ 70 % would keep using it | PROPOSED                          |
| Business validation                                                                      | Product owner confirms pilot phase and post-MVP roadmap                  | CONFIRMED (outcome, not a number) |

---

## 12. Risks and Open Questions

### 12.1 Unresolved project constraints (from RAPPORT-ANALYSE.md — all TO BE CONFIRMED)

1. Formal **objectives / deliverables** of the project — missing.
2. **Constraints and deadlines** (launch / pilot date) — missing.
3. **Budget** — missing.
4. **Team** (who builds / maintains the product) — missing.
5. **Stakeholders** and who owns product decisions — missing.

### 12.2 Open product decisions (need product-owner approval)

6. Pilot scale and scope: number of zones, agents and daily tours.
7. Must a citizen-report flow appear in the first demonstration? (would promote citizen reports to MVP scope)
8. Is a dedicated supervisor/team-leader role needed immediately?
9. Do agents have company smartphones and connectivity? (drives NFR-006/007)
10. Zone definition: existing municipal GIS/découpage or named approximate areas for the MVP?
11. Language: are pilot agents Arabic-only? (would promote Arabic UI to P0)
12. Completion verification: trust-based self-report vs. supervisor confirmation vs. photo proof.

### 12.3 Main risks

| Risk                                                  | Impact                            | Mitigation                                                       |
| ----------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| Scope creep (citizen portal, mapping pulled into MVP) | MVP delayed                       | DoD excludes P1/P2 features; owner approves scope at §3/§4       |
| Low agent adoption                                    | Pilot invalid                     | Field-first UX (today's work), short onboarding, owner champions |
| Connectivity gaps in the field                        | Check-in impossible               | Decide NFR-007 early (offline or supervisor confirmation)        |
| Arabic-only agents without Arabic UI                  | Usability failure                 | Decision 11 must be taken before build                           |
| Missing stakeholder/governance                        | Wrong priorities, endless changes | Owner named at §12.1; PRD approval gate before STEP 3            |

---

## 13. MVP Definition of Done

The MVP is complete only when **all** of the following hold:

1. Every **P0 story** (AUTH-001…003, ROL-001…003, AGT-001…002, ZON-001…002, CLE-001…005, DSH-001, LOC-001) is implemented and its acceptance criteria pass (§8).
2. A **fresh deployment** produces Admin + Agent roles and a first admin account; the platform is usable immediately.
3. The **operational loop is demonstrated end-to-end**: admin creates zones, registers agents, plans recurring tours; agent signs in, sees only their own tours, marks done/blocked; dashboard reflects done/pending/overdue/blocked per zone.
4. **Access control verified by automated test** (agent cannot reach admin pages or other agents' data).
5. **Audit trail** exists on every tour status change (actor + timestamp).
6. **Quality gates:** `lint`, `typecheck`, `test` all pass; unit/E2E tests cover P0 acceptance criteria; French UI in place.
7. **Pilot readiness:** shared pilot environment, agents onboarded, and §11 baseline metrics are collectable.
8. **No P1/P2 leakage:** scope is limited to §3.
9. **This PRD is approved** by the product owner — the entry condition for STEP 3 (architecture).

The DoD **cannot** be declared while items in §12.2 (notably 9 — connectivity, and 11 — language) remain unresolved, because they change requirements NFR-007 and FR/LOC scope.

---

## 14. Future Roadmap

| Phase                   | Content                                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2 (post vertical slice) | P1 backlog (password reset, edit/deactivate, rename/deactivate, reschedule/reassign, edit/cancel, notes, weekly trend); Arabic UI if required (LOC-002); citizen-report pilot |
| 3                       | Citizen reports (public + follow-up, CIT-001); zone mapping (MAP-001); photo proof (PHO-001); supervisor role (SUP-001)                                                       |
| 4                       | Notifications (SMS/email, NOT-001); real-time GPS (GPS-001); advanced reporting/exports (REP-001); English UI                                                                 |

---

## Appendix A — MVP feature list (approved)

| Feature                                    | Priority       | MVP?                  |
| ------------------------------------------ | -------------- | --------------------- |
| Authentication (email + password)          | MUST HAVE      | Yes                   |
| Roles Admin / Agent (RBAC)                 | MUST HAVE      | Yes                   |
| Zones — create / list                      | MUST HAVE      | Yes                   |
| Agents — register / list                   | MUST HAVE      | Yes                   |
| Tours — create with recurrence             | MUST HAVE      | Yes                   |
| Today's work (agent)                       | MUST HAVE      | Yes                   |
| Mark done / blocked                        | MUST HAVE      | Yes                   |
| Basic status dashboard                     | MUST HAVE      | Yes                   |
| Audit trail                                | MUST HAVE      | Yes                   |
| French UI                                  | MUST HAVE      | Yes                   |
| Arabic UI                                  | SHOULD HAVE ⚠️ | No (pending decision) |
| Citizen reports                            | SHOULD HAVE    | No                    |
| Supervisor role                            | SHOULD HAVE ⚠️ | No                    |
| Photo proof                                | COULD HAVE     | No                    |
| Map/GIS                                    | COULD HAVE     | No                    |
| Advanced reporting                         | COULD HAVE     | No                    |
| English UI                                 | COULD HAVE     | No                    |
| GPS tracking / notifications / native apps | OUT OF MVP     | No                    |

## Appendix B — P0 backlog (see §7.1) · Appendix C — P1 backlog (see §7.2)

The P0 and P1 backlogs are fully itemized in §7, with acceptance criteria in §8 and dependencies in RAPPORT-BACKLOG.md (STEP 2.3). Key dependency rule repeated here: **AUTH-001 → ROL-001 → ROL-002** gates every operations feature; nothing operations-side is built before auth and role-based access exist.
