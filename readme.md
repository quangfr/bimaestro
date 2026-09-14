# Bienvenue sur MAESTRO & BiMaestro 🧭
### Le guide pas à pas pour comprendre le pilotage décisionnel, la qualité et la gouvernance des données

> **Ce guide est conçu pour vous si :**  
> - Vous êtes un utilisateur métier, manager, planificateur ou chef de projet.  
> - Vous n'avez pas (ou peu) de compétences techniques ou data, mais vous souhaitez **découvrir et comprendre pas à pas** comment fonctionnent les données décisionnelles.  
> - Vous vous intéressez particulièrement à la **Gouvernance des Données** (*qui décide ? d'où vient l'information ?*) et à la **Qualité des Données** (*peut-on lui faire confiance pour décider sereinement ?*).

---

## 1. En deux mots : c'est quoi ce projet ?

Dans l'industrie aéronautique (MRO – maintenance et révision des moteurs d'avions), chaque jour d'immobilisation d'un moteur coûte très cher et peut clouer un avion au sol. Pour éviter cela, les équipes doivent prendre les bonnes décisions au bon moment :
- *Quand le moteur sera-t-il prêt et réparé ?* C'est le **délai** (ou **TAT** : *Turn Around Time*).
- *Nos ateliers ont-ils la place, les équipes et les pièces pour accueillir les prochains moteurs ?* C'est la **capacité**.

Pour répondre à ces questions, deux outils travaillent main dans la main :
1. **BiMaestro** *(ce site web interactif)* : un **simulateur pédagogique et visuel**. Il vous permet de tester sans danger différentes manières de calculer, d'explorer des tableaux et des graphiques, et de poser les bonnes questions avant de construire des solutions définitives.
2. **MAESTRO (SAP IBP & SAC)** : le système informatique officiel de l'entreprise (progiciel SAP) dans lequel les solutions validées sont déployées à grande échelle pour tous les ateliers.

---

## 2. Pourquoi la Gouvernance et la Qualité des Données sont indispensables ?

Avant même de créer de beaux graphiques colorés, une question essentielle se pose : **peut-on faire confiance aux chiffres que l'on voit ?**

Si un tableau de bord indique qu'un atelier est libre alors qu'il est en réalité surchargé, ou s'il calcule un délai faux :
- Le client subit un retard inattendu et son avion reste bloqué.
- L'entreprise paie de lourdes pénalités financières.
- Les équipes en atelier subissent une désorganisation et du stress.

### Les 4 piliers de la Qualité & Gouvernance dans Maestro :

```text
 ┌──────────────────────┐         ┌──────────────────────┐
 │ 1. La Source Unique  │         │ 2. La Responsabilité │
 │  ("Golden Source")   │         │    ("Data Owner")    │
 │ D'où vient la donnée │         │ Qui valide et qui    │
 │ officielle ?         │         │ est responsable ?    │
 └──────────┬───────────┘         └──────────┬───────────┘
            │                                │
            ▼                                ▼
 ┌──────────────────────┐         ┌──────────────────────┐
 │ 3. La Transparence   │         │ 4. La Restitution    │
 │   du Calcul (TAT)    │         │       Éthique        │
 │ Comment le chiffre a │         │ Le graphique aide-   │
 │ été fabriqué ?       │         │ t-il à décider ?     │
 └──────────────────────┘         └──────────────────────┘
```

1. **La Source Unique de Vérité (*Golden Source*) :**  
   Si l'atelier suit ses moteurs sur un fichier Excel de son côté tandis que la direction regarde un autre rapport, personne n'a les mêmes chiffres. La gouvernance impose **une source officielle reconnue par tous**.
2. **La Responsabilité (*Data Ownership*) :**  
   Chaque indicateur a un propriétaire clairement identifié : qui saisit l'information ? Qui vérifie qu'elle est à jour ? Qui arbitre en cas de litige ?
3. **La Transparence et la Compréhension du Calcul :**  
   Un délai moyen de 45 jours ne doit pas être un mystère (« boîte noire »). On doit pouvoir expliquer simplement s'il compte les week-ends, les temps d'attente de pièces détachées ou les périodes de gel demandées par le client.
4. **La Restitution Éthique & Simple :**  
   Un graphique doit être lisible instantanément par tous, sans tromper le regard (pas d'échelles déformées, pas de jargon inutile, et des alertes qui incitent à l'action concrète).

---

## 3. Découverte Pas à Pas : Le Parcours en 7 Étapes

