# BIMAESTRO - Prototype & Guide de Prompts IA pour le Cadrage Décisionnel MAESTRO 🚀

> **Guide Opérationnel & Catalogue de Prompts IA** pour concevoir, prototyper et éprouver des tableaux de bord industriels.  
> **Distinction & Contexte applicatif :** **BiMaestro** est le prototype agile interactif (SPA HTML/Chart.js) servant d'environnement d'idéation et de test rapide, à distinguer de l'outil industriel cible **MAESTRO** basé sur **SAP Integrated Business Planning (SAP IBP)** et ses **Analytics Stories (SAP Analytics Cloud)**. Il permet d'itérer à haute cadence avec l'IA avant d'engager les développements dans l'écosystème officiel SAP.

---

## 1. Vision & Architecture de Prototypage IA

L'objectif de Maestro est de transformer une expression de besoin métier en spécifications décisionnelles exploitables dans **SAP IBP Analytics Stories**, en exploitant l'IA comme pair-programmeur et copilote méthodologique à travers 5 approches complémentaires intégrées :

```text
                     ┌────────────────────────────────────────────────────────┐
                     │                     BESOIN MÉTIER                      │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
       ┌───────────────────┬────────────────────┼────────────────────┬────────────────────┐
       │ (Prompt 2.2)      │ (Prompt 2.3)       │ (Prompt 2.4)       │ (Prompt 2.1)       │ (Prompt 2.5)
       ▼                   ▼                    ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐      ┌──────────────┐
│  Modèle ERD  │   │   3 Idées    │     │ Visualisation│     │ Transposition│      │ Spécification│
│   (Mermaid)  │   │   Visuels    │     │   Chart.js   │     │  SAC / IBP   │      │ Exemples 4/6 │
│   (Étape 2)  │   │ (Étapes 3..6)│     │ (Étapes 3..6)│     │ (Étapes 4/6) │      │ (Étapes 4/6) │
└──────┬───────┘   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘      └──────┬───────┘
       │                  │                    │                    │                     │
       ▼                  ▼                    ▼                    ▼                     ▼
Étape 2 (Modèle)   3 Idées cadrées      Code JS Chart.js     Hypothèses & Pas-à-pas   Story SAC & Formules
UML & Entités MRO  Format SORTIE SAC    Données de démo      Rétro-ingénierie         Catalogue standard
```

### Règles d'Architecture & Modèle de Données (alignées sur `content.md`) :

#### 1. Modèle de Données & Master Data Types (SAP IBP)
1. **Les deux niveaux de granularité didactiques :**
   - **Option 2.A — Macro : Consolidation Demande (`MDT_MAINTENANCE_REQUEST`) :** 1 ligne = 1 demande de visite globale (`D-YYYY-XXXXXX`). Simple MDT pour la vision S&OP, la relation client (SLA) et le pilotage du TAT moteur consolidé.
   - **Option 2.B — Atelier : Lignes d'Intervention (`MDT_INTERVENTION`) :** 1 ligne = 1 intervention unitaire sur poste ou station (`I-YYYY-XXXXXX-ZZ`). Compound MDT avec clés composites (`ID_DEMANDE` + `ID_INTERVENTION`) pour l'ordonnancement fin et le suivi de charge.
2. **Règles architecturales du réseau d'atelier SAE :**
   - **10 Ateliers / Shops industriels (`S-XXX`) :** S-VIL (Villaroche), S-MON (Montereau), S-CHL (Châtellerault), S-BRU (Bruxelles), S-TLS (Toulouse), S-SQY (Saint-Quentin), S-GEN (Gennevilliers), S-BDX (Bordeaux), S-LGG (Liège), S-CRE (Le Creusot).
   - **Stations de réparation unifiées (`S-XXX-YY`) :** 3 à 10 stations par shop (ex: S-MON-01 à S-MON-06).
   - **8 Types de réparation (`T-XXXXXX`) :** T-INSCND, T-AUBTUR, T-MAJLOU, T-BANESS, T-EQUROT, T-COMHOT, T-REVCAR, T-FODREP (chacun couvrant 2 à 3 familles moteurs, chaque shop gérant 2 à 4 types).
