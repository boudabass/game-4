# Format de données du contenu — Elsass Farm V2

> Livrable du gate de pré-production (`ROADMAP/01_PREPRODUCTION.md`).
> Rédigé le 10/07/2026 — **brouillon à valider par John**.
> Objectif : en Production (phases 03-04), ajouter une culture, un PNJ ou une
> recette = modifier UN fichier JSON, sans toucher au code.

## Principes

- Tout le contenu vit dans `public/games/elsass-farm/v3/data/` sous forme de
  fichiers **JSON statiques**, chargés au boot via le loader (assets même
  origine — la règle « jamais de fetch direct » du workflow vise les API
  plateforme `/api/*`, pas les fichiers statiques du jeu).
- **Identifiants** : `kebab-case`, uniques par fichier (ex. `choux-choucroute`).
- **Libellés** : français, affichés tels quels (`label`).
- **Visuel** : chaque entité a un champ `emoji` ET un `fallback`
  (forme géométrique + couleur) si l'emoji rend mal sur un OS (GDD §12).
- **Prix** : fixés ici à jamais (pilier 5). `buy` = prix d'achat (graine,
  animal…), `sell` = prix de vente du produit. Jamais modifiés par le code.
- **Durées** : toujours en **jours de jeu** (1 jour = 24 min réelles).

## Fichiers et schémas

### crops.json — cultures
```json
{ "id": "asperge", "label": "Asperge", "emoji": "🌱",
  "fallback": { "shape": "triangle", "color": "#7cb342" },
  "season": "printemps", "growthDays": 6, "buy": 30, "sell": 55,
  "regrow": false }
```
`season` ∈ `printemps|ete|automne|hiver`. `regrow` : repousse après récolte (ex. framboises).

### animals.json — élevage
```json
{ "id": "poule", "label": "Poule", "emoji": "🐔",
  "fallback": { "shape": "circle", "color": "#efebe9" },
  "building": "poulailler", "product": "oeuf", "frequencyDays": 1, "buy": 120 }
```
`product` référence un id de `products.json`.

### products.json — produits bruts et transformés
```json
{ "id": "oeuf", "label": "Œuf", "emoji": "🥚",
  "fallback": { "shape": "circle", "color": "#fff8e1" }, "sell": 12 }
```

### recipes.json — artisanat (cuisine incluse, CDC §8)
```json
{ "id": "biere", "label": "Bière artisanale", "emoji": "🍺",
  "fallback": { "shape": "rect", "color": "#ffb300" },
  "station": "brasserie",
  "inputs": [ { "id": "houblon", "qty": 2 }, { "id": "orge", "qty": 2 } ],
  "output": { "id": "biere", "qty": 1 } }
```
Production asynchrone : résultat prêt au réveil suivant (GDD §6).

### npcs.json — PNJ du village
```json
{ "id": "boulangere", "label": "La boulangère", "emoji": "🥨",
  "fallback": { "shape": "circle", "color": "#8d6e63" },
  "place": "boulangerie",
  "sells": ["farine"], "buysCategories": ["cereale"],
  "relationTiers": [
    { "level": 5,  "effect": { "type": "discount", "value": 0.05 } },
    { "level": 10, "effect": { "type": "recipe", "id": "kougelhopf" } }
  ] }
```
Paliers 0/5/10/15/20 (GDD §5). Les `discount` sont les seules modulations de prix du jeu.

### weather.json — météo par saison (GDD §10)
```json
{ "season": "ete",
  "states": [
    { "id": "soleil", "weight": 55 },
    { "id": "pluie", "weight": 20, "effects": ["arrosage-auto", "peche-bonus"] },
    { "id": "canicule", "weight": 15, "effects": ["secheresse-progress"] },
    { "id": "orage", "weight": 10, "challenge": "grele" }
  ] }
```

### challenges.json — défis/catastrophes (GDD §7)
```json
{ "id": "gel-tardif", "label": "Gel tardif", "season": "printemps",
  "trigger": { "type": "weather", "chance": 0.05 },
  "effect": { "type": "crop-damage", "ratio": 0.4, "filter": "non-protege" },
  "mitigation": "serre" }
```

### skills.json — compétences (GDD §8)
```json
{ "id": "agriculture", "label": "Agriculture", "emoji": "🌾",
  "fallback": { "shape": "rect", "color": "#7cb342" },
  "xpPerAction": 5,
  "unlocks": [ { "level": 3, "type": "structure", "id": "arroseur" } ] }
```

## Hors data (reste dans le code/config)

- Échelle de temps, formule de score, taille de grille : `config.js` du jeu.
- Le marché asynchrone (tables serveur, API) : cadrage séparé, hors data locale.

## Validation

Chaque fichier sera validé au chargement (ids uniques, références croisées
`inputs`/`product` existantes) avec erreur claire en console — prévu phase 02.
