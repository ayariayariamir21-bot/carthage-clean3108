# STEP 2.3 — USER STORIES AND ACCEPTANCE CRITERIA (CARTHAGE-CLEAN)

Source: approved MVP (RAPPORT-MVP.md, STEP 2.2).
Epics are limited to functionality supported by the MVP. No application code is written in this step.

---

## MVP backlog (prioritized)

Priorities: **P0** critical for MVP · **P1** important · **P2** later.

| ID       | Epic                | User story                                                                                                                                       | Priority | Dependencies              |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------- |
| AUTH-001 | Authentication      | As an administrator, I want to log in with my email and password so that I can securely access the platform                                      | P0       | —                         |
| AUTH-002 | Authentication      | As a user, I want to log out so that my session is terminated                                                                                    | P0       | AUTH-001                  |
| AUTH-003 | Authentication      | As an administrator, I want protected pages to be blocked for anonymous visitors so that municipal data is not exposed                           | P0       | AUTH-001                  |
| AUTH-004 | Authentication      | As a user, I want to reset a forgotten password so that I can regain access                                                                      | P1       | AUTH-001                  |
| ROL-001  | Roles & users       | As a system, I want Admin and Agent roles and a first admin account to be created on first deployment so that the platform is usable immediately | P0       | AUTH-001                  |
| ROL-002  | Roles & users       | As an admin, I want role-based access so that agents see only their own work and only admins manage the platform                                 | P0       | ROL-001                   |
| ROL-003  | Roles & users       | As an admin, I want to create a login account for each agent so that agents can sign in                                                          | P0       | ROL-001                   |
| AGT-001  | Agents              | As an admin, I want to register a cleaning agent (name, phone, zone) so that the workforce is inventoried                                        | P0       | ROL-003, ZON-001          |
| AGT-002  | Agents              | As an admin, I want to list all agents so that I can consult the workforce at a glance                                                           | P0       | AGT-001                   |
| AGT-003  | Agents              | As an admin, I want to edit an agent's details and zone so that data stays accurate                                                              | P1       | AGT-001                   |
| AGT-004  | Agents              | As an admin, I want to deactivate an agent so that they appear in no new assignments and cannot log in                                           | P1       | AGT-001, ROL-003          |
| ZON-001  | Zones               | As an admin, I want to create a cleanliness zone with a name so that work can be organized per sector                                            | P0       | —                         |
| ZON-002  | Zones               | As an admin, I want to list all zones so that I can consult the municipality sectors                                                             | P0       | ZON-001                   |
| ZON-003  | Zones               | As an admin, I want to rename a zone so that the naming stays accurate                                                                           | P1       | ZON-001                   |
| ZON-004  | Zones               | As an admin, I want to deactivate a zone (no hard delete) so that referenced data is kept consistent                                             | P1       | ZON-001                   |
| CLE-001  | Cleaning operations | As an admin, I want to create a cleaning tour (zone, agent, date, daily/weekly recurrence) so that cleaning passes are planned and scheduled     | P0       | ZON-001, AGT-001          |
| CLE-002  | Cleaning operations | As an agent, I want to see my "Today's work" list so that I know what to clean                                                                   | P0       | CLE-001, ROL-002          |
| CLE-003  | Cleaning operations | As an agent, I want to mark a tour as done so that execution is recorded with a timestamp                                                        | P0       | CLE-002                   |
| CLE-004  | Cleaning operations | As an agent, I want to mark a tour as blocked with a reason so that problems are escalated                                                       | P0       | CLE-002                   |
| CLE-005  | Cleaning operations | As an admin, I want to list tours with filters (zone, agent, date, status) so that I can follow execution                                        | P0       | CLE-001                   |
| CLE-006  | Cleaning operations | As an admin, I want to reschedule or reassign an overdue/blocked tour so that missed work is recovered                                           | P1       | CLE-004                   |
| CLE-007  | Cleaning operations | As an admin, I want to edit or cancel a not-yet-executed tour so that plans stay accurate                                                        | P1       | CLE-001                   |
| CLE-008  | Cleaning operations | As an admin, I want to add a follow-up note on a blocked tour so that the issue history is recorded                                              | P1       | CLE-004                   |
| DSH-001  | Dashboard           | As an admin, I want a daily status dashboard (done / pending / overdue / blocked, per zone) so that I can monitor execution vs. plan             | P0       | CLE-003, CLE-004, CLE-005 |
| DSH-002  | Dashboard           | As an admin, I want a weekly completion rate per zone so that I can spot trends                                                                  | P1       | DSH-001                   |
| LOC-001  | Localisation        | As an admin, I want the entire interface in French so that municipal staff can use it                                                            | P0       | —                         |