3. **Planning Levels & Calculs de Key Figures :**
   - Granularité stricte des Key Figures : au niveau de base (*Base Level Calculation* : `Estimated Repair Duration`, `Shop Queue Time`) vs agrégations montantes (*Aggregated Key Figures* : `Total Engine TAT`, `Taux de Retard`).
   - Fonctions déterministes supportées en temps réel (`IF`, `ISNULL`, arithmétique) ; calculs lourds ou prédictifs (ML) exécutés en batch.

#### 2. Limites & Contraintes Ergonomiques SAP Analytics Stories (SAC)
1. **Catalogue de visualisations natives :** KPI Cards, Bar/Column (standard, groupé, 100%), Boxplot (P5/P50/P95), Waterfall, Heatmap 2D, Bullet Chart, Dual-Axis Combo Bar-Line, Treemap avec drill-down.
2. **Plafond de volumétrie :** Seuil de performance SAC (500 à 5 000 points max par widget) imposant le filtrage en amont (Story Filters / Input Controls) pour les données fines d'atelier.
3. **Calculs côté Story vs Backend IBP :** Calcul des métriques critiques dans le moteur IBP pour préserver la réactivité de consultation SAC.
4. **Thresholds & Lignes de référence :** Seuils d'alertes visuels normalisés (seuil de tolérance 10%, seuil de saturation critique 85%, engagement contractuel P85).

---

## 2. Guide de Prompting IA : Prototypage & Spécifications SAP

Ce guide met à disposition cinq canevas de prompting directifs pour interagir efficacement avec un LLM (ChatGPT, Claude, Gemini). Chaque bloc de code ci-dessous est **directement copiable** dans le presse-papier grâce à l'icône de copie (`⧉`) située en haut à droite de son conteneur ou via les boutons de l'interface BiMaestro.

---

### 2.1 Transposer un visuel dans SAP-IBP / SAP Analytics Stories (Switch `sap`)

**Objectif & Démarche :**
1. **Point de départ :** On dispose d'un visuel (standard ou personnalisé) affiché en **Étape 4** (délais / TAT) ou **Étape 6** (charge / capacité), ainsi que des modèles relationnels ERD Mermaid (2.A et 2.B) définis en **Étape 2**.
2. **Extraction automatique :** Dans le panneau graphique de droite, le switch **`sap`** génère automatiquement le prompt ci-dessous contenant le code JavaScript Chart.js du visuel sélectionné et les deux schémas relationnels Mermaid.
3. **Restitution IA attendue :** En soumettant ce prompt à un LLM (ChatGPT, Claude, Gemini), celui-ci produit :
   - Les **hypothèses fonctionnelles et techniques** (Master Data Types, granularité temporelle et organisationnelle, Key Figures associées).
   - Les **instructions pas à pas** pour implémenter et paramétrer le même graphique dans **SAP-IBP** et **SAP Analytics Cloud (SAC)** (type de composant SAC, dimensions en axe X/séries, mesures, formules de calcul Base Planning Level, Input Controls et seuils conditionnels).

````markdown
Générer les hypothèses et les instructions pour utiliser SAP-IBP / SAP Analytics Stories pour générer le même graphique pas à pas, en connaissant le VISUEL et les ENTRÉES :

VISUEL :
```javascript
[code js chartjs]
```

ENTRÉES :
--- Modèle 2.A (Consolidation Demande) ---
```mermaid
[Schéma Mermaid 2.A]
```

