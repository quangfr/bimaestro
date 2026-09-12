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

### Option 1.A : Urgence opérationnelle
- **Icône / Emoji :** 🚨
- **Sous-titre :** Alerte temps réel AOG & escalade immédiate
- **Description métier :**
  Alerter en direct sur les moteurs à risque d'immobilisation avion (**AOG**). Escalade automatique vers les chefs d'atelier dès dépassement critique.
- **Impact BI & Architecture :**
  - Fréquence : Modèle temps réel ou alertes DirectQuery J-3 / J-1 avant rupture.
  - Cible : Chefs d'atelier, superviseurs de ligne, ordonnanceurs MRO.
  - KPI phares : Moteurs AOG critiques, dérive > 48h détectée, dossiers pris en charge.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="5" y="5" width="90" height="75" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.8" />
  <circle cx="50" cy="28" r="16" fill="#fca5a5" opacity="0.35" />
  <text x="50" y="35" font-size="20" text-anchor="middle" fill="#dc2626">🚨</text>
  <text x="50" y="54" font-size="8.5" font-weight="black" text-anchor="middle" fill="#b91c1c">AOG CRITIQUE</text>
  <text x="50" y="66" font-size="7" text-anchor="middle" fill="#64748b">ESN-9842 • Retard > 5j</text>
  <line x1="20" y1="72" x2="80" y2="72" stroke="#ef4444" stroke-width="1" stroke-dasharray="2,2" />
</svg>
```

---

### Option 1.B : Engagements contractuels
- **Icône / Emoji :** ⏱️
- **Sous-titre :** Respect des SLA & vision globale par compagnie
- **Description métier :**
  Garantir le respect des **SLA** et du Turn Around Time (TAT) moyen par compagnie aérienne et typologie de contrat (Power-by-the-Hour vs T&M).
- **Impact BI & Architecture :**
  - Fréquence : Taux de conformité global, dérive par compagnie et benchmark flottes.
  - Cible : Direction des programmes, Customer Support Managers (CSM), Direction Financière.
  - KPI phares : % Respect SLA contractuel, projection du montant des pénalités en risque (€/k$), délai résiduel avant pénalité.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <circle cx="50" cy="40" r="30" fill="none" stroke="#f1f5f9" stroke-width="7" />
  <circle cx="50" cy="40" r="30" fill="none" stroke="#10b981" stroke-width="7" stroke-dasharray="188" stroke-dashoffset="24" stroke-linecap="round" />
  <text x="50" y="44" font-size="14" font-weight="black" text-anchor="middle" fill="#0f172a">94.2%</text>
  <text x="50" y="56" font-size="7.5" font-weight="semibold" text-anchor="middle" fill="#059669">Conformité SLA</text>
  <circle cx="50" cy="10" r="3.5" fill="#10b981" />
</svg>
```

---

### Option 1.C : Optimisation des capacités
- **Icône / Emoji :** 🏢
- **Sous-titre :** Lissage de charge & élimination des goulets ateliers
- **Description métier :**
  Équilibrer les charges inter-sites (Montereau, Villaroche, Bruxelles, etc.), lisser les goulets et anticiper les embouteillages d'ateliers d'usinage.
- **Impact BI & Architecture :**
  - Fréquence : Suivi saturation machines, charge/capacité et transferts inter-sites.
  - Cible : Ingénierie des méthodes, Responsables Lean, Contrôle de gestion industrielle.
  - KPI phares : Variance Gamme vs Réalisé (en h), Taux de retouches (Rework rate), Pareto des temps d'attente (Muda).
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="8" y="10" width="38" height="26" rx="4" fill="#f8fafc" stroke="#3b82f6" stroke-width="1.2" />
  <text x="27" y="24" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#1e40af">VIL</text>
  <text x="27" y="33" font-size="6.5" text-anchor="middle" fill="#64748b">Charge 72%</text>

  <rect x="54" y="10" width="38" height="26" rx="4" fill="#f8fafc" stroke="#3b82f6" stroke-width="1.2" />
  <text x="73" y="24" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#1e40af">CHL</text>
  <text x="73" y="33" font-size="6.5" text-anchor="middle" fill="#64748b">Charge 68%</text>

  <rect x="8" y="44" width="38" height="28" rx="4" fill="#fef2f2" stroke="#ef4444" stroke-width="1.8" />
  <text x="27" y="58" font-size="8.5" font-weight="black" text-anchor="middle" fill="#b91c1c">MON ⚠️</text>
  <text x="27" y="68" font-size="6.5" font-weight="bold" text-anchor="middle" fill="#dc2626">Saturation 94%</text>

  <rect x="54" y="44" width="38" height="28" rx="4" fill="#f8fafc" stroke="#3b82f6" stroke-width="1.2" />
  <text x="73" y="58" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#1e40af">BRU</text>
  <text x="73" y="68" font-size="6.5" text-anchor="middle" fill="#64748b">Charge 81%</text>
</svg>
```

---

### Option 1.D : Suivi Retard & Pénalités
- **Icône / Emoji :** 💰
- **Sous-titre :** Jours de dérapage ouvrés & exposition financière (€)
- **Description métier :**
  Mesurer finement le dérapage en **jours ouvrés** au-delà du SLA contractuel et chiffrer l'exposition financière (pénalités journalières).
- **Impact BI & Architecture :**
  - Fréquence : Mesures DAX de cumul pénalités = `Jours * Barème` par compagnie.
  - Cible : Direction Industrielle, Directeurs de site, Responsables Planification & Supply Chain.
  - KPI phares : Moteurs sous pénalités, exposition financière (€), retard moyen constaté.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="6" y="6" width="88" height="34" rx="5" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" />
  <text x="50" y="18" font-size="7" font-bold text-anchor="middle" fill="#78350f">DÉPASSEMENT MOYEN</text>
  <text x="50" y="32" font-size="13" font-weight="black" text-anchor="middle" fill="#b45309">+7.5 jours</text>

  <rect x="6" y="44" width="88" height="35" rx="5" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" />
  <text x="50" y="56" font-size="7" font-bold text-anchor="middle" fill="#991b1b">PÉNALITÉS ENCOURS</text>
  <text x="50" y="71" font-size="13" font-weight="black" text-anchor="middle" fill="#dc2626">142 500 €</text>
</svg>
```

