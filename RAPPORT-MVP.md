# STEP 2.2 — CARTHAGE-CLEAN MVP DEFINITION

Scope: smallest useful version of the product that can be demonstrated and validated.
Basis: available project information (scaffolded Next.js app, fr/ar/en locales, "Plateforme de gestion du nettoyage et de la propreté urbaine", STEP 2.1 area list).
Note: items marked ⚠️ require product-owner validation.

---

## 1. MVP objective

The Carthage-Clean MVP is an internal operations tool for the Municipality of Carthage that lets an operations administrator organize street-cleaning work — define cleanliness zones, register cleaning agents, plan recurring cleaning tours, and record whether each tour was actually carried out — replacing manual/paper follow-up with a single accountable digital record. The MVP exists to demonstrate and validate, with municipal decision-makers and team leaders, that cleaning operations can be planned, executed and verified reliably. Citizen-facing features, mapping and mobile apps are deliberately excluded so the pilot stays small and the operational baseline is proven first.

---

## 2. MVP users

| User                                 | Description                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Operations administrator (municipal) | Defines zones, registers agents, plans tours, monitors execution            |
| Cleaning agent (agent de propreté)   | Sees assigned work for the day, marks tours done or reports blocking issues |

⚠️ Whether a third role — supervisor/team-leader — is required immediately needs validation.

---

## 3. MVP features

| Feature                                                    | Priority       | User         | Purpose                                                                                             | MVP?          |
| ---------------------------------------------------------- | -------------- | ------------ | --------------------------------------------------------------------------------------------------- | ------------- |
| Zone management (create/list/name of general area)         | MUST HAVE      | Admin        | Group the municipality into named operational sectors that tours and agents attach to               | Yes           |
| Agent management (register + assign to zone)               | MUST HAVE      | Admin        | Maintain the workforce register and the agent↔zone link                                             | Yes           |
| Cleaning-tour creation (zone, agent, schedule, recurrence) | MUST HAVE      | Admin        | Plan planned cleaning rounds with an owner and frequency                                            | Yes           |
| "Today's work" view for agents                             | MUST HAVE      | Agent        | Agent sees their assigned tours for the day on a mobile-friendly web page                           | Yes           |
| Tour completion / issue recording                          | MUST HAVE      | Agent, Admin | Record that a cleaning pass was executed (or blocked) with timestamp — the core accountability loop | Yes           |
| Basic status dashboard (done / overdue / blocked per zone) | MUST HAVE      | Admin        | Give decision-makers visibility of execution vs. plan                                               | Yes (light)   |
| Authentication (email + password)                          | MUST HAVE      | All          | Secure access in a municipal context; trace who did what                                            | Yes (minimal) |
| Roles (Admin / Agent)                                      | MUST HAVE      | All          | Two-role access control so agents only see their own work                                           | Yes           |
| French UI                                                  | MUST HAVE      | Admin        | Language of the municipal administration and the demo                                               | Yes           |
| Arabic UI                                                  | SHOULD HAVE ⚠️ | Agent        | First-language interface for field staff → becomes MUST if agents are Arabic-only                   | No / ⚠️       |
| Citizen reports (submit + follow-up)                       | SHOULD HAVE    | Citizen      | Residents signal dirt; closes the loop with operations                                              | No            |
| Supervisor / team-leader role                              | SHOULD HAVE ⚠️ | Supervisor   | Independent verification of completed tours                                                         | No            |
| Photo proof on completion                                  | COULD HAVE     | Agent        | Evidence of cleanliness state instead of trust-based check-in                                       | No            |
| Zone mapping (visual)                                      | COULD HAVE     | Admin        | View zones and tours on a map                                                                       | No            |
| Advanced reporting (exports, charts, KPIs)                 | COULD HAVE     | Admin        | BI-style reporting                                                                                  | No            |
| English UI                                                 | COULD HAVE     | All          | Internationalisation                                                                                | No            |
| Real-time GPS tracking                                     | OUT OF MVP     | —            | Live agent position                                                                                 | No            |
| SMS / email notifications                                  | OUT OF MVP     | —            | Automatic alerts                                                                                    | No            |

---

## 4. MVP workflows

```text
Workflow 1 — Plan a cleaning tour
User    → Admin (operations) creates/selects a zone
Action  → Creates a tour with agent + schedule (e.g. daily)
System  → Persists the tour and surfaces it in the daily schedule
Result  → Plan is recorded: who cleans what, where, when

Workflow 2 — Execute and verify a tour
User    → Agent opens "Today's work"
Action  → Performs the cleaning, marks the tour "done" (or "blocked")
System  → Records status + timestamp, updates the admin dashboard
Result  → Execution is traceable and attributable

Workflow 3 — Follow up on missed or blocked tours
User    → Admin opens the dashboard, sees overdue/blocked tours
Action  → Reschedules, reassigns or logs an action
System  → Keeps an audit trail of the change
Result  → Exceptions are handled; the loop is closed
```

---

## 5. Explicitly excluded features (NOT in the MVP)

- Citizen-facing report portal (public submission + follow-up)
- Real-time GPS tracking of agents
- Native mobile apps (responsive web only)
- Map / GIS rendering of zones
- Photo proof on tour completion
- SMS / email notifications
- User self-service, SSO / advanced identity
- Supervisor role and multi-level verification workflows
- Equipment, waste-bin and vehicle asset management
- Budget, payroll, procurement
- Advanced reporting, analytics and exports
- Full French/Arabic/English localization (pending the language decision in §7)

---

## 6. MVP success criteria

| Criterion                                                                                    | Target                                                                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Tour execution recorded digitally while the pilot runs (baseline: no digital tracking today) | 100 % of planned MVP tours recorded during a 4-week pilot                |
| Agent adoption (pilot team)                                                                  | 100 % agents active daily; ≥ 80 % onboarded in week 1                    |
| Tour creation latency                                                                        | Admin creates a tour in < 5 minutes                                      |
| Agent check-in latency                                                                       | Agent records completion in < 60 seconds                                 |
| Traceability                                                                                 | ≥ 90 % of completions recorded within 24 h of execution                  |
| Reliability                                                                                  | 0 data loss; ≥ 99 % availability during working hours                    |
| User perception                                                                              | ≥ 70 % of pilot users rate the tool "useful"; ≥ 70 % would keep using it |
| Validation                                                                                   | Product owner confirms the pilot phase and the post-MVP roadmap          |

---

## 7. Open product decisions

1. ⚠️ Pilot scale and scope: how many zones and agents (drives performance and permissioning design)?
2. ⚠️ Must a citizen-report flow appear in the first demonstration (sponsor expectation would promote it to MUST HAVE)?
3. ⚠️ Role set for the pilot: is a supervisor/team-leader role needed immediately?
4. ⚠️ Do agents have company smartphones and connectivity? If offline, a supervisor-confirmation or offline-capable design is required.
5. ⚠️ Zone definition source: existing municipality GIS/découpage, or named approximate areas for the MVP?
6. ⚠️ Language: are pilot agents Arabic-only? (Arabic UI becomes MUST HAVE in that case.)
7. ⚠️ Completion verification: trust-based self-report vs. supervisor confirmation vs. photo proof — decide with team leaders.
8. ⚠️ Recurrence model: daily/weekly schedules, evening and night shifts on boundary zones?