--- Modèle 2.B (Lignes d'Intervention) ---
```mermaid
[Schéma Mermaid 2.B]
```
````

---

### 2.2 Générer un diagramme Entité-Relationnel (ERD Mermaid)

**Objectif & Démarche :**
1. Pour explorer de nouveaux visuels ou injecter des données fictives plausibles, il est crucial d'enrichir le contexte de l'IA avec une compréhension rigoureuse du modèle de données métier ou SAP-IBP.
2. Grâce au prompt structuré ci-dessous, l'IA génère la structure de données formelle sous la forme d'un diagramme Entité-Relationnel Mermaid (`erDiagram`).
3. **Visualisation instantanée dans BI Maestro :** Vous pouvez copier le bloc Mermaid généré par l'IA et le **coller directement dans la vue code source (`uml`) du panneau de l'Étape 2**. Le schéma relationnel interactif se met à jour en temps réel.

```markdown
Génère un diagramme ERD Mermaid :

**Type :** Type avec `*` devant si une valeur est obligatoire à la création.
**Nom :** Nom court.
**Contraintes :** `PK`, `FK`, `UK` si applicable.
**Commentaire :** Exemple concret si texte libre, ou liste des valeurs possibles. Mettre `*` sur celle par défaut (ex: `"*true | false"` ou `*DATE_NOW`).
**Relations :** Cardinalités Mermaid standard avec libellé débutant par un verbe à l'infinitif.
```

---

### 2.3 Générer 3 idées de visuels compatibles SAP-IBP / SAC (Switch `visuels`)

**Objectif & Démarche :**
1. **Point de départ :** Disponible dans les panneaux latéraux des **Étapes 3 et 5** (tables de calcul) et des **Étapes 4 et 6** (graphiques).
2. **Extraction automatique :** Le switch **`visuels`** prépare un prompt structuré complet basé sur :
   - L'objectif métier retenu en **Étape 1** (Persona & Enjeu),
   - Les modèles relationnels ERD Mermaid 2.A & 2.B de l'**Étape 2**,
   - La méthode de calcul TAT (Étape 3) ou capacitaire (Étape 5),
   - Le visuel actif en Étape 4 ou 6 (pour les étapes graphiques).
3. **Restitution IA attendue :** L'IA propose 3 idées de visuels structurées sous forme de blocs de code suivant fidèlement la structure de spécification SAC (`SORTIE`).

```markdown
Générer 3 idées de visuels compatibles avec SAP-IBP / SAC, chacune est dans un bloc de code qui suit la structure exacte suivante SORTIE sur la base des ENTRÉES : 

SORTIE

- Titre : 
- Contexte : 
- Type  : (type de graphique)
- Axe X : (éventuellement X1, X2 selon les graphiques)
- Axe Y : (idem)

- Dimensions :
  * NOM_DIMENSION (Description ou liste de valeurs séparé d'une virgule) 

- Mesures :
  * NOM_MESURE (Description et exemples)

- Filtres : (suggestions de dimensions en filtre sur le graphique)
- Règles : (instructions sur la génération automatique des données, nombre d'éléments, moyenne, distribution et intervalle pour les valeurs)

ENTRÉES
--- Objectif Métier (Étape 1) ---
[Objectif Étape 1 sélectionné]

--- Modèles Relationnels ERD (Étapes 2.A et 2.B) ---
[Schémas Mermaid 2.A & 2.B]

--- Méthode de Calcul TAT / Capacité (Étape 3 ou 5) ---
[Option & Logique de calcul sélectionnée]

--- Visuel Sélectionné (pour les Étapes 4 et 6) ---
[Titre & Description du visuel]
```

---

### 2.4 Créer un visuel ChartJS agile et des données d'exemple (Switch `chartjs`)

**Objectif & Démarche :**
1. **Point de départ :** Utilisable depuis les tables d'**Étapes 3 et 5** (switch `chartjs`) ou les graphiques d'**Étapes 4 et 6** (switch `chartjs` et modale d'ajout de visuel personnalisé).
2. **Extraction automatique :** Le prompt compile la table de calcul active (DAX / logique), le contexte du visuel visé et les modèles relationnels 2.A/2.B.
3. **Intégration directe :** L'IA produit un bloc de code JavaScript Chart.js sans les accolades extérieures `{ }` contenant `type`, `data` (avec données de démo) et `options`. Ce bloc peut être copié et collé directement dans l'éditeur de configuration (`config`) ou dans la modale de visuel personnalisé pour un rendu instantané.

```markdown
Proposer une visualisation pertinente basée sur les ENTRÉES dans un code bloc au format contenu sans le { } de l'objet js de ChartJS avec un minimum de données d'exemples.

ENTRÉES
Titre du visuel : "[Ex: Dérive TAT par Atelier & Spécialité]"
Description : "[Ex: Comparatif du délai moyen constaté selon les grands segments de réparation]"
[Méthode de calcul & Table de faits issue de l'Étape 3 ou 5]

Modèles Relationnels ERD (2.A et 2.B) :
--- Modèle 2.A (Consolidation Demande) ---
[Schéma Mermaid 2.A]

--- Modèle 2.B (Lignes d'Intervention) ---
[Schéma Mermaid 2.B]
```

---

### 2.5 Explorer et spécifier les visuels standards BIMAESTRO pour SAC

**Objectif & Démarche :**
1. **Point de départ :** Sélection d'un des 9 visuels prédéfinis du catalogue BIMAESTRO en **Étape 4** (4.A à 4.I) ou en **Étape 6** (6.A à 6.I).
2. **Usage didactique :** Ce template fournit le canevas de spécification complet utilisé dans la documentation et la transposition SAP Analytics Stories.
3. **Restitution IA attendue :** Un prototype autonome (HTML/Tailwind/Chart.js) et le cadrage technique pour configurer le widget dans une Story SAC connectée à SAP-IBP.

```markdown
Générer un graphique en HTML à la SAP-IBP / SAC incluant dedans les instructions pour le faire pas à pas
- Titre : "[Titre du visuel BIMAESTRO sélectionné]"

- Contexte : 
"[Description et contexte opérationnel du visuel]"

- Type  : [Type de composant SAC / Chart.js recommandé]
- Modèle & Grain : [MDT_MAINTENANCE_REQUEST ou MDT_INTERVENTION] — [Grain unitaire]
- Axe X : [Dimension temporelle, catégorielle ou organisationnelle]
- Axe Y : [Métrique ou indicateur principal]

- Dimensions :
  * [Liste des dimensions requises]
- Mesures :
  * [Liste des Key Figures IBP / mesures associées]

- Filtres : 
[Story Filters / Input Controls indispensables]
- Règles : 
[Formules de calcul, seuils d'alerte et règles métier]
```

---

## 5. Synthèse des 7 Étapes de Cadrage Maestro

| Étape | Question Clé de Cadrage | Choix Directeurs Disponibles | Restitution Analytics Stories |
| :---: | :--- | :--- | :--- |
| **Contexte** | Quel est le périmètre opérationnel et le rôle de la gouvernance ? | Spécifications projet, Golden Source, RLS/RBAC | Lecteur Markdown & pretty-print JSON dynamique |
| **Question** | Quel est le premier problème prioritaire à résoudre ? | AOG (1.A), SLA (1.B), Capacité (1.C), Pénalités (1.D), Pièces (1.E), Gouvernance (1.F) | Définition du Persona & KPIs d'alerte prioritaires |
| **Modèle** | Quel est le niveau de détail unitaire de la table de faits ? | Macro `visit` (2.A), Intervention `intervention` (2.B) | Schéma relationnel (Canvas SVG interactif vs Mermaid `erDiagram`) |
| **TAT** | Quelle méthode mathématique calcule le délai de traitement ? | Théorique (3.A), Statistiques $P_5/P_{50}/P_{95}$ (3.B), Occupation atelier (3.C), Avancée (3.D) | Formule DAX / Key Figure calculée et tableau dynamique |
| **Délai** | Comment visualiser le Turn Around Time pour décider ? | Boxplot (4.A), Stacked Sites (4.B), Clients (4.C), Listing ESN (4.D), KPIs (4.E), P85 (4.F), Waterfall (4.G), Gates (4.H) | Graphique temporel Chart.js 4.4 calibré |
| **Capacité** | Quelle logique modélise la capacité et la charge d'atelier ? | S&OP déterministe (5.A), Live WIP (5.B), Flux Pièces OTIF (5.C), Multi-factoriel (5.D) | Bilan de charge prévisionnelle et saturation |
| **Saturation** | Quelle visualisation révèle les tensions et les goulots ? | Pièces (6.A), Retards (6.B), Navettes (6.C), Ratio Lean (6.D), Seuil 85% (6.E), Heatmap (6.F), WIP In/Out (6.G), Treemap (6.H) | Graphique de charge Chart.js 4.4 calibré |
| **Synthèse** | Comment assembler le tableau de bord exécutif final ? | Ajustement temps réel Q1-Q6, filtres multi-axes (Site, Moteur, Client, Date prévisionnelle) | Analytics Story interactive avec quatuor de KPIs et double graphique |

---

## 6. Environnement de Prototypage Local & Déploiement

### Exécution Locale
L'application fonctionne comme une Single Page Application (SPA) sans compilation serveur. Un serveur HTTP local est requis pour le chargement dynamique `fetch` de l'Étape 0 :
```powershell
npx -y live-server --port=8080 --no-browser --entry-file=index.html
```
URL locale : `http://localhost:8080`.

### Déploiement Cloud
- **Firebase Hosting :** [https://bimaestro.web.app](https://bimaestro.web.app) (miroir : [https://gomaestro-app.web.app](https://gomaestro-app.web.app))
- **GitHub Pages :** [https://quangfr.github.io/bimaestro/](https://quangfr.github.io/bimaestro/)
