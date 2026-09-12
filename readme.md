# MAESTRO - Framework & Guide de Prompts IA pour le Cadrage Décisionnel MRO (SAP IBP / Analytics Stories) ✈️

> **Guide Opérationnel & Catalogue de Prompts IA** pour concevoir, prototyper et éprouver des tableaux de bord industriels.  
> **Contexte applicatif :** Maestro s'inscrit dans l'écosystème **SAP Integrated Business Planning (SAP IBP)** et cible des restitutions de type **SAP Analytics Cloud (Analytics Stories)**. L'application HTML/JS sert d'environnement agile de prototypage rapide piloté par l'IA avant implémentation dans les modules standards de SAP IBP.

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

### Méthodologie d'Arbitrage Graphique
- **Question d'alerte / escalade (ex: AOG, retards critiques) :** Cartes KPIs avec micro-alertes visuelles (statut rouge/ambre) et tables opérationnelles nominatives filtrables.
- **Question d'analyse de distribution (ex: dispersion du TAT) :** Boxplot ou diagramme en barres avec percentiles ($P_5, P_{50}, P_{95}$) plutôt qu'une simple moyenne.
- **Question de contribution / décomposition (ex: goulots par site) :** Barres horizontales empilées (Attente vs Réparation vs Transfert) ou Waterfall des écarts de révision.
- **Question de corrélation temporelle & saturation (ex: charge machines) :** Heatmap 2D (Site × Semaine) ou graphiques croisés Barres/Lignes (flux vs délais).

### Template de Prompt IA : Conception de Graphique Analytics Story
```markdown
Agis en tant qu'architecte SAP IBP / SAC Analytics Stories.
Je dois répondre à la question métier suivante : "[Insérer la question, ex: Quels réacteurs en atelier risquent de clouer un appareil au sol sous 48h ?]".

Recommande la configuration optimale pour SAP Analytics Cloud :
1. Type de graphique standard SAC (Barres, Boxplot, KPI Card, Heatmap, Waterfall, Timeline).
2. Axe X (Dimensions / Planning Level) et Axe Y (Key Figures / Mesures).
3. Dimensions de fractionnement (Color/Legend) et seuils d'alertes visuels (Statuts Vert/Orange/Rouge).
4. Filtres de Story pertinents (Site, Client, Modèle, Horizon temporel).
5. Mesure calculée ou Key Figure SAP IBP associée (formule de calcul équivalente).
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

## 4. Guide de Prompting IA : Granularité, Modélisation du TAT & Mesure de Fiabilité (ML)

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
- **Firebase Hosting :** [https://maestro-safran.web.app](https://maestro-safran.web.app)
- **GitHub Pages :** [https://quangfr.github.io/maestro/](https://quangfr.github.io/maestro/)