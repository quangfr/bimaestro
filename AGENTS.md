# AGENTS.md - Guide de Développement & Règles pour Agents IA (Maestro)

> **Objectif de ce document :**
> Contexte opérationnel pour toute IA ou développeur intervenant sur le projet **Maestro**. Ce guide est **purement technique** : il identifie les fichiers du projet, leurs responsabilités et les règles de gestion du vibe coding. Tout contenu métier/fonctionnel de l'application relève exclusivement de `content.md` (synchronisé avec `index.html`) — il ne doit **pas** être dupliqué ici.

---

## 1. Rôle des Fichiers du Projet

| Fichier / Dossier | Responsabilité |
| :--- | :--- |
| `index.html` | **Squelette SPA & Balisage** : structure HTML, Tailwind CDN, SVG inline, modales HTML et balises d'inclusion des scripts modulaires. |
| `js/data-schemas.js` | **Référentiel Schémas Mermaid & Prompts** : `SCHEMA_MERMAID`, `STEP_UML_SCHEMAS`, templates de prompts IA par défaut. |
| `js/state.js` | **Gestion de l'État & Navigation** : variables globales (`currentStep`, `selections`), navigation (`switchStep`), gestion des splitters interactifs. |
| `js/step0-markdown.js` | **Étape 0 — Lecteur Markdown** : chargement asynchrone des `.md` (`fetch`), parsing marked.js, modale Gouvernance. |
| `js/erd-engine.js` | **Moteur Relationnel ERD & Formules** : parseur Mermaid ERD (`parseMermaidErd`), PRNG Mulberry32, générateur de datasets, évaluateur de formules. |
| `js/step2-schema.js` | **Étape 2 — Modèle de Données** : contrôleur Zoom/Pan UML, visualiseur Mermaid SVG, Canvas 2D et tableau interactif Grid.js avec drill-down. |
| `js/steps-tables.js` | **Étapes 3 & 5 — Tableaux Grid.js** : rendu tabulaire multi-tables, dropdowns de sélection, drilldown 1-N cliquable et jointures N-1. |
| `js/steps-charts.js` | **Étapes 4, 6 & 7 — Moteur Chart.js** : calcul des séries de données, configuration Chart.js dynamique, synchronisation live et Dashboard Étape 7. |
| `js/modals.js` | **Gestionnaires des Modales** : générateur de données (Étape 2), générateur de mesures SAP IBP (3 & 5), modales d'ajout personnalisé (+ Table, + Visuel, + Mesure). |
| `content.md` | **Référentiel métier & fonctionnel** synchronisé : libellés, règles, formules DAX, schémas relationnels et diagrammes Mermaid. |
| `readme.md` | Contexte opérationnel SAE MRO affiché par défaut dans l'**Étape 0** (lecteur Markdown). |
| `gouvernance.md` | Référentiel Méthodologique Data & Gouvernance chargé à la volée dans la modale d'information `(i)`. |
| `AGENTS.md` | Le présent guide technique pour agents IA. |
| `firebase.json` / `.firebaserc` | Configuration du déploiement Firebase Hosting (`public: "."`). |

Structure :

```text
├── index.html              # Squelette SPA & balisage (~2 300 lignes)
├── js/                     # Scripts modulaires Vanilla ES (zéro bundler)
│   ├── data-schemas.js     # Schémas Mermaid ERD statiques & templates de prompt
│   ├── state.js            # État global, navigation, sélections & splitters
│   ├── step0-markdown.js   # Lecteur Markdown Étape 0 & modale Gouvernance
│   ├── erd-engine.js       # Parseur Mermaid ERD, PRNG Mulberry32 & formules
│   ├── step2-schema.js     # Canvas 2D, SVG Mermaid, Grid.js Étape 2 & drilldown
│   ├── steps-tables.js     # Tableaux Grid.js Étapes 3 et 5 & drilldown
│   ├── steps-charts.js     # Moteur Chart.js Étapes 4, 6 et Dashboard Étape 7
│   └── modals.js           # Gestionnaires des modales (DataGen, Mesures, Prompts...)
├── content.md              # Référentiel métier synchronisé avec l'application
├── readme.md               # Contexte opérationnel SAE MRO (affiché en Étape 0)
├── gouvernance.md          # Référentiel Méthodologique Data & Gouvernance (modale et Étape 0)
├── AGENTS.md               # Le présent guide technique
├── firebase.json           # Config Firebase Hosting (public: ".", site: "bimaestro")
└── .firebaserc             # Projet Firebase (go-maestro / GoMaestro)
```

