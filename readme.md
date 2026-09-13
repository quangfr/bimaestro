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

### Contraintes Spécifiques SAP IBP & Analytics Stories à respecter lors du prototypage :

#### 1. Contraintes Modèle de Données & Architecture SAP IBP
1. **Typologie stricte des données (Master Data Types) :**
   - Distinction impérative entre *Simple MDT* (ex: `SITE`, `CUSTOMER`), *Compound MDT* (ex: `PRDFAMILY`), et *Reference MDT*.
   - Définition obligatoire des clés primaires racines (*Root Attributes*) pour chaque objet métier.
2. **Planning Levels & Granularité dimensionnelle :**
   - Toutes les *Key Figures* doivent être rattachées à un niveau de planification précis (*Base Planning Level* ex: `WKPRODLOCCUST`).
   - Impossibilité de mixer arbitrairement des granularités sans règles formelles d'agrégation / désagrégation (ex: répartir du Macro vers le Micro requiert un ratio proportionnel ou un profil de pondération).
3. **Logique de calcul & Fonctions Key Figures IBP :**
   - Séparation stricte entre calculs au niveau de base (*Base Level Calculation*) et agrégations dynamiques (*Aggregated Key Figures* via `SUM`, `AVG`, `MAX`, `MIN`).
   - Pas de calculs itératifs non bornés : les fonctions IBP supportées en temps réel sont déterministes (ex: `IF`, `ISNULL`, `PERIODID`, opérateurs arithmétiques, fonctions d'agrégation d'attributs).
   - Les calculs complexes (régressions, machine learning lourd) s'exécutent en batch via les algorithmes du moteur de prévision IBP ou Python/HANA PAL, et non à la volée dans la cellule.
4. **Versioning & Scénarios de simulation :**
   - Gestion native des versions (Baseline, Optimiste, Dégradé) et des scénarios What-If sans altérer la donnée réelle.

#### 2. Limites & Contraintes Ergonomiques de SAP Analytics Stories (SAC)
1. **Catalogue de visualisations restreint :**
   - Pas de graphiques arbitraires ou de canvas customisés sans développer des *Custom Widgets* (Web Components SAC nécessitant hébergement externe et maintenance).
   - Se limiter aux composants natifs : Cartes KPI, Bar/Column (standard, groupé, 100%), Boxplot, Waterfall, Heatmap matricielle, Bullet Chart, Scatter/Bubble, Treemap, Donut/Pie, Milestones/Timeline standard.
2. **Limites de volumétrie et performances du navigateur :**
   - Plafond de points de données rendus simultanément par widget (seuil de performance SAC pour éviter le gel du navigateur : souvent limité entre 500 et 5 000 points selon le type de graphique).
   - Le niveau Micro (opérations unitaires de pointage atelier) ne peut pas être affiché brut en masse : il doit être filtré ou agrégé préalablement via des *Input Controls* ou *Page Filters*.
3. **Calculs à la volée (Calculated Measures SAC) vs Backend IBP :**
   - Les formules dans SAC Stories sont limitées en complexité par rapport à du DAX ou SQL complet (pas de boucles complexes ni de jointures dynamiques multi-sources sans modèle fédéré).
   - Privilégier le calcul des Key Figures dans le moteur IBP plutôt que de surcharger la couche de restitution SAC.
4. **Interactivité et liaisons de filtres (Linked Analysis) :**
   - Les interactions croisées (*Linked Analysis*) entre widgets doivent être soigneusement configurées pour éviter des requêtes redondantes vers le backend HANA/IBP.
   - Les seuils d'alertes visuels (conditionnels) doivent être alignés sur des seuils numériques fixes ou des mesures cibles déclarées dans le modèle.

---

## 2. Guide de Prompting IA : Conception, Arbitrage & Limites Techniques

Cette section fournit les canevas exacts de prompt pour interroger une IA selon l'angle d'analyse : arbitrages graphiques sous contraintes SAC, ou cadrage du modèle de données et des calculs sous contraintes SAP IBP.