---

## Étape 2 : Données

> **Question :** Quelles sont les tables qui permettent le calcul selon le niveau de détail unitaire (Granularité de la table centrale) ?
> **Description du besoin :** La structure des tables conditionne directement les méthodes de calcul de délai possibles à l'Étape 3. **Seul le niveau 2.C (Micro)** dispose de la table de référence des opérations (`REF_OPERATIONS_THEORIQUES`) avec la **durée de traitement théorique** par type de moteur et par type de réparation. En **2.B (Méso)**, le modèle repose exclusivement sur les **données historiques d'atelier** enregistrées (`Duree_Atelier_Historique`), ce qui rend **l'option 3.A ("Délais théoriques") indisponible**.

---

### Option 2.A : Macro - La Demande Globale (Shop Visit)
- **Icône / Emoji :** 📦
- **Sous-titre :** 1 ligne = 1 visite atelier / ESN moteur (`FAIT_DEMANDES_MRO`)
- **Description métier :**
  Niveau d'agrégation macroscopique. On suit la demande globale d'une visite moteur complète (Shop Visit / ESN) depuis sa réception jusqu'à son expédition certifiée. Idéal pour le suivi global du TAT contractuel et l'exposition aux pénalités de restitution vis-à-vis des compagnies aériennes.
- **Accès aux délais de transit :** 
  Non détaillé. Les transits sont agrégés dans un forfait logistique global ou inclus dans le TAT total du moteur.
- **Modèle de données associé & Tables de calcul :**
  - **Table de faits :** `FAIT_DEMANDES_MRO` (~1,5k lig/an)
    - Champs clés : `ID_Demande` (PK), `FK_Client`, `FK_Moteur`, `FK_Contrat`, `FK_Date_Entree`, `Duree_Reelle_Jours`, `Jours_Retard_SLA`, `Montant_Penalite_EUR`.
  - **Dimensions reliées (1:N) :**
    - `DIM_CLIENT` (`ID_Client`, Nom_Client, Flotte_Active, SLA_Contractuel_Standard)
    - `DIM_MOTEUR` (`ESN_Moteur`, Famille_Moteur, Heures_Vol_TSN, Cycles_Vol_CSN)
    - `DIM_CONTRAT_SLA` (`ID_Contrat`, Type_Engagement, SLA_Cible_Jours, Seuil_Alerte_P85)
    - `DIM_CALENDRIER` (`Date_Key`, Semaine_Fiscale, Mois_Annee, Est_Ouvre_Safran)
- **Illustration SVG du Schéma Relationnel :**
```xml
<svg class="w-full max-w-[550px] mx-auto" viewBox="0 0 520 220">
  <!-- DIM_CLIENT -->
  <rect x="10" y="10" width="130" height="85" rx="5" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" />
  <rect x="10" y="10" width="130" height="20" rx="5" fill="#f59e0b" />
  <text x="75" y="24" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">🏢 DIM_CLIENT</text>
  <text x="18" y="42" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Client</text>
  <text x="18" y="56" font-size="7.5" fill="#475569">• Compagnie_Aerienne</text>
  <text x="18" y="70" font-size="7.5" fill="#475569">• Taux_Penalite_Jour</text>

  <!-- DIM_CONTRAT_SLA -->
  <rect x="10" y="125" width="130" height="85" rx="5" fill="#ffffff" stroke="#10b981" stroke-width="1.5" />
  <rect x="10" y="125" width="130" height="20" rx="5" fill="#10b981" />
  <text x="75" y="139" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">📜 DIM_CONTRAT_SLA</text>
  <text x="18" y="157" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Contrat</text>
  <text x="18" y="171" font-size="7.5" fill="#475569">• SLA_Cible_Jours</text>
  <text x="18" y="185" font-size="7.5" fill="#475569">• Seuil_Alerte_P85</text>

  <!-- FAIT_DEMANDES_MRO (Centrale) -->
  <rect x="185" y="15" width="150" height="190" rx="6" fill="#ffffff" stroke="#3b82f6" stroke-width="2" />
  <rect x="185" y="15" width="150" height="26" rx="6" fill="#3b82f6" />
  <text x="260" y="32" font-size="9.5" font-weight="bold" fill="#ffffff" text-anchor="middle">FAIT_DEMANDES_MRO</text>
  <text x="195" y="54" font-size="8" fill="#d97706" font-weight="bold">PK ID_Demande</text>
  <text x="195" y="70" font-size="8" fill="#2563eb">FK FK_Client (1:N)</text>
  <text x="195" y="86" font-size="8" fill="#2563eb">FK FK_Moteur (1:N)</text>
  <text x="195" y="102" font-size="8" fill="#2563eb">FK FK_Contrat (1:N)</text>
  <text x="195" y="118" font-size="8" fill="#2563eb">FK FK_Date_Entree</text>
  <line x1="190" y1="128" x2="330" y2="128" stroke="#cbd5e1" stroke-width="1" />
  <text x="195" y="144" font-size="8" fill="#7c3aed" font-weight="bold">📐 Duree_Reelle_Jours</text>
  <text x="195" y="160" font-size="8" fill="#7c3aed">📐 Jours_Retard_SLA</text>
  <text x="195" y="176" font-size="8" fill="#7c3aed">📐 Montant_Penalite_EUR</text>

  <!-- DIM_MOTEUR -->
  <rect x="380" y="10" width="130" height="85" rx="5" fill="#ffffff" stroke="#8b5cf6" stroke-width="1.5" />
  <rect x="380" y="10" width="130" height="20" rx="5" fill="#8b5cf6" />
  <text x="445" y="24" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">✈️ DIM_MOTEUR</text>
  <text x="388" y="42" font-size="7.5" fill="#d97706" font-weight="bold">PK ESN_Moteur</text>
  <text x="388" y="56" font-size="7.5" fill="#475569">• Famille_Moteur</text>
  <text x="388" y="70" font-size="7.5" fill="#475569">• TSN / CSN</text>

  <!-- DIM_CALENDRIER -->
  <rect x="380" y="125" width="130" height="85" rx="5" fill="#ffffff" stroke="#ec4899" stroke-width="1.5" />
  <rect x="380" y="125" width="130" height="20" rx="5" fill="#ec4899" />
  <text x="445" y="139" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">📅 DIM_CALENDRIER</text>
  <text x="388" y="157" font-size="7.5" fill="#d97706" font-weight="bold">PK Date_Key</text>
  <text x="388" y="171" font-size="7.5" fill="#475569">• Semaine_Fiscale</text>
  <text x="388" y="185" font-size="7.5" fill="#475569">• Est_Ouvre_Safran</text>

  <!-- Liens relationnels -->
  <path d="M 140 50 L 185 70" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 140 165 L 185 102" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 380 50 L 335 86" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 380 165 L 335 118" stroke="#94a3b8" stroke-width="1.5" fill="none" />
</svg>
```

