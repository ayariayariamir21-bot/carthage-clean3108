# RAPPORT D'ANALYSE — PROJET CARTHAGE-CLEAN

**Rôle :** Chef de projet IA senior / Pilotage d'exécution
**Base de l'analyse :** documents du référentiel (PRD, MVP, Backlog, Analyse, état du code au 29/08/2026)

---

## 1. Résumé exécutif

Le projet **Carthage-Clean** (plateforme web de gestion de la propreté urbaine pour la Municipalité de Carthage) a franchi la phase de conception et entre maintenant dans la phase d'implémentation. Le socle de définition est solide et cohérent : un MVP clair (P0), un backlog priorisé, des critères d'acceptation testables et un périmètre explicitement exclu pour éviter le scope creep.

L'implémentation a **démarré par le socle technique (AUTH-001 : base de données + authentification)**, conformément à l'ordre approuvé. La validation qualité (tests, typecheck, lint, build) est au vert. Le point de blocage principal reste **l'absence d'une base PostgreSQL connectée** et **l'absence de décisions produit-pilote** (toutes marquées ⚠️/TO BE CONFIRMED dans le PRD) qui conditionnent le « Definition of Done » du MVP.

**Actions immédiates :** 1) fournir l'accès PostgreSQL et exécuter les migrations ; 2) nommer un product owner pour lever les décisions produit bloquantes ; 3) poursuivre l'implémentation selon l'ordre approuvé (RBAC/Bootstrap → Zones → Agents → Tours).

---

## 2. État d'avancement actuel

### Étapes terminées

| Étape                                                 | % estimé                                              |
| ----------------------------------------------------- | ----------------------------------------------------- |
| Analyse initiale (STEP 2.1 / RAPPORT-ANALYSE)         | 100 %                                                 |
| Définition du MVP (STEP 2.2 / RAPPORT-MVP)            | 100 %                                                 |
| Backlog + acceptation (STEP 2.3 / RAPPORT-BACKLOG)    | 100 %                                                 |
| PRD consolidé (STEP 2 / approbation pending)          | ~90 % (reste : validation product owner)              |
| Architecture scaffold (Turborepo + Next.js 15 + pnpm) | 100 %                                                 |
| Task 1 — AUTH-001 (DB + authentification)             | ~90 % (code/test ok ; migration non exécutée en live) |

### Étapes en cours

- **Task 1 — AUTH-001** : implémentation écrite et validée (tests/typecheck/lint/build verts). Reste : exécution des migrations sur une vraie base PostgreSQL + test manuel d'un cycle complet de connexion.

### Étapes restantes (MVP, ordre approuvé)

1. Task 2 — RBAC + Bootstrap (ROL-001, ROL-002 ; + ROL-003)
2. Task 3 — Gestion des zones (ZON-001, ZON-002)
3. Task 4 — Gestion des agents (AGT-001, AGT-002)
4. Task 5 — Création de tournées (CLE-001)
5. Suite P0 : « Travaux du jour » (CLE-002…004), liste tours admin (CLE-005), dashboard (DSH-001), audit trail (FR-017), UI française (LOC-001)

### Avancement global estimé

**≈ 35–40 %** du parcours vers le MVP terminé (conception ~complète ; implémentation en phase de démarrage).

---

## 3. Analyse des écarts

- **Coût de l'authentification** : AUTH-001 est livré sans exécution sur base réelle (pas de connexion PostgreSQL disponible dans l'environnement de travail). Écart fonctionnel **nul sur le code**, mais risque d'intégration non vérifié. Cause : absence de mot de passe/URL de connexion fourni.
- **Dépendance ROL-003** : le backlog liste ROL-003 (comptes agents) comme prérequis d'AGT-001 ; l'ordre par lots (RBAC = ROL-001/002) doit l'intégrer avant le lot Agents pour éviter un écart de planification.
- **Pas de dérive de périmètre** : aucun P1/P2 n'a été introduit. Écart positif.
- **Décisions produit non tranchées** : toutes restent en suspens (voir §6) — c'est l'écart de gouvernance principal et le plus risqué.

---

## 4. Prochaines étapes prioritaires

| #   | Action                                                   | Responsable suggéré    | Délai estimé | Livrable attendu                               |
| --- | -------------------------------------------------------- | ---------------------- | ------------ | ---------------------------------------------- |
| 1   | Nommer/confirmer le product owner                        | Direction / sponsor    | Immédiat     | Validation formelle du PRD + DoD               |
| 2   | Fournir l'accès PostgreSQL (URL/mot de passe)            | Équipe technique / Ops | 1–2 j        | Base `carthage_clean` + migrations exécutées   |
| 3   | Mener le cycle de validation AUTH-001                    | Développeur + testeur  | 1–2 j        | Connexion/échec validés end-to-end             |
| 4   | Implémenter ROL-001/002 (+ ROL-003)                      | Développeur            | 2–3 j        | Bootstrap rôles/admin + contrôle d'accès testé |
| 5   | Implémenter ZON-001/002 puis AGT-001/002                 | Développeur            | 3–4 j        | CRUD zones/agents (tests verts)                |
| 6   | Implémenter CLE-001 puis CLE-002…005, DSH-001, audit, FR | Développeur            | 4–6 j        | Boucle opérationnelle démontrable              |
| 7   | Préparer l'environnement pilote + onboarding             | PO + admin             | 2–3 j        | Pilot environnement + métriques baseline       |

