# MAESTRO - Référentiel des Contenus & Textes Métier MRO

Ce fichier centralise l'intégralité des contenus rédactionnels, explications métier, formules DAX et libellés des étapes du simulateur de cadrage décisionnel MRO Safran.

---

## Sommaire
- [Étape 1 : Finalité & Cas d'usage](#étape-1--finalité--cas-dusage)
- [Étape 2 : Granularité & Modélisation des Données](#étape-2--granularité--modélisation-des-données)
- [Étape 3 : Méthode de calcul du Turn Around Time (TAT)](#étape-3--méthode-de-calcul-du-turn-around-time-tat)
  - [Analyses croisées Étape 2 × Étape 3 (Diagnostics & Formules DAX)](#analyses-croisées-étape-2--étape-3)
- [Étape 4 : Visualisation des Délais & Alertes MRO](#étape-4--visualisation-des-délais--alertes-mro)
- [Étape 5 : Méthode d'Évaluation de la Capacité Atelier](#étape-5--méthode-dévaluation-de-la-capacité-atelier)
- [Étape 6 : Visualisation de la Saturation & Charge Atelier](#étape-6--visualisation-de-la-saturation--charge-atelier)
- [Étape 7 : Synthèse, Profils & Recommandations](#étape-7--synthèse-profils--recommandations)

---

## Étape 1 : Finalité & Cas d'usage

> **Question :** Quel est l'objectif décisionnel principal du rapport ?
> **Description du besoin :** Le choix de la finalité conditionne l'ergonomie, la fréquence de rafraîchissement des données et le niveau d'agrégation requis pour les comités.
>
> **🧭 Méthodologie Data & Gouvernance — Cadrage du Persona Métier & Enjeux Décisionnels :**
> 1. *Propriétaire métier (Data Owner) :* Qui porte la responsabilité décisionnelle (Directeur de site, CSM client, Chef d'atelier ou Approvisionneur) ?
> 2. *Pouvoir d'arbitrage :* Quelle décision formelle est prise sur la donnée (escalade AOG, contestation SLA, dérogation stock) ?
> 3. *Niveau d'habilitation (RBAC) :* Qui a le droit de voir quoi (vue par contrat client, vision globale Safran ou cloisonnement site) ?
> 4. *Pacte de service (SLA du rapport) :* Quel engagement de fraîcheur de donnée (Direct live horaire vs consolidation consolidée hebdo) ?
> 5. *Impact de non-conformité :* Quel coût financier, contractuel ou de réputation en cas d'erreur de pilotage ?
> 6. *Rituel de gouvernance :* Dans quelle instance officielle la donnée est-elle arbitrée (War room quotidienne, Comité de direction, Revue S&OP) ?

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

### Option 1.E : Logistique et Approvisionnement
- **Icône / Emoji :** 📦
- **Sous-titre :** Disponibilité stock, délais fournisseurs et kits complets
- **Description métier :**
  Suivre les pièces en stock, les délais de livraison fournisseurs et éviter les pièces manquantes bloquant la réparation.
- **Impact BI & Architecture :**
  - Modèle dimensionnel reliant la table de faits à la dimension `pièces du moteur (engine_parts)`.
  - Cible : Responsables Approvisionnements & Magasin MRO, Ordonnanceurs d'assemblage, Gestionnaires de flotte.
  - KPI phares : Taux de service magasin OTIF, nombre de kits en rupture sur chaîne, lead time moyen fournisseurs vs TAT.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <rect x="8" y="8" width="84" height="28" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.3" />
  <text x="16" y="21" font-size="8" font-weight="bold" fill="#1e40af">Aubes HP Monocristal</text>
  <rect x="16" y="25" width="48" height="6" rx="2" fill="#bfdbfe" />
  <rect x="16" y="25" width="42" height="6" rx="2" fill="#2563eb" />
  <text x="74" y="30" font-size="7.5" font-weight="bold" fill="#1e40af">88% Stock</text>

  <rect x="8" y="40" width="84" height="28" rx="4" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.3" />
  <text x="16" y="53" font-size="8" font-weight="bold" fill="#92400e">Disque LLP Turbine</text>
  <rect x="16" y="57" width="48" height="6" rx="2" fill="#fde68a" />
  <rect x="16" y="57" width="22" height="6" rx="2" fill="#d97706" />
  <text x="72" y="62" font-size="7.5" font-weight="bold" fill="#b45309">Lead: 18j ⚠️</text>
</svg>
```


---

## Étape 2 : Données

> **Question :** Quelles sont les tables qui permettent le calcul selon le niveau de détail unitaire (Granularité de la table centrale) ?
> **Description du besoin :** La structure des tables conditionne directement les méthodes de calcul de délai possibles à l'Étape 3 et de capacité à l'Étape 5.
>
> **🧭 Méthodologie Data & Gouvernance — Gestion du Patrimoine Données & Traçabilité :**
> 1. *Source de vérité unique (Golden Source) :* L'ERP Safran, le MES atelier ou le système de suivi commercial fait-il foi ?
> 2. *Data Stewardship & Rôles :* Qui certifie la qualité et valide la saisie des pointages d'opérations sur les postes ?
> 3. *Complétude & exhaustivité :* Existe-t-il des trous dans la raquette sur les gammes standards ou les tables de transits ?
> 4. *Intégrité référentielle :* Les identifiants ESN moteur, numéros d'OF et codes postes sont-ils unifiés et normés ?
> 5. *Linéage & Traçabilité Part-145 :* Peut-on justifier l'historique et la conformité légale de chaque mesure auprès de l'OSAC/EASA ?
> 6. *Gestion du cycle de vie (Archivage) :* Quelle durée de rétention des données unitaires vs historisation agrégée ?

---

### Option 2.A : Macro - La Demande (visit)
- **Icône / Emoji :** 📦
- **Sous-titre :** 1 ligne = 1 visite complète moteur (`visit`)
- **Description métier :**
  Niveau d'agrégation macroscopique. On suit la demande globale d'une visite moteur (`visit`) depuis sa réception jusqu'à son expédition certifiée. Idéal pour le pilotage du TAT contractuel global et l'exposition aux pénalités vis-à-vis des compagnies aériennes clientes.
- **Accès aux délais de transit :** 
  Non détaillé au niveau atelier. Les transits sont inclus dans un forfait logistique global lié au moteur (`engine`).
- **Modèle de données associé & Tables de calcul :**
  - **Table de faits centrale :** `visit (engine, priority, start, end)`
    - Champs clés : `id_visit` (PK), `engine_id` (FK), `priority`, `date_start` (FK), `date_end` (FK), `tat_days` (Mesure), `sla_delay_days` (Mesure), `penalty_eur` (Mesure).
  - **Dimensions reliées (1:N) :**
    - `engine (type, model, customer)` (`engine_id` PK, `type`, `model`, `customer`)
    - `pièces du moteur (engine_parts)` (`part_id` PK, `engine_model` FK, `disponibilité_pct`, `marge_confiance_j`, `date_besoin` liée à `start`)
    - `contract_sla` (`contract_id` PK, `customer`, `sla_target_days`, `penalty_rate_day`)
    - `durée des transits` (`transit_id` PK, `shop_from`, `shop_to`, `length`)
    - `calendar` (`date` PK, `fiscal_week`, `month_year`, `is_workday`)
- **Illustration SVG de la carte réponse :**
```xml
<svg class="w-full h-full" viewBox="0 0 60 60">
  <rect x="4" y="8" width="52" height="44" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
  <rect x="4" y="8" width="52" height="14" rx="4" fill="#3b82f6" />
  <text x="30" y="18" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">VISIT (Macro)</text>
  <circle cx="20" cy="34" r="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2" />
  <text x="20" y="37" font-size="9" text-anchor="middle">✈️</text>
  <rect x="33" y="28" width="20" height="4" rx="1" fill="#2563eb" />
  <rect x="33" y="35" width="14" height="3" rx="1" fill="#93c5fd" />
  <rect x="33" y="41" width="18" height="3" rx="1" fill="#10b981" />
</svg>
```

- **Avantages & Limites :**
  - Modèle très léger, réponses instantanées pour la Direction des Opérations.
  - Pas d'isolation des postes ou navettes physiques responsables des dérives.

---

### Option 2.B : Méso - La Réparation par Atelier (repair)
- **Icône / Emoji :** 🏢
- **Sous-titre :** 1 ligne = 1 réparation module par atelier (`repair`) - *Données historiques*
- **Description métier :**
  Niveau intermédiaire calqué sur les réparations de sous-ensembles / modules moteur (Fan, Compresseur HP, Turbine BP...). Permet d'analyser l'avancement par centre de réparation (`shop`) et les flux de transferts inter-sites.
- **Accès aux délais de transit inter-ateliers :** 
  ✅ **Oui, explicitement disponible via la table dédiée :** `durée des transits (shop, shop, length)`. Permet de dissocier le temps d'intervention atelier du délai de transport routier entre ateliers (Villaroche, Montereau, Châtellerault, Bruxelles).
- **Nature des données & Impact sur le calcul :**
  ⚠️ **Basé sur les données historiques d'atelier.** Pas de barème théorique unitaire à ce niveau. Par conséquent, **l'option 3.A ("Délais théoriques") n'est pas disponible** avec l'option 2.B (on utilise la distribution 3.B, le taux de saturation 3.C ou la simulation 3.D).
- **Modèle de données associé & Tables de calcul :**
  - **Table de faits centrale :** `repair (type, visit, shop, start, end)`
    - Champs clés : `repair_id` (PK), `visit_id` (FK), `shop_id` (FK), `type`, `start` (FK), `end` (FK), `shop_history_tat` (Mesure), `transit_duration` (Mesure).
  - **Dimensions reliées (1:N) :**
    - `visit (engine, priority, start, end)` (`visit_id` PK, `engine`, `priority`, `customer`)
    - `shop [centre de réparation] (type of repairs*, stations*)` (`shop_id` PK, `shop_name`, `type of repairs*`, `stations*`)
    - `pièces du moteur (engine_parts)` (`part_id` PK, `modèle_moteur` FK, `type_réparation_module`, `disponibilité_pct`, `marge_confiance_j`, `date_besoin` liée à `start`)
    - `durée des transits (shop, shop, length)` (`transit_id` PK, `shop`, `shop_dest`, `length`)
    - `calendar` (`date` PK, `fiscal_week`, `shuttle_day`, `is_workday`)
- **Illustration SVG de la carte réponse :**
```xml
<svg class="w-full h-full" viewBox="0 0 60 60">
  <rect x="4" y="6" width="22" height="24" rx="3" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.3" />
  <text x="15" y="16" font-size="6.5" font-weight="bold" fill="#15803d" text-anchor="middle">Shop A</text>
  <text x="15" y="24" font-size="5" fill="#475569" text-anchor="middle">VIL</text>
  <rect x="34" y="30" width="22" height="24" rx="3" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.3" />
  <text x="45" y="40" font-size="6.5" font-weight="bold" fill="#15803d" text-anchor="middle">Shop B</text>
  <text x="45" y="48" font-size="5" fill="#475569" text-anchor="middle">MON</text>
  <path d="M 26 18 Q 44 14, 45 28" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="2,2" />
  <text x="36" y="21" font-size="5.5" font-weight="bold" fill="#d97706">transit</text>
</svg>
```

- **Avantages & Limites :**
  - Équilibre idéal entre visibilité globale et tracking logistique inter-sites.
  - Nécessite l'historique réalisé pour les estimations de délais.

---

### Option 2.C : Micro - La Tâche Technique sur Poste (task)
- **Icône / Emoji :** 🔧
- **Sous-titre :** 1 ligne = 1 tâche technique pointée sur station (`task`) - *Seule option avec Durée Théorique*
- **Description métier :**
  Niveau le plus fin du suivi industriel. Chaque ligne correspond à un pointage d'opération unitaire sur une machine ou poste de travail (`station`) avec adéquation des compétences et outillages Part-145.
- **Accès aux délais de transit :** 
  ✅ **Oui, au niveau le plus détaillé.** Roulage interne, mise en bac tampon et navettes d'îlots.
- **Nature des données & Présence de la table théorique :**
  ⭐ **Seul niveau doté de la table des durées théoriques :** `durée des tâches (type engine, type task, length)`. Cette table croise le type de moteur (`CFM56`, `LEAP-1A`, `LEAP-1B`) et le type de tâche (`Tournage`, `Ressuage`, `Équilibrage`...) pour fournir la **durée théorique standard** (`length`). L'option 3.A y est donc pleinement calculable.
- **Modèle de données associé & Tables de calcul :**
  - **Table de faits centrale :** `task (visit, start, end, station, type, repair)`
    - Champs clés : `task_id` (PK), `visit` (FK), `repair` (FK), `station` (FK), `type`, `start` (FK), `end` (FK), `real_length_h` (Mesure).
  - **Dimensions reliées (1:N) :**
    - `durée des tâches (type engine, type task, length)` (`task_theo_id` PK, `type engine`, `type task`, `length`)
    - `station [poste de réparation] (shop, type of repairs)` (`station_id` PK, `shop`, `type of repairs`, `target_occupancy`)
    - `pièces du moteur (engine_parts)` (`part_id` PK, `modèle_moteur` FK, `type_tâche_op`, `disponibilité_pct`, `marge_confiance_h`, `date_besoin` liée à `start`)
    - `capacité, occupation, disponibilité des stations` (`capacity_id` PK, `station`, `occupation`, `disponibilité`)
    - `calendrier des réparations des stations` (`schedule_id` PK, `station`, `repair_slot`, `shift_team`)
- **Illustration SVG de la carte réponse :**
```xml
<svg class="w-full h-full" viewBox="0 0 60 60">
  <rect x="4" y="6" width="52" height="48" rx="4" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" />
  <text x="30" y="16" font-size="7" font-weight="bold" fill="#b45309" text-anchor="middle">STATION / TASK</text>
  <circle cx="20" cy="34" r="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.2" />
  <text x="20" y="38" font-size="11" text-anchor="middle">⚙️</text>
  <rect x="34" y="24" width="18" height="18" rx="2" fill="#2563eb" />
  <text x="43" y="32" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle">THEO</text>
  <text x="43" y="39" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">4.5h</text>
</svg>
```

- **Avantages & Limites :**
  - Précision chirurgicale pour l'analyse des goulets d'étranglement machine et l'écart Théorique vs Réalisé.
  - Volumétrie importante nécessitant de solides agrégations DAX pour les dashboards exécutifs.

---

## Étape 3 : Méthode de calcul du Turn Around Time (TAT)

> **Question :** Selon quelle formule et calendrier le délai de traversée (TAT) doit-il être calculé ?
> **Description du besoin :** Le TAT peut être calculé par barème théorique, par distribution statistique empirique (percentiles), selon le niveau d'engorgement des ateliers ou par modélisation dynamique multi-factorielle.
>
> **🧭 Méthodologie Data & Gouvernance — Dictionnaire des Métriques & Auditabilité du Calcul :**
> 1. *Définition certifiée (Data Dictionary) :* Le TAT est-il validé par toutes les parties (brut calendaire, ouvré ou net gelé client) ?
> 2. *Auditabilité & Reproductibilité :* Les auditeurs clients ou financiers peuvent-ils recalculer et prouver la même valeur à l'identique ?
> 3. *Transparence des hypothèses :* Les règles de suspension de chrono ("Stop-the-clock") ou de lissage sont-elles documentées ?
> 4. *Biais statistique & Représentativité :* L'échantillon historique utilisé (médiane $P_{50}$) exclut-il les visites aberrantes ou prototypes ?
> 5. *Robustesse & Validité dans le temps :* La formule résiste-t-elle aux changements d'organisation atelier et aux nouveaux moteurs ?
> 6. *Acceptation par les parties prenantes :* Les compagnies aériennes reconnaissent-elles juridiquement cette modalité de décompte ?

---

### Option 3.A : Délais théoriques de traitement
- **Icône / Emoji :** ➕
- **Sous-titre :** Somme arithmétique des temps de gammes standards et forfaits logistiques
- **Description métier :**
  Délais théoriques de traitement. Utilisé pour le devis commercial initial et la référence théorique constructeur.
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
>
> **🧭 Méthodologie Data & Gouvernance — Standard de Restitution & Éthique de Restitution :**
> 1. *Intégrité d'interprétation :* Le visuel évite-t-il les effets d'échelle trompeurs ou les faux sentiments d'urgence ?
> 2. *Standard Corporate Safran :* Les codes couleurs (vert conforme, orange aléas, rouge AOG) respectent-ils la charte MRO ?
> 3. *Neutralité & Fidélité :* Les seuils d'alerte (SLA, $P_{85}$) sont-ils objectivement opposables à tous les acteurs ?
> 4. *Accessibilité & Clarté cognitive :* Le lecteur novice comprend-il immédiatement l'action requise sans formation poussée ?
> 5. *Protection des données sensibles :* Les pénalités financières (€) doivent-elles être masquées selon le profil utilisateur ?
> 6. *Responsabilité de l'action :* Le graphique permet-il d'assigner sans ambiguïté un responsable au déblocage ?

---

### Option 4.A : Cartes KPIs Synthétiques
- **Icône / Emoji :** ⏱️
- **Sous-titre :** TAT moyen glissant, % respect SLA et écart-type de dérive
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Scorecard / Cartes KPIs & Jauge circulaire
  - **Axes :** N/A (Indicateurs scalaires agrégés)
  - **Dimensions :** Filtres contextuels d'en-tête (Site atelier, Modèle moteur, Compagnie cliente)
  - **Mesures représentées :** TAT moyen glissant (jours), Taux de conformité SLA (%), Retard moyen cumulé
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
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Barres Horizontales avec Ligne de Mire / Seuil d'alerte
  - **Axes :** Axe X = Durée constatée (jours ouvrés ou heures) • Axe Y = Entité (Compagnie, Module, Poste)
  - **Dimensions :** Compagnie cliente (2.A), Package module (2.B), Poste de travail (2.C)
  - **Mesures représentées :** TAT Réel constaté vs Seuil contractuel garanti ($P_{85}$ SLA ou temps de gamme alloué)
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

### Option 4.C : Barres Décomposées (Attente, Transfert, Réparation)
- **Icône / Emoji :** 🚚
- **Sous-titre :** Décomposition Usinage / Valeur Ajoutée vs Attente passive vs Transit inter-sites
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Barres Empilées 100% ou en Valeur Absolue
  - **Axes :** Axe X = Jours cumulés • Axe Y = Ligne de révision / Famille moteur (CFM56, LEAP)
  - **Dimensions :** Catégories physiques du délai (Temps de Gamme/Usinage, Navettes inter-ateliers, Attente pièces/bacs)
  - **Mesures représentées :** Somme des heures ou jours passés par jalon de traversée
- **Description métier :**
  Décomposition du Turn Around Time en 3 composantes physiques clés : temps de valeur ajoutée (usinage / montage), attente passive en stock/file et transferts logistiques routiers entre sites. Permet d'isoler précisément l'origine des retards.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="6" y="20" font-size="7.5" font-bold fill="#64748b">CFM</text>
  <rect x="26" y="10" width="32" height="13" rx="1.5" fill="#3b82f6" />
  <rect x="59" y="10" width="18" height="13" rx="1.5" fill="#f59e0b" />
  <rect x="78" y="10" width="16" height="13" rx="1.5" fill="#ef4444" />

  <text x="6" y="44" font-size="7.5" font-bold fill="#64748b">LEAP</text>
  <rect x="26" y="34" width="38" height="13" rx="1.5" fill="#3b82f6" />
  <rect x="65" y="34" width="14" height="13" rx="1.5" fill="#f59e0b" />
  <rect x="80" y="34" width="16" height="13" rx="1.5" fill="#ef4444" />

  <rect x="8" y="66" width="6" height="6" rx="1" fill="#3b82f6" />
  <text x="16" y="72" font-size="6" fill="#64748b">Répar.</text>
  <rect x="40" y="66" width="6" height="6" rx="1" fill="#f59e0b" />
  <text x="48" y="72" font-size="6" fill="#64748b">Transf.</text>
  <rect x="74" y="66" width="6" height="6" rx="1" fill="#ef4444" />
  <text x="82" y="72" font-size="6" fill="#64748b">Attente</text>
</svg>
```

---

### Option 4.D : Tableau d'Alertes Nominatives
- **Icône / Emoji :** 📋
- **Sous-titre :** Listing opérationnel détaillé nominatif ESN trié par criticité
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Table / Matrice avec Mise en Forme Conditionnelle
  - **Axes :** Lignes = Dossiers unitaires ESN • Colonnes = Indicateurs de pilotage
  - **Dimensions :** Identifiant ESN Moteur, Compagnie cliente, Centre de réparation, Statut AOG
  - **Mesures représentées :** Dépassement contractuel (Jours ouvrés), Pénalités journalières encourues (€)
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

## Étape 5 : Méthode d'Évaluation de la Capacité Atelier

> **Question :** Sur quelle base modéliser la capacité et la charge théorique ou prévisionnelle ?
> **Description du besoin :** La capacité peut être calibrée selon le plan de charge S&OP, les demandes effectives instantanées (WIP réel pointé), la disponibilité des pièces de rechange ou une modélisation multi-factorielle des aléas MRO.
>
> **🧭 Méthodologie Data & Gouvernance — Gouvernance du Plan Capacitaire & Accords de Service :**
> 1. *Autorité d'engagement :* Qui valide le plan capacitaire officiel (Directeur Industriel vs Ventes & Programmes) ?
> 2. *Contrats d'interface Fournisseurs :* Les lead times des équipementiers OEM reposent-ils sur des engagements contractuels opposables ?
> 3. *Fiabilité des prévisions S&OP :* Quel historique de respect des créneaux de déposes par les compagnies partenaires ?
> 4. *Synchronisation des silos :* Comment assurer la cohérence entre la cellule Achats Pièces et l'ordonnancement Atelier ?
> 5. *Gouvernance des dérogations :* Quelle procédure formelle autorise l'utilisation de pièces d'occasion ou cannibalisées ?
> 6. *Gestion des risques d'attrition :* Les règles de mise au rebut aux CND sont-elles certifiées par les autorités de navigabilité ?

---

### Option 5.A : Prévisions des Demandes (Plan S&OP)
- **Icône / Emoji :** 🗓️
- **Sous-titre :** Plan industriel et commercial, déposes fermes annoncées & créneaux réservés
- **Description métier :**
  Intégration du carnet de commandes prévisionnel et des programmes de révision négociés avec les compagnies clientes. Permet d'anticiper les vagues de déposes moteurs à 3-6 mois.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="5" y="6" width="40" height="38" rx="4" fill="#fefce8" stroke="#ca8a04" stroke-width="1.2" />
  <rect x="5" y="6" width="40" height="10" rx="3" fill="#ca8a04" />
  <circle cx="14" cy="11" r="1.5" fill="#ffffff" />
  <circle cx="25" cy="11" r="1.5" fill="#ffffff" />
  <circle cx="36" cy="11" r="1.5" fill="#ffffff" />
  <path d="M 12 24 L 20 32 L 38 18" fill="none" stroke="#854d0e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

---

### Option 5.B : Demandes Effectives à l'Instant (WIP)
- **Icône / Emoji :** ⚡
- **Sous-titre :** Charge en-cours réelle (Work-In-Progress) et dossiers pointés en direct
- **Description métier :**
  Calcul en temps réel basé sur le cumul des heures des dossiers et moteurs physiquement présents dans les ateliers. Révèle la tension immédiate sur le plancher sans spéculation.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="6" y="6" width="38" height="38" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="1.2" />
  <path d="M 25 10 L 16 26 L 24 26 L 22 40 L 34 22 L 26 22 Z" fill="#2563eb" />
  <circle cx="25" cy="25" r="18" fill="none" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4,2" />
</svg>
```

---

### Option 5.C : Capacité & Approvisionnement Pièces
- **Icône / Emoji :** 📦
- **Sous-titre :** Disponibilité magasin pièces de rechange, lead times OEM & kits complets
- **Description métier :**
  Évaluation de la capacité réelle d'avancement conditionnée par le taux de service pièces critiques (LLP, aubes HP, carters), les délais d'approvisionnement des équipementiers et la constitution des kits de révision complets (Kitting OTIF).
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="7" y="8" width="36" height="34" rx="3" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.2" />
  <path d="M 11 17 L 25 10 L 39 17 L 25 24 Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="1" />
  <path d="M 11 17 L 11 34 L 25 41 L 25 24 Z" fill="#86efac" stroke="#16a34a" stroke-width="1" />
  <path d="M 39 17 L 39 34 L 25 41 L 25 24 Z" fill="#4ade80" stroke="#16a34a" stroke-width="1" />
  <circle cx="37" cy="13" r="6" fill="#16a34a" />
  <path d="M 34 13 L 36 15 L 40 11" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
```

---

### Option 5.D : Prévisions Multi-factorielles Avancées
- **Icône / Emoji :** 🔮
- **Sous-titre :** Rebuts CND/ressuage, disponibilité des bancs d'essais, outillages & attrition pièces LLP
- **Description métier :**
  Modélisation prédictive intégrant les facteurs critiques réels MRO aéronautique : taux de rebuts aux contrôles non destructifs (CND/courants de Foucault), disponibilité et goulets des bancs d'essais moteur, tensions outillages spécifiques et attrition des pièces à durée de vie limitée (LLP).
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 50 50">
  <rect x="6" y="6" width="38" height="38" rx="4" fill="#faf5ff" stroke="#a855f7" stroke-width="1.2" />
  <circle cx="25" cy="25" r="13" fill="none" stroke="#c084fc" stroke-width="2" stroke-dasharray="3,2" />
  <circle cx="25" cy="25" r="5" fill="#7e22ce" />
  <line x1="25" y1="8" x2="25" y2="12" stroke="#9333ea" stroke-width="2" />
  <line x1="25" y1="38" x2="25" y2="42" stroke="#9333ea" stroke-width="2" />
  <line x1="8" y1="25" x2="12" y2="25" stroke="#9333ea" stroke-width="2" />
  <line x1="38" y1="25" x2="42" y2="25" stroke="#9333ea" stroke-width="2" />
</svg>
```

---

## Étape 6 : Visualisation de la Saturation / Capacité

> **Question :** Quel type de visuel illustre le mieux la saturation ou la capacité des ateliers ?
> **Description du besoin :** 4 formats opérationnels usuels pour surveiller la charge, repérer les îlots goulots et anticiper les surcharges physiques.
>
> **🧭 Méthodologie Data & Gouvernance — Pilotage des Tensions & Protocoles d'Arbitrage :**
> 1. *Protocole d'escalade au seuil 85% :* Quel circuit de décision officiel se déclenche dès l'entrée en zone de saturation critique ?
> 2. *Arbitrage inter-sites équitable :* Quelle gouvernance tranche le délestage d'un atelier vers un autre (VIL, MON, CHL, BRU) ?
> 3. *Responsabilité sur l'en-cours (WIP) :* Qui rend compte des dérives de lead time causées par l'accumulation d'en-cours ?
> 4. *Transparence de la file d'attente :* La ventilation temps utile vs temps d'attente est-elle partagée en toute neutralité avec le Lean ?
> 5. *Données de sous-traitance :* Les goulets chez les partenaires externes sont-ils monitorés avec les mêmes exigences de gouvernance ?
> 6. *Mesure de l'impact social & capacitaire :* Comment la donnée de saturation est-elle partagée avec le management des ressources humaines ?

---

### Option 6.A : Barres de Charge vs Seuil 85%
- **Icône / Emoji :** 📊
- **Sous-titre :** Taux d'occupation par atelier avec seuil d'alerte critique
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Barres Horizontales avec Seuil Critique (Target / Benchmark line)
  - **Axes :** Axe X = Taux de charge (%) • Axe Y = Ateliers / Postes de maintenance
  - **Dimensions :** Sites MRO Safran (Villaroche, Montereau, Châtellerault, Bruxelles) ou Lignes de production
  - **Mesures représentées :** Ratio Charge / Capacité nominale (%), Ligne de mire seuil de congestion à 85%
- **Description métier :**
  Barres de charge par atelier (Villaroche, Montereau, Châtellerault, Bruxelles) avec ligne de mire à 85% (seuil critique de dégradation exponentielle du TAT).
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <line x1="12" y1="72" x2="94" y2="72" stroke="#cbd5e1" stroke-width="1.2" />
  <rect x="18" y="32" width="12" height="40" rx="1.5" fill="#10b981" />
  <text x="24" y="80" font-size="6" fill="#64748b" text-anchor="middle">MON</text>
  <rect x="36" y="16" width="12" height="56" rx="1.5" fill="#ef4444" />
  <text x="42" y="80" font-size="6" fill="#64748b" text-anchor="middle">VIL</text>
  <rect x="54" y="24" width="12" height="48" rx="1.5" fill="#f59e0b" />
  <text x="60" y="80" font-size="6" fill="#64748b" text-anchor="middle">CHL</text>
  <rect x="72" y="38" width="12" height="34" rx="1.5" fill="#10b981" />
  <text x="78" y="80" font-size="6" fill="#64748b" text-anchor="middle">BRU</text>
  <line x1="12" y1="26" x2="94" y2="26" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" />
  <text x="88" y="23" font-size="5" font-weight="bold" fill="#dc2626">85%</text>
</svg>
```

---

### Option 6.B : Heatmap Hebdomadaire / Site
- **Icône / Emoji :** 🗓️
- **Sous-titre :** Grille thermique des charges par semaine et par centre MRO
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Heatmap Matricielle Thermique (Matrix Grid)
  - **Axes :** Axe X = Semaines fiscales Safran (S12..S15) • Axe Y = Centres industriels / Ateliers
  - **Dimensions :** Semaine calendaire, Atelier MRO, Ligne de montage / réparation
  - **Mesures représentées :** Heures planifiées d'atelier, Ratio charge/capacité, Gradient d'alerte (vert <75%, orange 75-85%, rouge >85%)
- **Description métier :**
  Matrice semaine × atelier colorée en dégradé vert/jaune/rouge selon le ratio Charge / Capacité. Donne une vision instantanée des tensions d'effectifs sur l'année.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <text x="14" y="22" font-size="5.5" font-weight="bold" fill="#64748b">VIL</text>
  <rect x="24" y="14" width="14" height="12" rx="1" fill="#fee2e2" />
  <rect x="42" y="14" width="14" height="12" rx="1" fill="#ef4444" />
  <rect x="60" y="14" width="14" height="12" rx="1" fill="#f87171" />
  <rect x="78" y="14" width="14" height="12" rx="1" fill="#fca5a5" />

  <text x="14" y="40" font-size="5.5" font-weight="bold" fill="#64748b">MON</text>
  <rect x="24" y="32" width="14" height="12" rx="1" fill="#d1fae5" />
  <rect x="42" y="32" width="14" height="12" rx="1" fill="#10b981" />
  <rect x="60" y="32" width="14" height="12" rx="1" fill="#fef3c7" />
  <rect x="78" y="32" width="14" height="12" rx="1" fill="#d1fae5" />

  <text x="14" y="58" font-size="5.5" font-weight="bold" fill="#64748b">CHL</text>
  <rect x="24" y="50" width="14" height="12" rx="1" fill="#fef3c7" />
  <rect x="42" y="50" width="14" height="12" rx="1" fill="#f59e0b" />
  <rect x="60" y="50" width="14" height="12" rx="1" fill="#d1fae5" />
  <rect x="78" y="50" width="14" height="12" rx="1" fill="#10b981" />

  <text x="31" y="74" font-size="5.5" fill="#94a3b8" text-anchor="middle">S12</text>
  <text x="49" y="74" font-size="5.5" fill="#94a3b8" text-anchor="middle">S13</text>
  <text x="67" y="74" font-size="5.5" fill="#94a3b8" text-anchor="middle">S14</text>
  <text x="85" y="74" font-size="5.5" fill="#94a3b8" text-anchor="middle">S15</text>
</svg>
```

---

### Option 6.C : Courbes Entrées vs Sorties (WIP)
- **Icône / Emoji :** 📈
- **Sous-titre :** Dérive de l'en-cours physique et ciseaux de flux industriels
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Courbes Cumulées de Flux / Diagramme de Flux Cumulé (CFD)
  - **Axes :** Axe X = Axe chronologique (Semaines Safran) • Axe Y = Nombre cumulé de moteurs / modules
  - **Dimensions :** Nature du flux (Entrées / Déposes fermes vs Sorties / Restitutions livrées)
  - **Mesures représentées :** Volume cumulé des entrées, Volume cumulé des sorties, Écart différentiel (En-cours physique WIP & dérive de lead time)
- **Description métier :**
  Courbe cumulative des réceptions vs livraisons moteurs. L'écartement des courbes matérialise visuellement le gonflement de l'en-cours et l'allongement mécanique du TAT (loi de Little).
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <line x1="12" y1="72" x2="94" y2="72" stroke="#cbd5e1" stroke-width="1.2" />
  <path d="M 14 65 Q 40 45, 88 18" fill="none" stroke="#2563eb" stroke-width="2.2" />
  <path d="M 14 68 Q 45 60, 88 38" fill="none" stroke="#10b981" stroke-width="2.2" />
  <path d="M 50 48 L 50 61" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2" />
  <text x="56" y="56" font-size="6" font-weight="bold" fill="#dc2626">WIP +18%</text>
  <text x="76" y="16" font-size="5.5" font-weight="bold" fill="#1d4ed8">Entrées</text>
  <text x="76" y="44" font-size="5.5" font-weight="bold" fill="#047857">Sorties</text>
</svg>
```

---

### Option 6.D : Ratio Attente vs Travail Effectif
- **Icône / Emoji :** ⏱️
- **Sous-titre :** Décomposition temps de gamme vs temps d'attente passif (WIP)
- **Spécifications Data & Dataviz :**
  - **Type de graphique :** Donut Chart / Ratio Part de Voix Lean (Valeur Ajoutée vs Non-VA)
  - **Axes :** N/A (Proportions circulaires sur base 100%)
  - **Dimensions :** Catégorie d'activité Lean (Temps d'usinage / montage à Valeur Ajoutée vs Temps d'attente passif / transit)
  - **Mesures représentées :** % Temps Contact productif vs % Temps en file d'attente / navette, Total Lead Time global
- **Description métier :**
  Donut chart comparant le temps d'usinage / montage à valeur ajoutée et le temps passé en file d'attente ou en attente d'approvisionnement pièce. Fondement du Lean MRO Safran.
- **Illustration SVG :**
```xml
<svg class="w-full h-full" viewBox="0 0 100 85">
  <circle cx="50" cy="42" r="28" fill="none" stroke="#fee2e2" stroke-width="12" />
  <circle cx="50" cy="42" r="28" fill="none" stroke="#2563eb" stroke-width="12" stroke-dasharray="176" stroke-dashoffset="120" stroke-linecap="round" />
  <text x="50" y="39" font-size="10" font-weight="black" fill="#1e293b" text-anchor="middle">32%</text>
  <text x="50" y="49" font-size="5" font-weight="bold" fill="#64748b" text-anchor="middle">VA REEL</text>
  <text x="50" y="78" font-size="6" font-weight="bold" fill="#dc2626" text-anchor="middle">68% File / Attente</text>
</svg>
```

---

## Étape 7 : Synthèse, Profils & Recommandations

> **Question :** Comment structurer la restitution finale pour engager les parties prenantes ?
> **Description du besoin :** Le slide de synthèse consolide l'ensemble de la chaîne de décision (de l'objectif métier aux choix d'architecture).

---

En fonction de la combinaison des choix effectués aux étapes 1 à 6, le système déduit le **Profil Décisionnel MRO** :

### Les 4 Grands Profils Décisionnels
1. **Profil Exploitation Opérationnelle (Shop Floor Control)** :
   - Dominante : Étape 1.A + Granularité 2.B ou 2.C + Visuels 4.A / 6.B.
   - Recommandation : Modèle en étoile avec DirectQuery ou rafraîchissement incrémentiel horaire.
2. **Profil Contractuel & Relation Client (SLA Guardian)** :
   - Dominante : Étape 1.B + TAT Net 3.C + Alertes 4.D.
   - Recommandation : Modèle tabulaire avec historisation journalière des statuts de gel de chrono.
3. **Profil Excellence Industrielle & Lean (Continuous Improvement)** :
   - Dominante : Étape 1.C + TAT Actif 3.D + CFD 6.D / Dispersion 4.B.
   - Recommandation : Import complet avec tables de faits découpées par module et matrice de variance.
4. **Profil Planification Stratégique & Capacitaire (S&OP Planner)** :
   - Dominante : Étape 1.D + Granularité Macro 2.A + Capacité 5.C + Charge/Capacité 6.A.
   - Recommandation : Modélisation mixte associant le carnet de commandes fermes et les prévisions de déposes moteur.

---

## Les 8 Graphiques Usuels Disponibles (4 en Étape 4 & 4 en Étape 6)

L'application retient exclusivement les **8 graphiques de référence** les plus efficaces et pragmatiques en production industrielle :

| Étape | Clé | Type de Visuel | Rôle Décisionnel MRO Safran |
| :--- | :--- | :--- | :--- |
| **Étape 4 (Délai)** | **4.A** | ⏱️ Cartes KPIs Synthétiques | Vue d'ensemble instantanée : TAT moyen glissant et taux de conformité SLA |
| **Étape 4 (Délai)** | **4.B** | 📊 Barres vs Seuils Cibles | Comparatif direct de la durée par ligne / atelier face au seuil de tolérance P85 |
| **Étape 4 (Délai)** | **4.C** | 🚚 Barres Décomposées | Décomposition physique en 3 blocs : Attente passive, Transfert et Réparation |
| **Étape 4 (Délai)** | **4.D** | 📋 Tableau d'Alertes Nominatives | Listing opérationnel unitaire par ESN moteur, client et montant de pénalité (€) |
| **Étape 6 (Saturation)** | **6.A** | 🚦 Barres de Charge vs Seuil 85% | Contrôle du point d'engorgement critique (85%) par site ou îlot machine |
| **Étape 6 (Saturation)** | **6.B** | 🗓️ Heatmap Hebdomadaire / Site | Matrice thermique temporelle des pics de tension d'effectifs et charges |
| **Étape 6 (Saturation)** | **6.C** | 📈 Courbes Entrées vs Sorties (WIP) | Suivi du volume d'en-cours physique et de la dérive du lead time (Loi de Little) |
| **Étape 6 (Saturation)** | **6.D** | ⏳ Ratio Attente vs Travail Effectif | Donut Lean MRO dissociant le temps de valeur ajoutée de la file d'attente |

> **Absence de restriction sur les étapes de calcul :**  
> Pour les étapes analytiques (Étape 2 Données, Étape 3 TAT, Étape 5 Capacité), aucune limitation n'est imposée.  
> Les choix de calcul du TAT (Étape 3) et d'évaluation de la capacité (Étape 5) modulent dynamiquement les indicateurs synthétiques de l'Étape 7 :
> - **3.B / 5.B** : Affichage sous forme $P_{50}$ ($P_{5} - P_{95}$) révélant la dispersion optimiste vs pessimiste sans mention redondante de médiane, avec mention `Effectif` pour l'en-cours.
> - **3.C / 5.C** : Indication explicite d'un degré de certitude précédé des mentions *"Sur la base de la charge machine"* (3.C) et *"Sur la base de la charge S&OP"* (5.C).
> - **3.D / 5.D** : Indice de certitude prédictif multi-factoriel (IA).
> - **5.A** : Sous-titre synthétique épuré en *"Théorique"*.
> - **Barre de filtres interactive (Étape 7)** : Sélecteur de date calendaire jour dans le futur couplé à l'affichage dynamique de la **Date Prévisionnelle de sortie** (= date sélectionnée + TAT médian constaté). Filtrage par Site, Client, Modèle moteur recalculant instantanément les indicateurs et volumes avec cohérence métier.
