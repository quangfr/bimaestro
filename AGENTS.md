# AGENTS.md - Guide de Développement & Règles pour Agents IA (Maestro)

> **Objectif de ce document :**  
> Ce référentiel sert de contexte opérationnel prioritaire pour toute IA ou développeur intervenant sur le projet **Maestro**. Il garantit la **fiabilité**, la **vitesse d'exécution**, la **cohérence métier Safran MRO** et prévient les régressions techniques et fonctionnelles.

---

## 1. Vue d'Ensemble du Projet

- **Nom du projet :** Maestro - Assistant de Cadrage MRO Safran ✈️
- **Rôle de l'application :** Simulateur interactif d'aide à la décision et de cadrage de modélisation dimensionnelle (Power BI / DAX / Tabulaire) pour la maintenance de moteurs aéronautiques (CFM56, LEAP-1A, LEAP-1B).
- **Architecture technique :**
  - **Front-end :** Page unique autonome (SPA Vanilla) contenue dans `index.html`.
  - **Styling :** Tailwind CSS (CDN) avec thème clair professionnel Safran (palette ardoise, bleu industriel, blanc glassmorphism).
  - **Graphismes vectoriels :** SVG dynamiques inline et Canvas 2D interactif pour le schéma relationnel de données.
  - **Documentation & Référentiel métier :** `content.md` synchronisé avec le code de `index.html`.
  - **Hébergement :** 
    - GitHub Pages : `https://quangfr.github.io/maestro/`
    - Firebase Hosting : `https://maestro-safran.web.app`

---

## 2. Règles Fondamentales & Règles Métier

### 2.1 Les 7 Étapes du Simulateur (Onglets 1 mot)
1. **Étape 1 : Objectif** (Cadrage métier prioritaire)
   - `1.A` : Urgence opérationnelle (AOG temps réel).
   - `1.B` : Engagements contractuels (SLA globaux par compagnie).
   - `1.C` : Optimisation des capacités (Équilibrage multi-sites & saturation).
   - `1.D` : Suivi Retard & Pénalités (Dérapage en jours ouvrés & exposition en €).
   - `1.E` : Logistique et Approvisionnement (Disponibilité stock, délais fournisseurs et kits complets).

2. **Étape 2 : Données** (Granularité & Tables pour le calcul)
   - `2.A` (Demande - visit) : 1 ligne = 1 visite complète moteur `visit (engine, priority, start, end)`. Transits forfaitaires, vision globale. Table dimensionnelle `pièces du moteur (engine_parts)` liée par `type visit` et filtrée par `model` + disponibilité (%), intervalle de confiance (+/-) et lien date `start`.
   - `2.B` (Réparation - repair) : 1 ligne = 1 réparation module par atelier `repair (type, visit, shop, start, end)`. **Données historiques d'atelier** + navettes physiques inter-ateliers via `durée des transits (shop, shop, length)`. Table dimensionnelle `pièces du moteur (engine_parts)` liée par `type repair`.
   - `2.C` (Tâche - task) : 1 ligne = 1 tâche technique unitaire pointée sur poste `task (visit, start, end, station, type, repair)`. **Seule option disposant de la table de référence des durées théoriques** `durée des tâches (type engine, type task, length)` croisant `type engine` et `type task`. Table dimensionnelle `pièces du moteur (engine_parts)` liée par `type task`.

3. **Étape 3 : TAT** (Méthode de calcul du Turn Around Time TAT)
   - `3.A` : Délais théoriques de traitement (Gamme standard + forfaits transit).
     > ⚠️ **RÈGLE STRICTE :** L'option **3.A est INDISPONIBLE en 2.B** (car 2.B repose sur les données historiques d'atelier). En cas de sélection de 2.B, 3.A doit être grisée, désactivée et la sélection doit automatiquement basculer sur 3.B si 3.A était active.
   - `3.B` : Table des délais moyens (Percentiles réels $P_{5}$, $P_{50}$ médian, $P_{95}$).
   - `3.C` : Délais selon le taux d'occupation atelier (Modélisation de saturation à l'approche de 85%).
   - `3.D` : Modélisation avancée (Simulation dynamique probabiliste multi-factorielle).

4. **Étape 4 : Délai** (Visualisation des Délais & Engagements TAT)
   - `4.A` : Cartes KPIs Synthétiques (TAT moyen, % SLA).
   - `4.B` : Barres vs Seuils Cibles (Durée réelle vs barres $P_{50}$ / $P_{85}$).
   - `4.C` : Barres Décomposées (Attente, Transfert, Réparation).
   - `4.D` : Tableau d'Alertes Nominatives (Listing nominatif ESN / Packages / Postes).