---

## 5. Ressources nécessaires pour les étapes restantes

- **Humaines** : 1 développeur full-stack (Next.js/Drizzle/Postgres), 1 testeur (tests unitaires + E2E), 1 product owner, 1 admin municipal pour le pilote.
- **Techniques** : instance PostgreSQL (locale ou serveur), variable `DATABASE_URL`, outil de gestion d'environnements (ex. drizzle migrations), outil E2E (ex. Playwright, absent aujourd'hui), CI légère pour lint/typecheck/test.
- **Budgétaires** : hébergement de démo/pilote ; optionnellement SMTP si un reset mot de passe (P1) est anticipé.
- **Matérielles** : smartphones des agents ou solution offline selon la décision connectivité.

---

## 6. Risques et points de blocage

| Risque / Blocage                                | Impact                                             | Atténuation                                                      |
| ----------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| **Migrations non exécutées (blocage immédiat)** | AUTH-001 non vérifiable en conditions réelles      | Fournir l'accès DB, exécuter `db:migrate`, test de cycle complet |
| **Product owner non nommé**                     | Décisions produit en suspens, priorisation fragile | Nommer un PO, approbation formelle du PRD avant poursuite        |
| **Connectivité agents (décision ⚠️ NFR-007)**   | Check-in impossible sur le terrain                 | Trancher tôt : offline ou confirmation superviseur               |
| **Langue (décision ⚠️ §10/LOC-002)**            | Loupé si agents arabophones uniquement             | Décider avant build ; sinon Arabic UI passée en P0               |
| **Scale pilote inconnu (décision ⚠️ NFR-012)**  | Dimensionnement/permissionnement mal calibrés      | Fixer nb zones/agents/tours cible                                |
| **Vérification de complétion (⚠️)**             | Choix du modèle (auto-déclaration vs supervision)  | Valider avec les chefs d'équipe                                  |
| **Scope creep**                                 | MVP retardé                                        | DoD exclut P1/P2 ; validation périodique du périmètre            |
| **Migrations générées mais non appliquées**     | Incertitude sur l'application réelle du schéma     | Tests d'intégration sur base de dev                              |

---

## 7. Plan d'action pour finaliser le projet avec notre équipe

**Modalités de collaboration**

- **Réunion de lancement (kick-off)** : revue du PRD, confirmation du périmètre P0, cadrage des décisions ⚠️.
- **Cérémonie courte hebdomadaire** : revue de l'ordre des lots et des validations.
- **Outils** : gestion de backlog partagée, suivi des tâches (tickets par story P0), CI sur lint/typecheck/test, bilans d'avancement basés sur le DoD.

**Répartition des rôles**

- **PO** : décisions produit, approbations, acceptation des critères.
- **Développeur** : implémentation lot par lot + tests.
- **Testeur** : validation des critères d'acceptation, vérification du contrôle d'accès par test automatisé (exigence DoD n°4).
- **Admin municipal** : préparation du pilote, onboarding, collecte des métriques baseline (§11 du PRD).

**Boucle de validation**

Chaque lot est accepté quand : lint ✓, typecheck ✓, tests ✓, build ✓, critères d'acceptation du lot vérifiés. Le MVP n'est clôturé que si tous les DoD (§13) sont remplis.

---

## 8. Recommandations finales

1. **Lever sans délai les décisions ⚠️** (connectivité, langue, rôle superviseur, vérification, scale). Elles conditionnent le DoD et le build éventuel de l'UI arabe (LOC-002 → P0).
2. **Obtenir un accès DB opérationnel** et exécuter les migrations avant d'empiler les lots suivants — c'est le goulot technique immédiat.
3. **Respecter strictement l'ordre approuvé** (Auth → RBAC → Zones → Agents → Tours → « Travaux du jour » → Dashboard/audit/FR) et intégrer ROL-003 dans le lot RBAC.
4. **Ne pas dévier du périmètre P0** : tout ajout (portail citoyen, cartographie, preuves photo, etc.) est reporté en roadmap.
5. **Piloter par le DoD** : un P0 n'est « terminé » que critères d'acceptation vérifiés + gates qualité verts.
6. **Ne pas déclarer le MVP terminé** tant que les décisions ⚠️ (§12.2 : 9, 11) restent ouvertes — cela modifierait NFR-007 et le périmètre FR/LOC.

---

## Informations manquantes (non inventées)

- Objectifs/délivrables formels du projet (`RAPPORT-ANALYSE.md` : champs vides).
- Contraintes de calendrier/date de pilote, budget, équipe, parties prenantes.
- Mot de passe / URL de connexion PostgreSQL (blocage immédiat pour l'exécution des migrations).
- Décisions produit ⚠️ : connectivité agents, langue (arabe), rôle superviseur, vérification de complétion, définition des zones (GIS vs secteurs nommés), échelle du pilote.
- Outil et stratégie de test E2E (absent du socle).
- Type de l'outil de suivi de projet partagé.
