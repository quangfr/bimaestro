# Bienvenue sur BiMaestro 🧭
### Le bac à sable pour apprivoiser la Gouvernance des Données, SAP IBP et SAP Analytics Stories sans jargon

> **Ce guide s'adresse à vous si :**  
> - Vous prenez en charge la **Gouvernance des Données** (Data Governance) et souhaitez savoir concrètement par quel bout la prendre.  
> - Vous découvrez l'univers de la Business Intelligence (BI) et de la Data, sans formation d'ingénieur informaticien ni développeur.  
> - Vous souhaitez monter en compétences sur **SAP IBP** (Integrated Business Planning) et **SAP Analytics Cloud Stories (SAC)** pour concevoir des tableaux de bord utiles, fiables et adoptés.  
> - Vous voulez utiliser **BiMaestro comme bac à sable d'expérimentation** (prototypage rapide sans risque de casser un système de production).  
> - Vous utilisez un **éditeur de code assisté par IA** (Google Antigravity, VS Code avec Claude Code, GitHub Copilot, Codex...) pour faire évoluer l'outil en langage naturel (*Vibe Coding*).

---

## 1. Pourquoi ce prototype ? (Le pont entre le Métier et SAP)

Dans les activités de maintenance aéronautique (MRO – réparation de moteurs d'avions), piloter l'activité revient toujours à répondre à deux questions critiques :
1. **Quand le moteur sera-t-il réparé et prêt à revoler ?** C'est le délai (**TAT** : *Turn Around Time*).
2. **Nos ateliers et nos pièces suffiront-ils pour absorber les prochains moteurs ?** C'est la **capacité** (charge vs ressources).

Pour y répondre, les entreprises déploient de puissants logiciels comme **SAP IBP** (pour planifier la charge et les flux) et **SAP Analytics Cloud / Stories** (pour restituer les indicateurs aux directeurs et aux chefs d'atelier).

Mais concevoir directement dans SAP sans tester au préalable est souvent long, rigide et intimidant :
- **BiMaestro est votre simulateur pédagogique :** il reproduit fidèlement la logique métier, les calculs de délais, les tables de données et les visuels SAP dans un navigateur web simple et fluide.
- **Zéro risque :** vous pouvez tester différentes formules, modifier des hypothèses, observer immédiatement l'impact sur les graphiques, puis exporter les spécifications prêtes pour vos équipes SAP.

---

## 2. Prendre en main la Data Gouvernance : ce que cela veut dire concrètement

Être garant de la gouvernance des données ne consiste pas à écrire des scripts informatiques complexes. Votre mission principale consiste à **garantir que les décideurs peuvent faire confiance aux chiffres qu'ils ont sous les yeux**.

Voici les **5 questions fondamentales de gouvernance** que vous apprendrez à arbitrer avec BiMaestro :

```text
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│       1. QUI EST RESPONSABLE ?   │       │       2. D'OÙ VIENT LE CHIFFRE ?│
│         (Data Ownership)        │       │         (Golden Source)         │
│  Qui valide l'information       │       │  L'ERP fait-il foi face aux    │
│  et arbitre en cas de litige ?  │       │  fichiers Excel d'atelier ?     │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 ▼                                         ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     3. LE CALCUL EST-IL CLAIR ? │       │     4. LA FORME EST-ELLE JUSTE ?│
│        (Auditabilité / TAT)     │       │       (Éthique Visuelle / SAC)  │
│  La formule est-elle comprise   │       │  Le graphique aide-t-il à agir  │
│  par tous sans "boîte noire" ?  │       │  ou induit-il en erreur ?       │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   5. LE PACTE DE SERVICE   │
                        │    (Fraîcheur & Qualité)  │
                        │  Données à jour à l'heure,│
                        │  au jour ou au mois ?     │
                        └───────────────────────────┘
```

1. **La Source Unique de Vérité (*Golden Source*) :**  
   Si l'atelier suit ses moteurs sur un fichier tableur de son côté et que la direction regarde un autre rapport, personne n'a les mêmes chiffres. La gouvernance identifie la source officielle unique.
2. **La Responsabilité (*Data Owner*) :**  
   Chaque indicateur a un propriétaire : qui saisit l'opération ? Qui vérifie sa conformité (traçabilité aéronautique Part-145) ?
3. **La Transparence du Calcul :**  
   Un délai moyen de 45 jours ne doit pas être un mystère : compte-t-on les samedis et dimanches ? Les temps d'attente de pièces manquantes ? BiMaestro vous montre les différentes méthodes de calcul possibles et leurs conséquences.
4. **La Restitution Responsable (*SAP Stories*) :**  
   Un tableau de bord doit inciter à la bonne action sans alarmer inutilement ni cacher les vrais goulots d'étranglement.
5. **La Qualité Opérationnelle :**  
   Détecter les pointages oubliés, les incohérences de dates ou les données manquantes avant qu'elles ne faussent les décisions.

---

## 3. Découverte du Bac à Sable : Le Parcours en 7 Étapes

BiMaestro est organisé comme un entonnoir logique de décision. En naviguant de l'Étape 0 à l'Étape 7, vous construisez pas à pas votre architecture décisionnelle :

| Étape | Ce que vous explorez | Votre rôle de Data Gouvernance | Équivalence SAP IBP / SAC |
| :---: | :--- | :--- | :--- |
| **Étape 0 : Documentation** | Le contexte opérationnel (10 ateliers MRO, flottes CFM56/LEAP, règles du jeu). | Définir le périmètre et le glossaire partagé de l'entreprise. | *Documentation du modèle & Référentiel Métier* |
| **Étape 1 : Question Métier** | Les 7 profils métiers (*Personas*) : Directeur de site, Planificateur réseau, Finance, Qualité Données... | Identifier qui décide (**Data Owner**) et quelle question doit primer. | *Définition du besoin & Cadrage Analytics Story* |
| **Étape 2 : Modèle de Données** | La granularité : regarder au niveau du **Dossier moteur global** (2.A) ou au niveau de **chaque intervention en atelier** (2.B). | Garantir l'intégrité des identifiants (`ID_DEMANDE`, `ID_INTERVENTION`, `SHOP_NAME`). | *Master Data Types (MDT) & Planning Levels IBP* |
| **Étape 3 : Calcul du Délai** | 4 façons de calculer le délai : forfait standard (S&OP), médiane historique, prise en compte des goulots, ou modèle prédictif. | Documenter la formule officielle et s'assurer qu'elle est vérifiable par tous. | *Key Figures de calcul & Formules IBP / SAC* |
| **Étape 4 : Visuel du Délai** | Choisir le bon type de graphique (comparaison mensuelle, distribution statistique, chemin critique...). | Veiller à la lisibilité et au respect de la charte visuelle. | *Widgets & Graphiques de la Story SAC* |
| **Étape 5 : Capacité Atelier** | 4 méthodes d'évaluation de la capacité disponible face à la charge des moteurs. | Vérifier la fiabilité des engagements fournisseurs et des heures disponibles. | *Ressources & Key Figures de Capacité IBP* |
| **Étape 6 : Visuel Saturation** | Détecter les postes en surchauffe (cartes thermiques, treemaps, routes inter-ateliers). | Fixer les seuils d'alerte officiels (ex : alerte rouge dès 85% d'occupation). | *Vues de saturation & Alertes conditionnelles SAC* |
| **Étape 7 : Slide de Synthèse** | Le tableau de bord exécutif complet, dynamique et interactif, prêt pour les comités de direction. | Arbitrer les indicateurs clés finaux et valider la cohérence d'ensemble. | *Dashboard Exécutif final SAP Analytics Cloud* |

> 💡 **Astuce Découverte :**  
> À chaque étape, cliquez sur l'icône **`(i)`** en haut à droite pour ouvrir la fiche de **Méthodologie Data & Gouvernance** associée, qui détaille les questions d'audit, de traçabilité et de pacte de service.

---

## 4. Les Boutons et Modes de Vue : Comment utiliser l'interface ?

Dans les panneaux de droite des étapes, vous trouverez des onglets permettant d'observer la donnée sous différents angles :

- **`data` (Vue Données) :** un tableau interactif (comme dans un tableur moderne) affichant des données d'exemple réalistes. Vous pouvez trier les colonnes, filtrer et cliquer sur les liens pour descendre dans le détail d'une commande (*drilldown*).
- **`graph` (Vue Graphique) :** le résultat visuel interactif (diagramme relationnel ou graphique métier).
- **`uml` (Vue Schéma) :** le plan d'architecture des tables et de leurs relations.
- **`<>visuels` / `<>sap` / `<>js` (Vues Prompts & Spécifications) :** BiMaestro prépare pour vous des instructions en texte clair destinées soit à l'Intelligence Artificielle, soit directement aux développeurs SAP (formules de calcul, axes recommandés, filtres).

---

## 5. Lancer l'Application en Local (Touche F5 sur VS Code / Antigravity)

Vous pouvez lancer et visualiser l'application en local sur votre poste en une seule seconde, avec rechargement automatique dès qu'une modification est enregistrée :

1. **Ouvrez le dossier du projet** dans votre éditeur (**Visual Studio Code** ou **Google Antigravity**).
2. **Appuyez sur la touche `F5`** (ou menu *Exécuter > Démarrer le débogage*) :
   - Un serveur web local démarre automatiquement sur le port 8080.
   - Votre navigateur par défaut (Chrome ou Edge) s'ouvre directement sur `http://localhost:8080`.
   - Dès que vous (ou votre IA) modifiez un fichier (`index.html`, `js/...`, `content.md`, `readme.md`), **la page se rafraîchit toute seule en direct** (*Live Reload*).
3. **Pour arrêter :** cliquez simplement sur le bouton rouge *Arrêter* (ou `Maj + F5`) dans la barre de débogage.

---

## 6. Modifier le Projet en Vibe Coding (Guide Débutant avec IDE & IA)

Vous n'avez pas besoin d'être programmeur pour faire évoluer ce prototype. Avec un éditeur assisté par IA, vous décrivez simplement en français ce que vous voulez ajouter ou corriger : c'est le **Vibe Coding**.

### A. La Boussole de votre IA : le fichier `AGENTS.md`
Le projet contient un fichier technique central nommé [`AGENTS.md`](./AGENTS.md).  
C'est le cahier des charges opérationnel que votre IA lit automatiquement. Il lui impose notamment :
- De respecter la modularité des scripts dans le dossier `js/`.
- De **garder synchronisés** le code et la documentation métier (`content.md`).
- De **vérifier la syntaxe** avant de valider.
- ⚠️ **Règle stricte de déploiement :** l'IA a interdiction formelle de committer, de pusher sur GitHub ou de déployer sur Firebase sans que vous lui ayez **explicitement demandé** (mots-clés *"déploie"*, *"push"* ou *"commit"*). Vos modifications restent donc protégées en local tant que vous ne donnez pas le feu vert.

### B. Configuration de votre IDE : MCP & Compétences Clés (Skills)
Pour donner à votre assistant IA toute son autonomie, assurez-vous que les connecteurs et outils suivants sont configurés dans votre environnement (Antigravity, Cursor, Claude Code...) :

1. **Outils Workspace & Édition de Fichiers (Local Tools) :**  
   - *Rôle :* Permet à l'IA de naviguer dans les répertoires, lire les modèles relationnels et modifier le bon fichier dans `js/` ou `content.md`.
2. **Connecteur Git / GitHub (CLI ou MCP GitHub) :**  
   - *Rôle :* Permet à l'IA de versionner vos modifications (*commit*), d'isoler des tests sur une branche dédiée et de synchroniser le dépôt sur commande explicite.
3. **Connecteur Terminal / Déploiement Firebase (CLI firebase-tools) :**  
   - *Rôle :* Permet à l'IA, dès que vous lui écrivez *"déploie"*, d'exécuter la publication immédiate sur [https://bimaestro.web.app](https://bimaestro.web.app).

### C. Comment formuler vos demandes en langage naturel ? (Exemples simples)
Ouvrez la fenêtre de chat de votre IDE et échangez naturellement :
- 💬 *"Je voudrais ajouter un 11ème atelier MRO situé à Marseille (S-MRS). Peux-tu mettre à jour le modèle dans js/ et synchroniser content.md ?"*
- 💬 *"Peux-tu changer le seuil d'alerte de saturation à 90% au lieu de 85% dans l'Étape 6 et sur le dashboard final ?"*
- 💬 *"Vérifie que tous les scripts sont valides, puis déploie la mise à jour sur Firebase."* *(-> Seul ce type de demande déclenche le push et le déploiement public).*

---

## 7. Structure des Fichiers du Projet

Pour vous repérer d'un simple coup d'œil :

```text
├── index.html              # Squelette de la page web (structure visuelle et modales)
├── js/                     # Scripts modulaires organisés par responsabilité :
│   ├── state.js            # Mémorisation des choix de l'utilisateur (étapes 1 à 7)
│   ├── data-schemas.js     # Définition des tables, champs et modèles relationnels
│   ├── step0-markdown.js   # Affichage des documents pédagogiques (dont ce readme)
│   ├── erd-engine.js       # Moteur de calcul des données d'exemple et formules
│   ├── step2-schema.js     # Gestion de la vue du modèle de données (Étape 2)
│   ├── steps-tables.js     # Tableaux interactifs des Étapes 3 et 5
│   ├── steps-charts.js     # Graphiques et tableaux de bord des Étapes 4, 6 et 7
│   └── modals.js           # Fenêtres de personnalisation (+ Table, + Visuel, + Mesure)
├── content.md              # Référentiel métier complet (descriptions détaillées et formules)
├── gouvernance.md          # Guide approfondi de Gouvernance Data & Audit Part-145
├── AGENTS.md               # Guide technique strict pour votre assistant IA
└── readme.md               # Ce guide de démarrage pas à pas
```

---

## 8. Liens d'Accès & Ressources

- **Prototype en ligne (Firebase) :** [https://bimaestro.web.app](https://bimaestro.web.app)
- **Miroir GitHub Pages :** [https://quangfr.github.io/bimaestro/](https://quangfr.github.io/bimaestro/)
- **Code source du projet :** [https://github.com/quangfr/bimaestro](https://github.com/quangfr/bimaestro)
- **Fiche méthodologique de Gouvernance :** Fichier `gouvernance.md` accessible depuis l'Étape 0 ou via l'icône `(i)`.
