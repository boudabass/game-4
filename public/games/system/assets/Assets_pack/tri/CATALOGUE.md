# Catalogue des assets triés (`assets/tri/`)

> Généré et mis à jour par Claude à chaque passe de tri. Une ligne par
> fichier : nom, description, taille, origine. Sert à savoir ce qui existe
> sans ouvrir les images. Voir `ASSETS_TEST.md` pour le processus et
> `ASSETS_TEXTURE_PACKS.md` pour l'usage prévu de chaque pack.

## Catégorie : ui

### Famille `mmap_route_<style>` — Kenney Minimap Pack, réseau de chemins

Icônes 8×8 px pour dessiner un tracé de route sur la mini-carte
(`MONDE_ET_PORTAILS.md`). 6 palettes de couleur identiques en forme
(`a` à `f`, une par style Kenney) — probablement une palette par zone/thème
de la mini-carte, à trancher par John à l'usage. Rôles présents pour
**chaque** style (complet, aucun manquant) :

| Rôle | Description | Taille | Origine |
|---|---|---|---|
| horizontal | segment droit horizontal (touche bords gauche+droit) | 8×8 | kenney_minimap-pack/Tiles/Style X/tile_0001 |
| horizontal_v2 | variante identique (doublon pixel-exact de horizontal) | 8×8 | .../tile_0011 |
| vertical | segment droit vertical (touche bords haut+bas) | 8×8 | .../tile_0005 |
| vertical_v2 | variante identique (doublon pixel-exact de vertical) | 8×8 | .../tile_0007 |
| croix | croisement 4 directions | 8×8 | .../tile_0006 |
| t_haut | jonction en T, branche vers le haut | 8×8 | .../tile_0009 |
| t_bas | jonction en T, branche vers le bas | 8×8 | .../tile_0008 |
| t_gauche | jonction en T, branche vers la gauche | 8×8 | .../tile_0004 |
| t_droite | jonction en T, branche vers la droite | 8×8 | .../tile_0003 |
| virage_hg | virage reliant haut + gauche | 8×8 | .../tile_0012 |
| virage_hd | virage reliant haut + droite | 8×8 | .../tile_0010 |
| virage_bg | virage reliant bas + gauche | 8×8 | .../tile_0002 |
| virage_bd | virage reliant bas + droite | 8×8 | .../tile_0000 |
| seul | point isolé (nœud non connecté) | 8×8 | .../tile_0013 |
| vide | fond uni, aucun chemin | 8×8 | .../tile_0014 |
| pont_horizontal | route horizontale avec coupure centrale (passe sous une autre route) | 8×8 | .../tile_0016 |
| pont_vertical | route verticale avec coupure centrale (passe sous une autre route) | 8×8 | .../tile_0017 |
| pont_riviere_vertical ⚠️ | route verticale, chevrons violets au centre — pont sur rivière (à confirmer) | 8×8 | .../tile_0022 |

### Famille `mmap_icone_<style>` — icônes isolées du même pack

| Rôle | Description | Taille | Origine |
|---|---|---|---|
| marqueur_jaune | case pleine jaune (couleur fixe, identique dans les 6 styles) | 8×8 | .../tile_0015 |
| marqueur_orange | case pleine orange/rouge (couleur fixe, identique dans les 6 styles) | 8×8 | .../tile_0020 |
| crane | icône tête de mort (danger/piège ?) | 8×8 | .../tile_0018 |
| monstre | icône silhouette monstre/champignon (ennemi ?) | 8×8 | .../tile_0019 |
| pont_riviere_horizontal ⚠️ | route horizontale, chevrons violets au centre — pont sur rivière (à confirmer) | 8×8 | .../tile_0021 |
| lettre_s | icône lettre "S" | 8×8 | .../tile_0023 |
| lettre_x | icône lettre "X" | 8×8 | .../tile_0024 |

⚠️ = à confirmer par John (sens exact incertain, nom basé sur ce qui est visible : violet = probablement eau, mais l'usage en jeu n'est pas tranché).

## Rejetés

- `_rejetes/kenney_minimap-pack/` : les 6 planches assemblées (`tilemap_style_*.png`,
  `tilemap_packed_style_*.png`, doublons des tuiles déjà séparées ci-dessus)
  + `Tilesheet.txt` (licence/infos Kenney).