---

## P0 user stories (full details)

### AUTH-001 — Login

Epic: Authentication · User: administrator

> As an administrator, I want to log in with my email and password so that I can securely access the platform.

Acceptance criteria:

```text
Given a registered account with valid credentials
When the user submits the login form with the correct email and password
Then the user is signed in and redirected to their home page (admin → dashboard)

Given any login attempt with a wrong email or wrong password
When the user submits the form
Then an error message is displayed and no session is created

Given a successful login
When the user navigates to any platform page
Then the authenticated user is identifiable by the system (for audit trail)
```

### AUTH-002 — Logout

Epic: Authentication · User: any authenticated user

> As a user, I want to log out so that my session is terminated.

Acceptance criteria:

```text
Given a signed-in user
When the user clicks "Se déconnecter"
Then the session is destroyed and the user is redirected to the login page

Given a user who logged out
When they press the browser's back button
Then they do not regain access to the protected page; a login is required
```

### AUTH-003 — Protected routes

Epic: Authentication · User: administrator

> As an administrator, I want protected pages to be blocked for anonymous visitors so that municipal data is not exposed.

Acceptance criteria:

```text
Given an unauthenticated visitor
When they request any URL other than the login page
Then they are redirected to the login page and the requested data is not returned

Given an authenticated user with an expired/invalid session
When they request a protected page
Then they are redirected to the login page
```

### ROL-001 — Bootstrap roles and first admin

Epic: Roles & users · User: system/administrator

> As a system, I want Admin and Agent roles and a first admin account to be created on first deployment so that the platform is usable immediately.

Acceptance criteria:

```text
Given a fresh deployment of the platform
When the system initializes
Then the roles "Admin" and "Agent" exist and one admin account (seeded credentials, password change required at first login) can sign in

Given the initialization has already run
When the system starts again
Then roles and the first admin are not duplicated
```

### ROL-002 — Role-based access

Epic: Roles & users · User: administrator

> As an admin, I want role-based access so that agents see only their own work and only admins manage the platform.

Acceptance criteria:

```text
Given a signed-in agent
When they browse the platform
Then they see only their own tours and never the agent, zone, tour-management or dashboard pages

Given a signed-in admin
When they browse the platform
Then they can access agent, zone, tour-management and dashboard pages

Given an agent who directly requests an admin URL
When the page loads
Then access is denied (403 or redirect) and the admin data is not returned
```

### ROL-003 — Admin creates agent accounts

Epic: Roles & users · User: administrator

> As an admin, I want to create a login account for each agent so that agents can sign in.

Acceptance criteria:

```text
Given a signed-in admin, one existing zone and an agent profile
When the admin creates the agent account
Then the agent can sign in with the generated temporary credentials

Given an account created with temporary credentials
When the agent signs in for the first time
Then they are required to set a new password before accessing the platform
```

### AGT-001 — Register agent

Epic: Agents · User: administrator

> As an admin, I want to register a cleaning agent (name, phone, zone) so that the workforce is inventoried.

Acceptance criteria:

