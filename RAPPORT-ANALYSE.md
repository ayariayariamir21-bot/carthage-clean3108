# Rapport d'analyse de projet — Carthage-Clean

> Source de l'analyse : inspection directe du dépôt `D:\carthage-clean` (code, configuration, vérifications `typecheck` / `lint` / `build` exécutées). **Le champ « description du projet » et les documents fournis en entrée étaient vierges** : ce rapport repose donc uniquement sur le contenu réel du repository. Toute donnée non retrouvée est listée en section « Informations manquantes ».

---

## 1. Résumé exécutif

**Carthage-Clean** est une plateforme de gestion de la propreté urbaine, actuellement au stade **d'amorçage technique (squelette)**, et non au stade d'un produit fonctionnel.

- ✅ Socle technique **opérationnel et sain** : monorepo Turborepo + pnpm, app Next.js 15 / React 19, configs partagées. `typecheck`, `lint` et `build` **passent tous avec succès**.
- ⚠️ Aucun commit Git n'a encore été réalisé (dépôt vide, tous les fichiers non suivis).
- ⚠️ **Aucune fonctionnalité métier** : une seule page d'accueil statique (aucun routage, aucune API, aucune donnée, aucune authentification, aucun test).
- ⚠️ Outillage de test installé (Vitest, Testing Library) mais **aucun test écrit ni script de test défini**.
- 🎯 **Avancement global estimé : ~10-15 %** (phase de bootstrap). Aucun plan produit, jalon ou deadline n'existe dans le dépôt.

**Action prioritaire immédiate** : valider le périmètre fonctionnel (PRD) et structurer le backlog avant tout développement, pour éviter de construire un squelette sans vision métier.

---

## 2. État d'avancement actuel

### Étapes terminées (estimation)

| # | Étape | Statut | % estimé |
|---|-------|--------|----------|
| 1 | Initialisation monorepo (pnpm workspace + Turborepo) | ✅ Terminé | 100 % |
| 2 | Application Next.js (App Router, React 19, Next 15) | ✅ Terminé (bootstrap) | 100 % |
| 3 | Package `@carthage-clean/types` (locales fr/ar/en) | ✅ Terminé (minimal) | 100 % |
| 4 | Package `@carthage-clean/config` (TS, Prettier, ESLint) | ✅ Terminé | 100 % |
| 5 | Qualité de base : lint, typecheck, build **verts** | ✅ Vérifié | 100 % |
| 6 | Hooks pré-commit (Husky + lint-staged) | ✅ Installé | ~90 % (à valider en conditions réelles) |

### Étapes en cours

| # | Étape | Statut | % estimé |
|---|-------|--------|----------|
| 7 | Définition du produit (périmètre, parcours, jalons) | 🔸 Non défini | 0 % |
| 8 | Architecture métier (modèle de données, API, rôles) | 🔸 Non défini | 0 % |

### Étapes restantes (liste de haut niveau)

