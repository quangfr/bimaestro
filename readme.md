# Maestro - Assistant de Cadrage MRO Safran ✈️

Assistant interactif de cadrage décisionnel et de modélisation dimensionnelle Power BI (DAX / Tabulaire) pour la maintenance des moteurs aéronautiques Safran MRO (CFM56-5B/7B, LEAP-1A, LEAP-1B). Application autonome (SPA) — ouvrez `index.html` dans un navigateur moderne.

## Contexte Opérationnel & Déploiement BI

Dans l'environnement de maintenance des moteurs aéronautiques civils et militaires de **Safran MRO** (flottes CFM56-5B/7B, LEAP-1A, LEAP-1B), un outil décisionnel Power BI d'aide au cadrage et au pilotage de la charge et des délais (TAT - *Turn Around Time*) vient d'être déployé.

Ce déploiement s'inscrit dans une démarche active **d'amélioration continue**, caractérisée par :
1. **Une forte composante de Product Discovery :** Aligner les besoins hétérogènes des différents personas (responsables de ligne de production, directeurs de programmes, CSM en contact avec les compagnies aériennes, acheteurs et logisticiens).
2. **La fiabilisation de la donnée et des algorithmes de calcul :** Éliminer les divergences entre les barèmes constructeurs théoriques, les déclaratifs manuels en atelier et les pointages réels au poste.
3. **L'optimisation des flux industriels :** Lisser la charge entre les différents centres spécialisés (Villaroche, Montereau, Châtellerault, Bruxelles) et maîtriser les encours physiques (WIP).

## Rôle & Enjeux du Consultant / Lead Data Supervisor

Le consultant qui supervise et développe les usages de cet outil décisionnel agit comme pivot entre les directions métiers et les équipes data. Ses missions prioritaires recouvrent :
- **L'arbitrage de la source de vérité (Golden Source) :** Garantir la cohérence entre l'ERP industriel, le MES d'atelier et les référentiels de pièces.
- **La supervision de la qualité et du cycle de vie des données :** Définir les seuils d'intégrité, les règles de gestion des données manquantes et les politiques de conservation/agrégation.
- **La normalisation des règles de calcul (Data Dictionary) :** Fixer des définitions mathématiques partagées (ex. exclusion ou inclusion des jours de gel client, distinction médiane vs moyenne, pondération de la charge).
- **L'éthique et la sémiologie de restitution :** Proposer des visualisations fidèles qui évitent les biais cognitifs, incitent à l'action corrective et respectent les habilitations de sécurité (RLS/RBAC).