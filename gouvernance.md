# Méthodologie Data & Gouvernance MRO 🏛️

> **Référentiel Méthodologique & Gouvernance des Données**  
> Ce guide opérationnel regroupe les principes de qualité, d'auditabilité, d'éthique de restitution et de pacte de service (SLA) pour chaque étape du cycle de décision Maestro (SAP IBP / Analytics Stories).

---

## Étape 1 : Persona Métier & Alignement Décisionnel
<a id="methodology-step-1"></a>

### 🏛️ Enjeux de Gouvernance & Propriété des Données
- **Propriétaire métier (Data Owner) :** Qui porte la responsabilité décisionnelle (Directeur de site, CSM client, Chef d'atelier, Approvisionneur ou Responsable Qualité Données DGOV) ?
- **Pouvoir d'arbitrage :** Quelle décision formelle est prise sur la donnée (escalade AOG, contestation SLA, dérogation stock, arbitrage réseau S&OP) ?
- **Niveau d'habilitation (RBAC) :** Qui a le droit de voir quoi (vue par contrat client, vision globale SAE ou cloisonnement par shop/atelier) ?
- **Pacte de service (SLA du rapport) :** Quel engagement de fraîcheur de la donnée (Direct live horaire vs consolidation hebdomadaire/mensuelle) ?
- **Impact de non-conformité :** Quel coût financier, contractuel ou de réputation en cas d'erreur d'interprétation ou de retard de pilotage ?
- **Rituel de gouvernance :** Dans quelle instance officielle la donnée est-elle arbitrée (War room quotidienne, Comité de direction, Revue S&OP, Comité de gouvernance de données) ?
- **Audit Qualité & Fiabilité des Modèles (DGOV) :** Mesurer le taux de complétude des données d'atelier (MES), certifier le degré de confiance statistique et surveiller la dérive du modèle prédictif face au réalisé effectif.
- **Détection d'opportunités de nouvelles sources (Hors MAESTRO) :** Identifier les gisements de données externes ou périphériques à forte valeur ajoutée (ex: télémétrie avionique ACARS/FDM, météo & perturbations vols, portails de supply chain étendue des équipementiers tiers, IoT capteurs d'outillage) pour enrichir le modèle prédictif au-delà du socle ERP/MES actuel.

---

## Étape 2 : Gestion du Patrimoine Données & Traçabilité
<a id="methodology-step-2"></a>

### 🏛️ Choix des Données, Patrimoine & Qualité
- **Source de vérité unique (Golden Source) :** L'ERP SAE, le MES atelier ou le système de suivi commercial fait-il foi en cas de divergence ?
- **Grain du modèle (MDT_MAINTENANCE_REQUEST vs MDT_INTERVENTION) :** Choix entre consolidation macro dossier (2.A) et granularité opérationnelle fine par atelier (2.B).
- **Data Stewardship & Rôles :** Qui certifie la qualité et valide la saisie des pointages d'opérations sur les postes et stations de travail (`S-XXX-YY`) ?
- **Règles architecturales du réseau MRO :** 10 ateliers industriels (`S-XXX`), 3 à 10 stations unifiées par shop (`S-XXX-YY`), et 8 types de réparation (`T-XXXXXX`) couvrant 2 à 3 familles moteurs.
- **Complétude & exhaustivité :** Existe-t-il des trous dans la raquette sur les gammes standards ou les matrices de transits logistiques ?
- **Intégrité référentielle :** Les identifiants de demande (`D-YYYY-XXXXXX`), d'intervention (`I-YYYY-XXXXXX-ZZ`), codes stations et shops sont-ils unifiés et normés entre applications ?
- **Linéage & Traçabilité Part-145 :** Peut-on justifier l'historique et la conformité légale de chaque mesure auprès de l'OSAC et de l'EASA ?
- **Gestion du cycle de vie (Archivage) :** Quelle durée de rétention pour les données unitaires pointées face à l'historisation agrégée ?

---

## Étape 3 : Dictionnaire des Métriques & Auditabilité du Calcul
<a id="methodology-step-3"></a>

