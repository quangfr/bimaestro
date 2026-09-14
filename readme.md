# BIMAESTRO - Prototype & Guide de Prompts IA pour le Cadrage Décisionnel MAESTRO 🚀

> **Guide Opérationnel & Catalogue de Prompts IA** pour concevoir, prototyper et éprouver des tableaux de bord industriels.  
> **Distinction & Contexte applicatif :** **BiMaestro** est le prototype agile interactif (SPA HTML/Chart.js) servant d'environnement d'idéation et de test rapide, à distinguer de l'outil industriel cible **MAESTRO** basé sur **SAP Integrated Business Planning (SAP IBP)** et ses **Analytics Stories (SAP Analytics Cloud)**. Il permet d'itérer à haute cadence avec l'IA avant d'engager les développements dans l'écosystème officiel SAP.

---

## 1. Vision & Architecture de Prototypage IA

L'objectif de Maestro est de transformer une expression de besoin métier en spécifications décisionnelles exploitables dans **SAP IBP Analytics Stories**, en exploitant l'IA comme pair-programmeur et copilote méthodologique à travers 4 approches complémentaires :

```text
                     ┌────────────────────────────────────────────────────────┐
                     │                     BESOIN MÉTIER                      │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
       ┌───────────────────┬────────────────────┴───────────────────┬────────────────────┐
       │ (Prompt 2.2)      │ (Prompt 2.3)                           │ (Prompt 2.1)       │ (Prompt 2.4)
       ▼                   ▼                                        ▼                    ▼
┌──────────────┐   ┌──────────────┐                        ┌──────────────┐      ┌──────────────┐
│  Modèle ERD  │   │ Visuel Agile │                        │ Transposition│      │ Spécification│
│   (Mermaid)  │   │   Chart.js   │ ──personnalisé──>      │  SAC / IBP   │      │ Exemples 4/6 │
└──────┬───────┘   └──────┬───────┘                        └──────┬───────┘      └──────┬───────┘
       │                  │                                        │                     │
       ▼                  ▼                                        ▼                     ▼
Étape 2 (Modèle)   Étapes 4 & 6 (Visuels)                  Hypothèses & Pas-à-pas   Story SAC & Formules
UML & Entités MRO  Rendu & Données Démo                    Rétro-ingénierie         Catalogue standard
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

Ce guide met à disposition quatre canevas de prompting directifs pour interagir efficacement avec un LLM (ChatGPT, Claude, Gemini). Chaque bloc de code ci-dessous est **directement copiable** dans le presse-papier grâce à l'icône de copie (`⧉`) située en haut à droite de son conteneur.

---

### 2.1 Transposer un visuel dans SAP-IBP / SAP Analytics Stories

**Objectif & Démarche :**
1. **Point de départ :** On dispose d'un visuel personnalisé ou prototypé en **Étape 4** (délais / TAT) ou **Étape 6** (charge / capacité), ainsi que des modèles relationnels ERD Mermaid (2.A et 2.B) définis en **Étape 2**.
2. **Extraction automatique :** Lorsqu'un visuel personnalisé est sélectionné, l'onglet `<>` du panneau graphique de droite génère automatiquement le prompt ci-dessous avec le code JavaScript Chart.js du visuel et les deux schémas relationnels Mermaid.
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

### 2.2 Générer un diagramme Entité-Relationnel (ERD)

**Objectif & Démarche :**
1. Pour explorer de nouveaux visuels ou injecter des données fictives plausibles, il est crucial d'enrichir le contexte de l'IA avec une compréhension rigoureuse du modèle de données métier ou SAP-IBP.
2. Grâce au prompt structuré ci-dessous, l'IA génère la structure de données formelle sous la forme d'un diagramme Entité-Relationnel Mermaid (`erDiagram`).
3. **Visualisation instantanée dans BI Maestro :** Vous pouvez copier le bloc Mermaid généré par l'IA et le **coller directement dans l'éditeur de code (`<>`) du panneau droit de l'Étape 2 (Modèle)**. Vous visualiserez ainsi immédiatement le schéma relationnel sans impacter le reste de l'application.

```markdown
Génère un diagramme ERD Mermaid :