---

## 2. Règles Techniques de Gestion du Vibe Coding

1. **Règle d'or de synchronisation :** toute modification de logique, de libellés ou de schémas dans `index.html` **doit** être répercutée dans `content.md` et vice-versa. Les diagrammes Mermaid de l'Étape 2 (`SCHEMA_MERMAID` dans `index.html` et section `Étape 2` de `content.md`) sont volontairement identiques : les garder synchronisés.

2. **Environnement Shell Windows / PowerShell :**
   - Ne jamais utiliser l'opérateur `&&` (erreur de syntaxe en PowerShell).
   - Séparer les commandes par `;` :
     ```powershell
     git add index.html content.md; git commit -m "..."; git push origin main
     ```

3. **Édition Modulaire (`index.html` & `js/*.js`) :**
   - Ne plus chercher tout le JavaScript dans `index.html` : `index.html` (~2 300 lignes) ne contient plus que le balisage HTML, SVG inline, les modales et le bootstrapping au chargement.
   - Les modifications de code applicatif doivent cibler directement le bon module dans le répertoire `js/` :
     - `js/data-schemas.js` : modèles relationnels Mermaid ERD statiques (`SCHEMA_MERMAID`, `STEP_UML_SCHEMAS`) et templates de prompts IA.
     - `js/state.js` : état global (`selections`, `currentStep`), navigation (`switchStep`), compatibilités et splitters.
     - `js/step0-markdown.js` : lecteur de documentation Markdown Étape 0 et modale méthodologie / gouvernance.
     - `js/erd-engine.js` : parseur Mermaid ERD, Mulberry32 PRNG, stratégies de données et moteur de formules SAP IBP.
     - `js/step2-schema.js` : contrôleur Zoom/Pan UML, visualiseur SVG, Canvas 2D et Grid.js Étape 2 avec drilldown.
     - `js/steps-tables.js` : tableaux de données Grid.js Étapes 3 et 5, drilldowns relationnels et sélecteur de tables.
     - `js/steps-charts.js` : visualisations Chart.js Étapes 4 et 6, éditeur de configuration JSON en live et dashboard Étape 7.
     - `js/modals.js` : gestionnaires d'ouverture/sauvegarde de toutes les modales de configuration et formulaires d'ajout.
   - Respecter les IDs existants et standardisés :
     - **Cards principales d'étapes :** `card-step-0` à `card-step-7`.
     - **Panels de réponses / options :** `step-1-answers` à `step-6-answers`, et cartes d'options individuelles `opt-X-Y` (`opt-X-Y-body`, `opt-X-Y-illust`).
     - **Panels latéraux droits (Étapes 2 à 6) :** `step-2-schema-panel`, `step-3-table-panel`, `step-4-chart-panel`, `step-5-table-panel`, `step-6-chart-panel`.
     - **Composants Étape 7 :** `card-step-7-dashboard`, `card-step-7-chart-q4`, `card-step-7-chart-q6`, `mock-kpis`.
     - **Éléments techniques :** `schema-mermaid-diagram`, `schema-svg-view`, `schema-mermaid-view`, `schema-prompt-view`, `schema-data-view`, `schema-data-table-wrapper`, `data-generator-modal`, `graph-data-generator-modal`, `add-schema-modal`, `mesure-generator-modal`, `add-custom-measure-modal`, `schema-toggle`, `step-3-toggle`, `step-5-toggle`, `step-4-chart-toggle`, `step-6-chart-toggle`, `step-3-data-view`, `step-3-uml-code-view`, `step-3-mermaid-view`, `step-3-visuels-view`, `step-5-data-view`, `step-5-uml-code-view`, `step-5-mermaid-view`, `step-5-visuels-view`, `step-4-data-view`, `step-4-chart-view`, `step-4-js-view`, `step-4-chartjs-prompt-view`, `step-4-visuels-view`, `step-4-sap-view`, `step-6-data-view`, `step-6-chart-view`, `step-6-js-view`, `step-6-chartjs-prompt-view`, `step-6-visuels-view`, `step-6-sap-view`, `md-file-select`, `md-render`, `step3-table-container`, `step5-table-container`, `select-q1` à `select-q6`, `tab-X`.
   - La fonction `drawSchema(granularity)` / `renderMermaidVisual(granularity)` (`A`/`B` ou custom) dessine dynamiquement le schéma relationnel Mermaid ERD dans `schema-mermaid-diagram` (vue `graph`). Tous les diagrammes UML (Étapes 2, 3 et 5) intègrent des boutons de contrôle de zoom discrets en bas à gauche (`+`, `−`, `↺`), le zoom à la molette et le pan/drag au clic. Le bouton `schema-toggle` en haut à droite du panel bascule entre :
     - La vue tabulaire interactive de données d'exemple (`data` / `schema-data-view`, fonction `renderStep2DataView()`) propulsée par Grid.js avec tri natif multi-colonnes, pagination 10 lignes par page avec résumé, largeur adaptative avec badges (`PK`, `FK`, `UK`), drill-down dans les tables associées (`drillDownToSubTable`, fil d'Ariane épuré `←`), et modale du générateur de données déduit de l'UML (`#data-generator-modal`, `openDataGeneratorModal`, sélecteur de type par champ, distributions double-poids pour la valeur préfixée `*`, formules pour entiers/décimaux, regex-genex avec padding/compteur pour les clés, tirages stables PRNG Mulberry32, barre d'actions harmonisée `Sauvegarder`/`Regénérer`/`Restaurer`).
     - La vue visuelle Mermaid SVG (`graph` / `schema-svg-view`), avec crayon `✎` en haut à droite ouvrant le générateur de données (`#data-generator-modal`).
     - La vue code source Mermaid éditable (`uml` / `schema-mermaid-view`), persistée en `localStorage`, réinitialisable via `schema-reset-btn` et dotée du crayon `✎` ouvrant le générateur de données de la table courante (`#data-generator-modal`).
     - La vue prompt IA diagramme ERD (`<>uml` / `schema-prompt-view`) copiable via `copySchemaPrompt()`, avec crayon `✎` d'édition du générateur de données.
     - Le bouton `+ Table` dans l'en-tête de l'Étape 2 ouvre `#add-schema-modal` pour enregistrer des modèles Mermaid personnalisés avec prompt IA d'accompagnement.
   - Les panneaux de données tabulaires d'Étapes 3 et 5 (`step-3-table-panel`, `step-5-table-panel`) disposent d'un sélecteur à 4 vues (`data`, `uml`, `graph`, `<>visuels`) :
     - `data` affiche le tableau interactif Grid.js reflétant précisément l'UML de chaque réponse (`STEP_UML_SCHEMAS[step][opt]`), avec sélecteur de table (`#step-X-data-table-select`), drilldown relationnel 1-N cliquable (`count ↗`, `drillDownToStepTable`), jointures N-1 avec nom résolu, bouton de retour (`#step-X-data-back-btn`, `drillBackToStepTable`), badge de filtre actif, tri multi-colonnes, pagination 10 lignes par page, colonnes calibrées avec badges PK/FK, et variation naturelle des mesures calculées par ligne.
     - `uml` affiche le code source Mermaid ERD éditable en direct dans un textarea persistant.
     - `graph` affiche le schéma relationnel SVG propre à chaque option (table principale reliée à 2–3 tables secondaires) avec pan/zoom, crayon `✎` d'édition des mesures ouvrant la modale SAP IBP `#mesure-generator-modal` (forme distribuée ou formule compacte avec autocomplétion et validation instantanée, barre d'actions harmonisée `Sauvegarder`/`Regénérer`/`Restaurer`), et mode édition si mesure personnalisée (`+ Mesure` / `#add-custom-measure-modal`).
     - `<>visuels` affiche le prompt IA structuré proposant 3 idées de visuels compatibles SAP-IBP / SAC (`step-X-visuels-view`, `copyVisuelsPrompt(step)`).
   - Les panneaux graphiques d'Étapes 4 et 6 (`step-4-chart-panel`, `step-6-chart-panel`) intègrent le bouton `+ Visuel` dans l'en-tête et disposent d'un sélecteur à 6 vues (`data`, `graph`, `js`, `<>js`, `<>visuels`, `<>sap`) : `data` affiche les données de la série sous forme de tableau avec crayon `✎` ouvrant `#graph-data-generator-modal` (moyenne et dispersion/écart-type paramétrables par série) modifiant dynamiquement le canvas du graphique, `graph` affiche le rendu canvas Chart.js actif (`step-X-chart-view`), `js` présente la configuration JSON éditable de l'objet Chart.js (`step-X-config-view`, `onChartConfigChange(step, val)`) avec répercussion instantanée sur le rendu graphique `graph` et persistance `localStorage`, `<>js` affiche le prompt IA permettant de générer une configuration Chart.js à partir des entrées calculées et des schémas 2.A/2.B (`step-X-chartjs-prompt-view`), `<>visuels` expose le prompt IA structuré de génération de 3 idées de visuels SAP-IBP / SAC basé sur les étapes 1, 2, 3/5 et 4/6 (`step-X-visuels-view`, `copyVisuelsPrompt(step)`), et `<>sap` affiche le prompt IA permettant d'obtenir les hypothèses et instructions pas à pas pour SAP-IBP / SAC (`step-X-sap-view`). Les cartes de réponses des Étapes 4 et 6 n'affichent plus de bloc `ans-meta` pour épurer l'interface.
   - Les encadrés graphiques de synthèse en Étape 7 (`card-step-7-chart-q4`, `card-step-7-chart-q6`) disposent de switches (`ui`, `config`, `sap`) pour basculer directement entre le rendu visuel, la configuration Chart.js éditable synchronisée en live (`onDashboardConfigChange(step, val)`) et le prompt de transposition SAP.