### 🏛️ Définitions Métier & Rigueur des Indicateurs
- **Définition certifiée (Data Dictionary) :** Le Turnaround Time (TAT) est-il validé par toutes les parties (brut calendaire, ouvré ou net gelé client) ?
- **Auditabilité & Reproductibilité :** Les auditeurs clients ou financiers peuvent-ils recalculer et prouver la même valeur à l'identique ?
- **Transparence des 4 approches de calcul :** Règles formalisées pour le forfait standard S&OP (D-SOP), la distribution réelle $P_{50}$ (D-STA), la saturation capacitaire (D-CAP) et la modélisation avancée probabiliste (D-ML).
- **Transparence des hypothèses :** Les règles de suspension de chrono (*"Stop-the-clock"*) ou de lissage sont-elles formellement documentées ?
- **Biais statistique & Représentativité :** L'échantillon historique utilisé (médiane $P_{50}$) exclut-il les visites aberrantes ou prototypes ?
- **Robustesse & Validité dans le temps :** La formule résiste-t-elle aux changements d'organisation atelier et à l'arrivée de nouvelles générations de moteurs (LEAP vs CFM56) ?
- **Acceptation par les parties prenantes :** Les compagnies aériennes reconnaissent-elles juridiquement cette modalité de calcul ?

---

## Étape 4 : Standard de Restitution & Éthique de Restitution
<a id="methodology-step-4"></a>

### 🏛️ Sémiologie Visuelle & Intégrité Décisionnelle
- **Intégrité d'interprétation :** Le visuel évite-t-il les effets d'échelle trompeurs, les tronquages d'axe ou les faux sentiments d'urgence ?
- **Standard Corporate SAE & SAC :** Les codes couleurs (vert conforme, ambre aléas, rouge AOG/saturation) respectent-ils la charte graphique MRO et les possibilités natives de SAP Analytics Cloud ?
- **Neutralité & Fidélité :** Les seuils d'alerte (SLA contractuel, $P_{85}$, seuil de tolérance 10%) sont-ils objectivement opposables à tous les acteurs ?
- **Accessibilité & Clarté cognitive :** Le lecteur novice comprend-il immédiatement l'action requise sans nécessiter une formation poussée ?
- **Protection des données sensibles :** Les pénalités financières (€) doivent-elles être masquées selon le profil et le niveau d'habilitation ?
- **Responsabilité de l'action :** Le graphique permet-il d'assigner sans ambiguïté un responsable opérationnel au déblocage ?
- **Spécification technique autoporteur `<>` :** Assurer la traçabilité des dimensions, mesures DAX/Key Figures et règles métier transmises aux équipes de mise en œuvre SAC/IBP.

---

## Étape 5 : Gouvernance du Plan Capacitaire & Accords de Service
<a id="methodology-step-5"></a>

### 🏛️ Gouvernance de la Charge & Contrats d'Interface
- **Autorité d'engagement :** Qui valide le plan capacitaire officiel (Directeur Industriel vs Direction Ventes & Programmes) ?
- **4 logiques de dimensionnement capacitaire :** C-SOP nominal planifié, C-STA basé sur le débit réel / WIP, C-LOG bridé par la disponibilité pièces (OTIF), C-ML prédictif multi-aléas.
- **Contrats d'interface Fournisseurs :** Les lead times des équipementiers OEM reposent-ils sur des engagements contractuels opposables ?
- **Fiabilité des prévisions S&OP :** Quel est l'historique de respect des créneaux de déposes par les compagnies partenaires ?
- **Synchronisation des silos :** Comment assurer la cohérence en temps réel entre la cellule Achats Pièces et l'ordonnancement Atelier ?
- **Gouvernance des dérogations :** Quelle procédure formelle autorise l'utilisation de pièces d'occasion ou cannibalisées ?
- **Gestion des risques d'attrition :** Les règles de mise au rebut lors des contrôles non destructifs (CND) sont-elles certifiées ?

---

## Étape 6 : Pilotage des Tensions & Protocoles d'Arbitrage
<a id="methodology-step-6"></a>

### 🏛️ Pilotage des Tensions & Protocoles d'Arbitrage
- **Protocole d'escalade au seuil 85% :** Quel circuit de décision officiel se déclenche dès l'entrée d'une station ou d'un atelier en zone de saturation critique ?
- **Arbitrage inter-sites équitable :** Quelle gouvernance tranche le délestage d'un shop vers un autre parmi les 10 sites (Villaroche, Montereau, Châtellerault, Bruxelles, etc.) ?
- **Responsabilité sur l'en-cours (WIP) :** Qui rend compte des dérives de délai de traversée causées par l'accumulation excessive d'en-cours d'intervention ?
- **Transparence de la file d'attente :** La ventilation temps utile vs temps d'attente passif est-elle partagée en toute neutralité avec le Lean ?
- **Données de sous-traitance :** Les goulots chez les partenaires externes sont-ils monitorés avec les mêmes exigences de gouvernance ?
- **Mesure de l'impact social & capacitaire :** Comment la donnée de saturation est-elle partagée avec le management des ressources humaines ?