### Méthodologie d'Arbitrage Graphique (Catalogue SAC)
- **Alerte & Escalade (AOG, retards) :** Numeric KPI Cards (avec badge de statut seuillé), Bullet Charts (réel vs objectif SLA), Tables opérationnelles nominatives avec mise en forme conditionnelle.
- **Distribution & Dispersion statistique (TAT, variabilité des délais) :** Boxplot (médiane, $P_5, P_{95}$, quartiles), Histogramme de fréquences, Scatter Plot (durée vs coût).
- **Contribution & Décomposition (Goulots, structure des coûts, étapes) :** Stacked Bar (barres 100% ou absolues empilées), Waterfall (cascade des dérives positives/négatives), Treemap (hiérarchie poste/atelier/composant).
- **Comparaison & Objectifs (Performance sites, respect engagements) :** Bar / Column Chart avec ligne de référence ($P_{85}$, cible SLA), Radar / Spider Chart (matrice multi-critères qualité/délais/coûts).
- **Évolution temporelle & Corrélation :** Line Chart (tendance avec zone d'intervalle de confiance), Combined Bar-Line (flux d'entrées en barres vs délai moyen en ligne), Area Chart / Cumulative Flow (CFD).
- **Matrice de densité & Charge capacitaire :** Heatmap 2D (Site ou Poste × Période temporelle), Bubble Chart (Volume × TAT moyen × Taille = Pénalités).
- **Séquencement & Suivi de projet :** Milestones Timeline / Gantt épuré (franchissement des jalons G1 à G5).

### Prompt IA 1 : Cadrage Graphique & Limites Ergonomiques d'Analytics Stories (SAC)
```markdown
Agis en tant qu'Architecte de Tableaux de Bord & Expert SAP Analytics Stories (SAC).
Contexte : Conception d'un tableau de bord de pilotage industriel MRO / aéronautique.
Question métier à traiter : "[Insérer la question, ex: Quels ateliers concentrent les goulots d'étranglement et risquent de générer des pénalités contractuelles ?]".

En intégrant rigoureusement les LIMITES NATIVES de SAP Analytics Stories (SAC) :
1. Diagnostic de faisabilité & Alternatives :
   - Identifie si le besoin nécessite un type visuel exotique (ex: diagramme de Sankey, réseau dynamique, Gantt multi-niveaux complexe).
   - Si oui, propose la meilleure alternative standard native SAC (ex: Waterfall, Heatmap 2D, Stacked Bar ou Bullet Chart) pour éviter le développement lourd d'un Custom Widget.
2. Conception visuelle standardisée :
   - Sélectionne le(s) composant(s) SAC recommandés (KPI Card, Boxplot, Treemap, Combo Chart...).
   - Définis les dimensions d'axes (Catégories / Colonnes) et les Key Figures / Mesures associées.
   - Spécifie les dimensions de couleur (Legend/Color Dimension) et les lignes de référence (ex: SLA contractuel ou seuil P85).
3. Respect des contraintes de volumétrie & de performance SAC :
   - Comment structurer les filtres d'en-tête (Story Filters) et sélecteurs (Input Controls) pour ne jamais dépasser le plafond de points de données par widget (seuil d'affichage fluide) ?
   - Quel niveau d'agrégation par défaut recommandes-tu à l'ouverture de la page pour préserver la réactivité de l'application ?
4. Règles de mise en forme conditionnelle (Thresholds) :
   - Définis les paliers numériques de couleur (Vert / Orange / Rouge) opposables aux opérationnels.
5. Mesures calculées SAC (Calculated Measures) :
   - Rédige la formule de calcul SAC requise pour la vue, en précisant si ce calcul doit être fait côté Story (Calculated Measure) ou délégué en amont au moteur IBP pour des raisons de performance.
```

