# BIMAESTRO - Prototype & Guide de Prompts IA pour le Cadrage Décisionnel MAESTRO 🚀

> **Guide Opérationnel & Catalogue de Prompts IA** pour concevoir, prototyper et éprouver des tableaux de bord industriels.  
> **Distinction applicative :** **BiMaestro** est le prototype agile interactif (SPA HTML/Chart.js) servant d'environnement d'idéation et de test rapide, à distinguer de l'outil cible **MAESTRO** basé sur **SAP Integrated Business Planning (SAP IBP)** et ses **Analytics Stories (SAP Analytics Cloud)**.

---

## 1. Vision & Architecture de Prototypage IA

Maestro transforme une expression de besoin métier en spécifications décisionnelles exploitables dans **SAP IBP Analytics Stories** grâce à 5 approches de prompting IA :

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

### Règles d'Architecture & Modèle de Données (alignées sur `content.md`)

#### 1. Modèle de Données & Master Data Types (SAP IBP)
1. **Deux niveaux de granularité didactiques :**
   - **Option 2.A — Macro (`MDT_MAINTENANCE_REQUEST`) :** 1 ligne = 1 demande de visite globale (`D-YYYY-XXXXXX`) pour la vision S&OP, les engagements SLA et le TAT consolidé.
   - **Option 2.B — Atelier (`MDT_INTERVENTION`) :** 1 ligne = 1 intervention unitaire sur poste ou station (`I-YYYY-XXXXXX-ZZ`) pour l'ordonnancement fin et le suivi de charge.
2. **Règles réseau d'atelier SAE :**
   - **10 Ateliers / Shops (`S-XXX`) :** S-VIL, S-MON, S-CHL, S-BRU, S-TLS, S-SQY, S-GEN, S-BDX, S-LGG, S-CRE.
   - **Stations unifiées (`S-XXX-YY`) :** 3 à 10 stations par atelier.
   - **8 Types de réparation (`T-XXXXXX`) :** 2 à 3 familles moteurs par type, 2 à 4 types par atelier.
3. **Key Figures & Planning Levels :** Calculs de base (*Base Level* : durées opératoires, temps de file) vs agrégations (*Aggregated* : TAT total, taux de retard). Calculs en temps réel ou batch selon la complexité.

#### 2. Limites & Contraintes Ergonomiques SAP Analytics Stories (SAC)
1. **Composants natifs :** KPI Cards, Bar/Column, Boxplot (P5/P50/P95), Waterfall, Heatmap 2D, Bullet Chart, Combo Bar-Line, Treemap hiérarchique.
2. **Volumétrie & Performance :** Plafond recommandé de 500 à 5 000 points par widget ; filtrage en amont (Story Filters / Input Controls).
3. **Répartition des calculs :** Métriques critiques calculées dans IBP pour préserver la fluidité de consultation SAC.
4. **Seuils d'alerte normalisés :** Tolérance de retard (10%), seuil de saturation critique (85%), engagement contractuel (P85).

---

## 2. Guide de Prompting IA : Prototypage & Spécifications SAP

Chaque bloc de code est directement copiable (`⧉`) pour soumission à un LLM (ChatGPT, Claude, Gemini).

---

### 2.1 Transposer un visuel dans SAP-IBP / SAC (Switch `sap`)

**Objectif :** Extraire les hypothèses fonctionnelles/techniques et les instructions pas à pas de configuration dans SAP-IBP et SAC à partir d'un visuel et des schémas ERD.

````markdown
Générer les hypothèses et les instructions pour utiliser SAP-IBP / SAP Analytics Stories pour générer le même graphique pas à pas, en connaissant le VISUEL et les ENTRÉES :

VISUEL :
```javascript
[code js chartjs]
```

ENTRÉES :
--- Modèle (Consolidation Demande) ---
```mermaid
[Schéma Mermaid 2.A]
```

