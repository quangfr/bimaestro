# BIMAESTRO - Prototype & Guide de Prompts IA pour le Cadrage Décisionnel MRO (vs MAESTRO SAP IBP) 🚀

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

### Contraintes SAP IBP / Analytics Stories à respecter lors du prototypage :
1. **Modèle de données IBP :** Basé sur des *Master Data Types* (Site, Moteur, Client, Pièce), des *Key Figures* (TAT, WIP Hours, SLA Compliance) et des *Planning Levels* (combinaisons dimensionnelles).
2. **Bibliothèque de visualisations Analytics Stories :** Boxplot, barres empilées/groupées, cartes numériques de KPIs avec seuils de statut, waterfall/variance, heatmaps 2D et frises chronologiques/jalons. Éviter les types exotiques non supportés nativement dans SAP Analytics Cloud.
3. **Logique de calcul IBP :** Distinction stricte entre calculs au niveau de base (*Base Planning Level*) et agrégations dynamiques (*Aggregated Key Figures*), équivalents aux calculs DAX présentés dans l'outil.

---

## 2. Guide de Prompting IA : Concevoir & Tester les Graphiques à partir d'une Question Métier

Cette section fournit le canevas exact de prompt pour interroger une IA lorsqu'il s'agit de choisir les types de graphiques, axes, dimensions et filtres selon le besoin.

### Méthodologie d'Arbitrage Graphique (Catalogue SAC)
- **Alerte & Escalade (AOG, retards) :** Numeric KPI Cards (avec badge de statut seuillé), Bullet Charts (réel vs objectif SLA), Tables opérationnelles nominatives avec mise en forme conditionnelle.
- **Distribution & Dispersion statistique (TAT, variabilité des délais) :** Boxplot (médiane, $P_5, P_{95}$, quartiles), Histogramme de fréquences, Scatter Plot (durée vs coût).
- **Contribution & Décomposition (Goulots, structure des coûts, étapes) :** Stacked Bar (barres 100% ou absolues empilées), Waterfall (cascade des dérives positives/négatives), Treemap (hiérarchie poste/atelier/composant).
- **Comparaison & Objectifs (Performance sites, respect engagements) :** Bar / Column Chart avec ligne de référence ($P_{85}$, cible SLA), Radar / Spider Chart (matrice multi-critères qualité/délais/coûts).
- **Évolution temporelle & Corrélation :** Line Chart (tendance avec zone d'intervalle de confiance), Combined Bar-Line (flux d'entrées en barres vs délai moyen en ligne), Area Chart / Cumulative Flow (CFD).
- **Matrice de densité & Charge capacitaire :** Heatmap 2D (Site ou Poste × Période temporelle), Bubble Chart (Volume × TAT moyen × Taille = Pénalités).
- **Séquencement & Suivi de projet :** Milestones Timeline / Gantt épuré (franchissement des jalons G1 à G5).

### Template de Prompt IA : Conception de Graphique Analytics Story
```markdown
Agis en tant qu'architecte de tableaux de bord SAP IBP / SAC Analytics Stories.
Je dois répondre à la question métier suivante : "[Insérer la question, ex: Quels postes ou familles de moteurs concentrent les dérives de délai et menacent les engagements clients ?]".

En te basant sur le catalogue standard de visualisations de SAP Analytics Cloud (SAC) :
1. Recommande le(s) type(s) de graphique(s) optimal(aux) parmi :
   - Bar / Column Chart (Classique, Empilé, 100%, Groupé)
   - Boxplot (Dispersion et percentiles P5/P50/P95)
   - Numeric KPI Card avec micro-tendance Sparkline et statut dynamique
   - Bullet Chart (Valeur réelle vs Objectif contractuel vs Seuil d'alerte)
   - Waterfall / Variance Chart (Cascade cumulative des retards ou écarts)
   - Heatmap Matrix (Charge 2D : Postes × Semaines)
   - Treemap (Part de charge ou goulots hiérarchiques par atelier)
   - Combined Bar & Line Chart (Volume d'en-cours en barres + Lead time moyen en courbe)
   - Scatter / Bubble Plot (Corrélation Dérapage SLA vs Pénalités financières €)
   - Milestones Timeline (Passage des jalons et franchissement des Gates)
   - Radar / Spider Chart (Évaluation multi-dimensionnelle par site)
2. Définis les dimensions d'axes :
   - Axe X / Catégories (Planning Level, Granularité temporelle, Entité)
   - Axe Y / Valeurs (Key Figures, Mesures de base ou agrégées)
3. Spécifie les options visuelles avancées :
   - Fractionnement couleur (Legend / Color Dimension)
   - Lignes de référence / Seuils d'alerte conditionnels (Vert / Orange / Rouge)
   - Règles de tri par défaut (ex: tri décroissant sur le montant d'exposition financière)
4. Liste les filtres de Story et Input Controls nécessaires (Site, Compagnie cliente, Modèle moteur, Urgence).
5. Propose la formule de Key Figure SAP IBP ou la mesure calculée SAC correspondante.
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

## 4. Guide de Prompting IA : Granularité, Modélisation du Calcul & Mesure de Fiabilité du Prédictive (ML)

Le choix de la granularité conditionne directement la capacité prédictive du modèle et le niveau de certitude offert aux planificateurs.

### Les 3 Niveaux de Granularité Didactiques
| Granularité | Table de Faits | Usage SAP IBP | Limite Analytique |
| :--- | :--- | :--- | :--- |
| **Macro (visit)** | 1 ligne = 1 visite complète | S&OP, vision globale client, contrats SLA | Masque les goulets d'ateliers intermédiaires |
| **Méso (repair)** | 1 ligne = 1 passage atelier (shop) | Ordonnancement inter-sites, navettes | Ne détaille pas le temps d'usinage unitaire |
| **Micro (task)** | 1 ligne = 1 opération station | MES / pointage poste, standard d'heures | Volumétrie très lourde, requiert pointage fin |

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
| **2️⃣ Modèle** | Quel est le niveau de détail unitaire de la table de faits ? | Macro `visit` (2.A), Méso `repair` (2.B), Micro `task` (2.C) | Schéma relationnel (Canvas SVG interactif vs Mermaid `erDiagram`) |
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
