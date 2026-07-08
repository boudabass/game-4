# Roadmap — Elsass Farm V2

> Statut : document de cadrage — phase réflexion, aucun code.
> Propose un ordre de construction pour limiter le risque (Stardew Valley = un projet réputé long ;
> l'idée est de valider le pivot d'interaction avant d'empiler tous les systèmes).

## Phase 0 — Cadrage (fait, ce dossier)
`PRD.md`, `CAHIER_DES_CHARGES.md`, `GAME_DESIGN_DOCUMENT.md`. Aucun code.

## Phase 1 — Prototype du pivot d'interaction
Objectif unique : valider le nouveau modèle avatar (déplacement au clic + action de proximité, zéro clavier/manette, voir `CAHIER_DES_CHARGES.md` §0) sur le socle `engine/v1`, avec un seul système jouable : la culture (labourer/planter/arroser/récolter), sur une petite grille. Pas d'élevage, pas de pêche, pas de mine, pas de PNJ. Sert de "vertical slice" — la plus petite version qui prouve que la boucle est amusante avant d'investir plus loin.

## Phase 2 — Élevage et Pêche
Ajout des deux systèmes suivants, un par un, en réutilisant l'inventaire et l'économie posés en phase 1.

## Phase 3 — Mine et Artisanat
Ajout du système d'exploration/énigmes (sans combat) et des structures de transformation. Ces deux systèmes sont liés (la mine alimente l'artisanat).

## Phase 4 — PNJ, relations, défis/catastrophes
Ajout du roster de PNJ, des relations, puis du système de défis — volontairement après les systèmes de production, car les défis doivent avoir quelque chose à perturber (cultures, animaux, stocks) pour avoir du sens.

## Phase 5 — Marché asynchrone
Dernier système, car il dépend d'un chantier technique séparé (donnée partagée entre comptes joueurs, modération). À cadrer avec John avant d'attaquer le développement de cette phase.

## Phase 6 — Habillage alsacien complet & polish
Intégration des assets définitifs (graphismes, musique, textes), ajustement de l'équilibrage (fréquence des défis, prix, temps de pousse), tests utilisateurs.

## Décisions à trancher avec John avant de coder

- Nom final du jeu (garder "Elsass Farm" ou en choisir un autre).
- Cible réelle du jeu (grand public vs seniors) — impacte lisibilité UI et rythme.
- Qui produit les assets graphiques/musicaux et avec quels outils.
- Cadrage technique du marché asynchrone (nouvelle table, API, modération) — sujet à traiter séparément, probablement avec une vraie session de développement dédiée plutôt qu'en réflexion pure.
- Calibrage définitif de la fréquence/sévérité des défis (première proposition en `GAME_DESIGN_DOCUMENT.md` §7, à tester).