- **Avantages & Limites :**
  - Volume très léger (< 10k lignes), réponses instantanées pour la Direction.
  - Impossibilité d'isoler le sous-ensemble ou l'atelier responsable d'un goulot d'étranglement.

---

### Option 2.B : Méso - La Réparation du Module (Shop Operation)
- **Icône / Emoji :** 🏢
- **Sous-titre :** 1 ligne = 1 lot d'opérations / module par site (`FAIT_PACKAGES_SITE`) - *Données historiques*
- **Description métier :**
  Niveau intermédiaire calqué sur les lots sous-ensembles / modules moteur (Fan, Compresseur HP, Chambre de Combustion, Turbine BP, Boîte d'engrenages AGB). Permet d'analyser les chemins critiques et les flux d'avancement par centre de travail ou site industriel.
- **Accès aux délais de transit inter-ateliers :** 
  ✅ **Oui, explicitement disponible.** Ce niveau capture précisément la durée des navettes et transferts physiques entre les différents sites et ateliers de réparation (ex: navettes routières ou transferts entre Villaroche, Montereau, Châtellerault, Bruxelles), permettant de dissocier le temps d'usinage/réparation en atelier (`Duree_Atelier_Historique`) du délai de transit logistique inter-sites (`Duree_Navette_Transit`).
- **Nature des données & Impact sur le calcul :**
  ⚠️ **Basé exclusivement sur les données historiques d'atelier.** Il n'existe pas de table de barème théorique unitaire à ce niveau. Par conséquent, **l'option 3.A ("Délais théoriques de traitement") n'est pas disponible** avec l'option 2.B (on s'appuie sur la distribution historique des délais réels 3.B, le taux de charge 3.C ou la simulation dynamique 3.D).
- **Modèle de données associé & Tables de calcul :**
  - **Table de faits :** `FAIT_PACKAGES_SITE` (~15k lig/an - Données Historiques)
    - Champs clés : `ID_Lot_Package` (PK), `FK_Demande_MRO`, `FK_Sous_Ensemble`, `FK_Site_Safran`, `FK_Date_Envoi`, `Duree_Atelier_Historique`, `Duree_Navette_Transit` *(Délai transit inter-ateliers)*, `TAT_Package_Total`.
  - **Dimensions reliées (1:N) :**
    - `DIM_DEMANDE_MRO` (`ID_Demande`, ESN_Moteur, Client_Nom, Date_Promesse_SLA)
    - `DIM_SOUS_ENSEMBLE` (`ID_Module`, Nom_Sous_Ensemble, Famille_Technologique, Criticite_Maint)
    - `DIM_SITE_SAFRAN` (`ID_Site`, Nom_Site, Specialite_Atelier, Capacite_Lots_Hebdo)
    - `DIM_CALENDRIER` (`Date_Key`, Semaine_Fiscale, Navette_Planifiee, Est_Ouvre_Atelier)