**Type :** Type avec `*` devant si une valeur est obligatoire à la création.
**Nom :** Nom court.
**Contraintes :** `PK`, `FK`, `UK` si applicable.
**Commentaire :** Exemple concret si texte libre, ou liste des valeurs possibles. Mettre `*` sur celle par défaut (ex: `"*true | false"` ou `*DATE_NOW`).
**Relations :** Cardinalités Mermaid standard avec libellé débutant par un verbe à l'infinitif.
```

---

### 2.3 Créer un visuel ChartJS et des données d'exemple

**Objectif & Démarche :**
1. **Point de départ :** On s'appuie sur le modèle de données retenu en **Étape 2** (Macro Demande `visit` ou Atelier `intervention`) et sur la méthode de calcul choisie en amont (**Étape 3** pour le TAT / délais, ou **Étape 5** pour la charge / capacité).
2. **Cadrage du besoin :** Dans la modale d'ajout d'un visuel personnalisé (accessible depuis l'Étape 4 ou l'Étape 6), on saisit le **titre du visuel** souhaité et, facultativement, sa **description** ainsi que les personas ciblés.
3. **Génération du prompt enrichi :** En cliquant sur **"Copier le prompt IA"**, le prompt est automatiquement alimenté avec :
   - Le modèle de données ERD Mermaid,
   - La méthode de calcul et la table de faits sélectionnées,
   - Le titre et la description saisis en cours dans la modale.
4. **Intégration directe :** On soumet ce prompt à un LLM (ChatGPT, Claude, Gemini). Celui-ci produit le code JavaScript Chart.js prêt à l'emploi (avec un jeu de données de démonstration cohérent). Il suffit de coller le code dans la modale pour voir le graphique s'afficher instantanément dans l'application.

```markdown
Proposer une visualisation pertinente basée sur les ENTRÉES dans un code bloc au format contenu sans le { } de l'objet js de ChartJS avec un minimum de données d'exemples.

ENTRÉES
Titre du visuel : "[Ex: Dérive TAT par Atelier & Spécialité]"
Description : "[Ex: Comparatif du délai moyen constaté selon les grands segments de réparation]"
[Méthode de calcul & Table de faits issue de l'Étape 3 ou 5]

Modèles Relationnels ERD (2.A et 2.B) :
[Schéma Mermaid 2.A & 2.B]
```

---

### 2.4 Explorer les exemples de visuel BIMAESTRO avec l'IA et dans SAP-IBP/SAC

**Objectif & Démarche :**
1. **Point de départ :** On sélectionne l'un des graphiques prédéfinis du catalogue BIMAESTRO en **Étape 4** (Boxplot 4.A, Stacked 4.B, Clients 4.C, Listing ESN 4.D, KPIs 4.E, P85 4.F, Waterfall 4.G, Gates 4.H) ou en **Étape 6** (Pièces 6.A, Retards 6.B, Navettes 6.C, Lean 6.D, Seuil 85% 6.E, Heatmap 6.F, In/Out 6.G, Treemap 6.H).
2. **Extraction automatique :** Dans le panneau graphique de droite, l'onglet `<>` (accessible aussi via le bouton `⧉`) génère la fiche de spécification formelle du visuel actif (titre, contexte opérationnel, type, modèle MDT, dimensions, mesures, filtres et règles métier).
3. **Exploration & Restitution IA :** En soumettant ce prompt à un LLM, on obtient à la fois :
   - Un prototype autonome (code HTML/Tailwind/Chart.js) pour explorer des variantes ou tester d'autres jeux de données.
   - Les directives complètes pour recréer le visuel dans **SAP Analytics Cloud (SAC)** et mapper les calculs dans **SAP-IBP**.

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
