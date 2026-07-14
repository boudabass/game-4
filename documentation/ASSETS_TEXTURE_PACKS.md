# Assets — Texture packs Kenney (CC0)

> Décision John 10/07/2026 : abandon de "tout dessiné par le code" (ancienne
> décision `elsass-farm-v2/GAME_DESIGN_DOCUMENT.md` §12). Les jeux game-4
> utilisent des texture packs CC0 de Kenney.nl, adaptés/recolorés au besoin.
> Banque commune à tous les jeux de l'arcade, pas seulement elsass-farm.
>
> **Emplacement réel (10/07/2026) : `public/games/system/assets/Assets_pack/`**
> (un sous-dossier par pack, ex. `kenney_tiny-farm/`, plus `Sounds/` pour les
> bruitages). ⚠️ Le reste de `public/games/system/assets/` (`box/`, `decor/`,
> `ground/`, `house/`, `tent/`, `Tiled_files/`) est un jeu de assets
> préexistant **déjà utilisé par d'autres jeux créés avec le nouveau système
> — ne pas y toucher, ne pas le confondre avec `Assets_pack/`.**

## Pourquoi

Kenney.nl a un catalogue énorme de tilesets/sprites libres (CC0, zéro
attribution requise), qualité pro — largement suffisant pour ne rien dessiner
à la main. Principe "texture pack" façon Minecraft : récupérer un pack
cohérent et l'adapter (recoloration, retouches ponctuelles) plutôt que tout
produire soi-même.

## Limite connue, assumée par John

Les 15 packs ci-dessous viennent de familles graphiques différentes (Tiny /
Roguelike / PICO-8 / styles isolés) : pas homogènes visuellement entre elles
si mélangées dans un même jeu. Décision de John : chaque zone/jeu utilise le
pack qui lui correspond, pas de recherche d'unité graphique globale entre
tous les jeux de l'arcade.

## Les 15 packs retenus et leur usage

| Pack | Lien | Usage prévu |
|---|---|---|
| Tiny Farm | kenney.nl/assets/tiny-farm | elsass-farm v3 — zone ferme (cultures GDD §2, élevage §3) |
| Fish Pack | kenney.nl/assets/fish-pack | elsass-farm v3 — **décor de la zone pêche** (rivière/canal/étang, poissons visibles dans l'eau) |
| Pixel Shmup | kenney.nl/assets/pixel-shmup | elsass-farm v3 — **mini-jeu de pêche actif** (l'action de pêche elle-même : timing/esquive), distinct du décor |
| Tiny Town | kenney.nl/assets/tiny-town | elsass-farm v3 — village, marché couvert, bâtiments (GDD §5, §9) |
| Minimap Pack | kenney.nl/assets/minimap-pack | elsass-farm v3 — mini-carte de navigation entre zones (`MONDE_ET_PORTAILS.md`) — **trié et renommé le 10/07/2026** |
| Roguelike Characters | kenney.nl/assets/roguelike-characters | elsass-farm v3 — sprites des 8 PNJ du village (GDD §5) |
| Roguelike Indoors | kenney.nl/assets/roguelike-indoors | elsass-farm v3 — intérieurs de bâtiments (Roadmap Partie 2 : bâtiments à un ou plusieurs étages) |
| UI Pack Pixel Adventure | kenney.nl/assets/ui-pack-pixel-adventure | Transversal — HUD, menus, boutons, tous les jeux |
| Pico-8 Platformer | kenney.nl/assets/pico-8-platformer | elsass-farm v3 — zone mine (GDD §4, paliers/énigmes) |
| Desert Shooter Pack | kenney.nl/assets/desert-shooter-pack | Réserve — futur jeu à thème désert, pas encore planifié |
| Pico-8 City | kenney.nl/assets/pico-8-city | Réserve — futur jeu/zone ville, pas encore planifié |
| Tiny Battle | kenney.nl/assets/tiny-battle | Réserve — futur jeu, pas encore planifié (pas de combat dans elsass-farm) |
| Sci-Fi RTS | kenney.nl/assets/sci-fi-rts | Réserve — futur jeu, hors thème alsacien |
| Medieval RTS | kenney.nl/assets/medieval-rts | Réserve — futur jeu, ou renfort zone village si Tiny Town ne suffit pas (pas encore tranché) |
| Roguelike RPG Pack | kenney.nl/assets/roguelike-rpg-pack | Réserve — futur jeu, même famille que Roguelike Characters/Indoors |

9 packs servent elsass-farm v3 directement, 6 restent en réserve pour de
futurs jeux non encore planifiés.

## Tranché le 10/07/2026

- **Fish Pack et Pixel Shmup ne sont pas concurrents** : Fish Pack habille le
  décor de la zone pêche (rivière/canal/étang, poissons ambiants), Pixel
  Shmup habille le mini-jeu de pêche actif (la séquence de capture
  elle-même). Les deux sont retenus, chacun sur son propre écran.

## Reste à trancher en phase de prototypage (elsass-farm v3)

- **Pico-8 Platformer** (mine) a une palette fixe 16 couleurs, différente du
  reste du jeu (Tiny Farm, Roguelike...). Acceptable car la mine est une zone
  à part reliée par portail dédié (`MONDE_ET_PORTAILS.md`) — à confirmer
  visuellement au test.

## Outil de tri (10/07/2026)

Le tri/validation des packs se fait avec le jeu-outil **assets-test**
(`public/games/assets-test/v1/`, masqué du catalogue) — voir
`documentation/ASSETS_TEST.md`. Le résultat de chaque passe de tri doit être
reporté ici (colonne "Usage prévu" → usage réel constaté).

## Tiny Farm — trié le 10/07/2026

132 tuiles (16×16 px) classées et renommées : 16 tuiles de sol labouré
(butte isolée + sillon vertical/horizontal), sapin en 3 stades de
croissance, 6 cultures complètes avec leurs stades de champ + icônes de
récolte (carotte, aubergine, maïs, tomate, chou, blé), l'ensemble bâtiment
`grange` (mur + toit, 24 tuiles), 2 personnages fermiers, mouton/vache/
poule, et une vingtaine d'objets (outils, récipients, coffres, branches
ramassables). Détail complet et plan de montage de la grange :
`Assets_pack/tri/CATALOGUE.md`. 4 tuiles à confirmer par John (rôle
incertain) — voir journal `ASSETS_TEST.md`.

## Minimap Pack — trié le 10/07/2026

Confirmé à l'usage : un système complet de tuiles-chemin 8×8 px (réseau
horizontal/vertical/croix/T/virages + point isolé + case vide + 2 ponts),
décliné en 6 palettes de couleur identiques en forme (`a` à `f`) — utilisable
tel quel pour dessiner un tracé de route sur la mini-carte. Plus 2 marqueurs
pleins (jaune/orange, couleur fixe indépendante du style — probablement
repère joueur/objectif) et quelques icônes (crâne, monstre, lettres S/X,
2 tuiles "pont sur rivière" à confirmer). Détail complet :
`Assets_pack/tri/CATALOGUE.md`. Aucun manque : le jeu de rôles est complet
pour les 6 styles.

Le tri/validation des packs se fait avec le jeu-outil **assets-test**
(`public/games/assets-test/v1/`, masqué du catalogue) — voir
`documentation/ASSETS_TEST.md`. Le résultat de chaque passe de tri doit être
reporté ici (colonne "Usage prévu" → usage réel constaté).
