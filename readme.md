# BIMAESTRO - Prototype & Guide de Prompts IA pour le Cadrage Décisionnel MAESTRO 🚀

> **Guide Opérationnel & Catalogue de Prompts IA** pour concevoir, prototyper et éprouver des tableaux de bord industriels.  
> **Distinction & Contexte applicatif :** **BiMaestro** est le prototype agile interactif (SPA HTML/Chart.js) servant d'environnement d'idéation et de test rapide, à distinguer de l'outil industriel cible **MAESTRO** basé sur **SAP Integrated Business Planning (SAP IBP)** et ses **Analytics Stories (SAP Analytics Cloud)**. Il permet d'itérer à haute cadence avec l'IA avant d'engager les développements dans l'écosystème officiel SAP.

---

## 1. Vision & Architecture de Prototypage IA

L'objectif de Maestro est de transformer une expression de besoin métier en spécifications décisionnelles exploitables dans **SAP IBP Analytics Stories**, en exploitant l'IA comme pair-programmeur et copilote méthodologique :

```text
[ Besoin Métier ] ──(Prompt IA)──> [ Prototypage SPA (HTML/Chart.js) ] ──(Spécification)──> [ SAP IBP Analytics Story ]
                                          ▲                  │
                                          │                  ▼
                                     data.json         UML / erDiagram
                                 (Structure/Dimensions) (Clés & Relations)
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

## 2. Guide de Prompting IA : Conception, Arbitrage & Limites Techniques

Cette section fournit des canevas de prompt directifs pour guider une IA selon les possibilités natives de SAP-IBP et SAC.

### Prompt IA 1 : Cadrage Visuel & Restitution SAC
```markdown
Agis en tant qu'Architecte de Tableaux de Bord & Expert SAP Analytics Stories (SAC).
Contexte : Conception d'un tableau de bord de pilotage industriel MRO / aéronautique.
Question métier : "[Insérer la question, ex: Quels ateliers concentrent les goulots d'étranglement ?]".

En respectant strictement les POSSIBILITÉS NATIVES de SAP Analytics Stories (SAC) :
1. Composant SAC recommandé : sélectionne le visuel standard adapté (KPI Card, Boxplot, Treemap, Waterfall, Combo Chart...).
2. Dimensions & Mesures : précise l'Axe Catégories (X), l'Axe Valeurs (Y) et les Key Figures associées.
3. Volumétrie & Filtres : définis les filtres d'en-tête (Story Filters) pour respecter le seuil de fluidité d'affichage (< 2000 points).
4. Seuils d'Alerte (Thresholds) : indique les paliers visuels opposables (ex: 85% de charge critique, tolérance 10%).
```

### Prompt IA 2 : Cadrage Modèle & Calculs SAP-IBP
```markdown
Agis en tant qu'Architecte Solution SAP Integrated Business Planning (SAP IBP).
Contexte : Modélisation des données MRO et règles de calcul du Turn Around Time (TAT) et de la capacité.
Problématique : "[Insérer le sujet, ex: Calcul du délai prévisionnel pondéré par la saturation atelier]".

En respectant rigoureusement les CONTRAINTES DE SAP IBP :
1. Master Data Types (MDT) : indique les MDTs requis (Simple pour en-tête demande, Compound pour lignes d'intervention) et leurs clés primaires racines.
2. Planning Level : définis le Base Planning Level adéquat pour le stockage des indicateurs.
3. Expression de Calcul : fournis la formule déterministe au niveau de base (Base Level) et la règle d'agrégation temporelle/dimensionnelle.
4. Simulation : précise comment paramétrer la Key Figure pour autoriser les scénarios What-If sans impacter la baseline.
```

---

## 3. Guide de Prompting IA : Modélisation des Données (`data.json`) & Schémas Relationnels

### Template de Prompt IA : Structuration de Données & Diagramme Mermaid
```markdown
Agis en tant que Data Modeler SAP IBP.
Domaine industriel cible : "[Décrire le domaine, ex: Maintenance de rames ferroviaires TGV]".

1. Structure JSON pour `data.json` : déclare les référentiels (sites, modèles, clients, alertes, gammes, routes) avec des identifiants normés et sans mesures chiffrées en dur.
2. Diagramme Mermaid (`erDiagram`) : formalise les tables de faits (demandes, interventions) et dimensions (sites, calendrier, matériel, SLA) avec leurs cardinalités (||--o{).
```

---

## 4. Guide de Prompting IA : Méthodes de Calcul & Mesure de Fiabilité

### Template de Prompt IA : Comparaison de Méthodes & Analyse de Dérive
```markdown
Agis en tant que Data Scientist & Expert SAP IBP Demand Sensing / Forecasting.
Contexte : Estimation du TAT de révision d'équipements industriels.

1. Benchmark des 4 méthodes : compare (A) Gammes standards S&OP, (B) Distribution empirique P50, (C) Saturation capacitaire files d'attente, et (D) Modélisation probabiliste / ML.
2. Évaluation de la dérive : formule pour mesurer l'écart prévu vs effectif (MAPE, dérive > 15%) et restituer un indice de certitude exploitable dans une Analytics Story SAC.
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