- **Illustration SVG du Schéma Relationnel :**
```xml
<svg class="w-full max-w-[550px] mx-auto" viewBox="0 0 520 220">
  <!-- DIM_DEMANDE_MRO -->
  <rect x="10" y="10" width="130" height="85" rx="5" fill="#ffffff" stroke="#3b82f6" stroke-width="1.5" />
  <rect x="10" y="10" width="130" height="20" rx="5" fill="#3b82f6" />
  <text x="75" y="24" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">📦 DIM_DEMANDE_MRO</text>
  <text x="18" y="42" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Demande</text>
  <text x="18" y="56" font-size="7.5" fill="#475569">• ESN_Moteur</text>
  <text x="18" y="70" font-size="7.5" fill="#475569">• Date_Promesse_SLA</text>

  <!-- DIM_SITE_SAFRAN -->
  <rect x="10" y="125" width="130" height="85" rx="5" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" />
  <rect x="10" y="125" width="130" height="20" rx="5" fill="#f59e0b" />
  <text x="75" y="139" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">🏭 DIM_SITE_SAFRAN</text>
  <text x="18" y="157" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Site</text>
  <text x="18" y="171" font-size="7.5" fill="#475569">• Nom_Site (VIL/MON)</text>
  <text x="18" y="185" font-size="7.5" fill="#475569">• Capacite_Lots_Hebdo</text>

  <!-- FAIT_PACKAGES_SITE (Centrale Historique) -->
  <rect x="185" y="15" width="150" height="190" rx="6" fill="#ffffff" stroke="#10b981" stroke-width="2" />
  <rect x="185" y="15" width="150" height="26" rx="6" fill="#10b981" />
  <text x="260" y="32" font-size="9.5" font-weight="bold" fill="#ffffff" text-anchor="middle">FAIT_PACKAGES_SITE</text>
  <text x="195" y="54" font-size="8" fill="#d97706" font-weight="bold">PK ID_Lot_Package</text>
  <text x="195" y="70" font-size="8" fill="#2563eb">FK FK_Demande_MRO</text>
  <text x="195" y="86" font-size="8" fill="#2563eb">FK FK_Sous_Ensemble</text>
  <text x="195" y="102" font-size="8" fill="#2563eb">FK FK_Site_Safran</text>
  <text x="195" y="118" font-size="8" fill="#2563eb">FK FK_Date_Envoi</text>
  <line x1="190" y1="128" x2="330" y2="128" stroke="#cbd5e1" stroke-width="1" />
  <text x="195" y="144" font-size="8" fill="#7c3aed" font-weight="bold">📐 Duree_Atelier_Hist</text>
  <text x="195" y="160" font-size="8" fill="#7c3aed" font-weight="bold">📐 Duree_Navette_Transit</text>
  <text x="195" y="176" font-size="8" fill="#7c3aed">📐 TAT_Package_Total</text>

  <!-- DIM_SOUS_ENSEMBLE -->
  <rect x="380" y="10" width="130" height="85" rx="5" fill="#ffffff" stroke="#8b5cf6" stroke-width="1.5" />
  <rect x="380" y="10" width="130" height="20" rx="5" fill="#8b5cf6" />
  <text x="445" y="24" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">⚙️ DIM_SOUS_ENSEMBLE</text>
  <text x="388" y="42" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Module</text>
  <text x="388" y="56" font-size="7.5" fill="#475569">• Aubes Fan, HP, AGB</text>
  <text x="388" y="70" font-size="7.5" fill="#475569">• Criticite_Maint</text>

  <!-- DIM_CALENDRIER -->
  <rect x="380" y="125" width="130" height="85" rx="5" fill="#ffffff" stroke="#ec4899" stroke-width="1.5" />
  <rect x="380" y="125" width="130" height="20" rx="5" fill="#ec4899" />
  <text x="445" y="139" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">📅 DIM_CALENDRIER</text>
  <text x="388" y="157" font-size="7.5" fill="#d97706" font-weight="bold">PK Date_Key</text>
  <text x="388" y="171" font-size="7.5" fill="#475569">• Navette_Planifiee</text>
  <text x="388" y="185" font-size="7.5" fill="#475569">• Est_Ouvre_Atelier</text>

  <!-- Liens relationnels -->
  <path d="M 140 50 L 185 70" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 140 165 L 185 102" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 380 50 L 335 86" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 380 165 L 335 118" stroke="#94a3b8" stroke-width="1.5" fill="none" />
</svg>
```

- **Avantages & Limites :**
  - Excellent compromis volumétrie / finesse analytique.
  - Isole parfaitement les frottements logistiques inter-sites sans noyer l'utilisateur dans le détail de chaque coup d'outil.

---

### Option 2.C : Micro - L'Opération Technique (Shop Task)
- **Icône / Emoji :** 🔧
- **Sous-titre :** 1 ligne = 1 opération de gamme ou 1 pointage (`FAIT_OPERATIONS_REPARATION`) - *Seule option avec Table Théorique*
- **Description métier :**
  Niveau le plus fin du système d'information industriel (MES / ERP). Chaque ligne représente une opération élémentaire de gamme ou un pointage sur poste (ex: tournage carter, ressuage CND, équilibrage dynamique, passage banc d'essai) avec qualification Part-145 requise.
- **Accès aux délais de transit inter-ateliers :** 
  ✅ **Oui, au niveau le plus granulaire.** Permet de mesurer non seulement les transferts physiques inter-ateliers et inter-bâtiments, mais également les temps de roulage internes, les délais de mise en bac navette et les temps d'attente en zone tampon avant prise en charge sur la machine suivante (`Temps_Transit_Buffer_h` et transferts inter-îlots).
- **Nature des données & Présence de la table théorique :**
  ⭐ **Seul niveau doté de la table des opérations théoriques (`REF_OPERATIONS_THEORIQUES`).** Cette table de référence fournit pour chaque croisement `Type_Moteur` (CFM56, LEAP-1A, LEAP-1B) et `Type_Reparation` (Tournage, Ressuage, Équilibrage...) la **durée de traitement théorique standard** (`Duree_Theorique_h`). L'option 3.A y est donc pleinement calculable et comparable aux pointages réels (`Temps_Reel_Historique_h`).