5. **Étape 5 : Capacité** (Méthode d'évaluation de la Capacité & des Demandes)
   - `5.A` : Prévisions des Demandes (Plan S&OP, déposes fermes annoncées & créneaux réservés).
   - `5.B` : Demandes Effectives à l'Instant (En-cours physique réel WIP et pièces pointées en direct).
   - `5.C` : Capacité & Approvisionnement Pièces (Disponibilité magasin pièces de rechange, lead times OEM & kits complets OTIF).
   - `5.D` : Prévisions Multi-factorielles Avancées (Rebuts CND/ressuage, disponibilité des bancs d'essais, outillages & attrition pièces LLP).

6. **Étape 6 : Saturation** (Visualisation de la Saturation / Capacité)
   - `6.A` : Barres de Charge vs Seuil 85%.
   - `6.B` : Heatmap Hebdomadaire / Site.
   - `6.C` : Courbes Entrées vs Sorties (Dérive en-cours WIP).
   - `6.D` : Ratio Attente vs Travail Effectif (Donut lead time).

7. **Étape 7 : Synthèse** (Slide Décisionnel & Dashboard Projeté)
   - Tableau de bord en temps réel alimenté par l'objet global `selections = { 1, 2, 3, 4, 5, 6 }`.
   - Menus déroulants interactifs de modification directe (`#select-q1` à `#select-q6`) synchronisés avec les pages étapes.
   - Recommandations d'architecture BI et mesures DAX adaptées au profil choisi.

---

## 3. Structure des Fichiers & Conventions

```text
├── index.html        # Fichier principal : application SPA, balisage, SVG, Canvas 2D, scripts JS
├── content.md        # Référentiel des contenus textuels, formules DAX et illustrations SVG complètes
├── AGENTS.md         # Le présent guide technique et méthodologique pour agents IA
├── readme.md         # Présentation globale utilisateur du projet
├── firebase.json     # Configuration de déploiement Firebase Hosting (public: ".")
└── .firebaserc       # Définition du projet Firebase (sherpa-5938b / maestro-safran)
```

### Règle d'or de Synchronisation :
Chaque modification apportée à la logique, aux libellés ou aux schémas dans `index.html` **doit être immédiatement répercutée dans `content.md`** et vice-versa.

---

## 4. Précautions Techniques pour l'Édition du Code

1. **Environnement Shell Windows / PowerShell :**
   - Ne jamais utiliser l'opérateur `&&` pour enchaîner des commandes (provoque une erreur de syntaxe en PowerShell).
   - Utiliser systématiquement le point-virgule `;` pour séparer les commandes :
     ```powershell
     git add index.html content.md; git commit -m "..."; git push origin main
     ```

2. **Édition de `index.html` :**
   - Ce fichier contient plus de 2100 lignes.
   - Toujours privilégier `replace_file_content` avec un bloc cible précis et vérifié plutôt que des réécritures complètes.
   - Respecter les IDs HTML existants (`schemaCanvas`, `step3-table-container`, `select-q1` à `select-q5`, `opt-X-Y`, `tab-X`).

3. **Fonction Canvas `drawSchema(granularity)` :**
   - En `A` : Faits `visit (engine, priority, start, end)` + Dimensions `engine (type, model, customer)`, `contract_sla`, `durée des transits`, `calendar` + `pièces moteur [engine_parts] (part_ref, model, dispo_rate, confidence_margin, start_req_date)`.
   - En `B` : Faits `repair (type, visit, shop, start, end)` + Dimensions `visit`, `shop [centre de réparation] (type of repairs*, stations*)`, `durée des transits (shop, shop, length)`, `calendar` + `pièces moteur [engine_parts] (part_ref, model, dispo_rate, confidence_margin, start_req_date)`.
   - En `C` : Faits `task (visit, start, end, station, type, repair)` + Dimension de calcul `durée des tâches (type engine, type task, length)` + Dimensions `station [poste de réparation] (shop, type of repairs)`, `capacité, occupation, disponibilité des stations`, `calendrier des réparations des stations` + `pièces moteur [engine_parts] (part_ref, model, dispo_rate, confidence_margin, start_req_date)`.

---

## 5. Workflow de Validation & Déploiement

À la fin de chaque demande utilisateur impliquant une modification :

1. **Vérification de l'intégrité :**
   - Contrôler que `index.html` et `content.md` sont rigoureusement synchronisés.
   - S'assurer que le script s'exécute sans erreur de syntaxe (`node -e "..."`).

2. **Git Commit, Push & Déploiement Firebase :**
   > ⚠️ **RÈGLE STRICTE DE DÉPLOIEMENT :** Ne committer, pusher sur GitHub et déployer sur Firebase Hosting **QUE si l'utilisateur le demande explicitement** dans sa commande. En l'absence de demande explicite, valider les modifications localement et présenter le résultat sans lancer de déploiement automatique.
   - Si demandé par l'utilisateur :
     ```powershell
     git add <fichiers modifiés>; git commit -m "<type>: <description claire>"; git push origin main
     npx -y firebase-tools deploy --only hosting
     ```

3. **Restitution à l'utilisateur :**
   - Fournir un résumé concis des changements effectués.
   - Rappeler les deux URLs de consultation :
     - Firebase : [https://maestro-safran.web.app](https://maestro-safran.web.app)
     - GitHub Pages : [https://quangfr.github.io/maestro/](https://quangfr.github.io/maestro/)