```text
Given a signed-in admin and at least one zone
When the admin creates an agent with first name, last name, phone and a zone
Then the agent appears in the agent list and can be assigned to tours

Given a submission missing a required field (name or zone)
When the admin submits the form
Then an error message shows the missing field and no agent is created

Given an agent assigned to a zone
When that zone is displayed
Then the agent's affiliation is consistent in the agent list
```

### AGT-002 — List agents

Epic: Agents · User: administrator

> As an admin, I want to list all agents so that I can consult the workforce at a glance.

Acceptance criteria:

```text
Given agents registered in the system
When the admin opens the agent list
Then every agent is shown with name, phone, zone and active status

Given a list with more results than the page can hold
When the admin navigates the list
Then pagination works without data loss
```

### ZON-001 — Create zone

Epic: Zones · User: administrator

> As an admin, I want to create a cleanliness zone with a name so that work can be organized per sector.

Acceptance criteria:

```text
Given a signed-in admin
When the admin creates a zone with a unique name
Then the zone appears in the zone list and is selectable when creating tours and registering agents

Given a zone name that already exists
When the admin submits the form
Then an error message is shown and no duplicate zone is created
```

### ZON-002 — List zones

Epic: Zones · User: administrator

> As an admin, I want to list all zones so that I can consult the municipality sectors.

Acceptance criteria:

```text
Given zones registered in the system
When the admin opens the zone list
Then every zone is shown with its name and active status
```

### CLE-001 — Create tour (with recurrence)

Epic: Cleaning operations · User: administrator

> As an admin, I want to create a cleaning tour (zone, agent, date, daily/weekly recurrence) so that cleaning passes are planned and scheduled.

Acceptance criteria:

```text
Given a signed-in admin, at least one zone and one agent
When the admin creates a tour with a zone, an agent, a start date and a repetition (daily or weekly) and an end date
Then one tour instance is generated for each planned date and appears in the schedules of the admin and the assigned agent

Given a tour with no agent selected
When the admin submits the tour
Then the tour is not saved and the missing agent is pointed out

Given a single-occurrence tour (no repetition)
When the tour is saved
Then exactly one instance exists for the chosen date
```

### CLE-002 — Today's work

Epic: Cleaning operations · User: agent

> As an agent, I want to see my "Today's work" list so that I know what to clean.

Acceptance criteria:

```text
Given a signed-in agent with tours assigned for today
When the agent opens "Travaux du jour"
Then all their tours for today are listed, each with the zone name and status

Given an agent with no tour today
When the agent opens "Travaux du jour"
Then a clear "no work today" message is displayed

Given another agent's tour
When the agent opens "Travaux du jour"
Then that tour is never shown (own-tours only)
```

### CLE-003 — Mark tour done

Epic: Cleaning operations · User: agent

> As an agent, I want to mark a tour as done so that execution is recorded with a timestamp.

Acceptance criteria:

```text
Given a tour with status "pending" on today's list
When the agent confirms "marked done"
Then the tour status becomes "done", and the agent's identity and a timestamp are stored

Given a tour marked "done"
When the agent opens the list again
Then the tour no longer appears as pending and shows status "done"
```

### CLE-004 — Mark tour blocked

Epic: Cleaning operations · User: agent

> As an agent, I want to mark a tour as blocked with a reason so that problems are escalated.

Acceptance criteria:

```text
Given a tour with status "pending" on today's list
When the agent selects "blocked" and a predefined reason (e.g. inaccessible zone, equipment failure)
Then the tour status becomes "blocked" with the reason, the agent's identity and a timestamp

Given a tour with status "blocked"
When the agent opens the list again
Then the block reason is visible on the tour
```

### CLE-005 — Admin tour list

Epic: Cleaning operations · User: administrator

> As an admin, I want to list tours with filters (zone, agent, date, status) so that I can follow execution.

Acceptance criteria:

