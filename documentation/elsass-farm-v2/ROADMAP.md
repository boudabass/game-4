# Roadmap — Elsass Farm V2

> Statut : document de cadrage — phase réflexion, aucun code.
> Pipeline inspiré des studios AAA (pré-production → production Alpha/Beta → certification/Gold → lancement → post-lancement),
> adapté à une équipe de deux (John + Claude). Détail complet, règles strictes et checklists dans le dossier `ROADMAP/`.

## Arborescence

```
documentation/elsass-farm-v2/
├── PRD.md                        # vision produit
├── CAHIER_DES_CHARGES.md         # spécifications fonctionnelles
├── GAME_DESIGN_DOCUMENT.md       # contenu concret (cultures, PNJ, recettes, défis...)
├── ROADMAP.md                    # ce fichier — index
└── ROADMAP/
    ├── 00_METHODOLOGIE.md            # règles strictes, definition of done, versionnement
    ├── 01_PREPRODUCTION.md           # réduction des risques, prototype gray-box
    ├── 02_VERTICAL_SLICE.md          # tranche verticale jouable et représentative
    ├── 03_ALPHA_FEATURE_COMPLETE.md  # tous les systèmes fonctionnent (contenu provisoire toléré)
    ├── 04_BETA_CONTENT_COMPLETE.md   # tout le contenu final, feature freeze
    ├── 05_CERTIFICATION_RC.md        # conformité technique stricte, tests de robustesse
    ├── 06_LANCEMENT.md               # publication + communication
    ├── 07_POST_LANCEMENT_LIVEOPS.md  # contenu additionnel, KPIs, backlog
    └── CHECKLISTS.md                 # checklists réutilisées à chaque gate
```

## Règle absolue

**Chaque phase se termine par un gate de sortie obligatoire (liste de critères dans le fichier de la phase). Interdiction de passer à la phase suivante tant que le gate n'est pas explicitement validé par John.** Détail dans `ROADMAP/00_METHODOLOGIE.md`.

## Vue d'ensemble des phases

| # | Phase | Jalon | Version |
|---|---|---|---|
| 01 | Pré-production | Prototype gray-box du pivot d'interaction validé | v0.1 |
| 02 | Vertical Slice | Tranche verticale jouable représentative | v0.3 |
| 03 | Alpha | Feature complete (tous les systèmes du scope V1) | v0.5 |
| 04 | Beta | Content complete (feature freeze) | v0.9 |
| 05 | Certification / RC | Conformité technique, tests de robustesse | v1.0-rc |
| 06 | Lancement | Publication + communication | v1.0 (Gold) |
| 07 | Post-lancement | Live-ops, contenu additionnel, KPIs | v1.x |

## Décisions actées le 10/07/2026 (John)

- **Moteur : p5.js seul** — pas de p5.play ni planck.js (mention obsolète dans `GAME_WORKFLOW.md`, à corriger).
- **Base commune** : `engine/v1` ne fournit que Loader + Save ; les modules communs (déplacement au clic, zone d'action, caméra/zoom, grille, états) sont à refaire de zéro et à mutualiser dans le socle (probablement `engine/v2`) pour resservir aux futurs jeux.
- **Échelle de temps** : 1 min réelle = 1 h en jeu, un jour = 24 min ; le temps s'écoule pareil partout, en pause pendant mini-jeux/dialogues/menus ; minuit sans dormir = évanouissement avec léger malus.
- **Économie** : une seule monnaie, tous les prix fixés d'avance à jamais ; seules les réductions PNJ modulent les prix ; défis "concurrence commerciale" et "manipulation du marché" supprimés.
- **Météo** : système central affectant le gameplay (pluie = arrosage auto + meilleure pêche) — catalogue GDD §10.
- **Score** : cumulatif et toujours croissant, recalculé à chaque nuit, soumis via `Score.submit()` — formule GDD §11.
- **Cuisine** = artisanat (pas de système séparé) ; recettes corrigées (blé/orge ajoutés aux cultures).
- **Mine** : points de repos à reconstruire avant usage ; énigmes sans coût d'énergie (les actions physiques en coûtent).
- **Rester simple** : mécaniques annexes type FarmVille (déco, collections, cadeaux/bonus quotidiens) écartées — le jeu doit rester fun et le développement réaliste, pas un jeu AAA.
- **Nom : "Elsass Farm"** — simple, reste dans le thème Alsace.
- **Cible : grand public à dominante senior** — un public qui ne veut pas se prendre la tête ; lisibilité et rythme doux prioritaires.
- **Assets : dessinés par le code** (formes géométriques p5.js + emoji), minimalistes et lisibles — pas d'assets externes spéciaux (GDD §12).
- **Audio : pas de musique**, seulement une ambiance sonore simple générée en code (bruitages de feedback).
- **Marché asynchrone — principe confirmé** : nouvelles tables + partie technique séparée du jeu (service partagé entre tous les joueurs) ; le détail (API, modération) reste à cadrer en session dédiée.

## Décisions restant à trancher avant de coder (voir aussi `PRD.md` §9)

- Cadrage technique de détail du marché asynchrone (schéma des nouvelles tables, API du service partagé, modération du mur du village) — le principe est acté (tables dédiées + partie séparée du jeu), le détail se traite en session de développement dédiée.
- Calibrage définitif de la fréquence/sévérité des défis et des probabilités météo (premières propositions en `GAME_DESIGN_DOCUMENT.md` §7 et §10, à tester en phase Beta).