### Prompt IA 2 : Spécification & Contraintes Modèle / Calculs SAP-IBP
```markdown
Agis en tant qu'Architecte Solution SAP Integrated Business Planning (SAP IBP for Supply Chain).
Contexte : Cadrage du modèle de données et des règles de calcul pour le suivi du TAT (Turn Around Time) et de la charge capacitaire MRO.
Problématique métier à modéliser : "[Insérer le sujet, ex: Calcul du délai prévisionnel pondéré par le niveau de saturation atelier et ventilation de la charge sur les postes critiques]".

En respectant rigoureusement les CONTRAINTES ARCHITECTURALES DE SAP IBP :
1. Modélisation Master Data Types (MDT) & Clés racines :
   - Spécifie les Master Data Types requis (Simple, Compound, Reference) avec leurs Root Attributes (ex: `SITEID`, `ENGINEMODEL`, `REPAIRSHOP`, `WORKCENTER`).
   - Vérifie la cohérence des relations d'intégrité référentielle entre tables de faits et référentiels.
2. Définition des Planning Levels :
   - Quel est le Base Planning Level exact pour stocker l'indicateur (ex: `WKLOCPRDRES` : Semaine - Site - Famille Moteur - Poste de charge) ?
   - Quels sont les Planning Levels intermédiaires nécessaires pour assurer la cohérence des agrégations montantes (vers la macro-visite) ou de la désagrégation descendante (vers l'opération) ?
3. Règles de Calcul des Key Figures (Base vs Aggregated) :
   - Rédige la formule exacte de la Key Figure au niveau de base (*Base Level Expression*) en respectant les fonctions déterministes autorisées par IBP (`IF`, `ISNULL`, arithmétique).
   - Rédige l'expression d'agrégation (*Aggregation Expression*) sur la dimension temporelle et dimensionnelle (ex: `SUM`, `AVG`, `MIN`, `MAX`).
4. Gestion des Scénarios & Simulation de Capacité :
   - Comment paramétrer la Key Figure pour supporter la simulation temps réel (Version Baseline vs Scénarios What-If d'augmentation de charge ou d'aléas de pièces) ?
5. Stratégie de Découpage des Calculs (Temps réel vs Batch) :
   - Précise si le calcul peut être exécuté dynamiquement lors de la consultation ou s'il doit être planifié via un opérateur batch IBP / Statistical Forecasting / Scripting HANA.
```

---

## 3. Guide de Prompting IA : Modélisation des Données (`data.json`) & Schémas Relationnels

Pour adapter Maestro à une nouvelle structure de données source, il est indispensable de poser un modèle propre et de vérifier les relations d'intégrité référentielle.

### Rôle de `data.json` vs Modèle Conceptuel
- **`data.json` :** Référentiel unifié des nomenclatures (libellés, codes, clés primaires sans chiffres codés en dur).
- **Diagrammes relationnels (Mermaid `erDiagram` / UML) :** Définissent les cardinalités ($1:1, 1:N, N:M$) entre la table de faits centrale et les dimensions.

### Canevas de Vérification Relationnelle
Lors de la définition d'un nouveau domaine (ex: ferroviaire, turbines, maintenance d'hélicoptères), vérifier :
1. **Unicité des clés primaires :** Préfixage normalisé (ex: `D-xxxxx` pour les visites/ordres, `Pxxxxx` pour les pièces/composants).
2. **Cohérence des clés étrangères :** Raccordement des faits vers les dimensions `SITE`, `CLIENT`, `EQUIPEMENT`, `CALENDAR`.
3. **Gestion des forfaits vs durées réelles :** Définir si les transferts logistiques sont portés par l'ordre (macro) ou par le segment d'atelier (méso).

### Template de Prompt IA : Structuration de Données & Génération Mermaid
```markdown
Agis en tant que Data Modeler SAP IBP.
Je souhaite adapter Maestro au domaine industriel suivant : "[Décrire le domaine, ex: Maintenance de rames ferroviaires TGV]".

1. Génère la structure JSON à insérer dans `data.json` (sections : sites, modeles, clients, alertesESN, pieces, routes) avec des identifiants réalistes et normalisés (clés primaires).
2. Fournis le diagramme relationnel Mermaid (`erDiagram`) formalisant les tables de faits (visites, réparations) et les dimensions (matériel, client, calendrier, pièces critiques), en précisant les cardinalités (||--o{).
3. Valide qu'aucune mesure chiffrée n'est injectée en dur dans le JSON (le chiffrage dynamique relève du moteur de mock).
```

---

## 4. Guide de Prompting IA : Granularité, Modélisation du Calcul & Mesure de Fiabilité

Le choix de la granularité conditionne directement la capacité prédictive du modèle et le niveau de certitude offert aux planificateurs.

### Les 2 Niveaux de Granularité Didactiques
| Granularité | Table de Faits | Usage SAP IBP | Limite Analytique |
| :--- | :--- | :--- | :--- |
| **Macro (visit)** | 1 ligne = 1 visite complète | S&OP, vision globale client, contrats SLA | Masque les sous-étapes et cheminements d'atelier |
| **Intervention (intervention)** | 1 ligne = 1 intervention atelier (shop & type de réparation) | Ordonnancement poste & atelier, durées standards de gammes | Volumétrie fine, requiert pointage des interventions |