```text
Given tours in the system
When the admin opens the tour list
Then each tour shows zone, agent, scheduled date, status and completion time where applicable

Given the admin applies one or more filters (zone, agent, date range, status)
When the list is refreshed
Then only the matching tours are shown
```

### DSH-001 — Daily status dashboard

Epic: Dashboard · User: administrator

> As an admin, I want a daily status dashboard (done / pending / overdue / blocked, per zone) so that I can monitor execution vs. plan.

Acceptance criteria:

```text
Given tours planned today
When the admin opens the dashboard
Then the total counts of done, pending, blocked and overdue tours are displayed

Given tours attached to multiple zones
When the admin opens the dashboard
Then the same four counts are broken down per zone

Given a tour whose scheduled date has passed without a status change
When the dashboard is rendered
Then that tour is counted as "overdue"
```

### LOC-001 — French interface

Epic: Localisation · User: administrator

> As an admin, I want the entire interface in French so that municipal staff can use it.

Acceptance criteria:

```text
Given any page of the platform
When it is rendered
Then all labels, messages and buttons are displayed in French (e.g. "Se connecter", "Travaux du jour", "Marquer fait")

Given a validation error
When it is displayed
Then the message is shown in French and is understandable
```

---

## P1 user stories (full details)

### AUTH-004 — Password reset

> As a user, I want to reset a forgotten password so that I can regain access.

```text
Given a signed-out user whose email is registered
When they request a password reset
Then a one-time reset link is sent to that email

Given a valid reset link
When the user sets a new password
Then they can sign in with the new password and the old one no longer works

Given an expired or already-used reset link
When the user follows it
Then no password change is applied and an error is shown
```

### AGT-003 — Edit agent

> As an admin, I want to edit an agent's details and zone so that data stays accurate.

```text
Given an existing agent
When the admin changes their phone or zone and saves
Then the agent list reflects the change

Given an agent whose zone changes
When future tours are generated
Then new tours are assigned to the new zone
```

### AGT-004 — Deactivate agent

> As an admin, I want to deactivate an agent so that they appear in no new assignments and cannot log in.

```text
Given an active agent
When the admin deactivates them
Then the agent can no longer sign in and is no longer selectable for new tours

Given a deactivated agent
When the admin filters the agent list
Then the agent still appears with status "inactive" (data is not deleted)
```

### ZON-003 — Rename zone

> As an admin, I want to rename a zone so that the naming stays accurate.

```text
Given an existing zone
When the admin renames it and saves
Then the new name is shown everywhere the zone is referenced
```

### ZON-004 — Deactivate zone

> As an admin, I want to deactivate a zone (no hard delete) so that referenced data is kept consistent.

```text
Given a zone referenced by agents or tours
When the admin asks to delete it
Then deletion is refused and only deactivation is offered

Given a deactivated zone
When new tours or agents are created
Then the zone is not selectable
```

### CLE-006 — Reschedule / reassign

> As an admin, I want to reschedule or reassign an overdue/blocked tour so that missed work is recovered.

```text
Given a tour with status "overdue" or "blocked"
When the admin changes its date or agent
Then the tour is updated with the new date/agent and keeps a reference to the original issue

Given a rescheduled tour
When the new date arrives
Then it appears on the assigned agent's "Today's work" list
```

### CLE-007 — Edit / cancel tour

> As an admin, I want to edit or cancel a not-yet-executed tour so that plans stay accurate.

```text
Given a tour with status "pending" and a future date
When the admin edits its zone/agent/date
Then the changes are reflected in both admin and agent views

Given a pending tour
When the admin cancels it
Then the tour is marked "cancelled", removed from both schedules and shown as such in the tour list
```

### CLE-008 — Follow-up note on blocked tour

> As an admin, I want to add a follow-up note on a blocked tour so that the issue history is recorded.

```text
Given a blocked tour
When the admin adds a note (e.g. "2nd attempt planned") and saves
Then the note is stored with the admin's name and a timestamp

Given a blocked tour with notes
When it is viewed later
Then the full history of notes is visible
```