--- Modèle (Lignes d'Intervention) ---
```mermaid
[Schéma Mermaid 2.B]
```
````

---

### 2.2 Générer un diagramme Entité-Relationnel (ERD Mermaid)

**Objectif :** Obtenir un modèle relationnel Mermaid formel (`erDiagram`) injectable directement dans l'éditeur code source (`uml`) de l'Étape 2.

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

**Objectif :** Générer 3 propositions de visuels conformes au format de spécification SAC (`SORTIE`) selon les sélections des étapes 1 à 6.

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

--- Modèles Relationnels ERD ---
[Schémas Mermaid 2.A & 2.B]

--- Méthode de Calcul TAT / Capacité ---
[Option & Logique de calcul sélectionnée]

--- Visuel Sélectionné (pour les Étapes 4 et 6) ---
[Titre & Description du visuel]
```

---

### 2.4 Créer un visuel ChartJS agile et des données d'exemple (Switch `chartjs`)

**Objectif :** Obtenir un bloc JavaScript Chart.js sans `{ }` prêt à coller dans l'éditeur de configuration (`config`) ou dans la modale d'ajout de visuel.

```markdown
Proposer une visualisation pertinente basée sur les ENTRÉES dans un code bloc au format contenu sans le { } de l'objet js de ChartJS avec un minimum de données d'exemples.

ENTRÉES
Titre du visuel : "[Ex: Dérive TAT par Atelier & Spécialité]"
Description : "[Ex: Comparatif du délai moyen constaté selon les grands segments de réparation]"
[Méthode de calcul & Table de faits issue de l'Étape 3 ou 5]

Modèles Relationnels ERD :
--- Modèle (Consolidation Demande) ---
[Schéma Mermaid 2.A]

--- Modèle (Lignes d'Intervention) ---
[Schéma Mermaid 2.B]
```

---

### 2.5 Explorer et spécifier les visuels standards BIMAESTRO pour SAC

**Objectif :** Spécifier un composant décisionnel complet pour une Story SAC connectée à SAP-IBP.

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
| **Contexte** | Périmètre opérationnel et gouvernance ? | Spécifications, Golden Source, RLS/RBAC | Lecteur Markdown & pretty-print JSON dynamique |
| **Question** | Problème prioritaire à résoudre ? | AOG (1.A), SLA (1.B), Capacité (1.C), Pénalités (1.D), Pièces (1.E), Données (1.F) | Persona & KPIs d'alerte prioritaires |
| **Modèle** | Niveau de détail de la table de faits ? | Macro Demande (2.A), Atelier Intervention (2.B) | Schéma relationnel (Visualisation SVG vs code Mermaid) |
| **TAT** | Méthode mathématique de calcul du délai ? | S&OP (3.A), Statistique P5/P50/P95 (3.B), Capacitaire (3.C), ML (3.D) | Formule de calcul et tableau dynamique |
| **Délai** | Visualisation du Turn Around Time ? | Boxplot (4.A), Empilé (4.B), Clients (4.C), Liste (4.D), KPIs (4.E), P85 (4.F), Waterfall (4.G), Gates (4.H), Synthèse (4.I) | Graphique temporel Chart.js calibré & éditable |
| **Capacité** | Logique de modélisation charge / capacité ? | S&OP (5.A), Live WIP (5.B), Logistique OTIF (5.C), ML (5.D) | Bilan de charge prévisionnelle et saturation |
| **Saturation** | Visualisation des tensions et goulots ? | Retards (6.A), Types (6.B), Navettes (6.C), Décomposition (6.D), Postes (6.E), Heatmap (6.F), WIP (6.G), Treemap (6.H), Benchmark (6.I) | Graphique de charge Chart.js calibré & éditable |
| **Synthèse** | Assemblage du tableau de bord exécutif ? | Ajustement temps réel Q1-Q6, filtres multi-axes | Dashboard interactif : KPIs exécutifs et double graphique |

---

## 6. Environnement de Prototypage Local & Déploiement

### Exécution Locale
Application SPA sans serveur applicatif. Serveur HTTP local requis pour les requêtes `fetch` de l'Étape 0 :
```powershell
npx -y live-server --port=8080 --no-browser --entry-file=index.html
```
URL locale : `http://localhost:8080`.

### Déploiement Cloud
- **Firebase Hosting :** [https://bimaestro.web.app](https://bimaestro.web.app) (miroir : [https://gomaestro-app.web.app](https://gomaestro-app.web.app))
- **GitHub Pages :** [https://quangfr.github.io/bimaestro/](https://quangfr.github.io/bimaestro/)