| # | Étape | Statut |
|---|-------|--------|
| 9 | Fonctionnalités métier (agents de nettoyage, zones, tournées, signalements, reporting…) | 🔻 À construire — **périmètre à valider** |
| 10 | Internationalisation fonctionnelle (fr/ar/en), actuellement uniquement typée | 🔻 À construire |
| 11 | Tests (unitaires + intégration) et script `test` dédié | 🔻 À construire |
| 12 | CI/CD (GitHub Actions ou équivalent) + environnement de déploiement | 🔻 À construire |
| 13 | Couche données + authentification/autorisations | 🔻 À construire |
| 14 | Design system / UI structurée (styles inline aujourd'hui) | 🔻 À construire |
| 15 | Documentation, recette, mise en production | 🔻 À construire |

### Avancement global

**Environ 10-15 %** — correspond à la fin de la phase de fondations techniques. La valeur est indicative : sans plan produit ni jalons datés, l'avancement « métier » est nul (0 %).

---

## 3. Analyse des écarts

> Aucun plan initial formel n'est disponible dans le dépôt (pas de PRD, spec, backlog, roadmap, budget ou calendrier). L'analyse ci-dessous compare donc l'existant à ce qu'un MVP de ce type de plateforme requiert.

| Dimension | Écart / constat | Gravité |
|-----------|-----------------|---------|
| **Périmètre fonctionnel** | Aucun livrable métier défini ni implémenté (une seule page statique). | Élevée |
| **Délais** | Aucun calendrier/jalon formalisé. Risque de dérive non mesurable. | Élevée |
| **Qualité** | Lint/typecheck/build OK, mais **0 test** malgré Vitest + Testing Library installés ; pas de script `test`. | Moyenne |
| **Traçabilité** | **Aucun commit Git** : aucune sauvegarde, aucune traçabilité, aucune possibilité de revue diff. | Élevée |
| **Données** | Aucune couche de données, aucun schéma, aucune API route. | Élevée |
| **i18n** | Locales typées (fr/ar/en) mais **aucune implémentation** de traduction/routage. | Moyenne |
| **UI/UX** | Styles inline, pas de design system, pas de maquettes de référence. | Moyenne |
| **Documentation** | README minimal (structure + commandes) : correct pour le bootstrap, insuffisant pour un produit. | Faible |

---

## 4. Prochaines étapes prioritaires

| # | Action | Responsable suggéré | Délai estimé | Livrable attendu |
|---|--------|---------------------|--------------|------------------|
| 1 | Atelier de cadrage produit | Product Owner / MOA (avec le sponsor métier) | 1 semaine | PRD + périmètre MVP + user stories |
| 2 | Initialiser le dépôt Git + branche `main` protégée, premier commit | Lead Dev / tous | 1 jour | Historique Git, conventions de commit |
| 3 | Définir l'architecture cible (données, API, rôles, modules) | Architecte / Lead Dev | 1-2 semaines | Doc d'architecture + modèle de données |
| 4 | Établir la roadmap jalonnée (Sprint 0 → MVP → prod) avec dates | Chef de projet | 1 semaine | Roadmap + planning itératif |
| 5 | Mettre en place les tests (vitest, config, script `test`) | Développeur | 3-5 jours | Tests sur les premiers modules + script CI |
| 6 | Connecter la pile data + première fonctionnalité métier de bout en bout | Développeurs (2) | 2-4 semaines | Feature verticale démontrable |
| 7 | CI/CD + déploiement d'un environnement de preview | DevOps / Lead Dev | 1 semaine | Pipeline vert + URL de preview |
| 8 | Implémenter l'i18n fonctionnelle (fr/ar/en) | Développeur | 1 semaine | Routes/traductions multilingues |

---

## 5. Ressources nécessaires pour les étapes restantes

**Humaines**
- 1 Product Owner / référent métier (définition du périmètre, priorisation).
- 1 Lead développeur (architecture, arbitrages techniques).
- 1-2 développeurs full-stack (Next.js/React/TypeScript).
- 1 DevOps (CI/CD, hébergement) — peut être mutualisé avec le lead.
- 1 UX/UI designer (maquettes, design system) — en appoint.
- Chef de projet / coordinateur (planning, recette, communication).

**Techniques**
- Validation des choix actuels : Next.js 15 + React 19 (à confirmer face aux besoins : PWA/offline agents de terrain, géolocalisation ?).
- Base de données (à choisir : PostgreSQL recommandé par défaut) + ORM/backend (possibilités : Next.js API Routes / tRPC / Prisma / Supabase).
- Authentification et gestion des rôles.
- CI (GitHub Actions) et plateforme d'hébergement (Vercel recommandé — app déjà compatible Next.js).
- Cartographie/géolocalisation si les tournées/zones l'exigent (Leaflet/MapLibre).

**Budgétaires / matériels**
- Budget hébergement + base de données (estimation à faire selon volumétrie).
- Comptes outils : GitHub, Vercel (ou équivalent), éventuellement solution de cartographie.
- **Aucun budget n'est déclaré** : à chiffrer lors du cadrage.

---

## 6. Risques et points de blocage

| Risque | Probabilité | Impact | Mitigation |
|--------|:-----------:|:------:|------------|
| **Aucune définition du périmètre → sur-ingénierie ou produit hors cible** | Élevée | Élevé | Cadrage PRD obligatoire avant développement (Action n°1) |
| **Aucun commit Git → perte de travail / aucune revue** | Moyenne | Élevé | Commit initial immédiat + branche protégée + revues obligatoires |
| **Dérive de délais non mesurable (pas de jalons)** | Élevée | Élevé | Roadmap datée, itérations courtes, démo à chaque sprint |
| **0 test → régressions silencieuses** | Moyenne | Élevé | Baseline de tests avant toute feature critique + CI bloquante |
| **Répartition inconnue de l'équipe / disponibilités** | Moyenne | Moyen | Clarifier rôles et disponibilités au kick-off |
| **Sujet métier complexe (propreté urbaine : terrain, géo, multi-acteurs)** | Moyenne | Moyen | Ateliers métier, personas, recette terrain |
| **Internationalisation oubliée dans les modèles de données** | Faible | Moyen | Modéliser les libellés bilingues dès le départ |
| **Dépendances à la dernière version (Next 15/React 19, nouvelles APIs)** | Moyenne | Faible | Pins de versions, veille sur les breaking changes |

---

## 7. Plan d'action pour finaliser le projet avec notre équipe

Notre accompagnement peut couvrir chaque étape restante, en mode itératif et vérifiable :

| Étape | Votre rôle | Notre accompagnement (IA / outils) | Organisation |
|-------|------------|-------------------------------------|--------------|
| **Cadrage (S1)** | Fournir contexte métier, objectifs, utilisateurs types, priorités | Co-rédiger le PRD et le backlog (user stories, critères d'acceptation) | Atelier de cadrage (1 session) + revue écrite |
| **Fondation (S1)** | Valider les choix techniques | Génération du commit initial, config CI/tests, architecture | Revue du socle avant développement |
| **Développement (S2-S4)** | Valider chaque fonctionnalité (démos) | Implémentation feature par feature avec revue de code et tests | Itérations courtes (sprints 1-2 semaines), livraison continue en preview |
| **i18n (S2)** | Valider la qualité des traductions (fr/ar/en) | Mise en place du mécanisme de traduction et des routes | Revues de traduction utilisateur |
| **Qualité (continu)** | Pointer priorités de couverture | Génération de tests, correction lint/typecheck, maintien de la CI verte | Pipeline CI bloquant, code review |
| **Recette / Prod** | Recette métier + décision de go/no-go | Plan de test, préparation au déploiement, documentation | Recette formelle puis mise en production |

**Format de collaboration recommandé :**
- Réunions : kick-off (1 h) → point hebdomadaire 30 min (avancement, blocages) → démo de fin de sprint (30-45 min).
- Outils : GitHub (repo + issues), PR avec revue, un canal de communication (Slack/Discord), tableau Kanban (GitHub Projects).
- Rythme de validation : chaque sprint livre une feature démontrable en environnement de preview.

---

## 8. Recommandations finales

1. **Commencer par le cadrage, pas par le code.** Le squelette technique est sain, mais toute la valeur repose sur le périmètre métier. Sans PRD validé, chaque semaine de développement est à risque.
2. **Sécuriser le dépôt dès aujourd'hui** : premier commit, branche `main` protégée, convention de commits — coût d'une journée, bénéfice décisif.
3. **Visée verticale, pas horizontale** : livrer **une** feature métier complète de bout en bout (données → API → UI → test) avant d'élargir le périmètre.
4. **Installer la qualité dès maintenant** : script `test`, baseline de tests et CI bloquante avant que la dette ne s'accumule.
5. **Fixer des jalons datés** dès le PRD : un projet sans calendrier ne peut pas être piloté, ni livré à temps.
6. **Intégrer l'i18n et les contraintes terrain de façon native** (fr/ar/en, éventuellement géolocalisation/hors-ligne) — les ajouter après coup coûte cher.
7. **Ne pas supposer une équipe ou un budget** : sans information sur les ressources réelles, tout engagement de date reste conditionnel (voir section suivante).

---

## Informations manquantes

Ajoutez les éléments suivants pour affiner ce rapport (aucun n'était fourni ni présent dans le dépôt) :

- [ ] **Objectifs détaillés** et succès cible (KPI de la plateforme).
- [ ] **Livrables attendus** (MVP, version cible, exigences fonctionnelles/non-fonctionnelles).
- [ ] **Contraintes** (réglementaires, techniques, sécurité, mobilité terrain, hors-ligne…).
- [ ] **Délais** : date de démarrage, échéance, jalons intermédiaires.
- [ ] **Budget** global et par poste.
- [ ] **Équipe** : composition, rôles, disponibilités, compétences.
- [ ] **Outils et environnement cible** (hébergement, base de données, cartographie, ERP à intégrer…).
- [ ] **Contexte / parties prenantes** (collectivité, prestataires de nettoyage, citoyens, sponsor).
- [ ] **Toute documentation produit** : PRD, maquettes, notes, captures, liens.

Une fois ces informations communiquées, je pourrai convertir ce rapport en un **plan de projet exécutable** (WBS, planning daté, backlog priorisé, allocation de l'équipe).