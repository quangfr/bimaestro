# MAESTRO - Référentiel des Contenus & Textes Métier MRO

Ce fichier centralise l'intégralité des contenus rédactionnels, explications métier, formules DAX et libellés des étapes du simulateur de cadrage décisionnel MRO Safran.

---

## Sommaire
- [Étape 1 : Finalité & Cas d'usage](#étape-1--finalité--cas-dusage)
- [Étape 2 : Granularité & Modélisation des Données](#étape-2--granularité--modélisation-des-données)
- [Étape 3 : Méthode de calcul du Turn Around Time (TAT)](#étape-3--méthode-de-calcul-du-turn-around-time-tat)
  - [Analyses croisées Étape 2 × Étape 3 (Diagnostics & Formules DAX)](#analyses-croisées-étape-2--étape-3)
- [Étape 4 : Visualisation des Délais & Alertes MRO](#étape-4--visualisation-des-délais--alertes-mro)
- [Étape 5 : Visualisation de la Capacité & Charge Atelier](#étape-5--visualisation-de-la-capacité--charge-atelier)
- [Étape 6 : Synthèse, Profils & Recommandations](#étape-6--synthèse-profils--recommandations)

---

## Étape 1 : Finalité & Cas d'usage

> **Question :** Quel est l'objectif décisionnel principal du rapport ?
> **Description du besoin :** Le choix de la finalité conditionne l'ergonomie, la fréquence de rafraîchissement des données et le niveau d'agrégation requis pour les comités.

---

### Option 1.A : Pilotage Opérationnel (Atelier MRO)
- **Icône / Emoji :** 🔧
- **Sous-titre :** Gestion de flux temps réel & goulets d'étranglement
- **Description métier :**
  Suivi quotidien et intra-journalier des en-cours d'atelier (WIP) et des priorités d'ordonnancement. Détection immédiate des blocages (manque de pièces rechange, attentes CND/ressuage, temps d'attente sous-traitance) pour réallouer les techniciens et débloquer les moteurs critiques.
- **Impact BI & Architecture :**
  - Fréquence : Rafraîchissement quasi-temps réel / DirectQuery (toutes les 15 min à 1h).
  - Cible : Chefs d'atelier, superviseurs de ligne, ordonnanceurs MRO.
  - KPI phares : Pièces bloquées par cause, heures pointées vs allouées, respect des jalons journaliers.

---

### Option 1.B : Pilotage Contractuel & Client (SLA & Pénalités)
- **Icône / Emoji :** 📜
- **Sous-titre :** Respect des engagements contractuels & clauses de pénalités
- **Description métier :**
  Mesure stricte du Turn Around Time (TAT) contractuel vis-à-vis des compagnies aériennes et loueurs (Lessors). Anticipation proactive des dépassements de jalons (SLA) entraînant des pénalités financières journalières ou des clauses de mise à disposition de moteurs de remplacement (Spare engines).
- **Impact BI & Architecture :**
  - Fréquence : Rafraîchissement journalier (J-1 à J).
  - Cible : Direction des programmes, Customer Support Managers (CSM), Direction Financière.
  - KPI phares : % Respect SLA contractuel, projection du montant des pénalités en risque (€/k$), délai résiduel avant pénalité.

---

### Option 1.C : Amélioration Continue & Performance Industrielle (Lean)
- **Icône / Emoji :** 📈
- **Sous-titre :** Rapprochement Gammes / Devis / Réalisé & Élimination des gaspillages
- **Description métier :**
  Analyse rétrospective des écarts structurels entre les gammes opératoires standards, les devis commerciaux initiaux et les temps réels consommés. Identification des causes racines de non-qualité, dérives systématiques sur les interventions de rectification et gains de productivité Lean Six Sigma.
- **Impact BI & Architecture :**
  - Fréquence : Mensuelle / Trimestrielle.
  - Cible : Ingénierie des méthodes, Responsables Lean, Contrôle de gestion industrielle.
  - KPI phares : Variance Gamme vs Réalisé (en h), Taux de retouches (Rework rate), Pareto des temps d'attente (Muda).

---

### Option 1.D : Dimensionnement & Planification Stratégique (S&OP)
- **Icône / Emoji :** 🌐
- **Sous-titre :** Adéquation Charge / Capacité à moyen-long terme (6 à 24 mois)
- **Description métier :**
  Projection macroscopique de l'adéquation entre la demande prévisionnelle de visites moteurs (induite par les plans de vol des compagnies et les cycles de dépose) et les capacités capacitaires des bancs d'essais, cabines de nettoyage et postes d'assemblage. Dimensionnement des effectifs certifiés et investissements outillages.
- **Impact BI & Architecture :**
  - Fréquence : Mensuelle (cycles S&OP / IBP).
  - Cible : Direction Industrielle, Directeurs de site, Responsables Planification & Supply Chain.
  - KPI phares : Taux d'engagement de capacité (%), Équivalents Temps Plein (ETP) requis vs disponibles, Goulot d'étranglement critique.

---

## Étape 2 : Granularité & Modélisation des Données

> **Question :** Quel est le niveau de détail unitaire de la table de faits centrale ?
> **Description du besoin :** La granularité définit la cardinalité de la table centrale, la complexité des jointures dimensionnelles et les capacités de forage (drill-down).

---

### Option 2.A : Macro - La Demande Globale (Visite Moteur / Shop Visit)
- **Icône / Emoji :** 🛩️
- **Entité modélisée :** `Fact_VisiteMoteur` (1 ligne = 1 visite complète d'un moteur en atelier)
- **Description métier :**
  Niveau d'agrégation le plus élevé. On suit la commande client ou la visite d'atelier globale du moteur (ex: révision complète CFM56 / LEAP) depuis sa réception jusqu'à son expédition certifiée (Release EASA Form 1).
- **Modèle de données associé :**
  - **Table de faits :** `Fact_VisiteMoteur`
    - Champs : `ID_Visite` (PK), `ID_Client`, `ID_Moteur`, `Date_Reception`, `Date_Livraison`, `Date_SLA_Contractuel`, `Montant_Devis_EUR`, `Penalite_Jour_EUR`, `TAT_Total_Jours`.
  - **Dimensions :**
    - `Dim_Client` (`ID_Client`, Nom, Type_Contrat, Segment_Flotte)
    - `Dim_Moteur` (`ID_Moteur`, Type_Moteur, Num_Serie, Cycles_Depuis_Neuf)
    - `Dim_Date` (`Date_Key`, Date, Mois, Trimestre, Annee)
- **Avantages & Limites :**
  - Volume de données très léger (< 100k lignes).
  - Réponses instantanées pour les tableaux de bord exécutifs.
  - Impossible d'isoler l'étape ou le module responsable d'un retard sans aller dans les détails inférieurs.

---

### Option 2.B : Méso - Le Sous-Ensemble / Module (Work Package)
- **Icône / Emoji :** ⚙️
- **Entité modélisée :** `Fact_Module_WP` (1 ligne = 1 module / lot de maintenance)
- **Description métier :**
  Niveau intermédiaire calqué sur l'organisation des lignes de production MRO (ex: Module Fan, Compresseur HP, Chambre de Combustion, Turbine BP, Boîte d'engrenages / AGB). Permet d'analyser les chemins critiques et les flux parallèles entre baies de montage.
- **Modèle de données associé :**
  - **Table de faits :** `Fact_Module_WP`
    - Champs : `ID_WorkPackage` (PK), `ID_Visite` (FK), `ID_Module`, `ID_Atelier`, `Date_Debut_Plan`, `Date_Fin_Reelle`, `Heures_Allouees`, `Heures_Pointees`, `Delai_Attente_Pieces_Jours`.
  - **Dimensions :**
    - `Dim_VisiteMoteur` (`ID_Visite`, ID_Client, Num_Dossier_MRO, Statut_Visite)
    - `Dim_Module_Ref` (`ID_Module`, Libelle_Module, Section_Moteur, Poids_Standard)
    - `Dim_Atelier` (`ID_Atelier`, Ligne_Assemblage, Responsable_Ligne, Site_MRO)
- **Avantages & Limites :**
  - Meilleur équilibre entre volume (100k - 2M lignes) et granularité opérationnelle.
  - Permet le suivi des goulets d'étranglement par centre de travail sans descendre dans l'excès de détail des pointages.

---

### Option 2.C : Micro - L'Opération Élementaire (Gamme / Task Card)
- **Icône / Emoji :** 📋
- **Entité modélisée :** `Fact_Pointage_Operation` (1 ligne = 1 opération de gamme ou 1 pointage)
- **Description métier :**
  Niveau le plus fin du système d'information industriel (MES / ERP). Chaque ligne représente un geste technique validé (ex: contrôle FPI ressuage pale rotor, équilibrage dynamique arbre turbine, dépose carter) avec matricule du mécanicien certifié et horodatage au centième.
- **Modèle de données associé :**
  - **Table de faits :** `Fact_Pointage_Operation`
    - Champs : `ID_Operation` (PK), `ID_WorkPackage` (FK), `ID_Tache_Ref`, `ID_Technicien`, `Timestamp_Debut`, `Timestamp_Fin`, `Temps_Standard_H`, `Temps_Pointe_H`, `Code_Arret`.
  - **Dimensions :**
    - `Dim_WorkPackage` (`ID_WorkPackage`, ID_Visite, Module, Priorite)
    - `Dim_Tache` (`ID_Tache_Ref`, Code_ATA, Libelle_Tache, Qualification_Requise)
    - `Dim_Technicien` (`ID_Technicien`, Nom, Equipe, Certifications_EASA)
- **Avantages & Limites :**
  - Exhaustivité totale, indispensable pour le calcul des coûts de revient et des productivités individuelles/équipes.
  - Volumétrie massive (10M à 50M+ lignes).
  - Nécessite des tables d'agrégation dans Power BI pour conserver des temps d'affichage fluides.

---

## Étape 3 : Méthode de calcul du Turn Around Time (TAT)

> **Question :** Selon quelle formule et calendrier le délai de traversée (TAT) doit-il être calculé ?
> **Description du besoin :** Le TAT peut être calculé en jours calendaires bruts ou en jours ouvrés avec exclusion des arrêts non imputables (attente accord devis client, pénurie pièce externe).

---

### Option 3.A : TAT Brut / Calendaire (Total Elapsed Time)
- **Principe métier :** 
  Différence brute entre la date d'entrée et la date de sortie, 7j/7 et 24h/24. C'est l'indicateur perçu directement par le client propriétaire de l'aéronef, dont l'avion est immobilisé au sol (AOG - Aircraft On Ground).
- **Réalité terrain :** 
  Inclut l'ensemble des week-ends, jours fériés, ponts et temps d'attente passifs de nuit.
- **Usage MRO type :** 
  Direction générale, benchmark d'attractivité commerciale entre ateliers mondiaux.

---

### Option 3.B : TAT Ouvré / Industriel (Working Days TAT)
- **Principe métier :** 
  Décompte strict des jours d'ouverture effectifs de l'atelier (généralement 5j/7 ou 6j/7 selon l'accord d'entreprise), en excluant les dimanches et les jours fériés légaux.
- **Réalité terrain :** 
  Isole le calendrier d'activité réel du site et évite de pénaliser artificiellement la performance d'un atelier qui ne travaille pas le week-end par rapport à un site en 3×8 continu.
- **Usage MRO type :** 
  Pilotage d'atelier, comités de performance hebdomadaires, suivi des objectifs d'équipe.

---

### Option 3.C : TAT Net / Contractuel (Adjusted / Stop-the-Clock TAT)
- **Principe métier :** 
  Décompte du TAT après application des clauses de gel de chrono (« Stop-the-clock »). Les retards causés par des facteurs contractuellement non imputables à l'atelier sont déduits.
- **Réalité terrain :** 
  Les arrêts typiquement déduits comprennent : le délai de validation du devis complémentaire par le client (Customer Hold), l'attente de fourniture d'une pièce spécifique commandée par le client (BFE - Buyer Furnished Equipment), ou les cas de force majeure douanière.
- **Usage MRO type :** 
  Calcul officiel des pénalités financières de retard, facturation contractuelle, audits juridiques.

---

### Option 3.D : TAT Actif / Temps de Contact (Direct Labor Hands-on Time)
- **Principe métier :** 
  Somme exclusive des heures où un technicien certifié intervient physiquement avec un outillage sur le matériel.
- **Réalité terrain :** 
  Met en lumière l'efficience de la traversée : sur un TAT total de 45 jours calendaires (1080 heures), le temps de contact réel sur un moteur n'est parfois que de 180 à 250 heures. Les 850 heures restantes représentent des files d'attente, du séchage, des transports et des validations documentaires.
- **Usage MRO type :** 
  Chantiers Lean Manufacturing, calcul de la Value Added Ratio (VAR = Temps à Valeur Ajoutée / TAT total), optimisation des encours.

---

### Analyses croisées Étape 2 × Étape 3

Le tableau ci-dessous explicite le comportement du calcul selon la granularité de table de faits choisie à l'Étape 2 :

#### Cas 2.A (Macro - Visite Moteur)
- **Avec 3.A (Brut) :**
  - *Diagnostic :* Calcul trivial au niveau visite. Pas d'overhead DAX.
  - *Formule DAX :* `TAT_Brut = DATEDIFF(Fact_VisiteMoteur[Date_Reception], COALESCE(Fact_VisiteMoteur[Date_Livraison], TODAY()), DAY)`
- **Avec 3.B (Ouvré) :**
  - *Diagnostic :* Nécessite une table `Dim_Date` filtrée sur `Dim_Date[Est_Ouvre] = TRUE`.
  - *Formule DAX :* `TAT_Ouvre = CALCULATE(COUNTROWS(Dim_Date), DATESBETWEEN(Dim_Date[Date], Fact_VisiteMoteur[Date_Reception], Fact_VisiteMoteur[Date_Livraison]), Dim_Date[Est_Ouvre] = TRUE)`
- **Avec 3.C (Net / Stop-the-Clock) :**
  - *Diagnostic :* Nécessite une colonne de déduction des jours de gel client `Jours_Gel_Client` stockée dans la table de visite ou issue d'une table liée des litiges.
  - *Formule DAX :* `TAT_Net = [TAT_Ouvre] - SUM(Fact_VisiteMoteur[Jours_Gel_Client])`
- **Avec 3.D (Actif / Contact) :**
  - *Diagnostic :* Nécessite le total des heures pointées récapitulées au niveau de la visite.
  - *Formule DAX :* `TAT_Actif_Jours = DIVIDE(Fact_VisiteMoteur[Total_Heures_Pointees], 7, 0) -- base 7h/jour ouvré`

#### Cas 2.B (Méso - Work Package / Module)
- **Avec 3.A (Brut) :**
  - *Diagnostic :* Calcul sur le chemin critique du Work Package : le TAT moteur global correspond au délai entre le premier démarrage de WP et la dernière fin de WP.
  - *Formule DAX :* `TAT_WP_Brut = DATEDIFF(Fact_Module_WP[Date_Debut_Plan], Fact_Module_WP[Date_Fin_Reelle], DAY)`
- **Avec 3.B (Ouvré) :**
  - *Diagnostic :* Compte les jours ouvrés consommés module par module, puis identifie le module le plus long de la chaîne critique.
  - *Formule DAX :* `TAT_WP_Ouvre = CALCULATE(COUNTROWS(Dim_Date), DATESBETWEEN(Dim_Date[Date], Fact_Module_WP[Date_Debut_Plan], Fact_Module_WP[Date_Fin_Reelle]), Dim_Date[Est_Ouvre] = TRUE)`
- **Avec 3.C (Net / Stop-the-Clock) :**
  - *Diagnostic :* Gèle le chrono uniquement sur le module impacté par l'attente pièce ou l'accord technique client.
  - *Formule DAX :* `TAT_WP_Net = [TAT_WP_Ouvre] - Fact_Module_WP[Jours_Attente_Pieces_SousTraitance]`
- **Avec 3.D (Actif / Contact) :**
  - *Diagnostic :* Somme des heures pointées sur le module rapportée aux heures allouées standard du Work Package.
  - *Formule DAX :* `Ratio_Valeur_Ajoutee_Module = DIVIDE(Fact_Module_WP[Heures_Pointees], Fact_Module_WP[TAT_WP_Ouvre] * 7)`

#### Cas 2.C (Micro - Pointage / Opération)
- **Avec 3.A (Brut) :**
  - *Diagnostic :* Agrégation montante de millions de lignes requise pour reconstituer le délai calendaire global. Déconseillé en direct, privilégier une table pré-agrégée.
  - *Formule DAX :* `TAT_Moteur_Reconstitue = DATEDIFF(MIN(Fact_Pointage_Operation[Timestamp_Debut]), MAX(Fact_Pointage_Operation[Timestamp_Fin]), DAY)`
- **Avec 3.B (Ouvré) :**
  - *Diagnostic :* Calcul basé sur les créneaux d'ouverture de l'atelier appliqués à la séquence d'opérations.
  - *Formule DAX :* `Duree_Ouvree_Operation_H = DATEDIFF(Fact_Pointage_Operation[Timestamp_Debut], Fact_Pointage_Operation[Timestamp_Fin], MINUTE) / 60`
- **Avec 3.C (Net / Stop-the-Clock) :**
  - *Diagnostic :* Filtrage direct des codes arrêts (ex: `Code_Arret = 'ATTENTE_CLIENT'`) au niveau de la ligne d'événement.
  - *Formule DAX :* `Temps_Net_Operation = CALCULATE(SUM(Fact_Pointage_Operation[Temps_Pointe_H]), Fact_Pointage_Operation[Code_Arret] <> "ATTENTE_EXTERNE")`
- **Avec 3.D (Actif / Contact) :**
  - *Diagnostic :* C'est le cas idéal pour cette formule : somme directe et exacte des pointages au poste.
  - *Formule DAX :* `Heures_Contact_Reelles = SUM(Fact_Pointage_Operation[Temps_Pointe_H])`

---

## Étape 4 : Visualisation des Délais & Alertes MRO

> **Question :** Sous quelle forme graphique visualiser le flux des délais et les risques de retard ?
> **Description du besoin :** Le visuel doit permettre d'identifier immédiatement les écarts par rapport aux objectifs contractuels ou cibles industrielles.

---

### Option 4.A : Diagramme de Gantt / Suivi de Jalons
- **Icône / Emoji :** 📊
- **Composant :** Barres de progression horizontales avec repères de jalons (Gate 1, Gate 2, Essai banc, Expédition)
- **Usage métier :**
  Visualisation de la progression temporelle des moteurs et détection visuelle du chemin critique. Idéal pour repérer immédiatement quel sous-ensemble est en dérive par rapport à la date de livraison promise.

---

### Option 4.B : Courbe de Tendance & Box-Plot (Dispersion du TAT)
- **Icône / Emoji :** 📉
- **Composant :** Graphique en ligne avec zones de dispersion (médiane, 1er/3e quartiles, valeurs extrêmes)
- **Usage métier :**
  Analyse de la capabilité industrielle du processus MRO. Permet d'observer si le délai moyen se stabilise dans le temps et de mesurer la dispersion (variabilité) qui génère l'insatisfaction client.

---

### Option 4.C : Histogramme de Distribution du TAT (Classes de jours)
- **Icône / Emoji :** 📶
- **Composant :** Barres verticales réparties en tranches de délais (< 30j, 30-45j, 45-60j, > 60j)
- **Usage métier :**
  Contrôle de la loi statistique de livraison. Permet de vérifier la conformité par rapport au SLA cible (ex: 85% des moteurs livrés en moins de 42 jours) et d'isoler la « longue traîne » des dossiers à problèmes.

---

### Option 4.D : Matrice de Risque SLA & Jauge de Dépassement
- **Icône / Emoji :** 🚦
- **Composant :** Grille thermique (Matrice Probabilité × Impact Financier) ou tachymètre à seuils Vert / Orange / Rouge
- **Usage métier :**
  Alerte de gestion financière et opérationnelle. Classement des moteurs selon le risque d'entrée en zone de pénalités de retard et le montant quotidien associé.

---

## Étape 5 : Visualisation de la Capacité & Charge Atelier

> **Question :** Quel visuel privilégier pour piloter l'adéquation entre le plan de travail et les moyens disponibles ?
> **Description du besoin :** Visualiser la saturation pour anticiper les embouteillages d'atelier ou les sous-charges d'équipes.

---

### Option 5.A : Histogramme Superposé Charge vs Capacité
- **Icône / Emoji :** ⚖️
- **Composant :** Barres empilées représentant les heures requises confrontées à une ligne de capacité nominale (heures disponibles)
- **Usage métier :**
  Visualisation classique du S&OP. Met en évidence les semaines ou mois en situation de surcharge (heures supplémentaires ou sous-traitance nécessaires) et de sous-charge.

---

### Option 5.B : Carte Thermique (Heatmap) par Poste / Centre de Travail
- **Icône / Emoji :** 🔥
- **Composant :** Matrice Postes de travail × Semaines avec dégradé de couleur (Blanc = libre, Vert = optimal, Rouge = saturé > 100%)
- **Usage métier :**
  Localisation précise des goulets d'étranglement physiques (banc de test moteur, cabine de décapage, machine d'usinage 5 axes, compétences rares de soudure).

---

### Option 5.C : Jauge / Donut de Taux d'Utilisation Global
- **Icône / Emoji :** ⏱️
- **Composant :** Cadran à pourcentage indiquant le taux moyen d'occupation des ressources
- **Usage métier :**
  Indicateur synthétique pour la direction de site et le reporting exécutif. Permet de juger en un coup d'œil si l'usine opère dans sa zone de rentabilité cible (ex: 82-88% de charge).

---

### Option 5.D : Diagramme d'Accumulation des En-Cours (Cumulative Flow Diagram - CFD)
- **Icône / Emoji :** 🌊
- **Composant :** Graphique d'aires empilées montrant le nombre de matériels à chaque étape du flux au cours du temps
- **Usage métier :**
  Outil d'excellence opérationnelle Lean / Kanban. Révèle l'enflure des stocks tampons inter-postes et permet de calculer le lead time réel par la loi de Little (En-cours = Débit × Délai).

---

## Étape 6 : Synthèse, Profils & Recommandations

En fonction de la combinaison des choix effectués aux étapes 1 à 5, le système déduit le **Profil Décisionnel MRO** :

### Les 4 Grands Profils Décisionnels
1. **Profil Exploitation Opérationnelle (Shop Floor Control)** :
   - Dominante : Étape 1.A + Granularité 2.B ou 2.C + Visuels 4.A / 5.B.
   - Recommandation : Modèle en étoile avec DirectQuery ou rafraîchissement incrémentiel horaire.
2. **Profil Contractuel & Relation Client (SLA Guardian)** :
   - Dominante : Étape 1.B + TAT Net 3.C + Alertes 4.D.
   - Recommandation : Modèle tabulaire avec historisation journalière des statuts de gel de chrono.
3. **Profil Excellence Industrielle & Lean (Continuous Improvement)** :
   - Dominante : Étape 1.C + TAT Actif 3.D + CFD 5.D / Dispersion 4.B.
   - Recommandation : Import complet avec tables de faits découpées par module et matrice de variance.
4. **Profil Planification Stratégique & Capacitaire (S&OP Planner)** :
   - Dominante : Étape 1.D + Granularité Macro 2.A + Charge/Capacité 5.A.
   - Recommandation : Modélisation mixte associant le carnet de commandes fermes et les prévisions de déposes moteur.