- **Modèle de données associé & Tables de calcul :**
  - **Table de référence des calculs théoriques :** `REF_OPERATIONS_THEORIQUES`
    - Champs clés : `ID_Op_Ref` (PK), `Type_Moteur`, `Type_Reparation`, `Duree_Theorique_h` *(Durée standard théorique)*.
  - **Table de faits :** `FAIT_OPERATIONS_REPARATION` (>250k lig/an - Pointages & Réalisé)
    - Champs clés : `ID_Op_Reparation` (PK), `FK_Operation_Ref`, `FK_Poste_Machine`, `FK_Lot_Package`, `FK_Temps_Slot`, `Temps_Reel_Historique_h`, `Temps_Transit_Buffer_h` *(Transit inter-ateliers / buffers)*, `Ecart_Theorique_h`.
  - **Dimensions reliées (1:N) :**
    - `REF_OPERATIONS_THEORIQUES` (`ID_Op_Ref`, Type_Moteur, Type_Reparation, Duree_Theorique_h)
    - `DIM_POSTE_MACHINE` (`ID_Poste`, Nom_Machine, Ilot_Atelier, Taux_Charge_Cible)
    - `DIM_PACKAGE` (`ID_Lot`, ESN_Moteur_Ref, Module_Concerne, Statut_Avancement)
    - `DIM_TEMPS_SLOT` (`Slot_Key`, Date_Jour, Equipe_Shift, Creneau_Heure)
- **Illustration SVG du Schéma Relationnel :**
```xml
<svg class="w-full max-w-[550px] mx-auto" viewBox="0 0 520 220">
  <!-- REF_OPERATIONS_THEORIQUES (Table théorique de calcul unique) -->
  <rect x="10" y="10" width="140" height="85" rx="5" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
  <rect x="10" y="10" width="140" height="20" rx="5" fill="#2563eb" />
  <text x="80" y="24" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">⭐ REF_OPERATIONS_THEO</text>
  <text x="18" y="42" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Op_Ref</text>
  <text x="18" y="56" font-size="7.5" fill="#475569">• Type_Moteur (LEAP/CFM)</text>
  <text x="18" y="70" font-size="7.5" fill="#1d4ed8" font-weight="bold">• Duree_Theorique_h</text>

  <!-- DIM_PACKAGE -->
  <rect x="10" y="125" width="140" height="85" rx="5" fill="#ffffff" stroke="#10b981" stroke-width="1.5" />
  <rect x="10" y="125" width="140" height="20" rx="5" fill="#10b981" />
  <text x="80" y="139" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">🏢 DIM_PACKAGE</text>
  <text x="18" y="157" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Lot</text>
  <text x="18" y="171" font-size="7.5" fill="#475569">• ESN_Moteur_Ref</text>
  <text x="18" y="185" font-size="7.5" fill="#475569">• Statut_Avancement</text>

  <!-- FAIT_OPERATIONS_REPARATION (Centrale) -->
  <rect x="185" y="15" width="155" height="190" rx="6" fill="#ffffff" stroke="#f59e0b" stroke-width="2" />
  <rect x="185" y="15" width="155" height="26" rx="6" fill="#f59e0b" />
  <text x="262" y="32" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">FAIT_OPERATIONS_REP</text>
  <text x="195" y="54" font-size="8" fill="#d97706" font-weight="bold">PK ID_Op_Reparation</text>
  <text x="195" y="70" font-size="8" fill="#2563eb">FK FK_Operation_Ref</text>
  <text x="195" y="86" font-size="8" fill="#2563eb">FK FK_Poste_Machine</text>
  <text x="195" y="102" font-size="8" fill="#2563eb">FK FK_Lot_Package</text>
  <text x="195" y="118" font-size="8" fill="#2563eb">FK FK_Temps_Slot</text>
  <line x1="190" y1="128" x2="335" y2="128" stroke="#cbd5e1" stroke-width="1" />
  <text x="195" y="144" font-size="8" fill="#7c3aed" font-weight="bold">📐 Temps_Reel_Hist_h</text>
  <text x="195" y="160" font-size="8" fill="#7c3aed">📐 Temps_Transit_Buffer_h</text>
  <text x="195" y="176" font-size="8" fill="#7c3aed" font-weight="bold">📐 Ecart_Theorique_h</text>

  <!-- DIM_POSTE_MACHINE -->
  <rect x="375" y="10" width="135" height="85" rx="5" fill="#ffffff" stroke="#8b5cf6" stroke-width="1.5" />
  <rect x="375" y="10" width="135" height="20" rx="5" fill="#8b5cf6" />
  <text x="442" y="24" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">🤖 DIM_POSTE_MACHINE</text>
  <text x="383" y="42" font-size="7.5" fill="#d97706" font-weight="bold">PK ID_Poste</text>
  <text x="383" y="56" font-size="7.5" fill="#475569">• USI-04 / CND-02</text>
  <text x="383" y="70" font-size="7.5" fill="#475569">• Taux_Charge_Cible</text>

  <!-- DIM_TEMPS_SLOT -->
  <rect x="375" y="125" width="135" height="85" rx="5" fill="#ffffff" stroke="#ec4899" stroke-width="1.5" />
  <rect x="375" y="125" width="135" height="20" rx="5" fill="#ec4899" />
  <text x="442" y="139" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">⏱️ DIM_TEMPS_SLOT</text>
  <text x="383" y="157" font-size="7.5" fill="#d97706" font-weight="bold">PK Slot_Key</text>
  <text x="383" y="171" font-size="7.5" fill="#475569">• Equipe_Shift (Matin/Soir)</text>
  <text x="383" y="185" font-size="7.5" fill="#475569">• Creneau_Heure</text>

  <!-- Liens relationnels -->
  <path d="M 150 50 L 185 70" stroke="#2563eb" stroke-width="2" fill="none" />
  <path d="M 150 165 L 185 102" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 375 50 L 340 86" stroke="#94a3b8" stroke-width="1.5" fill="none" />
  <path d="M 375 165 L 340 118" stroke="#94a3b8" stroke-width="1.5" fill="none" />
</svg>
```