L'application **BiMaestro** est conçue comme un parcours interactif d'apprentissage en 7 étapes. Voici ce que vous découvrez à chaque étape :

| Étape | Ce que l'on découvre | La question métier simple | L'angle Qualité & Gouvernance |
| :---: | :--- | :--- | :--- |
| **0. Contexte** | Les bases et la documentation | *De quoi parle-t-on et sur quel périmètre ?* | Comprendre l'organisation générale des 10 ateliers moteurs et les règles du jeu. |
| **1. Question Métier** | Les métiers de l'entreprise (*Personas*) | *Quel problème prioritaire voulons-nous résoudre ?* | Identifier le bon responsable décisionnel (**Data Owner**) : veut-on sécuriser un contrat client, optimiser les coûts ou désaturer un atelier ? |
| **2. Modèle de Données** | Le niveau de détail (*Granularité*) | *Regarde-t-on le dossier global ou chaque tâche en atelier ?* | **Traçabilité & Intégrité :** chaque moteur et chaque intervention doivent avoir un identifiant unique et certifié (normes aéronautiques Part-145). |
| **3. Calcul du Délai** | La méthode de calcul du délai (TAT) | *Comment calcule-t-on la durée d'une visite ?* | **Auditabilité :** la formule est-elle transparente et validée par tous les partenaires (clients, production, finance) ? |
| **4. Visuel du Délai** | Le choix du bon graphique de délai | *Comment rendre le délai clair et utile ?* | **Éthique visuelle :** mettre en valeur les retards réels sans noyer le lecteur sous trop d'informations complexes. |
| **5. Capacité Atelier** | L'équilibre entre travail à faire et ressources | *Nos ateliers peuvent-ils tenir le rythme prévu ?* | **Qualité des prévisions :** les dates d'arrivée prévues des moteurs et les délais promis par les fournisseurs de pièces sont-ils fiables ? |
| **6. Visuel Saturation** | Les points de blocage (goulots) | *Quels postes de travail risquent la surchauffe ?* | **Seuils d'alerte partagés :** déclencher une action rapide dès que l'occupation dépasse un seuil critique (ex: 85%). |
| **7. Synthèse** | Le tableau de bord final interactif | *Comment tout réunir pour décider ensemble en réunion ?* | **Alignement collectif :** disposer d'un tableau de bord unique, partagé et incontestable pour piloter les réunions opérationnelles. |

---

## 4. Les 5 Bons Réflexes « Data Qualité » au Quotidien

Face à n'importe quel tableau de bord ou chiffre métier, adoptez ces 5 questions réflexes :

- 🕒 **Fraîcheur :** De quand date cette donnée ? Est-elle mise à jour en temps réel, chaque matin ou une fois par mois ?
- 🧩 **Complétude :** Y a-t-il des données manquantes (par exemple des pointages d'atelier non saisis) ?
- 🎯 **Précision :** S'agit-il d'une mesure réelle constatée ou d'une estimation prévisionnelle ?
- 📖 **Définition partagée :** Est-ce que tout le monde comprend le mot « retard » de la même façon ?
- 🚀 **Actionnabilité :** Si un voyant passe au rouge, sait-on exactement **qui** doit intervenir et **quoi** faire ?

---

## 5. Comment utiliser ce site pour explorer et apprendre ?

1. **Naviguez librement entre les étapes (de 0 à 7) :** L'outil est interactif et sans risque ! Chaque option sélectionnée met à jour immédiatement les explications et les graphiques.
2. **Consultez l'icône Information `(i)` :** À côté du titre de chaque étape, cliquez sur le petit `(i)` pour ouvrir le guide complet de **Méthodologie Data & Gouvernance** dédié à cette étape.
3. **Basculez entre les vues :**  
   - Le bouton **`ui`** affiche toujours le rendu visuel (tableau ou graphique).  
   - Les boutons comme **`visuels`**, **`config`** ou **`chartjs`** sont là pour les curieux souhaitant découvrir comment l'intelligence artificielle ou le code informatique structurent ces informations.

---

## 6. Liens utiles & Consultation

- **Application en ligne (Firebase) :** [https://bimaestro.web.app](https://bimaestro.web.app)
- **Miroir GitHub Pages :** [https://quangfr.github.io/bimaestro/](https://quangfr.github.io/bimaestro/)
- **Référentiel détaillé de Gouvernance :** accessible à tout moment dans l'Étape 0 (fichier `gouvernance.md`) ou via l'icône d'aide `(i)`.