### Comparaison des Modélisations & Évaluation de la Dérive (Écart Prévu vs Réel)
Dans SAP IBP, un modèle prédictif (série temporelle, régression ML ou moyenne pondérée par saturation) doit faire l'objet d'un suivi de performance continu :
- **Mean Absolute Percentage Error (MAPE)** : Mesure de l'erreur relative entre le TAT prédit et le TAT constaté.
- **Intervalle de confiance ($P_5 - P_{95}$)** : Quantifie le niveau de certitude opérationnel. Plus l'intervalle est resserré, plus l'engagement client est fiable.
- **Dérive d'algorithme (Model Drift)** : Alerte dès que l'écart dépasse un seuil de tolérance (ex: $\Delta > 15\%$), déclenchant une recalibration des paramètres dans l'Étape 1.F (Data Gouvernance).

### Template de Prompt IA : Comparaison de Méthodes & Analyse de Dérive
```markdown
Agis en tant que Data Scientist & Expert SAP IBP Demand Sensing / Forecasting.
Contexte : Prévision du délai de révision (TAT) pour une flotte de moteurs aéronautiques.

1. Compare les 4 approches de calcul de l'Étape 3 :
   - A. Délais théoriques de gammes standards.
   - B. Distribution empirique par percentiles (P5, P50, P95).
   - C. Ajustement physique par le taux d'occupation atelier (file d'attente M/M/1).
   - D. Modélisation probabiliste multi-factorielle (usure, rebuts CND, disponibilité banc).
2. Pour la méthode D (Machine Learning / Prédictif) :
   - Comment évaluer mathématiquement la fiabilité des prévisions par rapport à l'historique (MAPE, RMSE, résidus) ?
   - Comment exprimer un indice de certitude exploitable par un planificateur dans une Analytics Story (ex: indice de 1 à 5 étoiles ou bande de confiance 85%) ?
   - Propose la formule DAX / SAP IBP Key Figure permettant de suivre l'écart prévisionnel vs effectif au fil des semaines.
```

---

## 5. Synthèse des 7 Étapes de Cadrage Maestro

| Étape | Question Clé de Cadrage | Choix Directeurs Disponibles | Restitution Analytics Stories |
| :---: | :--- | :--- | :--- |
| **0️⃣ Contexte** | Quel est le périmètre opérationnel et le rôle de la gouvernance ? | Spécifications projet, Golden Source, RLS/RBAC | Lecteur Markdown & pretty-print JSON dynamique |
| **1️⃣ Question** | Quel est le premier problème prioritaire à résoudre ? | AOG (1.A), SLA (1.B), Capacité (1.C), Pénalités (1.D), Pièces (1.E), Gouvernance (1.F) | Définition du Persona & KPIs d'alerte prioritaires |
| **2️⃣ Modèle** | Quel est le niveau de détail unitaire de la table de faits ? | Macro `visit` (2.A), Intervention `intervention` (2.B) | Schéma relationnel (Canvas SVG interactif vs Mermaid `erDiagram`) |
| **3️⃣ TAT** | Quelle méthode mathématique calcule le délai de traitement ? | Théorique (3.A), Statistiques $P_5/P_{50}/P_{95}$ (3.B), Occupation atelier (3.C), Avancée (3.D) | Formule DAX / Key Figure calculée et tableau dynamique |
| **4️⃣ Délai** | Comment visualiser le Turn Around Time pour décider ? | Boxplot (4.A), Stacked Sites (4.B), Clients (4.C), Listing ESN (4.D), KPIs (4.E), P85 (4.F), Waterfall (4.G), Gates (4.H) | Graphique temporel Chart.js 4.4 calibré |
| **5️⃣ Capacité** | Quelle logique modélise la capacité et la charge d'atelier ? | S&OP déterministe (5.A), Live WIP (5.B), Flux Pièces OTIF (5.C), Multi-factoriel (5.D) | Bilan de charge prévisionnelle et saturation |
| **6️⃣ Saturation** | Quelle visualisation révèle les tensions et les goulots ? | Pièces (6.A), Retards (6.B), Navettes (6.C), Ratio Lean (6.D), Seuil 85% (6.E), Heatmap (6.F), WIP In/Out (6.G), Treemap (6.H) | Graphique de charge Chart.js 4.4 calibré |
| **🏁 Synthèse** | Comment assembler le tableau de bord exécutif final ? | Ajustement temps réel Q1-Q6, filtres multi-axes (Site, Moteur, Client, Date prévisionnelle) | Analytics Story interactive avec quatuor de KPIs et double graphique |

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