- **Avantages & Limites :**
  - Finesse maximale pour l'optimisation Lean, détection des gaspillages de manutention et calcul précis de l'écart Gamme vs Réalisé.
  - Volumétrie élevée nécessitant des agrégations Power BI pour les rapports de synthèse.

---

## Étape 3 : Méthode de calcul du Turn Around Time (TAT)

> **Question :** Selon quelle formule et calendrier le délai de traversée (TAT) doit-il être calculé ?
> **Description du besoin :** Le TAT peut être calculé par barème théorique, par distribution statistique empirique (percentiles), selon le niveau d'engorgement des ateliers ou par modélisation dynamique multi-factorielle.

---

### Option 3.A : Délais théoriques de traitement
- **Icône / Emoji :** ➕
- **Sous-titre :** Somme arithmétique des temps de gammes standards et forfaits logistiques
- **Description métier :**
  Délais théoriques de traitement par (demande/package/opération par type de moteur selon la réponse en 2). Utilisé pour le devis commercial initial et la référence théorique constructeur.
- **Disponibilité selon Étape 2 :**
  - En **2.A (Macro)** : Forfaits constructeurs et logistiques globaux.
  - En **2.B (Méso)** : ❌ **Indisponible** (modèle basé uniquement sur l'historique réalisé).
  - En **2.C (Micro)** : ⭐ **Idéal & Standard** grâce à `REF_OPERATIONS_THEORIQUES`.
- **Formule DAX type :** `SUMX(FAIT, FAIT[Duree_Standard] + FAIT[Transit_Forfait])`
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="5" y="6" width="40" height="10" rx="2" fill="#dbeafe" stroke="#2563eb" />
  <text x="25" y="14" font-size="7" font-weight="bold" text-anchor="middle" fill="#1e40af">3j + 12j</text>
  <text x="25" y="27" font-size="10" font-weight="black" text-anchor="middle" fill="#64748b">+</text>
  <rect x="5" y="32" width="40" height="10" rx="2" fill="#d1fae5" stroke="#059669" />
  <text x="25" y="40" font-size="7" font-weight="bold" text-anchor="middle" fill="#065f46">TR 1j</text>
</svg>
```

---

### Option 3.B : Table des délais moyens (5%, 95%, médian)
- **Icône / Emoji :** 📊
- **Sous-titre :** Distribution statistique réelle basée sur l'historique des visites ($P_{5}, P_{50}, P_{95}$)
- **Description métier :**
  Table des délais moyens de traitement calculée à partir de la distribution empirique constatée. Permet d'évaluer la dispersion, d'asseoir des engagements contractuels réalistes et de maîtriser les aléas.
- **Formule DAX type :** `PERCENTILEX.INC(FAIT, FAIT[Duree_Reelle], 0.50)`
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="6" y="28" width="6" height="14" fill="#93c5fd" />
  <rect x="15" y="18" width="6" height="24" fill="#93c5fd" />
  <rect x="24" y="10" width="6" height="32" fill="#2563eb" />
  <rect x="33" y="14" width="6" height="28" fill="#93c5fd" />
  <line x1="27" y1="6" x2="27" y2="42" stroke="#059669" stroke-width="1.5" />
  <text x="27" y="48" font-size="6" font-weight="bold" text-anchor="middle" fill="#059669">P50</text>
</svg>
```

---

### Option 3.C : Délais selon le taux d'occupation atelier
- **Icône / Emoji :** 🚦
- **Sous-titre :** Prise en compte physique des goulots et files d'attente quand l'atelier approche de la saturation
- **Description métier :**
  Table des délais de traitement moyens ajustés dynamiquement par le niveau de charge de l'atelier ou du site. Permet d'alerter précocement sur les embouteillages et d'arbitrer les flux entrants.
- **Formule DAX type :** `DIVIDE(Temps_Usinage, 1 - RELATED(DIM_SITE[Taux_Charge]))`
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <line x1="8" y1="40" x2="44" y2="40" stroke="#94a3b8" stroke-width="1.2" />
  <line x1="8" y1="8" x2="8" y2="40" stroke="#94a3b8" stroke-width="1.2" />
  <path d="M 8 38 Q 30 36, 40 8" fill="none" stroke="#dc2626" stroke-width="2" />
  <line x1="34" y1="8" x2="34" y2="40" stroke="#d97706" stroke-dasharray="1.5,1.5" />
  <text x="34" y="47" font-size="6" font-weight="bold" text-anchor="middle" fill="#d97706">85%</text>
</svg>
```

---

### Option 3.D : Modélisation avancée
- **Icône / Emoji :** 📈
- **Sous-titre :** Simulation prédictive intégrant les facteurs contextuels et aléas multiples d'usure
- **Description métier :**
  Table des délais de traitement dynamiques issus d'une simulation probabiliste multi-factorielle (Monte Carlo / machine learning). Offre un pilotage prédictif fin et une optimisation adaptative des plannings.
- **Formule DAX / Algo type :** `SIMULATE_TAT_ADVANCED(FAIT, CONTEXT)`
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <path d="M 5 40 Q 18 40, 25 12 Q 32 40, 45 40" fill="none" stroke="#2563eb" stroke-width="2" />
  <line x1="25" y1="12" x2="25" y2="40" stroke="#d97706" stroke-dasharray="2,2" />
  <circle cx="25" cy="12" r="2.5" fill="#d97706" />
  <text x="25" y="47" font-size="6.5" font-weight="bold" text-anchor="middle" fill="#d97706">m</text>
</svg>
```

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
- **Avec 3.A (Délais théoriques) :**
  - *Diagnostic :* ❌ **NON DISPONIBLE.** Le niveau 2.B se base exclusivement sur les données historiques d'atelier (`FAIT_PACKAGES_SITE`). Sans table de barème théorique unitaire (disponible uniquement en 2.C), ce calcul théorique ne peut être exécuté.
  - *Alternative recommandée :* Basculer sur 3.B (distribution des délais médians historiques) ou sur le niveau 2.C si l'analyse théorique est indispensable.
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
- **Avec 3.A (Délais théoriques) :**
  - *Diagnostic :* ✅ **DISPONIBLE & IDÉAL.** Seule option disposant de la table `REF_OPERATIONS_THEORIQUES` croisant `Type_Moteur` et `Type_Reparation`. Permet de sommer les durées standards de gamme et de comparer directement avec le temps réel pointé (`Ecart_Theorique_h`).
  - *Formule DAX :* `TAT_Theorique_Op = SUMX(REF_OPERATIONS_THEORIQUES, [Duree_Theorique_h])`
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

### Option 4.A : Cartes KPIs Synthétiques
- **Icône / Emoji :** ⏱️
- **Sous-titre :** TAT moyen glissant, % respect SLA et écart-type de dérive
- **Description métier :**
  Indicateurs phares en gros chiffres : TAT moyen glissant, taux de respect des engagements contractuels et écart-type de dérive. Clarté maximale en un coup d'œil pour le management.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="6" y="6" width="88" height="34" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
  <text x="50" y="18" font-size="7" font-bold text-anchor="middle" fill="#64748b">TAT MOYEN RÉEL</text>
  <text x="50" y="32" font-size="13" font-weight="black" text-anchor="middle" fill="#0284c7">18.4 jours</text>

  <rect x="6" y="44" width="88" height="35" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
  <text x="50" y="56" font-size="7" font-bold text-anchor="middle" fill="#64748b">RESPECT SLA GLOBAL</text>
  <text x="50" y="71" font-size="13" font-weight="black" text-anchor="middle" fill="#16a34a">96.2 %</text>
</svg>
```

---

### Option 4.B : Barres vs Seuils Cibles
- **Icône / Emoji :** 📊
- **Sous-titre :** Durée réelle vs barres de tolérance contractuelles ($P_{50}$ et $P_{85}$)
- **Description métier :**
  Comparaison visuelle directe de la durée réelle par sous-ensemble face aux barres de tolérance contractuelles ($P_{50}$ et $P_{85}$). Met immédiatement en évidence les packages qui dérapent.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="8" y="18" font-size="7.5" font-semibold fill="#64748b">Aubes</text>
  <rect x="32" y="9" width="46" height="13" rx="2" fill="#3b82f6" />
  <line x1="68" y1="5" x2="68" y2="25" stroke="#dc2626" stroke-width="2" />

  <text x="8" y="44" font-size="7.5" font-semibold fill="#64748b">Révis.</text>
  <rect x="32" y="35" width="58" height="13" rx="2" fill="#3b82f6" />
  <line x1="78" y1="31" x2="78" y2="51" stroke="#dc2626" stroke-width="2" />

  <text x="8" y="70" font-size="7.5" font-semibold fill="#64748b">Banc</text>
  <rect x="32" y="61" width="38" height="13" rx="2" fill="#3b82f6" />
  <line x1="60" y1="57" x2="60" y2="77" stroke="#dc2626" stroke-width="2" />

  <text x="68" y="83" font-size="6.5" font-bold text-anchor="middle" fill="#dc2626">| Seuil P85</text>
</svg>
```

---

### Option 4.C : Barres Empilées Usinage vs Transit
- **Icône / Emoji :** 🚚
- **Sous-titre :** Décomposition Usinage / Valeur Ajoutée vs Transit inter-sites
- **Description métier :**
  Décomposition du Turn Around Time pour isoler le temps de valeur ajoutée (usinage/réparation) du temps logistique inter-sites. Démontre aux clients si un retard vient des ateliers ou des transferts.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="6" y="20" font-size="7.5" font-bold fill="#64748b">Lot 1</text>
  <rect x="26" y="10" width="42" height="13" rx="2" fill="#3b82f6" />
  <rect x="68" y="10" width="24" height="13" rx="2" fill="#f59e0b" />

  <text x="6" y="46" font-size="7.5" font-bold fill="#64748b">Lot 2</text>
  <rect x="26" y="36" width="34" height="13" rx="2" fill="#3b82f6" />
  <rect x="60" y="36" width="32" height="13" rx="2" fill="#f59e0b" />

  <circle cx="28" cy="70" r="3.5" fill="#3b82f6" />
  <text x="35" y="73" font-size="7" fill="#64748b">Atelier</text>
  <circle cx="62" cy="70" r="3.5" fill="#f59e0b" />
  <text x="69" y="73" font-size="7" fill="#64748b">Transit</text>
</svg>
```

---

### Option 4.D : Tableau d'Alertes Nominatives
- **Icône / Emoji :** 📋
- **Sous-titre :** Listing opérationnel détaillé nominatif ESN trié par criticité
- **Description métier :**
  Listing opérationnel détaillé avec statut couleur (vert/orange/rouge), ESN moteur, client, jours d'écart et action requise. Support quotidien des réunions de production et de crise MRO.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="4" y="6" width="92" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
  <circle cx="12" cy="16" r="3" fill="#10b981" />
  <text x="20" y="19" font-size="7" font-bold fill="#334155">9842 • AFR • Conforme</text>

  <rect x="4" y="32" width="92" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" />
  <circle cx="12" cy="42" r="3" fill="#f59e0b" />
  <text x="20" y="45" font-size="7" font-bold fill="#334155">7731 • DLH • Aléas +2j</text>

  <rect x="4" y="58" width="92" height="20" rx="3" fill="#fef2f2" stroke="#fecaca" />
  <circle cx="12" cy="68" r="3" fill="#ef4444" />
  <text x="20" y="71" font-size="7" font-bold fill="#dc2626">6510 • RYR • AOG Critique</text>
</svg>
```

---

## Étape 5 : Visualisation de la Capacité & Charge Atelier

> **Question :** Quel visuel privilégier pour piloter l'adéquation entre le plan de travail et les moyens disponibles ?
> **Description du besoin :** Visualiser la saturation pour anticiper les embouteillages d'atelier ou les sous-charges d'équipes.

---

### Option 5.A : Barres de Charge vs Seuil 85%
- **Icône / Emoji :** 🚦
- **Sous-titre :** Taux d'occupation machine/banc face à la ligne critique des 85%
- **Description métier :**
  Taux d'occupation machine/banc face à la ligne rouge critique des 85% au-delà de laquelle l'encombrement explose. Changement de couleur dynamique (bleu < 85%, rouge clignotant au-delà).
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="8" y="20" font-size="7.5" font-semibold fill="#64748b">VIL-01</text>
  <rect x="32" y="10" width="45" height="13" rx="2" fill="#3b82f6" />

  <text x="8" y="46" font-size="7.5" font-semibold fill="#64748b">MON-01</text>
  <rect x="32" y="36" width="62" height="13" rx="2" fill="#ef4444" />

  <line x1="68" y1="5" x2="68" y2="58" stroke="#d97706" stroke-dasharray="2.5,2.5" stroke-width="1.8" />
  <text x="68" y="70" font-size="7" font-bold text-anchor="middle" fill="#d97706">Seuil Critique 85%</text>
</svg>
```

---

### Option 5.B : Heatmap Hebdomadaire / Site
- **Icône / Emoji :** 🗓️
- **Sous-titre :** Matrice thermique des volumes par site industriel et par semaine
- **Description métier :**
  Matrice croisant sites industriels et semaines calendaires pour repérer les pics saisonniers d'entrées moteurs. Gradient thermique de bleu (fluide) à rouge vif (goulot d'étranglement).
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="10" y="10" width="16" height="16" rx="2.5" fill="#dbeafe" stroke="#93c5fd" />
  <rect x="31" y="10" width="16" height="16" rx="2.5" fill="#3b82f6" />
  <rect x="52" y="10" width="16" height="16" rx="2.5" fill="#ef4444" />
  <rect x="73" y="10" width="16" height="16" rx="2.5" fill="#dbeafe" stroke="#93c5fd" />

  <rect x="10" y="32" width="16" height="16" rx="2.5" fill="#dbeafe" stroke="#93c5fd" />
  <rect x="31" y="32" width="16" height="16" rx="2.5" fill="#ef4444" />
  <rect x="52" y="32" width="16" height="16" rx="2.5" fill="#b91c1c" />
  <rect x="73" y="32" width="16" height="16" rx="2.5" fill="#3b82f6" />

  <text x="50" y="66" font-size="8" font-bold text-anchor="middle" fill="#dc2626">Pic Semaine 38 (Rouge)</text>
</svg>
```

---

### Option 5.C : Courbes Entrées vs Sorties (WIP)
- **Icône / Emoji :** 📈
- **Sous-titre :** Différentiel de flux et suivi de l'en-cours Work-In-Progress
- **Description métier :**
  Diagramme de flux cumulé mesurant l'écart entre arrivées et restitutions. Détecte l'accumulation anormale d'en-cours si la courbe d'entrée s'écarte de la courbe de sortie.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <path d="M 10 58 Q 40 50, 60 22 Q 80 16, 92 12" fill="none" stroke="#2563eb" stroke-width="2.2" />
  <path d="M 10 60 Q 40 56, 60 52 Q 80 48, 92 46" fill="none" stroke="#059669" stroke-width="2.2" />
  <text x="82" y="10" font-size="7.5" font-bold fill="#2563eb">In (Entrées)</text>
  <text x="82" y="58" font-size="7.5" font-bold fill="#059669">Out (Sorties)</text>
  <text x="50" y="75" font-size="7.5" font-bold text-anchor="middle" fill="#dc2626">Zone Dérive WIP</text>
</svg>
```

---

### Option 5.D : Ratio Attente vs Travail Effectif
- **Icône / Emoji :** ⏳
- **Sous-titre :** Donut d'efficience et part du lead time passée en attente passive
- **Description métier :**
  Donut d'efficience mesurant la proportion du cycle de vie passée en attente passive d'un technicien ou d'un slot disponible. Démontre que fluidifier les files d'attente est plus rentable qu'accélérer l'usinage.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <circle cx="36" cy="38" r="22" fill="none" stroke="#3b82f6" stroke-width="6.5" />
  <circle cx="36" cy="38" r="22" fill="none" stroke="#ef4444" stroke-width="6.5" stroke-dasharray="138" stroke-dashoffset="80" />
  <text x="68" y="30" font-size="8" font-bold fill="#dc2626">42% Attente</text>
  <text x="68" y="46" font-size="8" font-bold fill="#2563eb">58% Usinage</text>
  <text x="50" y="73" font-size="7.5" font-semibold text-anchor="middle" fill="#64748b">Ratio Lead Time Réel</text>
</svg>
```

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