4. **Étape 0 — Lecteur Markdown :** la page Étape 0 charge à la volée (via `fetch`) les fichiers `*.md` du dossier racine (`ROOT_MD_FILES` dans le script) et les rend avec marked.js (CDN). Ne jamais copier le contenu des `.md` dans le HTML. Nécessite un serveur HTTP (file:// bloque le fetch).

5. **Règles métier contraintes dans le code :** les contraintes fonctionnelles conditionnant le comportement des options (ex. 3.A indisponible en 2.B, badges d'usages) sont documentées dans `content.md`. Toute évolution de ces règles doit partir de `content.md`, puis être reportée dans `index.html`.

6. **Règles de Layout UI & Redimensionnement (Panels & Answer Cards Étapes 2 à 6) :**
   - **Panels answers à gauche (`answers-scroll-area`) :** le panneau d'options/réponses à gauche (Étapes 2, 3, 4, 5 et 6) doit être **strictement scrollable verticalement** (`overflow-y: auto`, `overflow-x: hidden`, `h-full max-h-full min-h-0`), sans jamais provoquer de défilement ou d'overflow sur la page entière (`document.body`).
   - **Answer cards individuelles :** la carte réponse en height doit **occuper tout son contenu** de manière naturelle (`min-height: auto`, `height: auto`, `overflow: visible`, `flex-shrink: 0`, aucun `overflow-y` interne ou masquage de texte). C'est le panel parent qui scrolle, jamais la carte elle-même.
   - **Panels de droite (Modèle SVG/Mermaid, Tableaux de Faits/Capacité, Graphiques Chart.js) :** doivent occuper **100 % de la hauteur disponible** (`h-full max-h-full min-h-0 overflow-hidden`), sans overflow ni barre de défilement externe ; c'est au composant visuel (Canvas Chart.js, schéma SVG ou container tableau) de s'adapter dynamiquement à la hauteur restante (`flex-1 min-w-0`).
   - **Redimensionnement interactif (Splitter) :** un splitter central (`#step-X-splitter`, visible dès l'écran `lg`) sépare le panneau de gauche et le panneau de droite pour les Étapes 2 à 6. Le drag & drop horizontal ajuste la largeur (bornée entre 18% et 82%) et la ratio est persistée en local storage (`maestro_split_ratio_step_X`). Un double-clic sur la poignée réinitialise la largeur à sa valeur nominale (~41.7%).

---

## 3. Workflow de Validation & Déploiement

À la fin de chaque demande utilisateur impliquant une modification :

1. **Vérification de l'intégrité :**
   - Contrôler que `index.html` et `content.md` sont rigoureusement synchronisés.
   - Vérifier la syntaxe du script : `node -e "..."`.

2. **Git Commit, Push & Déploiement Firebase :**
   > ⚠️ **RÈGLE STRICTE DE DÉPLOIEMENT :** Ne committer, pusher sur GitHub et déployer sur Firebase Hosting **QUE si l'utilisateur le demande explicitement** dans sa commande. En l'absence de demande explicite, valider localement et présenter le résultat sans lancer de déploiement automatique.
   - Si demandé par l'utilisateur :
     ```powershell
     git add <fichiers modifiés>; git commit -m "<type>: <description claire>"; git push origin main
     npx -y firebase-tools deploy --only hosting
     ```

3. **Restitution à l'utilisateur :**
   - Fournir un résumé concis des changements effectués.
   - Rappeler les deux URLs de consultation :
     - Firebase : [https://bimaestro.web.app](https://bimaestro.web.app)
     - GitHub Pages : [https://quangfr.github.io/bimaestro/](https://quangfr.github.io/bimaestro/)