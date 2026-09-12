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

2. **Étape 2 : Données** (Granularité & Tables pour le calcul)
   - `2.A` (Macro - Shop Visit) : 1 ligne = 1 visite globale ESN (`FAIT_DEMANDES_MRO`). Transits forfaitaires, vision globale.
   - `2.B` (Méso - Shop Operation) : 1 ligne = 1 lot module par site (`FAIT_PACKAGES_SITE`). **Données historiques d'atelier** + navettes physiques inter-ateliers (Villaroche, Montereau, Châtellerault, Bruxelles). Pas de barème théorique unitaire.
   - `2.C` (Micro - Shop Task) : 1 ligne = 1 tâche technique unitaire pointée (`FAIT_OPERATIONS_REPARATION`). **Seule option disposant de la table de référence des durées théoriques** (`REF_OPERATIONS_THEORIQUES`) croisant `Type_Moteur` et `Type_Reparation`.

3. **Étape 3 : TAT** (Méthode de calcul du Turn Around Time TAT)
   - `3.A` : Délais théoriques de traitement (Gamme standard + forfaits transit).
     > ⚠️ **RÈGLE STRICTE :** L'option **3.A est INDISPONIBLE en 2.B** (car 2.B repose sur les données historiques d'atelier). En cas de sélection de 2.B, 3.A doit être grisée, désactivée et la sélection doit automatiquement basculer sur 3.B si 3.A était active.
   - `3.B` : Table des délais moyens (Percentiles réels $P_{5}$, $P_{50}$ médian, $P_{95}$).
   - `3.C` : Délais selon le taux d'occupation atelier (Modélisation de saturation à l'approche de 85%).
   - `3.D` : Modélisation avancée (Simulation dynamique probabiliste multi-factorielle).

4. **Étape 4 : Délai** (Visualisation des Délais & Engagements TAT)
   - `4.A` : Cartes KPIs Synthétiques (TAT moyen, % SLA).
   - `4.B` : Barres vs Seuils Cibles (Durée réelle vs barres $P_{50}$ / $P_{85}$).
   - `4.C` : Barres Empilées (Décomposition Usinage / Valeur vs Transit inter-sites).
   - `4.D` : Tableau d'Alertes Nominatives (Listing nominatif ESN / Packages / Postes).
   - `4.E` : Histogramme Distribution TAT (Tranches de jours <20j, 20-30j, 30-40j, >40j).
   - `4.F` : Box-Plot & Dispersion (Médiane, quartiles Q1/Q3 et moustaches par famille moteur).
   - `4.G` : Waterfall des Dérives (Cascade cumulative des retards pièces/CND vs SLA).
   - `4.H` : Jalons de Traversée Gates (Jalons industriels Gate 1 Démontage, Gate 2 Contrôle, Gate 3 Banc).

5. **Étape 5 : Capacité** (Méthode d'évaluation de la Capacité & des Demandes)
   - `5.A` : Capacité Nominale Standard (Heures d'ouverture calendrier et effectifs théoriques).
   - `5.B` : Demandes Effectives à l'Instant (En-cours physique réel WIP et pièces pointées en direct).
   - `5.C` : Prévisions des Demandes (Plan S&OP, déposes fermes annoncées & créneaux réservés).
   - `5.D` : Prévisions Multi-factorielles Avancées (Modélisation prédictive IA, cycles TSN/CSN, météo & aléas).

6. **Étape 6 : Saturation** (Visualisation de la Saturation / Capacité)
   - `6.A` : Barres de Charge vs Seuil 85%.
   - `6.B` : Heatmap Hebdomadaire / Site.
   - `6.C` : Courbes Entrées vs Sorties (Dérive en-cours WIP).
   - `6.D` : Ratio Attente vs Travail Effectif (Donut lead time).
   - `6.E` : Jauge Tachymètre de Saturation Globale (Cadran à aiguille avec seuils vert/jaune/rouge).
   - `6.F` : Radar Poly-compétences & Postes Clés (Adéquation charge pointée vs capacité Part-145).
   - `6.G` : Diagramme Spaghetti / Flux de Transfert (Trajets et intensité des navettes inter-sites).
   - `6.H` : Treemap des Goulots par Atelier/Machine (Surfaces proportionnelles au WIP bloqué).

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
   - En `A` : Faits `FAIT_DEMANDES_MRO` + Dimensions Client, Moteur, Contrat SLA, Calendrier.
   - En `B` : Faits `FAIT_PACKAGES_SITE` (Historique atelier + Transit inter-sites) + Dimensions Demande, Sous-Ensemble, Site Safran, Calendrier.
   - En `C` : Faits `FAIT_OPERATIONS_REPARATION` (Pointages & Réalisé) + Dimension de calcul `REF_OPERATIONS_THEORIQUES` (Durées standard par Moteur/Réparation) + Dimensions Machine, Package, Temps Slot.

---

## 5. Workflow de Validation & Déploiement

À la fin de chaque demande utilisateur impliquant une modification :

1. **Vérification de l'intégrité :**
   - Contrôler que `index.html` et `content.md` sont synchronisés.
   - S'assurer que le script s'exécute sans erreur de syntaxe.

2. **Git Commit & Push :**
   ```powershell
   git add <fichiers modifiés>; git commit -m "<type>: <description claire>"; git push origin main
   ```

3. **Déploiement Firebase Hosting :**
   ```powershell
   npx -y firebase-tools deploy --only hosting
   ```

4. **Restitution à l'utilisateur :**
   - Fournir un résumé concis des changements.
   - Rappeler les deux URLs de consultation :
     - Firebase : [https://maestro-safran.web.app](https://maestro-safran.web.app)
     - GitHub Pages : [https://quangfr.github.io/maestro/](https://quangfr.github.io/maestro/)
