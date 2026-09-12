# MAESTRO - Référentiel des Contenus & Cadrage Métier MRO

Ce document constitue le référentiel textuel, méthodologique et technique synchronisé avec l'application SPA `index.html`. Il rassemble le contexte opérationnel, les enjeux de gouvernance des données, les descriptions fonctionnelles, les représentations graphiques Mermaid ainsi que les extraits des tables dynamiques et formules DAX.

---

## Sommaire
- [Étape 0 : Contexte & Documentation](#étape-0--contexte--documentation)
- [Étape 1 : Question (Cadrage métier prioritaire)](#étape-1--question)
- [Étape 2 : Modèle (Granularité & Tables de calcul)](#étape-2--modèle)
- [Étape 3 : TAT (Méthode de calcul du Turn Around Time)](#étape-3--tat)
- [Étape 4 : Délai (Visualisations & Alertes TAT)](#étape-4--délai)
- [Étape 5 : Capacité (Méthode d'évaluation de la Capacité Atelier)](#étape-5--capacité)
- [Étape 6 : Saturation (Visualisations de la Charge Atelier)](#étape-6--saturation)
- [Étape 7 : Synthèse, Profils & Dashboard Dérivé](#étape-7--synthèse-profils--dashboard-dérivé)
- [Stratégie de Génération de Données & Moteur Pseudo-Aléatoire Seedé](#stratégie-de-génération-de-données--moteur-pseudo-aléatoire-seedé)

---

## Étape 0 : Contexte & Documentation

> **En-tête de l'interface :** Étape 0 : Contexte & Documentation  
> **Comportement :** La page Étape 0 charge et affiche le contenu des fichiers Markdown du dossier racine via un sélecteur en haut (`readme.md` par défaut, puis `content.md`, `gouvernance.md`, `AGENTS.md`, `data.json`). Les fichiers `.json` (`data.json`) sont affichés en JSON formaté (pretty-print) dans un bloc mono-police.

### 0.1 Contenu par défaut (readme.md)
Le fichier `readme.md`, affiché par défaut, porte le **contexte opérationnel** et le **rôle du consultant / data lead supervisor** :
- **Contexte Opérationnel & Déploiement BI :** Déploiement d'un outil décisionnel Power BI de cadrage de charge et de pilotage du TAT sur les flottes CFM56-7B, CFM56-5B, LEAP-1A, LEAP-1B, GE90-115B, M88-2, sur 10 centres Safron (FR-Villaroche, FR-Montereau, FR-Châtellerault, BE-Bruxelles, FR-Saint-Quentin, FR-Gennevilliers, FR-Bordeaux, FR-Toulouse, BE-Liège, FR-Le Creusot).
- **Rôle & Enjeux du Consultant / Data Lead Supervisor :** Arbitrage de la source de vérité (Golden Source), supervision de la qualité et du cycle de vie des données, normalisation des règles de calcul (Data Dictionary) et éthique de restitution (RLS/RBAC).

> *(La **Méthodologie Data & Gouvernance** est consultable à tout moment via le bouton d'information `i` (icône Lucide) présent à côté du titre de chaque étape, ouvrant une modale globale avec ancres de navigation directe.)*

---

## Étape 1 : Question

> **Question de cadrage :** Quel est le premier problème que le tableau de bord doit résoudre ?  
> **En-tête de l'interface :** Étape 1 : Cadrer la question métier prioritaire (`🎯 Cadrage du Persona Métier`)

### Options Décisionnelles Disponibles :
1. **Option 1.A : Urgence opérationnelle (AOG)**
   - *Sous-titre :* Alerte temps réel AOG & escalade immédiate
   - *Description :* Alerter en direct sur les moteurs à risque d'immobilisation avion (**AOG**). Escalade immédiate vers les chefs d'atelier dès dérive critique.
   - *Orientation de restitution :* Badges d'alerte rouge clignotant, identification des ESN en souffrance.
   - *Exemples de questions métiers cibles :*
     - Quels réacteurs en atelier risquent de clouer un appareil au sol sous 48h ?
     - Quel chef d'atelier doit être alerté en priorité sur une dérive critique ?
     - Quels dossiers urgents doivent préempter les créneaux d'usinage et de banc ?
2. **Option 1.B : Engagements contractuels (SLA)**
   - *Sous-titre :* Respect des SLA & vision globale par compagnie
   - *Description :* Garantir le respect des **SLA** et du TAT moyen par compagnie aérienne et typologie de contrat.
   - *Orientation de restitution :* Jauges de conformité contractuelle, décompte des dossiers livrés dans les temps.
   - *Exemples de questions métiers cibles :*
     - Quel est le taux de respect des SLA engagés auprès d'Air France ou Delta ?
     - Quel contrat MRO génère les dépassements de TAT moyen les plus récurrents ?
     - Comment benchmarke-t-on le TAT effectif vs contractuel par type de flotte ?
3. **Option 1.C : Optimisation des capacités**
   - *Sous-titre :* Lissage de charge & élimination des goulets ateliers
   - *Description :* Équilibrer les charges multi-sites (Montereau, Villaroche, Bruxelles), lisser les goulets et l'usinage.
   - *Orientation de restitution :* Comparatif capacitaire inter-sites et détection des îlots saturés.
   - *Exemples de questions métiers cibles :*
     - Quel site Safron approche du seuil critique de 85% de saturation ?
     - Peut-on réorienter des modules CFM56 de Montereau vers Bruxelles ?
     - Où se situent les goulets d'usinage retardant le passage sur banc ?
4. **Option 1.D : Suivi Retard & Pénalités**
   - *Sous-titre :* Dérapage en jours ouvrés & exposition financière (€)
   - *Description :* Mesurer le dérapage en **jours ouvrés** au-delà du SLA et chiffrer l'exposition financière (€).
   - *Orientation de restitution :* Exposition financière cumulée, compteurs d'ESN sous pénalités journalières.
   - *Exemples de questions métiers cibles :*
     - Quel montant de pénalités contractuelles court aujourd'hui sur les visites en retard ?
     - Quels moteurs accumulent plus de 5 jours de dérive financièrement pénalisante ?
     - Quel barème financier s'applique par jour ouvré supplémentaire sur chaque client ?
5. **Option 1.E : Logistique & Approvisionnement (Kits & Pièces)**
   - *Sous-titre :* Disponibilité stock, délais fournisseurs OTIF et kits complets (Repair Kits)
   - *Description :* Disponibilité des kits de réparation (Repair Kits) et pièces critiques, délais fournisseurs OTIF et élimination des ruptures d'atelier.
   - *Orientation de restitution :* Taux de service OTIF, détection des kits incomplets (aubes HP, LLP) et arrêts magasin.
   - *Exemples de questions métiers cibles :*
     - Quels kits de réparation (aubes monocristal, LLP) manquent pour ouvrir l'ordre atelier ?
     - Quel est le taux de service OTIF des fournisseurs sur les kits critiques ?
     - Combien d'heures d'attente atelier sont directement imputables à un kit incomplet ?
6. **Option 1.F : Data Gouvernance**
   - *Sous-titre :* Suivi des usages métiers, fiabilisation, pertinence des modèles & nouvelles sources
   - *Description :* Suivre les usages métiers, fiabiliser la donnée, s'assurer de la pertinence des modèles en mesurant l'écart prévisionnel vs effectif, et détecter les opportunités de connexion à de nouvelles sources de données hors périmètre MAESTRO.
   - *Orientation de restitution :* Dérive des algorithmes, contrôle qualité des tables, suivi de l'adoption décisionnelle et cartographie des gisements de données externes (télémétrie avionique, météo, supply tiers).
   - *Exemples de questions métiers cibles :*
     - Quel est l'écart moyen entre les durées de réparation prévues et constatées en atelier ?
     - Les chefs d'atelier et ordonnanceurs consultent-ils régulièrement les rapports BI ?
     - Quels modèles prédictifs subissent une dérive statistique nécessitant un recalibrage ?
     - Quelles sources de données externes (télémétrie en vol, portail logistique tiers, IoT) pourraient enrichir la prédictivité hors périmètre MAESTRO actuel ?

```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Écart Prévisionnel vs Effectif Réel (Surveillance Dérive Modèle)"
    x-axis ["Semaine 1", "Semaine 2", "Semaine 3", "Semaine 4", "Semaine 5"]
    y-axis "TAT Moyen (Jours)" 10 --> 26
    line [18, 19, 21, 23, 24]
    line [17, 18, 18, 19, 20]
```

---

## Étape 2 : Modèle

> **Question de cadrage :** Quelles tables permettent le calcul selon le niveau de détail unitaire ?  
> **En-tête de l'interface :** Étape 2 : Données (Granularité & Tables pour le calcul)  
> **Bouton d'affichage :** en haut à droite, le bouton `schema-toggle` bascule entre la vue SVG (`schemaCanvas`) et le code Mermaid (`SCHEMA_MERMAID` dans `index.html`, avec bouton dédié « Copier le code » et sélection intégrale sans toast intempestif), identique aux diagrammes `erDiagram` ci-dessous.

### Les 3 Niveaux de Granularité :

#### Option 2.A : Macro — Demande de Visite (`visit`)
- **Granularité :** 1 ligne = 1 visite complète moteur `visit (engine, priority, start, end)`.
- **Transits logistiques :** Forfait logistique global rattaché au moteur.
- **Hypothèses de simplification vs 2.C (Micro) :**
  - **Forfaitisation des transferts :** Les temps de transit logistiques sont modélisés comme un forfait moyen global au moteur, masquant les navettes inter-ateliers unitaires.
  - **Masquage des sous-étapes d'atelier :** Le cycle de visite est appréhendé de bout en bout sans détailler le cheminement interne entre îlots spécialisés.
  - **Allotissement immédiat des pièces :** Le kit de pièces complet est réputé requis et alloué dès la date d'induction (`start_req_date`), sans suivre la séquence de consommation réelle au poste.
- **Modélisation relationnelle Canvas :**
  - **Fait central :** `visit` (`id_demande` / `id_visit` commençant par `D-xxxxx`, `id_moteur` / ESN, `priorite`, `date_entree [start]`, `date_livraison`, `id_kit_pieces`, `tat_realise_j`, `derapage_sla_j`, `penalites_eur`).
  - **Dimensions liées (1:N) :** `engine` (type, modele, client), `contract_sla` (client, sla_cible_jours, penalite_jour_eur), `transits` (shop_source, shop_dest, delai_transit_j), `calendar` (date, semaine, ouvre), `engine_parts` (`id_piece_pn` au format `Pxxxxx`, modele_moteur, dispo %, intervalle confiance +/-, lien date start).
  - **Identifiants normalisés (`data.json`) :** Demandes au format `D-xxxxx` (ex: `D-09842`), Pièces au format `Pxxxxx` (ex: `P01125`), clés étrangères alignées avec le schéma de l'Étape 2 (`id_demande`, `id_moteur`, `id_shop`, `id_piece_pn`).

##### 📋 Dictionnaire de Données — Option 2.A (Macro)

| Table & Champ | Type / Format | Cardinalité | Rôle & Description | Exemple Concret |
| :--- | :--- | :--- | :--- | :--- |
| **`VISIT`** *(Table de faits)* | | **Fait central** | **1 ligne = 1 visite complète moteur en atelier MRO** | `D-09842` |
| ↳ `id_visit` | `String` (`D-xxxxx`) | **PK** (1:1) | Identifiant unique de la demande d'intervention MRO | `"D-09842"` |
| ↳ `id_moteur` | `String` (`ESN-xxxxxx`) | **FK** (N:1 → `ENGINE`) | Numéro de série constructeur de l'équipement (*Engine Serial Number*) | `"ESN-884210"` |
| ↳ `priorite` | `String` (`Enum`) | Attribut de fait | Niveau d'urgence opérationnelle de la dépose moteur | `"AOG Critique"` / `"Normal"` |
| ↳ `date_entree` | `Date` (`YYYY-MM-DD`) | Attribut temporel (`start`) | Date d'induction physique sur le site de révision | `"2026-03-01"` |
| ↳ `date_livraison` | `Date` (`YYYY-MM-DD`) | Attribut temporel (`end`) | Date de remise à disposition client après essais au banc | `"2026-03-22"` |
| ↳ `id_kit_pieces` | `String` (`Pxxxxx`) | **FK** (N:1 → `ENGINE_PARTS`)| Référence du kit d'approvisionnement majeur alloué | `"P01125"` |
| ↳ `tat_realise_j` | `Float` (`#.0` jours) | Métrique / *Key Figure* | Durée totale de traversée constatée (*Turnaround Time*) | `21.0` jours |
| ↳ `derapage_sla_j`| `Float` (`#.0` jours) | Métrique calculée | Retard constaté par rapport à l'engagement contractuel SLA | `+3.0` jours (ou `0.0`) |
| ↳ `penalites_eur` | `Integer` (`€`) | Métrique financière | Coût financier induit par le dépassement des engagements SLA | `4 500` € |
| **`ENGINE`** *(Dimension)* | | **1:N** avec `VISIT` | **Référentiel des moteurs et de la flotte cliente** | `LEAP-1A26` |
| ↳ `id_moteur` | `String` (`ESN-xxxxxx`) | **PK** (1:1) | Identifiant unique de l'équipement | `"ESN-884210"` |
| ↳ `type` | `String` | Attribut de regroupement | Famille majeure de motorisation aéronautique | `"LEAP-1A"` / `"CFM56-7B"` |
| ↳ `modele` | `String` | Attribut technique | Variante spécifique de poussée et d'aéronef | `"LEAP-1A26 (A320neo)"` |
| ↳ `client` | `String` (Code OACI/IATA)| Attribut commercial | Compagnie aérienne propriétaire ou opératrice | `"AFR"` (Air France) |
| **`CONTRACT_SLA`** *(Dimension)* | | **1:N** avec `VISIT` | **Paramètres contractuels et engagements de service** | Contrat SLA Ryannair |
| ↳ `id_contrat` | `String` (`CTR-xxxx`) | **PK** (1:1) | Identifiant unique de l'accord-cadre commercial | `"CTR-RYR-2025"` |
| ↳ `client` | `String` (Code client) | Attribut contractuel | Compagnie aérienne sous contrat | `"RYR"` (Ryanair) |
| ↳ `sla_cible_jours` | `Integer` (Jours) | Seuil de référence | Objectif contractuel de TAT négocié | `18` jours |
| ↳ `penalite_jour_eur`| `Integer` (`€/jour`) | Barème contractuel | Pénalité financière journalière par jour de dérive | `2 000` €/jour |
| **`TRANSITS`** *(Dimension)* | | **1:N** avec `VISIT` | **Forfait logistique moyen de transport inter-sites** | Villaroche ↔ Saint-Quentin |
| ↳ `id_liaison` | `String` (`TR-xxx-xxx`) | **PK** (1:1) | Code de la liaison logistique | `"TR-VIL-STQ"` |
| ↳ `site_depart` | `String` (Site code) | Dimension géographique | Site d'expédition d'origine | `"Villaroche (VIL)"` |
| ↳ `site_arrivee` | `String` (Site code) | Dimension géographique | Site de destination industrielle | `"Saint-Quentin (STQ)"` |
| ↳ `delai_transit_j`| `Float` (Jours) | Paramètre forfaitaire | Durée forfaitaire d'acheminement aller-retour | `2.5` jours |
| **`ENGINE_PARTS`** *(Dimension)* | | **1:N** avec `VISIT` | **État de disponibilité des kits pièces pour la visite** | Kit Aubes Mobiles |
| ↳ `id_piece_pn` | `String` (`Pxxxxx`) | **PK** (1:1) | Référence normalisée de la pièce / kit (*Part Number*) | `"P01125"` |
| ↳ `modele_moteur` | `String` | Clé de compatibilité | Modèle moteur sur lequel le kit est installable | `"LEAP-1A"` |
| ↳ `disponibilite_pct`| `Float` (`0.0 - 100.0%`)| Mesure de service | Taux de disponibilité à date de lancement | `84.5` % |
| ↳ `confiance_appro_j`| `Float` (± Jours) | Intervalle de risque | Marge d'incertitude sur la date de réception du kit | `± 3.0` jours |
| **`CALENDAR`** *(Dimension)* | | **1:N** avec `VISIT` | **Référentiel temporel d'atelier** | Calendrier industriel |
| ↳ `date` | `Date` (`YYYY-MM-DD`) | **PK** (1:1) | Date du calendrier civil | `"2026-03-15"` |
| ↳ `semaine` | `String` (`YYYY-Wxx`) | Attribut d'agrégation | Numéro de semaine ISO | `"2026-W11"` |
| ↳ `jour_ouvre` | `Boolean` (`true/false`)| Filtre d'activité | Indicateur de jour travaillé ouvré en atelier | `true` |

```mermaid
erDiagram
    VISIT ||--o{ ENGINE : "moteur ESN"
    VISIT }o--|| CONTRACT_SLA : "client + engagement"
    VISIT }o--|| TRANSITS : "transit forfaitaire"
    VISIT }o--|| CALENDAR : "date entrée / livraison"
    ENGINE ||--o{ ENGINE_PARTS : "filtre par modèle"
    VISIT }o--|| ENGINE_PARTS : "kit pièces (start_req_date, dispo %)"

    VISIT {
        string id_visit PK "1 ligne = 1 visite"
        string id_moteur FK "engine (ESN)"
        string priorite "AOG / Normal"
        date date_entree "start"
        date date_livraison "end"
        string id_kit_pieces FK "engine_parts"
        number tat_realise_j "TAT global (j)"
        number derapage_sla_j "Écart contractuel"
        number penalites_eur "Exposition (€)"
    }
    ENGINE {
        string id_moteur PK "Numéro ESN"
        string type "CFM56-5B/7B, LEAP-1A/1B"
        string modele "Sous-variante"
        string client "Compagnie"
    }
    ENGINE_PARTS {
        string id_piece_pn PK "Part Number"
        string modele_moteur "Filtre modèle"
        number disponibilite_pct "Dispo %"
        number confiance_appro_j "Intervalle +/-"
    }
    CONTRACT_SLA {
        string id_contrat PK
        string client
        number sla_cible_jours
        number penalite_jour_eur
    }
    TRANSITS {
        string id_liaison PK
        string site_depart
        string site_arrivee
        number delai_transit_j
    }
    CALENDAR {
        date date PK
        string semaine
        boolean jour_ouvre
    }
```

---

#### Option 2.B : Méso — Réparation par Atelier (`repair`)
- **Granularité :** 1 ligne = 1 réparation module par atelier `repair (type, visit, shop, start, end)`.
- **Transits logistiques :** Navettes physiques mesurées via `durée des transits (shop, shop, length)`.
- **Hypothèses de simplification vs 2.C (Micro) :**
  - **Agrégation au niveau de l'atelier :** La réparation d'un module (ex: Turbine HP) est traitée comme un bloc homogène dans l'atelier, sans modéliser la succession des postes (démontage, usinage, ressuage, remontage).
  - **Kits de réparation dédiés (Repair Kits) :** L'approvisionnement est géré sous forme de *Repair Kits* complets rattachés à la gamme d'atelier, sans descendre à la pièce ou consommable unitaire pointé au poste.
  - **Non-modélisation des shifts et vacations :** Les délais sont comptabilisés en jours ouvrés atelier sans prise en compte des plannings de shift horaires (équipes 2x8 / 3x8).
- **Modélisation relationnelle Canvas :**
  - **Fait central :** `repair` (`id_réparation`, `id_visite`, `id_atelier`, `type_réparation_saisi`, `date_début [start]`, `date_fin`, `id_kit_module`, `tat_atelier_j`, `durée_navette_j`).
  - **Dimensions liées (1:N) :** `visit` (moteur, priorité, client), `shop` (nom, spécialités, postes), `durée des transits` (atelier_source, atelier_dest, délai_transit_j), `calendar`, `repair_kits` (kits selon type de réparation).

##### 📋 Dictionnaire de Données — Option 2.B (Méso)

| Table & Champ | Type / Format | Cardinalité | Rôle & Description | Exemple Concret |
| :--- | :--- | :--- | :--- | :--- |
| **`REPAIR`** *(Table de faits)*| | **Fait central** | **1 ligne = 1 passage/réparation de module dans un atelier spécifique** | `REP-2026-0881` |
| ↳ `id_repair` | `String` (`REP-xxxx-xxxx`)| **PK** (1:1) | Identifiant unique de l'ordre de réparation modulaire | `"REP-2026-0881"` |
| ↳ `id_visite` | `String` (`D-xxxxx`) | **FK** (N:1 → `VISIT`) | Visite moteur globale chapeautant cette opération | `"D-09842"` |
| ↳ `id_shop` | `String` (`SHP-xx`) | **FK** (N:1 → `SHOP`) | Atelier spécialisé réalisant la révision | `"SHP-VIL-HP"` (Shop Haute Pression) |
| ↳ `type_repair` | `String` | Type d'intervention | Gamme d'intervention appliquée sur le module | `"Turbine HP"` / `"Compresseur BP"` |
| ↳ `date_debut` | `Date` (`YYYY-MM-DD`) | Attribut temporel (`start`) | Date d'entrée effective du module dans l'atelier | `"2026-03-05"` |
| ↳ `date_fin` | `Date` (`YYYY-MM-DD`) | Attribut temporel (`end`) | Date de fin de contrôle et sortie d'atelier | `"2026-03-14"` |
| ↳ `id_kit_module` | `String` (`Pxxxxx`) | **FK** (N:1 → `REPAIR_KITS`)| Kit de réparation consommables dédié à ce type d'atelier (*Repair Kit*) | `"P02440"` |
| ↳ `tat_atelier_j` | `Float` (Jours) | Métrique opérationnelle | Temps de passage net en atelier d'usinage/réparation | `9.0` jours |
| ↳ `duree_navette_j`| `Float` (Jours) | Métrique logistique | Durée réelle de la navette physique vers le prochain atelier | `1.5` jours |
| **`SHOP`** *(Dimension)* | | **1:N** avec `REPAIR` | **Référentiel des centres de compétence et ateliers industriels** | Atelier Aubes & Disques |
| ↳ `id_shop` | `String` (`SHP-xx`) | **PK** (1:1) | Code unique de l'atelier de production | `"SHP-MON-BP"` (Shop Montereau BP) |
| ↳ `nom` | `String` | Libellé usuel | Dénomination claire de l'unité de production | `"Atelier Modules BP Montereau"` |
| ↳ `type_of_repairs`| `String` (CSV / Tags) | Attribut de compétence | Familles techniques prises en charge par l'atelier | `"Chambre Combustion, Turbine BP"` |
| ↳ `stations` | `String` (Liste de codes)| Capacité installée | Postes de travail techniques rattachés à cet atelier | `"USI-01, USI-02, CND-01"` |
| **`TRANSITS`** *(Dimension)* | | **1:N** avec `REPAIR` | **Matrice logistique dynamique des transferts physiques inter-ateliers** | Navette VIL ↔ MON |
| ↳ `id_liaison` | `String` (`TR-xxx-xxx`) | **PK** (1:1) | Identifiant de la liaison inter-ateliers | `"TR-VIL-MON"` |
| ↳ `shop_source` | `String` (`SHP-xx`) | Dimension origine | Atelier d'expédition amont | `"SHP-VIL-HP"` |
| ↳ `shop_dest` | `String` (`SHP-xx`) | Dimension destination | Atelier récepteur aval | `"SHP-MON-BP"` |
| ↳ `duree_transit_j`| `Float` (Jours) | Mesure logistique (*length*)| Durée moyenne constatée de transport par navette | `1.2` jours |
| **`REPAIR_KITS`** *(Dimension)* | | **1:N** avec `REPAIR` | **Disponibilité des kits de réparation par gamme de module** | Kit Réparation HP |
| ↳ `id_kit_module` | `String` (`Pxxxxx`) | **PK** (1:1) | Part number du sous-ensemble / kit de révision modulaire | `"P02440"` |
| ↳ `type_repair` | `String` | Clé d'affectation | Gamme de réparation consommatrice de ce kit | `"Turbine HP"` |
| ↳ `disponibilite_pct`| `Float` (`%`) | Mesure d'approvisionnement | Pourcentage de complétude du kit à l'entrée atelier | `91.0` % |
| ↳ `confiance_appro_j`| `Float` (± Jours) | Indice de fiabilité | Aléa sur le réapprovisionnement des pièces critiques du kit | `± 1.5` jours |
| **`VISIT`** *(Dimension parente)*| | **1:N** avec `REPAIR` | **Contexte général de la visite moteur parente** | Visite ESN-884210 |
| ↳ `id_visit` | `String` (`D-xxxxx`) | **PK** (1:1) | Clé de la visite parente | `"D-09842"` |
| ↳ `id_moteur` | `String` (`ESN-xxxxxx`) | Attribut d'identification | Moteur en cours de révision | `"ESN-884210"` |
| ↳ `priorite` | `String` (`Enum`) | Priorité d'ordonnancement | Priorité globale répercutée sur les ateliers | `"AOG Critique"` |

```mermaid
erDiagram
    VISIT ||--o{ REPAIR : "visite moteur"
    SHOP ||--o{ REPAIR : "atelier spécialisé"
    TRANSITS ||--o{ REPAIR : "navette inter-ateliers"
    CALENDAR ||--o{ REPAIR : "date début / fin"
    REPAIR ||--o{ REPAIR_KITS : "kits selon type de réparation"

    REPAIR {
        string id_repair PK "1 ligne = 1 réparation module"
        string id_visite FK "visit"
        string id_shop FK "atelier"
        string type_repair "Gamme saisie (HP, BP...)"
        date date_debut "start"
        date date_fin "end"
        string id_kit_module FK "repair_kits"
        number tat_atelier_j "Délai atelier (j)"
        number duree_navette_j "Transit inter-ateliers"
    }
    VISIT {
        string id_visit PK "1 ligne = 1 visite moteur"
        string id_moteur FK
        string priorite "AOG / Normal"
    }
    SHOP {
        string id_shop PK "Centre de réparation"
        string nom
        string type_of_repairs "Spécialités"
        string stations "Postes rattachés"
    }
    TRANSITS {
        string id_liaison PK
        string shop_source
        string shop_dest
        number duree_transit_j "durée des transits (length)"
    }
    CALENDAR {
        date date PK
        string semaine
        boolean jour_ouvre
    }
    REPAIR_KITS {
        string id_kit_module PK "Part Number Kit Module"
        string type_repair "Lié par type de réparation"
        number disponibilite_pct "Dispo %"
        number confiance_appro_j "Intervalle +/-"
    }
```

---

#### Option 2.C : Micro — Tâche sur Poste (`task`)
- **Granularité :** 1 ligne = 1 tâche technique pointée sur poste `task (visit, repair, station, type)`.
- **Référentiel des durées théoriques :** Seule option disposant de la table de référence `durée des tâches (type engine, type task, length)`.
- **Modélisation relationnelle Canvas :**
  - **Fait central :** `task` (`id_pointage_tâche`, `id_visite`, `id_réparation`, `id_poste`, `opération_saisie`, `horodatage_début [start]`, `horodatage_fin`, `id_composant_task`, `durée_pointée_h`).
  - **Dimensions liées (1:N) :** `durée des tâches` (type engine, type task, durée_gamme_h), `station` (atelier, spécialités, seuil saturation 85%), `capacity` (taux d'occupation réel, heures dispo), `schedule` (créneau, shift), `engine_parts` (composant unitaire au poste).

##### 📋 Dictionnaire de Données — Option 2.C (Micro)

| Table & Champ | Type / Format | Cardinalité | Rôle & Description | Exemple Concret |
| :--- | :--- | :--- | :--- | :--- |
| **`TASK`** *(Table de faits)* | | **Fait central** | **1 ligne = 1 pointage unitaire d'opération sur un poste de travail (MES)** | `TSK-109482` |
| ↳ `id_task` | `String` (`TSK-xxxxxx`) | **PK** (1:1) | Numéro unique d'événement de pointage atelier | `"TSK-109482"` |
| ↳ `id_visite` | `String` (`D-xxxxx`) | **FK** (N:1 → `VISIT`) | Visite globale de rattachement | `"D-09842"` |
| ↳ `id_repair` | `String` (`REP-xxxx-xxxx`)| **FK** (N:1 → `REPAIR`) | Réparation modulaire parente | `"REP-2026-0881"` |
| ↳ `id_station` | `String` (`STN-xx`) | **FK** (N:1 → `STATION`) | Poste de travail / machine où est réalisée la tâche | `"STN-USI-04"` (Fraiseuse 5-axes) |
| ↳ `operation` | `String` (`Enum`) | Type d'intervention technique | Nature physique de l'opération technique pointée | `"Usinage Aubes"`, `"Contrôle CND Ressuage"` |
| ↳ `horodatage_debut`| `DateTime` (`ISO-8601`) | Pointage temps (`start`) | Début effectif de travail par le technicien | `"2026-03-06T08:15:00Z"` |
| ↳ `horodatage_fin` | `DateTime` (`ISO-8601`) | Pointage temps (`end`) | Fin effective de travail et libération du poste | `"2026-03-06T14:45:00Z"` |
| ↳ `id_composant` | `String` (`Pxxxxx`) | **FK** (N:1 → `ENGINE_PARTS`)| Pièce ou consommable unitaire monté au poste | `"P09931"` |
| ↳ `duree_pointee_h` | `Float` (Heures) | Métrique d'effort net | Heures effectives de travail productif enregistrées | `6.5` heures |
| **`STATION`** *(Dimension)* | | **1:N** avec `TASK` | **Référentiel des machines, bancs et postes de travail unitaires** | Poste Usinage 5-axes |
| ↳ `id_station` | `String` (`STN-xx`) | **PK** (1:1) | Identifiant unique de la station de travail | `"STN-USI-04"` |
| ↳ `id_shop` | `String` (`SHP-xx`) | **FK** (N:1 → `SHOP`) | Atelier d'appartenance hiérarchique | `"SHP-VIL-HP"` |
| ↳ `type_of_repairs`| `String` | Capacité technique | Gammes opérables sur cette machine | `"Usinage aubes titane & disques"` |
| ↳ `seuil_saturation`| `Float` (`85.0%`) | Règle de gestion / Alerte | Seuil d'engorgement critique déclenchant un goulot | `85.0` % |
| **`DUREE_TACHES`** *(Dimension)*| | **1:N** avec `TASK` | **Gamme standard et temps alloués théoriques constructeur** | Temps de gamme CFM56 / Usinage |
| ↳ `type_engine` | `String` | **PK composite** (1/2) | Famille de moteur concernée | `"LEAP-1A"` |
| ↳ `type_task` | `String` | **PK composite** (2/2) | Libellé standard de l'opération de gamme | `"Usinage Aubes"` |
| ↳ `duree_gamme_h` | `Float` (Heures) | Standard théorique (*length*)| Temps standard alloué par le bureau des méthodes | `4.5` heures |
| **`CAPACITY`** *(Dimension)* | | **1:1** avec `STATION` | **Suivi de la disponibilité machine et charge instantanée** | Charge journalière machine |
| ↳ `id_station` | `String` (`STN-xx`) | **PK** (1:1) | Poste évalué | `"STN-USI-04"` |
| ↳ `taux_occupation_reel`| `Float` (`%`) | Métrique d'utilisation | Taux d'occupation mesuré sur le cycle d'équipe | `92.4` % (Goulot actif) |
| ↳ `heures_dispo` | `Float` (Heures) | Capacité résiduelle | Heures ouvrables restantes sur la vacation | `1.5` h disponibles |
| **`SCHEDULE`** *(Dimension)* | | **1:N** avec `STATION` | **Organisation du travail et vacations d'équipes (shifts)** | Shift 2x8 Matin |
| ↳ `id_station` | `String` (`STN-xx`) | **FK** (N:1 → `STATION`) | Poste concerné par le créneau | `"STN-USI-04"` |
| ↳ `creneau` | `String` (`HH:MM-HH:MM`)| Plage horaire | Fenêtre temporelle d'ouverture | `"06:00 - 14:00"` |
| ↳ `shift` | `String` (`Enum`) | Organisation d'équipe | Désignation du shift | `"Matin (2x8)"` / `"Nuit"` |
| **`ENGINE_PARTS`** *(Dimension)* | | **1:N** avec `TASK` | **Disponibilité des références unitaires au bac poste** | Fraise carbure spécifique |
| ↳ `id_piece_pn` | `String` (`Pxxxxx`) | **PK** (1:1) | Numéro de nomenclature unitaire | `"P09931"` |
| ↳ `id_station` | `String` (`STN-xx`) | **FK** de localisation | Poste consommateur de la référence | `"STN-USI-04"` |
| ↳ `disponibilite_pct`| `Float` (`%`) | Disponibilité locale | Taux de présence en bac de bord de ligne | `98.0` % |
| ↳ `confiance_appro_j`| `Float` (± Jours) | Délai de réappro | Temps de réapprovisionnement magasin central | `± 0.5` jour |

```mermaid
erDiagram
    VISIT ||--o{ TASK : "visite moteur"
    REPAIR ||--o{ TASK : "réparation parente"
    STATION ||--o{ TASK : "poste de réparation"
    DUREE_TACHES ||--o{ TASK : "durée théorique (type engine + type task)"
    SHOP ||--o{ STATION : "atelier"
    CAPACITY ||--o{ STATION : "capacité / occupation"
    SCHEDULE ||--o{ STATION : "calendrier des réparations"
    ENGINE_PARTS }o--|| TASK : "composant pointé au poste"

    TASK {
        string id_task PK "1 ligne = 1 tâche unitaire"
        string id_visite FK
        string id_repair FK
        string id_station FK "poste"
        string operation "type task"
        date horodatage_debut "start"
        date horodatage_fin "end"
        string id_composant FK "engine_parts"
        number duree_pointee_h "Durée réelle (h)"
    }
    STATION {
        string id_station PK "Poste de réparation"
        string id_shop FK "atelier"
        string type_of_repairs
        number seuil_saturation "85 %"
    }
    DUREE_TACHES {
        string type_engine PK
        string type_task PK
        number duree_gamme_h "Durée théorique (length)"
    }
    CAPACITY {
        string id_station PK
        number taux_occupation_reel
        number heures_dispo
    }
    SCHEDULE {
        string id_station PK
        string creneau
        string shift
    }
    ENGINE_PARTS {
        string id_piece_pn PK "Part Number"
        string id_station FK "Composant unitaire au poste"
        number disponibilite_pct "Dispo %"
        number confiance_appro_j "Intervalle +/-"
    }
```

---

---

## Étape 3 : TAT

> **Question de cadrage :** Quel niveau de complexité mathématique et d'hypothèse adopter ?  
> **En-tête de l'interface :** Étape 3 : Choisir la méthode de calcul du délai (TAT) (`📐 Méthode & Rigueur de Calcul`)

### Les 4 Méthodes de Calcul du TAT :
1. **Option 3.A : Délais théoriques de traitement**
   - *Principe :* Somme arithmétique des temps de gammes standards constructeur et des forfaits logistiques.
   - *Formule DAX :* `SUMX(FAIT, FAIT[Duree_Standard] + FAIT[Transit_Forfait])`
   - ⚠️ **Règle stricte :** Indisponible en Granularité 2.B (bascule automatique sur 3.B).
2. **Option 3.B : Table des délais moyens (5%, 95%, médian)**
   - *Principe :* Distribution empirique réelle ($P_5, P_{50}, P_{95}$) mesurée sur l'historique de passage.
   - *Formule DAX :* `PERCENTILEX.INC(FAIT, FAIT[Duree_Reelle], 0.50)`
3. **Option 3.C : Délais selon le taux d'occupation atelier**
   - *Principe :* Modélisation de l'engorgement des files d'attente à l'approche du seuil critique (85%).
   - *Formule DAX :* `DIVIDE(Temps_Usinage, 1 - RELATED(DIM_SITE[Taux_Charge]))`
4. **Option 3.D : Modélisation avancée**
   - *Principe :* Simulation dynamique probabiliste multi-factorielle contextuelle.
   - *Formule DAX :* `SIMULATE_TAT_ADVANCED(FAIT, CONTEXT)`

### Extraits des Tables Dynamiques d'Atelier (Croisement Granularité × TAT)

#### Extrait A : Demande Macro (visit) × Table des Délais Moyens (3.B)
```text
| id_visit       | engine          | priority | délai à 5% (Opt) | délai médian (50%) | délai à 95% (Pess) | écart_type |
| :------------- | :-------------- | :------- | :--------------- | :----------------- | :----------------- | :--------- |
| VISIT-2024-089 | CFM56-7B (AFR)  | AOG      | 14.5 j           | 18.2 j             | 27.0 j             | 3.8 j      |
| VISIT-2024-094 | LEAP-1A (DLH)   | Standard | 18.0 j           | 22.5 j             | 34.5 j             | 4.2 j      |
| VISIT-2024-102 | CFM56-5B (RYR)  | Standard | 11.0 j           | 14.0 j             | 21.0 j             | 2.5 j      |
```
*Formule DAX associée :* `TAT_Median = PERCENTILEX.INC(visit, [tat_days], 0.50)`

#### Extrait B : Réparation Méso (repair) × Délais selon Taux d'Occupation (3.C)
```text
| repair_id    | type            | shop       | taux_occupation_shop | tps_atelier_hist_j | attente_saturation_j | tat_total_shop |
| :----------- | :-------------- | :--------- | :------------------- | :----------------- | :------------------- | :------------- |
| REP-701-AUB  | Aubes HP        | Montereau  | 72 % (Normal)        | 6.5 j              | + 1.2 j              | 7.7 j          |
| REP-701-COM  | Compresseur BP  | Villaroche | 86 % (Tendu)         | 12.0 j             | + 4.8 j              | 16.8 j         |
| REP-701-TST  | Banc d'Essai    | Bruxelles  | 94 % (Goulot 🚨)     | 2.5 j              | + 7.4 j              | 9.9 j ⚠️       |
```
*Formule DAX associée :* `TAT_Repair_Charge = [shop_history_tat] / (1 - RELATED(shop[taux_occupation]))`

#### Extrait C : Tâche Micro (task) × Délais Théoriques (3.A)
```text
| task_id     | type engine | type task         | station       | durée des tâches (length) | transit_buffer_h | cycle_total_h |
| :---------- | :---------- | :---------------- | :------------ | :------------------------ | :--------------- | :------------ |
| TASK-901-01 | CFM56-7B    | Tournage Carter   | USI-04 (VIL)  | 4.5 h                     | + 1.0 h          | 5.5 h         |
| TASK-901-02 | LEAP-1A     | Ressuage Chimique | CND-02 (MON)  | 2.0 h                     | + 0.5 h          | 2.5 h         |
| TASK-901-03 | LEAP-1B     | Équilibrage Rotor | EQU-01 (VIL)  | 3.5 h                     | + 0.5 h          | 4.0 h         |
```
*Formule DAX associée :* `Duree_Totale_Theorique = SUMX('durée des tâches', [length])`

---

## Étape 4 : Délai

> **Question de cadrage :** Quels visuels utiliser pour piloter les délais et les engagements clients ?  
> **En-tête de l'interface :** Étape 4 : Sélectionner les visuels pour le Délai (TAT) (`📊 Dataviz & Conception Graphique`)
> **Rendu Chart.js (Étape 4) :** Les cartes d'options disposent d'un panneau Chart.js à droite (titres et sous-titres avec description explicite de la mesure et des axes X et Y, canvas `#step-4-canvas`). Les valeurs graphiques sont affichées par défaut sur chaque point, barre ou tranche via `chartjs-plugin-datalabels` (sans nécessiter de survol). Les données sont générées côté client (PRNG seedé `maestro_seed`, persistant) sur la base des libellés de `data.json` avec 10 sites Safron préfixés (`BE-`, `FR-`) et les flottes de moteurs (*CFM56-7B, CFM56-5B, LEAP-1A, LEAP-1B, GE90-115B, M88-2*).

### Les 8 Graphiques Disponibles pour le Délai :
- **4.A : TAT Médian & Bornes 5%-95% par Moteur**  
  *Titre & Sous-titre :* Mesure du TAT Médian et intervalle P5-P95 (j) | Axe X : Modèle Moteur (CFM56-7B, CFM56-5B, LEAP-1A, LEAP-1B, GE90-115B, M88-2) | Axe Y : Durée du TAT (jours).  
  *Rendu :* Distribution statistique avec étiquettes de valeurs par défaut sur les médianes et bornes.  
  *Usages associés :* `Pilotage`, `Gouvernance`.
- **4.B : Décomposition du TAT par Site**  
  *Titre & Sous-titre :* Décomposition du TAT cumulé (j) | Axe X : Site Industriel Safron (10 sites : FR-Villaroche, FR-Montereau, FR-Châtellerault, BE-Bruxelles, FR-Saint-Quentin, FR-Gennevilliers, FR-Bordeaux, FR-Toulouse, BE-Liège, FR-Le Creusot) | Axe Y : Jours cumulés (j).  
  *Rendu :* Barres empilées (Attente, Réparation, Transit) avec affichage systématique des valeurs chiffrées en jours sur chaque segment.  
  *Usages associés :* `Opérationnel`, `Pilotage`, `Logistique`.
- **4.C : Respect des Délais Contractuels par Client & Moteur**  
  *Titre & Sous-titre :* Respect Contractuel et Taux de Dérive SLA (%) | Axe X : Compagnies Aériennes (Air France, Air China, EasyJet, Lufthansa, Delta Air Lines, Emirates, Singapore Airlines) | Axe Y1 : Jours (j) / Axe Y2 : Dérive SLA (%).  
  *Rendu :* Barres groupées et courbe combinée avec étiquettes de valeurs actives en permanence.  
  *Usages associés :* `Contractuel`, `Financier`.
- **4.D : Tableau d'Alertes Nominatives**  
  *Titre & Sous-titre :* Cartographie des Dossiers ESN et Niveaux d'Escalade | Axe X : Moteur / Compagnie | Axe Y : Retard Effectif (jours).  
  *Rendu :* Répartition catégorisée (Conforme, En cours, Retard, AOG critique) avec badges et valeurs associées.  
  *Usages associés :* `Opérationnel`, `Contractuel`, `Financier`.
- **4.E : Cartes KPIs Synthétiques**  
  *Titre & Sous-titre :* Indicateurs Phares Globaux | Métriques : TAT Moyen Réel (j), Taux SLA (%), En-cours Critique.  
  *Rendu :* Cartes métriques scalaires et donut de répartition des statuts avec affichage direct des volumes.  
  *Usages associés :* `Pilotage`, `Contractuel`.
- **4.F : Barres vs Seuils Cibles P85**  
  *Titre & Sous-titre :* Positionnement TAT vs Seuil Tolérance P85 (j) | Axe X : Durée constatée (j) | Axe Y : Modules & Types de Réparation.  
  *Rendu :* Barres horizontales avec seuils cibles et valeurs exactes affichées en bout de barre.  
  *Usages associés :* `Opérationnel`, `Gouvernance`.
- **4.G : Waterfall des Dérives TAT**  
  *Titre & Sous-titre :* Décomposition Cumulative des Dérives TAT (j) | Axe X : Facteurs de Dérive / Étapes | Axe Y : Impact sur le Délai (jours).  
  *Rendu :* Cascade de barres flottantes avec delta chiffré sur chaque composante de retard.  
  *Usages associés :* `Contractuel`, `Financier`, `Gouvernance`.
- **4.H : Jalons de Traversée (Gates)**  
  *Titre & Sous-titre :* Durée de Traversée par Gate Industrielle (G1 à G3) | Axe X : Portes Industrielles | Axe Y : Durée de Passage (jours).  
  *Rendu :* Chronogramme avec valeurs affichées par étape et chemin critique mis en exergue.  
  *Usages associés :* `Opérationnel`, `Pilotage`, `Logistique`.

### Illustrations Graphiques en Mermaid (Étape 4)

#### 1. TAT Médian & Bornes de Dispersion P5 - P95 par Moteur (Illustration 4.A)
```mermaid
gantt
    title TAT Médian (P50) et Intervalle de Dispersion (P5 - P95) par Moteur (Jours)
    dateFormat X
    axisFormat %s j

    section CFM56-7B
    Dispersion P5 - P95 (9.2j à 21j)     :a1, 9, 21
    Médian P50 (14.5j)                   :milestone, m1, 14, 0d

    section LEAP-1A
    Dispersion P5 - P95 (14j à 31.5j)    :crit, a2, 14, 31
    Médian P50 (21.4j)                   :milestone, m2, 21, 0d

    section LEAP-1B
    Dispersion P5 - P95 (11.8j à 27j)    :active, a3, 12, 27
    Médian P50 (18.2j)                   :milestone, m3, 18, 0d
```

#### 2. Décomposition du TAT par Site Industriel (Illustration 4.B)
```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#3b82f6'}}}%%
xychart-beta
    title "Décomposition du TAT (Jours) par Site Safron : Réparation vs Navette vs Attente"
    x-axis ["FR-Villaroche", "FR-Montereau", "FR-Châtellerault", "BE-Bruxelles", "FR-St-Quentin", "FR-Gennevilliers", "FR-Bordeaux"]
    y-axis "Jours cumulés" 0 --> 25
    bar [11, 10, 12, 10, 11, 13, 12]
    bar [3, 4, 2, 3, 2, 3, 2]
    bar [4, 7, 3, 3, 4, 5, 4]
```

#### 3. Respect des Délais Contractuels vs Effectifs par Client (Illustration 4.C)
```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Écart TAT Contractuel vs Effectif et Taux de Non-Respect SLA (%)"
    x-axis ["Air France", "Air China", "EasyJet", "Lufthansa", "Delta Air Lines", "Emirates", "Singapore Airlines"]
    y-axis "TAT Moyen (Jours)" 0 --> 25
    bar [20, 18, 22, 16, 21, 19, 23]
    bar [19, 17, 22, 19, 20, 18, 21]
    line [5, 4, 6, 15, 8, 5, 4]
```

#### 4. Logigramme d'Escalade et Qualification des Statuts ESN (Illustration 4.D)
```mermaid
graph TD
    A[Pointage Événement Moteur ESN] --> B{Statut de la Demande}
    B -- "TAT <= SLA" --> C[🟢 Conforme • Dossier sous contrôle]
    B -- "En cours sans retard" --> D[⏳ En Cours • Clôture dans les délais]
    B -- "TAT > SLA (+1 à +4j)" --> E[⚠️ En Retard • Surveillance chef d'atelier]
    B -- "Dérive critique / AOG" --> F[🚨 AOG Critique • Escalade immédiate & Pénalités]
    
    style C fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px
    style D fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px
    style E fill:#fef3c7,stroke:#d97706,stroke-width:1.5px
    style F fill:#fee2e2,stroke:#dc2626,stroke-width:2px
```

---

## Étape 5 : Capacité

> **Question de cadrage :** Sur quelle base dimensionner et projeter la capacité des ateliers ?  
> **En-tête de l'interface :** Étape 5 : Choisir la méthode d'évaluation de la Capacité Atelier (`⚖️ Modélisation du Capacitaire`)

### Les 4 Méthodes d'Évaluation de la Capacité :
1. **Option 5.A : Prévisions des Demandes (Plan S&OP)**
   - *Principe :* Croisement des déposes annoncées par les compagnies à 3-6 mois et des créneaux de baies réservés.
   - *Formule DAX :* `Charge_Prevue_SOP = SUM(prevision_visit[visites_fermes]) / [capacité_mensuelle]`
2. **Option 5.B : Demandes Effectives à l'Instant (WIP Réel)**
   - *Principe :* Photographie exacte des moteurs et lots physiquement présents sur plancher et pointés en direct.
   - *Formule DAX :* `Taux_Occupation_Live = DIVIDE(COUNTROWS(FILTER(visit, ISBLANK([date_end]))), [capacité_baies])`
3. **Option 5.C : Capacité & Approvisionnement Pièces**
   - *Principe :* Débit d'atelier directement contraint par la disponibilité des kits de rechange (OTIF) et les délais OEM.
   - *Formule DAX :* `Debit_Visite_Pieces = MIN([Capacite_Baies], [Kits_OTIF_Disponibles])`
4. **Option 5.D : Prévisions Multi-factorielles (Réalité MRO)**
   - *Principe :* Simulation probabiliste intégrant rebuts aux contrôles CND/ressuage, créneaux bancs et usure des pièces LLP.
   - *Formule DAX :* `Demande_Predictive_MRO = FORECAST_MRO(cycles_tsn_csn, rebuts_cnd, banc_slots, llp_attrition)`

### Extraits des Vues Capacitaires d'Atelier (Croisement Granularité × Capacité)

#### Extrait A : Visite Macro (visit) × Prévisions S&OP (5.A)
```text
| engine type | mois_cible     | visites_annoncées (S&OP) | créneaux_réservés | couverture_plan         |
| :---------- | :------------- | :----------------------- | :---------------- | :---------------------- |
| CFM56       | M+1 (Octobre)  | 14 visites fermes        | 12 slots          | 116.7 % (Déficit 🚨)    |
| LEAP-1A     | M+1 (Octobre)  | 7 visites fermes         | 8 slots           | 87.5 % (OK)             |
| LEAP-1B     | M+1 (Octobre)  | 5 visites fermes         | 6 slots           | 83.3 % (OK)             |
```
*Formule DAX associée :* `Charge_Prevue_SOP = SUM(prevision_visit[visites_fermes]) / [capacité_mensuelle]`

#### Extrait B : Réparation Méso (repair) × WIP Instantané d'Atelier (5.B)
```text
| shop (atelier)    | type of repairs  | lots_repair_wip | durée des transits (en cours) | taux_occupation |
| :---------------- | :--------------- | :-------------- | :---------------------------- | :-------------- |
| FR-Montereau      | Aubes Turbine HP | 22 lots actifs  | 3 navettes route              | 91.7 % ⚠️       |
| FR-Villaroche     | Compresseurs     | 11 lots actifs  | 1 navette route               | 68.8 %          |
| BE-Bruxelles      | Banc d'Essai     | 10 lots actifs  | 2 en attente quai             | 100.0 % 🚨      |
| FR-Saint-Quentin  | Éléments Chauds  | 8 lots actifs   | 1 navette route               | 78.4 %          |
```
*Formule DAX associée :* `Occupation_Shop_Live = DIVIDE(COUNTROWS(FILTER(repair, ISBLANK([end]))), [capacité_lots_hebdo])`

#### Extrait C : Tâche Micro (task) × Approvisionnement Pièces au Poste (5.C)
```text
| station [poste]       | composants_requis            | disponibilité_bacs_tampons | manquants_poste         | temps_attente_induit |
| :-------------------- | :--------------------------- | :------------------------- | :---------------------- | :------------------- |
| USI-04 (5-Axes)       | Plaquettes carbure & fraises | 96 %                       | 0 rupture               | 0.0 h                |
| CND-02 (Ressuage)     | Kits éprouvettes ressuage    | 98 %                       | 0 rupture               | 0.0 h                |
| EQU-01 (Équilibrage)  | Masselottes d'équilibrage    | 75 %                       | 3 références en rupture | +6.5 h attente ⚠️    |
```
*Formule DAX associée :* `Attente_Pieces_Poste = SUMX(task, [heures_arret_manquant])`

---

## Étape 6 : Saturation

> **Question de cadrage :** Quels visuels choisir pour repérer les goulots d'étranglement et la surcharge ?  
> **En-tête de l'interface :** Étape 6 : Sélectionner les visuels pour la Saturation des Ateliers (`📊 Dataviz & Conception Graphique`)
> **Rendu Chart.js (Étape 6) :** Les cartes d'options disposent d'un panneau Chart.js à droite (titres et sous-titres avec description explicite de la mesure et des axes X et Y, canvas `#step-6-canvas`). Les valeurs graphiques sont affichées par défaut sur chaque point, barre ou tranche via `chartjs-plugin-datalabels` (sans nécessiter de survol). Les données sont générées côté client (PRNG seedé `maestro_seed`, persistant) sur la base des libellés de `data.json` avec 7 sites Safron préfixés (`BE-`, `FR-`) et les vraies compagnies aériennes.

### Les 8 Graphiques de Saturation :
- **6.A : Top Pièces Manquantes par Site**  
  *Titre & Sous-titre :* Heures d'Attente Induites par les Pièces Manquantes (h) | Axe X : Références Pièces Critiques (Aubes HP, Disques LLP, etc.) | Axe Y : Heures d'attente cumulées (h).  
  *Rendu :* Barres avec affichage permanent des heures d'attente cumulées sur chaque barre.  
  *Usages associés :* `Logistique`, `Opérationnel`.
- **6.B : Retards par Réparation & Moteur**  
  *Titre & Sous-titre :* Taux de Retard par Type de Réparation et Flotte Moteur (%) | Axe X : Typologie de Réparation | Axe Y : % de Dossiers Décalés (%).  
  *Rendu :* Barres groupées CFM56 vs LEAP avec pourcentages affichés par défaut.  
  *Usages associés :* `Opérationnel`, `Gouvernance`.
- **6.C : Top Routes de Transfert Inter-Sites**  
  *Titre & Sous-titre :* Flux Navettes et Délais de Transfert Inter-Sites | Axe X : Axes Logistiques Inter-Sites | Axe Y1 : % du Flux Global / Axe Y2 : Délai Moyen Navette (j).  
  *Rendu :* Barres de volume de flux combinées à la courbe des délais avec valeurs visibles sur chaque point et barre.  
  *Usages associés :* `Logistique`, `Pilotage`.
- **6.D : Ratio Attente vs Travail Effectif**  
  *Titre & Sous-titre :* Répartition du Lead Time Global Atelier (Lean MRO) | Donut : Travail VA, Attente pièces, Transferts navettes.  
  *Rendu :* Donut Lean avec étiquettes de pourcentages et d'heures affichées directement sur chaque segment.  
  *Usages associés :* `Pilotage`, `Gouvernance`.
- **6.E : Barres de Charge vs Seuil 85%**  
  *Titre & Sous-titre :* Taux de Charge Atelier vs Seuil Critique 85% (%) | Axe X : Centres Industriels Safron | Axe Y : Taux d'Occupation Réel (%).  
  *Rendu :* Barres de charge avec coloration d'alerte et étiquette du taux d'occupation exact par site.  
  *Usages associés :* `Opérationnel`, `Pilotage`.
- **6.F : Heatmap Hebdomadaire / Site**  
  *Titre & Sous-titre :* Matrice d'Intensité Hebdomadaire de Charge (%) | Axe X : Semaines Calendaires (S1 à S8) | Axe Y : Sites Safron (7 centres).  
  *Rendu :* Matrice thermique avec affichage des taux de charge moyens par site.  
  *Usages associés :* `Pilotage`, `Opérationnel`.
- **6.G : Courbes Entrées vs Sorties WIP**  
  *Titre & Sous-titre :* Cumulative Flow Diagram - Entrées vs Sorties WIP (unités) | Axe X : Semaines Calendaires (S1 à S6) | Axe Y : Volumes Cumulés (moteurs).  
  *Rendu :* Courbes d'accumulation avec volumes visibles par défaut sur chaque jalon hebdomadaire.  
  *Usages associés :* `Logistique`, `Financier`, `Gouvernance`.
- **6.H : Treemap des Goulots d'Atelier**  
  *Titre & Sous-titre :* En-cours Cumulé et Taux de Saturation par Poste Critique | Axe X : En-cours Cumulé WIP (heures) | Axe Y : Postes & Machines d'Atelier.  
  *Rendu :* Barres horizontales avec étiquettes détaillées `[WIP h (Saturation %)]` affichées en bout de ligne.  
  *Usages associés :* `Opérationnel`, `Pilotage`, `Logistique`.

### Illustrations Graphiques en Mermaid (Étape 6)


#### 1. Top des Pièces Manquantes Causant l'Attente par Site (Illustration 6.A)
```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ef4444'}}}%%
xychart-beta
    title "Heures de Blocage d'Attente par Référence Critique et Site"
    x-axis ["Aubes HP (FR-Montereau)", "Disques LLP (FR-Villaroche)", "Joints Fan (FR-Châtellerault)", "Injecteurs (BE-Bruxelles)"]
    y-axis "Heures de rupture cumulées" 0 --> 100
    bar [84, 52, 28, 16]
```

#### 2. Dérive et Retard par Type d'Opération Atelier et Moteur (Illustration 6.B)
```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Part des Demandes Subissant un Aléa Imprévu (% Retard) : CFM56 vs LEAP"
    x-axis ["Usinage Carter Fan", "Ressuage CND", "Revêtement Aubes HP", "Recette Banc d'Essais"]
    y-axis "% Demandes Décalées" 0 --> 35
    bar [18, 14, 12, 8]
    bar [29, 24, 26, 17]
```

#### 3. Top des Routes de Sous-Traitance et Délais Navettes (Illustration 6.C)
```mermaid
%%{init: {'theme': 'base'}}%%
xychart-beta
    title "Flux de Sous-Traitance (% Demandes) et Délai Navette Route (Jours)"
    x-axis ["FR-Montereau ➔ FR-Villaroche", "FR-Châtellerault ➔ BE-Bruxelles", "FR-Villaroche ➔ FR-Châtellerault", "FR-Montereau ➔ BE-Bruxelles"]
    y-axis "% Part du Flux Global" 0 --> 45
    bar [38, 27, 19, 16]
    line [12, 24, 18, 31]
```

#### 4. Donut Lean : Temps Contact vs Temps d'Attente (Illustration 6.D)
```mermaid
pie title "Répartition du Lead Time Global MRO"
    "Temps de travail à Valeur Ajoutée (Usinage/Montage)" : 56
    "Attente passive pièces et outillage" : 28
    "Transfert logistique et navettes inter-sites" : 16
```

---

## Étape 7 : Synthèse, Profils & Dashboard Dérivé

> **Question de cadrage :** Comment structurer la restitution finale pour engager les parties prenantes ?  
> **En-tête de l'interface :** Étape 7 : Slide de Synthèse Décisionnel & Dashboard Projeté (`✨ Fiche Architecture`)

### Fonctionnalités Clés du Slide Décisionnel :
1. **Dropdowns Interactifs Synchronisés (`#select-q1` à `#select-q6`) :**
   Permettent de modifier instantanément un choix sans devoir reboucler les étapes antérieures.
2. **Barre de Filtres Multidimensionnelle Dynamique :**
   - *Filtre Site (10 sites) :* Tous, FR-Villaroche (VIL), FR-Montereau (MON), FR-Châtellerault (CHL), BE-Bruxelles (BRU), FR-Saint-Quentin (SQY), FR-Gennevilliers (GEN), FR-Bordeaux (BDX), FR-Toulouse (TLS), BE-Liège (LGG), FR-Le Creusot (CRE).
   - *Filtre Client (Vraies compagnies) :* Toutes compagnies, Air France (AFR), Air China (CCA), EasyJet (EZY), Lufthansa (DLH), Delta Air Lines (DAL), Emirates (UAE), Singapore Airlines (SIA).
   - *Filtre Moteur (6 flottes) :* CFM56-7B, CFM56-5B, LEAP-1A, LEAP-1B, GE90-115B, M88-2.
   - *Filtre Date Calendaire Jour :* Sélecteur de date d'entrée prédictive couplé au calcul automatique de la **Date Prévisionnelle de restitution** (`Date + TAT Médian`).
3. **Quatuor de Cartes KPIs Dynamiques :**
   - KPI 1 : Dérive métier selon l'objectif Q1 (ex: AOG critiques, pénalités financières encourues, % SLA).
   - KPI 2 : Suivi opérationnel (dossiers en sursis, livraisons conformes, kits en rupture).
   - KPI 3 : TAT moyen glissant et bornes de dispersion $P_5 - P_{95}$ (selon Q3).
   - KPI 4 : Taux de charge et certitude d'adéquation capacitaire (selon Q5).
4. **Visualisations Temps Réel Croisées :**
   - Cadre gauche : Visualisation du délai calibrée selon l'option choisie en Étape 4 (de 4.A à 4.H) avec axes explicites et valeurs par défaut.
   - Cadre droit : Visualisation de la saturation calibrée selon l'option choisie en Étape 6 (de 6.A à 6.H) avec axes explicites et valeurs par défaut.
5. **Recommandations d'Architecture BI & Mesures DAX Déduites :**
   - Formulations automatiques suggérant les colonnes calculées, les liens d'étoile avec le calendrier industriel ouvré et les règles de partitionnement DirectQuery / Import selon la combinaison `[Q1, Q2, Q3, Q4, Q5, Q6]`.

---

## Stratégie de Génération de Données & Moteur Pseudo-Aléatoire Seedé

Cette section formalise la stratégie d'ingénierie des données et de mock dynamique déployée dans Maestro, garantissant à la fois **l'indépendance de la structure**, **la reproductibilité des tests** et **la cohérence physique des indicateurs**.

### 1. Découplage Structure vs Métriques Chiffrées
Afin d'assurer une étanchéité totale entre la nomenclature métier et les calculs dynamiques :
- **`data.json` ne contient AUCUN chiffre figé :** il agit comme un catalogue de référence déclarant uniquement les dimensions, entités réelles (10 sites Safron MRO, 7 compagnies aériennes réelles, 6 familles moteurs, références de pièces au format `Pxxxxx`, demandes au format `D-xxxxx`) et liens structurels.
- **Les visualisations Chart.js sont alimentées à chaud :** les séries temporelles, percentiles, pourcentages de saturation et matrices de charge sont instanciés dynamiquement en mémoire via la fonction `buildMaestroData(base)`.

```text
┌─────────────────────────┐       ┌──────────────────────────────┐
│       data.json         │       │    Mulberry32 (PRNG Seed)    │
│  (Structure & Entités)  │       │   (Reproductibilité session) │
└────────────┬────────────┘       └──────────────┬───────────────┘
             │                                   │
             └───────────────┬───────────────────┘
                             ▼
                 ┌───────────────────────┐
                 │  buildMaestroData()   │
                 │ (Règles de Cohérence) │
                 └───────────┬───────────┘
                             ▼
                 ┌───────────────────────┐
                 │ Tableaux & Graphiques │
                 │ (Chart.js 4.4 + DAX)  │
                 └───────────────────────┘
```

### 2. Reproductibilité & Stabilité par PRNG Seedé (`Mulberry32`)
Pour éviter le clignotement des valeurs d'une interaction à l'autre tout en permettant des variations contrôlées :
- L'algorithme pseudo-aléatoire **Mulberry32** (générateur 32 bits rapide et uniforme) est initialisé avec une graine (`seed`) fixe (valeur par défaut : `42`).
- Cette graine est persistée dans le `localStorage` du navigateur (`maestro_seed`).
- **Bénéfice didactique :** un utilisateur ou formateur retrouve exactement le même jeu d'essai lors d'une démonstration, tout en pouvant régénérer un jeu alternatif cohérent via `resetFilters()`.

### 3. Règles de Cohérence Physique Industrielle MRO
Le moteur de mock applique un ensemble d'invariants mathématiques et opérationnels pour garantir la crédibilité décisionnelle :

1. **Hiérarchie Stricte des Percentiles ($P_5 < P_{50} < P_{95}$) :**
   - La médiane $P_{50}$ est calibrée sur le standard constructeur de la famille moteur (ex: ~14.9j pour CFM56-7B, ~21.6j pour LEAP-1A, ~26.2j pour GE90-115B).
   - La borne basse $P_5$ est contrainte entre 60% et 70% de la médiane ($P_{50}$).
   - La borne haute $P_{95}$ est contrainte entre 140% et 165% de la médiane ($P_{50}$).
2. **Décomposition Additive du TAT (100% du délai total) :**
   - Pour chaque site, le TAT global décomposé respecte : $\text{TAT} = \text{Réparation (9 à 12.5j)} + \text{Attente (2.5 à 7j)} + \text{Transfert Navette (1.5 à 4j)}$.
3. **Statut d'Urgence et Modélisation des Pénalités Financières :**
   - Un dossier `Conforme` a un retard contractuel nul ($\Delta_{\text{SLA}} = 0$).
   - Un dossier `En Retard` subit un retard de 2 à 5 jours.
   - Un dossier `AOG Critique` subit un retard sévère de 8 à 18 jours.
   - Les pénalités financières encourues sont mathématiquement calculées par la formule :
     $$\text{Pénalités (€)} = \text{Retard (jours)} \times \text{Barème journalier contractuel (1 500 € à 2 500 € / j)}$$
4. **Détection des Goulots d'Atelier & Seuil Critique de 85% :**
   - Les heures de rupture de stock sont directement proportionnelles au statut de criticité du composant (Critique : 55 à 90h, Modéré : 30 à 55h, Veille : 10 à 30h).
   - Les îlots et machines dont la charge dépasse 85% déclenchent automatiquement un code couleur ambre/rouge sur les jauges et la heatmap 2D (Étape 6.F).

### 4. Guide de Transposition à un Autre Domaine Métier
Pour injecter des données d'un autre secteur industriel (ex: ferroviaire ou naval) :
1. Remplacer les entités de `data.json` par vos matériels, centres techniques et clients.
2. Ajuster l'objet `p50Base` dans `index.html` avec les durées nominales de vos interventions.
3. Conserver le moteur `buildMaestroData()` : il propagera automatiquement des données chiffrées cohérentes, plausibles et visuellement démonstratives dans l'ensemble des 8 visualisations de délai et 8 visualisations de charge.

