# AGENTS.md - Guide de Développement & Règles pour Agents IA (Maestro)

> **Objectif de ce document :**
> Contexte opérationnel pour toute IA ou développeur intervenant sur le projet **Maestro**. Ce guide est **purement technique** : il identifie les fichiers du projet, leurs responsabilités et les règles de gestion du vibe coding. Tout contenu métier/fonctionnel de l'application relève exclusivement de `content.md` (synchronisé avec `index.html`) — il ne doit **pas** être dupliqué ici.

---

## 1. Rôle des Fichiers du Projet

| Fichier | Responsabilité |
| :--- | :--- |
| `index.html` | **Application SPA unique** : balisage, stylage (Tailwind CDN), SVG inline, Canvas 2D et scripts JS. Contient tout le code exécutable. |
| `content.md` | **Référentiel métier & fonctionnel** synchronisé avec `index.html` : libellés, règles, formules DAX, schémas relationnels et diagrammes Mermaid. Source unique du contenu de l'application. |
| `readme.md` | Contexte opérationnel SAE MRO affiché par défaut dans l'**Étape 0** (lecteur Markdown). |
| `gouvernance.md` | Référentiel Méthodologique Data & Gouvernance chargé à la volée dans la modale d'information `(i)`. |
| `AGENTS.md` | Le présent guide technique pour agents IA. |
| `firebase.json` / `.firebaserc` | Configuration du déploiement Firebase Hosting (`public: "."`). |

Structure :

```text
├── index.html          # Application SPA (code exécutable)
├── content.md          # Référentiel métier synchronisé avec index.html
├── readme.md           # Contexte opérationnel & prompts IA (affiché en Étape 0)
├── gouvernance.md      # Référentiel Méthodologique Data & Gouvernance (modale et Étape 0)
├── AGENTS.md           # Le présent guide technique
├── firebase.json       # Config Firebase Hosting (public: ".", site: "bimaestro")
└── .firebaserc         # Projet Firebase (go-maestro / GoMaestro)
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

3. **Édition de `index.html` (+2100 lignes) :**
   - Privilégier des remplacements ciblés et vérifiés plutôt que des réécritures complètes.
   - Respecter les IDs existants et standardisés :
     - **Cards principales d'étapes :** `card-step-0` à `card-step-7`.
     - **Panels de réponses / options :** `step-1-answers` à `step-6-answers`, et cartes d'options individuelles `opt-X-Y` (`opt-X-Y-body`, `opt-X-Y-illust`).
     - **Panels latéraux droits (Étapes 2 à 6) :** `step-2-schema-panel`, `step-3-table-panel`, `step-4-chart-panel`, `step-5-table-panel`, `step-6-chart-panel`.
     - **Composants Étape 7 :** `card-step-7-dashboard`, `card-step-7-chart-q4`, `card-step-7-chart-q6`, `mock-kpis`.
     - **Éléments techniques :** `schema-mermaid-diagram`, `schema-svg-view`, `schema-mermaid-view`, `schema-toggle`, `md-file-select`, `md-render`, `step3-table-container`, `step5-table-container`, `select-q1` à `select-q6`, `tab-X`.
   - La fonction `drawSchema(granularity)` / `renderMermaidVisual(granularity)` (`A`/`B`) dessine dynamiquement le schéma relationnel Mermaid ERD dans `schema-mermaid-diagram` (vue `svg`). Le bouton `schema-toggle` en haut à gauche du panel bascule entre la vue visuelle Mermaid SVG (`svg` / `schema-svg-view`) et la vue code source Mermaid éditable (`<>` / `schema-mermaid-view`), persistée en `localStorage` et réinitialisable via `schema-reset-btn`.

4. **Étape 0 — Lecteur Markdown :** la page Étape 0 charge à la volée (via `fetch`) les fichiers `*.md` du dossier racine (`ROOT_MD_FILES` dans le script) et les rend avec marked.js (CDN). Ne jamais copier le contenu des `.md` dans le HTML. Nécessite un serveur HTTP (file:// bloque le fetch).

5. **Règles métier contraintes dans le code :** les contraintes fonctionnelles conditionnant le comportement des options (ex. 3.A indisponible en 2.B, badges d'usages) sont documentées dans `content.md`. Toute évolution de ces règles doit partir de `content.md`, puis être reportée dans `index.html`.

6. **Règles de Layout UI (Panels & Answer Cards Étapes 2 à 6) :**
   - **Panels answers à gauche (`answers-scroll-area`) :** le panneau d'options/réponses à gauche (Étapes 2, 3, 4, 5 et 6) doit être **strictement scrollable verticalement** (`overflow-y: auto`, `overflow-x: hidden`, `h-full max-h-full min-h-0`), sans jamais provoquer de défilement ou d'overflow sur la page entière (`document.body`).
   - **Answer cards individuelles :** la carte réponse en height doit **occuper tout son contenu** de manière naturelle (`min-height: auto`, `height: auto`, `overflow: visible`, `flex-shrink: 0`, aucun `overflow-y` interne ou masquage de texte). C'est le panel parent qui scrolle, jamais la carte elle-même.
   - **Panels de droite (Modèle SVG/Mermaid, Tableaux de Faits/Capacité, Graphiques Chart.js) :** doivent occuper **100 % de la hauteur disponible** (`h-full max-h-full min-h-0 overflow-hidden`), sans overflow ni barre de défilement externe ; c'est au composant visuel (Canvas Chart.js, schéma SVG ou container tableau) de s'adapter dynamiquement à la hauteur restante.

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