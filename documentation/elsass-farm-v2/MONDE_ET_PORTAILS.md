# Structure du monde & portails — Elsass Farm V2

> Livrable de la Partie 2 du gate de pré-production (`ROADMAP/01_PREPRODUCTION.md`).
> Rédigé le 10/07/2026 — **brouillon à valider par John**.
> Complète `CAHIER_DES_CHARGES.md` §1 (déplacement) et prépare le prototype gray-box « Partie 2 ».

## 1. Principe

Le monde n'est pas une carte unique et immense, mais un ensemble de **zones**
indépendantes, chacune avec sa propre taille et son propre rôle de gameplay.
Les tailles précises restent à définir zone par zone en phase de contenu
(03-04) — seul le principe de zones multiples et de portails est validé ici.

Une zone peut être :
- une **portion de map extérieure** (ferme, village, forêt, rivière...) ;
- l'**intérieur d'un bâtiment**, potentiellement sur plusieurs étages ;
- un **palier de mine**.

## 2. Portails

Un portail est un point placé à la main dans une zone (jamais auto-généré sur
les bords, contrairement à l'ancien prototype de test `elsass-farm/v2`) :
1 à 2 cases, positionnées en bord de map, devant une porte, ou sur un élément
visuel fixe (ex. ascenseur).

Interaction, dans tous les cas : le joueur clique sur le portail (ou la
porte/l'ascenseur), le personnage s'y déplace comme sur n'importe quelle case
(CDC §1), et l'arrivée sur la case déclenche la transition.

Deux comportements possibles à l'arrivée :

- **Portail simple** : transition directe vers une zone cible + un point
  d'entrée précis. Cas des bords de map et des portes de bâtiment.
- **Portail à choix** : une popup s'ouvre proposant plusieurs destinations
  (ex. liste des étages de la mine). Cas de l'ascenseur — un seul élément
  visuel fixe, plusieurs destinations possibles.

## 3. Minimap / bouton MAP

Reste un **plan de repérage uniquement** (nom + position des zones), jamais
un fast-travel cliquable — cohérent avec le prototype de test où le clic de
téléportation rapide avait été prévu puis désactivé.

## 4. Modèle de données (proposition)

Chaque portail vit dans les données de sa zone (mêmes conventions que
`FORMAT_DONNEES.md` : kebab-case, ids uniques), pas dans le code.

### Portail simple
```json
{ "id": "sortie-ferme-nord",
  "from": { "zone": "ferme", "cells": [[20, 0], [21, 0]] },
  "to": { "zone": "village", "entry": { "col": 20, "row": 39 } } }
```

### Portail à choix (ascenseur)
```json
{ "id": "ascenseur-mine",
  "from": { "zone": "mine-entree", "cells": [[10, 10]] },
  "choices": [
    { "label": "Étage 1 — Galerie", "to": { "zone": "mine-etage-1", "entry": { "col": 5, "row": 5 } } },
    { "label": "Étage 2 — Filon",   "to": { "zone": "mine-etage-2", "entry": { "col": 5, "row": 5 } } }
  ] }
```

`from.cells` : 1 à 2 coordonnées grille qui déclenchent le portail.
`to.entry` : position d'arrivée dans la zone cible. `choices` remplace `to`
quand le portail propose plusieurs destinations (popup).

## 5. Ouvert / à trancher

- Liste définitive des zones (ferme, village, forêt, rivière, mine par
  palier, intérieurs de bâtiments...) et leurs tailles respectives — au cas
  par cas, en phase de contenu.
- Faut-il un indice visuel sur les cases de portail (icône, surbrillance),
  ou restent-elles invisibles comme dans le prototype de test ?
- Nombre d'étages par bâtiment/mine à définir au contenu.