### DSH-002 — Weekly completion trend

> As an admin, I want a weekly completion rate per zone so that I can spot trends.

```text
Given recorded tour execution over several weeks
When the admin opens the dashboard
Then a completion rate (done / planned) per zone for the last 4 weeks is displayed

Given a week with no planned tours in a zone
When the trend is rendered
Then that week shows "no data" rather than 0 %
```

---

## P2 / future stories (briefly listed)

- **CIT-001 — Citizen reports**: As a citizen, I want to report a cleanliness issue in my neighborhood and follow its resolution.
- **MAP-001 — Zone mapping**: As an admin, I want to visualize zones and tours on a map.
- **LOC-002 — Arabic UI**: As an agent, I want the interface in Arabic (pending the decision in RAPPORT-MVP.md §7 — becomes P0 if agents are Arabic-only).
- **PHO-001 — Photo proof**: As an agent, I want to attach a photo when completing a tour.
- **SUP-001 — Supervisor role**: As a supervisor, I want to independently validate completed tours.
- **NOT-001 — Notifications**: As an admin, I want to be notified (SMS/email) of blocked or overdue tours.
- **GPS-001 — Real-time tracking**: As an admin, I want to see agents' live positions.
- **REP-001 — Advanced reporting**: As an admin, I want to export operational KPIs to PDF/Excel.

---

## Dependencies

```text
AUTH-001 (login)
 └─ AUTH-002 (logout), AUTH-003 (protected routes)

AUTH-001 + AUTH-003
 └─ ROL-001 (bootstrap roles/admin)
      └─ ROL-002 (role-based access) ── gate for ALL agent/admin features
      └─ ROL-003 (agent accounts)
           └─ AGT-001 (register agent)
                └─ AGT-002 (list agents)

ZON-001 (create zone)
 └─ ZON-002 (list zones)
 └─ ZON-001 + AGT-001 → CLE-001 (create tour)
      └─ CLE-005 (admin tour list)
      └─ CLE-001 + ROL-002 → CLE-002 (today's work)
           └─ CLE-003 (mark done)
           └─ CLE-004 (mark blocked)
           └─ CLE-003 / CLE-004 / CLE-005 → DSH-001 (dashboard)
                └─ DSH-002 (trend)

LOC-001 (French UI) − no dependency (applies to every screen)
```

Key rule: **nothing is built on the operations side before ROL-001 and ROL-002** are in place — every feature depends on knowing who the user is and what they may do.

---

## MVP definition of done

The MVP is complete only when **all** of the following are true:

1. **Backlog**: every P0 story (AUTH-001…003, ROL-001…003, AGT-001…002, ZON-001…002, CLE-001…005, DSH-001, LOC-001) is implemented, its acceptance criteria passing.
2. **Bootstrap**: a fresh deployment produces Admin + Agent roles and a first admin account; anyone can start using the tool immediately.
3. **Operational loop demonstrated end-to-end**: an admin can create at least one zone, register agents, and plan recurring tours; an agent can sign in, see only their own assigned tours, mark them done or blocked; the admin dashboard reflects done/pending/overdue/blocked per zone.
4. **Access control**: agents cannot reach admin pages or other agents' data (verified by test, not manually).
5. **Audit trail**: every status change on a tour stores the actor and a timestamp.
6. **Quality gates**: unit/E2E tests cover the P0 acceptance criteria; `lint`, `typecheck` and `test` all pass; 100 % tour recording during a 4-week pilot (success criteria §6 of RAPPORT-MVP.md).
7. **Demoable in French**: all screens and messages are in French; the demo runs on a shared pilot environment.
8. **Cooldown**: no P1/P2 story has been accidentally pulled in (scope control).

Being blocked on any item marked ⚠️ in RAPPORT-MVP.md (role set, agent connectivity, language, verification method) stops the MVP definition of done from being declared.
