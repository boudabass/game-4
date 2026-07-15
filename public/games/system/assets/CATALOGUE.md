# Catalogue des assets triés (`assets/tri/`)

> Généré et mis à jour par Claude à chaque passe de tri. Une ligne par
> fichier : nom, description, taille, origine. Sert à savoir ce qui existe
> sans ouvrir les images. Voir `ASSETS_TEST.md` pour le processus et
> `ASSETS_TEXTURE_PACKS.md` pour l'usage prévu de chaque pack.


## Cible finale (décision John, 14/07/2026)

À la fin du tri, le CONTENU de `tri/` remonte directement dans
`games/system/assets/` (assets/sol/, assets/decor/, assets/catalogue.json…)
et TOUT le reste disparaît : les packs restants (vidés au fil des passes),
`_rejetes/` (supprimé à la fin — les packs Kenney sont re-téléchargeables,
la règle "jamais supprimé" ne vaut que pendant le tri), `Assets_pack/`,
`box/`, `decor/`, `house/`, `tent/`, `Tiled_files/`, `ground/` (part avec
la refonte de test-system), l'outil assets-test et la route
/api/assets/scan. Les seuls fichiers utilisés par les jeux seront ceux
issus du tri.

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

## Catégorie : sol — kenney_tiny-farm

Buttes de terre labourée, vue de dessus (16×16 px). Deux familles :

| Nom | Rôle | Description |
|---|---|---|
| farm_sol_butte_seul_v1 | isolée v1 | Butte de terre labourée isolée, vue de dessus, variante 1 (passable: oui) |
| farm_sol_butte_seul_v2 | isolée v2 | Butte de terre labourée isolée, variante 2 (passable: oui) |
| farm_sol_butte_vert_haut_v1 | bout haut sillon vertical v1 | Bout haut (arrondi) d'un sillon labouré vertical, variante 1 (passable: oui) |
| farm_sol_butte_vert_haut_v2 | bout haut v2 | Bout haut d'un sillon labouré vertical, variante 2 (passable: oui) |
| farm_sol_butte_vert_centre_v1 | centre sillon vertical v1 | Segment central (droit) d'un sillon labouré vertical, variante 1 (passable: oui) |
| farm_sol_butte_vert_centre_v2 | centre v2 | Segment central d'un sillon labouré vertical, variante 2 (passable: oui) |
| farm_sol_butte_vert_bas_v1 | bout bas sillon vertical v1 | Bout bas (arrondi) d'un sillon labouré vertical, variante 1 (passable: oui) |
| farm_sol_butte_vert_bas_v2 | bout bas v2 | Bout bas d'un sillon labouré vertical, variante 2 (passable: oui) |
| farm_sol_sillon_horizontal_fonce_gauche | sillon horizontal foncé — bord gauche | Sillon labouré horizontal (terre foncée), bout gauche, 4 tuiles de large (passable: oui) |
| farm_sol_sillon_horizontal_fonce_centre1 | — centre 1 | Sillon labouré horizontal foncé, segment central 1 (passable: oui) |
| farm_sol_sillon_horizontal_fonce_centre2 | — centre 2 | Sillon labouré horizontal foncé, segment central 2 (passable: oui) |
| farm_sol_sillon_horizontal_fonce_droit | — bord droit | Sillon labouré horizontal foncé, bout droit (passable: oui) |
| farm_sol_sillon_horizontal_clair_gauche | sillon horizontal clair — bord gauche | Sillon labouré horizontal (terre claire/sèche), bout gauche (passable: oui) |
| farm_sol_sillon_horizontal_clair_centre1 | — centre 1 | Sillon labouré horizontal clair, segment central 1 (passable: oui) |
| farm_sol_sillon_horizontal_clair_centre2 | — centre 2 | Sillon labouré horizontal clair, segment central 2 (passable: oui) |
| farm_sol_sillon_horizontal_clair_droit | — bord droit | Sillon labouré horizontal clair, bout droit (passable: oui) |

⚠️ Rôle du set butte_seul/vert_haut/centre/bas déduit visuellement (empilement d'un sillon vertical) — non confirmé par assemblage en jeu, à valider par John à l'usage.


## Catégorie : decor — kenney_tiny-farm

### Arbre (sapin) — croissance 3 stades

| Nom | Stade | Description |
|---|---|---|
| farm_arbre_sapin_jeune | jeune | Jeune sapin, stade de croissance 1 (petit) |
| farm_arbre_sapin_moyen | moyen | Sapin, stade de croissance 2 (moyen) |
| farm_arbre_sapin_mature | mature | Sapin mature, stade de croissance 3 (adulte) |

### Cultures — 6 familles, mêmes rôles (tuiles de champ, catégorie decor ; icône/sac/caisse/présentoir → catégorie objet)


**Carotte** (`farm_carotte_*`) :

| Rôle | Fichier | Catégorie | Description |
|---|---|---|---|
| pousse1 | farm_carotte_pousse1 | decor | Culture carotte (racine orange) — stade 'pousse1' (tuile de champ) |
| pousse2 | farm_carotte_pousse2 | decor | Culture carotte (racine orange) — stade 'pousse2' (tuile de champ) |
| mure | farm_carotte_mure | decor | Culture carotte (racine orange) — stade 'mure' (tuile de champ) |
| recolte_sol | farm_carotte_recolte_sol | decor | Culture carotte (racine orange) — stade 'recolte_sol' (tuile de champ) |
| icone | farm_carotte_icone | objet | Icône carotte (racine orange) récoltée (item) |
| sac | farm_carotte_sac | objet | Sachet de graines — carotte (racine orange) |
| caisse | farm_carotte_caisse | objet | Caisse de rangement — carotte (racine orange) |
| presentoir | farm_carotte_presentoir | objet | Présentoir de marché (item posé) — carotte (racine orange) |

**Aubergine** (`farm_aubergine_*`) :

| Rôle | Fichier | Catégorie | Description |
|---|---|---|---|
| pousse1 | farm_aubergine_pousse1 | decor | Culture aubergine (violette) — stade 'pousse1' (tuile de champ) |
| pousse2 | farm_aubergine_pousse2 | decor | Culture aubergine (violette) — stade 'pousse2' (tuile de champ) |
| mure | farm_aubergine_mure | decor | Culture aubergine (violette) — stade 'mure' (tuile de champ) |
| recolte_sol | farm_aubergine_recolte_sol | decor | Culture aubergine (violette) — stade 'recolte_sol' (tuile de champ) |
| icone | farm_aubergine_icone | objet | Icône aubergine (violette) récoltée (item) |
| sac | farm_aubergine_sac | objet | Sachet de graines — aubergine (violette) |
| caisse | farm_aubergine_caisse | objet | Caisse de rangement — aubergine (violette) |
| presentoir | farm_aubergine_presentoir | objet | Présentoir de marché (item posé) — aubergine (violette) |

**Maïs** (`farm_mais_*`) :

| Rôle | Fichier | Catégorie | Description |
|---|---|---|---|
| pousse1 | farm_mais_pousse1 | decor | Culture maïs (épi orange/jaune) — stade 'pousse1' (tuile de champ) |
| pousse2 | farm_mais_pousse2 | decor | Culture maïs (épi orange/jaune) — stade 'pousse2' (tuile de champ) |
| mure | farm_mais_mure | decor | Culture maïs (épi orange/jaune) — stade 'mure' (tuile de champ) |
| recolte_sol | farm_mais_recolte_sol | decor | Culture maïs (épi orange/jaune) — stade 'recolte_sol' (tuile de champ) |
| icone | farm_mais_icone | objet | Icône maïs (épi orange/jaune) récoltée (item) |
| sac | farm_mais_sac | objet | Sachet de graines — maïs (épi orange/jaune) |
| caisse | farm_mais_caisse | objet | Caisse de rangement — maïs (épi orange/jaune) |
| presentoir | farm_mais_presentoir | objet | Présentoir de marché (item posé) — maïs (épi orange/jaune) |

**Tomate** (`farm_tomate_*`) :

| Rôle | Fichier | Catégorie | Description |
|---|---|---|---|
| pousse1 | farm_tomate_pousse1 | decor | Culture tomate (rouge) — stade 'pousse1' (tuile de champ) |
| pousse2 | farm_tomate_pousse2 | decor | Culture tomate (rouge) — stade 'pousse2' (tuile de champ) |
| pousse3 | farm_tomate_pousse3 | decor | Culture tomate (rouge) — stade 'pousse3' (tuile de champ) |
| mure | farm_tomate_mure | decor | Culture tomate (rouge) — stade 'mure' (tuile de champ) |
| fane | farm_tomate_fane | decor | Culture tomate (rouge) — stade 'fane' (tuile de champ) |
| icone | farm_tomate_icone | objet | Icône tomate (rouge) récoltée (item) |
| sac | farm_tomate_sac | objet | Sachet de graines — tomate (rouge) |
| caisse | farm_tomate_caisse | objet | Caisse de rangement — tomate (rouge) |
| presentoir | farm_tomate_presentoir | objet | Présentoir de marché (item posé) — tomate (rouge) |

**Chou** (`farm_chou_*`) :

| Rôle | Fichier | Catégorie | Description |
|---|---|---|---|
| pousse1 | farm_chou_pousse1 | decor | Culture chou/laitue (boule verte) — stade 'pousse1' (tuile de champ) |
| pousse2 | farm_chou_pousse2 | decor | Culture chou/laitue (boule verte) — stade 'pousse2' (tuile de champ) |
| mure | farm_chou_mure | decor | Culture chou/laitue (boule verte) — stade 'mure' (tuile de champ) |
| recolte_sol | farm_chou_recolte_sol | decor | Culture chou/laitue (boule verte) — stade 'recolte_sol' (tuile de champ) |
| icone | farm_chou_icone | objet | Icône chou/laitue (boule verte) récoltée (item) |
| sac | farm_chou_sac | objet | Sachet de graines — chou/laitue (boule verte) |
| caisse | farm_chou_caisse | objet | Caisse de rangement — chou/laitue (boule verte) |
| presentoir | farm_chou_presentoir | objet | Présentoir de marché (item posé) — chou/laitue (boule verte) |

**Blé** (`farm_ble_*`) :

| Rôle | Fichier | Catégorie | Description |
|---|---|---|---|
| pousse1 | farm_ble_pousse1 | decor | Culture blé (épi doré) — stade 'pousse1' (tuile de champ) |
| pousse2 | farm_ble_pousse2 | decor | Culture blé (épi doré) — stade 'pousse2' (tuile de champ) |
| mure | farm_ble_mure | decor | Culture blé (épi doré) — stade 'mure' (tuile de champ) |
| recolte_sol | farm_ble_recolte_sol | decor | Culture blé (épi doré) — stade 'recolte_sol' (tuile de champ) |
| icone | farm_ble_icone | objet | Icône blé (épi doré) récoltée (item) |
| sac | farm_ble_sac | objet | Sachet de graines — blé (épi doré) |
| caisse | farm_ble_caisse | objet | Caisse de rangement — blé (épi doré) |
| presentoir | farm_ble_presentoir | objet | Présentoir de marché (item posé) — blé (épi doré) |

### Meubles / bâti agricole (ensembles 2 tuiles gauche+droit)

| Ensemble | Description |
|---|---|
| farm_banc_bois_gauche / farm_banc_bois_droit | Banc en bois (sprite 2 tuiles, poser côte à côte) |
| farm_banc_metal_gauche / farm_banc_metal_droit | Banc métal/gris (sprite 2 tuiles, poser côte à côte) |
| farm_bac_eau_gauche / farm_bac_eau_droit | Bac/abreuvoir eau bleue (sprite 2 tuiles, poser côte à côte) |
| farm_mangeoire_gauche / farm_mangeoire_droit | Mangeoire à grain doré (sprite 2 tuiles, poser côte à côte) |

### Divers (decor)

| Nom | Description | Passable |
|---|---|---|
| farm_buisson_baies | Buisson avec baies rouges | non |
| farm_taupiniere | Monticule brun-orangé arrondi, rôle incertain (taupinière ? souche ?) ⚠️ à confirmer | oui |
| farm_herbe_touffe | Touffe d'herbe sauvage | oui |
| farm_pousse_en_pot | Petite pousse à 3 tiges dans un pot en terre | oui |
| farm_tournesol | Tournesol | non |
| farm_tas_pierres | Tas de pierres (2 rochers, plus gros que 'cailloux') | non |
| farm_ruche | Ruche traditionnelle (skep), dôme + cerclages empilés | non |

### Coffres (objet — conteneurs)

| Nom | Description |
|---|---|
| farm_coffre_bois_clair | Coffre en bois clair, bande foncée |
| farm_coffre_bois_fonce | Caisse/armoire en bois foncé |
| farm_coffre_jaune | Coffre orange/jaune à cadenas |
| farm_coffre_raye | Coffre rayé rouge/orange |

## Catégorie : batiment — kenney_tiny-farm (ensemble `grange`)

Bâtiment complet en 2 blocs séparés (mur 3×4 tuiles + toit 3×4 tuiles, à poser l'un sur l'autre en jeu) — assemblage vérifié visuellement sur la planche source. Toit = passable `haut` (le personnage passe dessous, visuellement recouvert).

```
MUR (3 col x 4 rangees)              TOIT (3 col x 4 rangees, + 1 pointe)
mur_haut_gauche  centre  droit               [ toit_apex (centré, 1 tuile) ]
mur_brique1_g    centre  droit        toit_haut_gauche  centre  droit
mur_brique2_g    centre  droit        toit_milieu_gauche centre droit
porte_gauche  porte_droit  fenetre    toit_bas_gauche  centre  droit
                                       toit_avant_toit_gauche [vide] toit_avant_toit_droit
```

Préfixe commun `farm_grange_`. Porte = passable oui (entrée). Fenêtre/murs = non. Tuile centrale du rang "avant_toit" (idx 130 source) quasi vide (2px de bruit) → rejetée.


## Catégorie : perso — kenney_tiny-farm

| Nom | Description |
|---|---|
| farm_fermier_brun | Personnage fermier, cheveux bruns, sans chapeau, salopette bleue |
| farm_fermier_chapeau | Personnage fermier avec chapeau de paille, salopette bleue |
| farm_mouton | Mouton |
| farm_vache | Vache |
| farm_poule | Poule |

## Catégorie : objet — kenney_tiny-farm

### Outils, récipients, ressources

| Nom | Description |
|---|---|
| farm_seau_vide | Seau en bois vide, cerclé métal |
| farm_seau_eau | Seau en bois rempli d'eau |
| farm_sac_toile | Sac en toile/jute (grain ou farine) |
| farm_coffre_bois_clair | Coffre en bois clair, bande foncée |
| farm_coffre_bois_fonce | Caisse/armoire en bois foncé |
| farm_gant | Gant de jardinage |
| farm_pelle | Pelle/bêche |
| farm_hache | Hache |
| farm_cailloux | Petit tas de cailloux ramassables (3 pierres) |
| farm_coffre_jaune | Coffre orange/jaune à cadenas |
| farm_coffre_raye | Coffre rayé rouge/orange |
| farm_pot_lait | Pot/bocal avec couvercle, contenu blanc (lait ?) |
| farm_seau_lait | Seau/tonneau cerclé métal rempli de lait |
| farm_pain | Miche de pain ronde |
| farm_branche_v1 | Branche/brindille au sol, ramassable (bois), variante 1 |
| farm_branche_v2 | Branche/brindille au sol, ramassable (bois), variante 2 |
| farm_branche_v3 | Branche/brindille au sol, ramassable (bois), variante 3 |
| farm_branche_v4 | Branche/brindille au sol, ramassable (bois), variante 4 |

### Icônes de récolte par culture (`_icone` / `_sac` / `_caisse` / `_presentoir`)

Voir tableau des cultures ci-dessus (catégorie decor) — 4 icônes objet par culture, 24 au total.


## Catégorie : ui — kenney_tiny-farm

| Nom | Description |
|---|---|
| farm_aide_inconnu | Icône point d'interrogation (aide / objet non identifié) |

## Rejetés — kenney_tiny-farm

- `_rejetes/kenney_tiny-farm/Tilesheet.txt` : infos techniques Kenney (taille 16px, espacement 1px, grille 12×11) — pas de noms de tuiles fournis par Kenney, tout a été identifié visuellement tuile par tuile.
- `_rejetes/kenney_tiny-farm/farm_toit_avant_toit_vide_tile0130.png` : tuile quasi vide (2px de bruit résiduel), sans usage.
- `tri/_references/farm_apercu_tilemap.png` + `farm_apercu_tilemap_packed.png` : planches complètes d'origine (aperçu de montage), conservées en référence.
- `tri/_references/planche_<categorie>.png` : planches de contact générées pour contrôle visuel rapide (une par catégorie touchée dans cette passe).

## Douteux — à confirmer par John (kenney_tiny-farm)

- `farm_taupiniere` : monticule brun-orangé arrondi, rôle incertain (taupinière ? souche ? autre ?) — nom provisoire.
- `farm_ruche` : forme en dôme + cerclages, identifiée comme ruche traditionnelle par déduction visuelle — à confirmer.
- `farm_pain` : miche ronde beige, identifiée comme pain — pourrait aussi être un fromage rond, peu d'indices visuels distinctifs.
- Rôles précis du set `sol_butte_*` (seul/vert_haut/vert_centre/vert_bas) déduits par élimination, pas de confirmation par assemblage en jeu.

---

# Passe du 14/07/2026 — kenney_tiny-town (préfixe `town_`)

> Usage : le village 16 px qui complète tiny-farm — sols, arbres/forêts,
> clôtures et bâtiments en kit pour le bourg d'elsass-farm v3.
> 132 tuiles 16×16, pas d'espacement. 132 triées, 3 rejets (planches + txt).

## Catégorie : sol — kenney_tiny-town

| nom | description | px | passable |
|---|---|---|---|
| town_herbe_centre / _v2 / town_herbe_fleurs | herbe unie / touffes / fleurs jaunes | 16 | oui |
| town_terre_* (9 rôles) | patch de terre sur herbe : coin_hg, bord_haut, coin_hd, bord_gauche, centre, bord_droit, coin_bg, bord_bas, coin_bd — **complet** (pas de coin_int) | 16 | oui |
| town_terre_centre_v2..v5 | terre pleine, variantes touffes/cailloux | 16 | oui |
| town_dalles_herbe | patch de dalles grises sur herbe (isolé) | 16 | oui |
| town_place_pavee_* (9 rôles) | place pavée claire bordée d'un muret à créneaux — **complet**. Centre passable, bords non (muret) | 16 | centre oui, bords non |

## Catégorie : decor — kenney_tiny-town

| nom | description | passable |
|---|---|---|
| town_arbre_orange_haut/_bas, town_arbre_vert_haut/_bas | grands arbres 1×2 (cime `haut`, tronc `non`) | haut/non |
| town_arbre_orange_petit, town_arbre_vert_petit | petits arbres 1 tuile | non |
| town_buisson / town_pousses / town_champignons | buisson rond / pousses vertes / champignons rouges | non/oui/oui |
| town_foret_verte_l1c1..l3c3 (9) | massif de sapins verts **tileable 3×3** (arbres coupés aux bords, se répète avec lui-même) | non |
| town_foret_orange_l1c1..l3c3 (9) | idem en version automne orange | non |
| town_cloture_* (14) | clôture bois : coin_hg/hd/bg/bd, horizontal (+v2, v3), vertical (+v2, v3), bout_haut/bas/gauche/droit — **complet** (pas de T ni croix) | non |
| town_muret_* (4) | muret pierre à créneaux : bout_gauche, horizontal, bout_droit, seul (pas de vertical) | non |
| town_panneau_affichage / town_pancarte | panneau d'affichage / pancarte sur piquet | non |
| town_ruche / town_cible / town_tonneau_vide / town_tonneau_eau | ruche jaune, cible, tonneaux (vide / rempli d'eau) | non |

### Plans de montage (vérifiés par assemblage Pillow)

```
foret_verte / foret_orange (3×3, répétable) :
l1c1 | l1c2 | l1c3
l2c1 | l2c2 | l2c3
l3c1 | l3c2 | l3c3

enclos type en clôture (3×3) :
coin_hg    | horizontal    | coin_hd
vertical_v2| (contenu)     | vertical_v3
coin_bg    | horizontal_v2 | coin_bd

tronçon vertical : bout_haut / vertical / bout_bas
tronçon horizontal : bout_gauche / horizontal_v3 / bout_droit
```

## Catégorie : batiment — kenney_tiny-town (kit maison)

| nom | description | passable |
|---|---|---|
| town_toit_gris_* / town_toit_rouge_* (8 chacun) | toit ardoise / tuiles : haut_gauche/centre/droit, bas_gauche/centre/droit, lucarne, pignon | non |
| town_mur_bois_* / town_mur_pierre_* (4 chacun) | murs torchis / pierre : bord_gauche, centre, ouverture_porte (oui), bord_droit | non (ouverture oui) |
| town_mur_bois/pierre_fenetre, _porte, _porte_v2, _porte_v3 | fenêtre à volets + 3 portes intégrées au mur | fenêtre non, portes oui |
| town_porte_ville_l1c1..l2c2 | porte de ville 2×2 avec herse (haut `haut`, passage bas `oui`) | haut/oui |
| town_arche_brique_gauche/droite | arche ouverte sur mur de briques (2×1, passage central) | haut |
| town_mur_brique / town_mur_brique_fenetre | mur de briques grises plein / avec niche | non |
| town_puits_haut/bas | puits 1×2 : toit bois + bassin avec seau d'eau | haut/non |
| town_trappe_echelle | trappe en pierre avec échelle qui descend (accès cave) — confirmé John 14/07 | oui |

```
maison type (kit libre, ex. 3 de large) :
toit_x_haut_gauche | toit_x_haut_centre     | toit_x_haut_droit
toit_x_bas_gauche  | toit_x_bas_centre      | toit_x_bas_droit
mur_y_gauche       | mur_y_porte (ou centre)| mur_y_droit
(x = gris|rouge, y = bois|pierre ; lucarne remplace un toit haut,
pignon remplace un toit bas en façade ; vérifié par montage)

porte_ville (2×2) :        puits (1×2) :
l1c1 | l1c2                haut
l2c1 | l2c2                bas
```

## Catégorie : objet — kenney_tiny-town

| nom | description |
|---|---|
| town_piece_or | pièce/jeton doré ovale |
| town_bombe | bombe noire à mèche |
| town_sacoche | sacoche/besace en cuir |
| town_jarre | jarre en terre cuite |
| town_pioche, town_fourche, town_pelle, town_hache, town_marteau, town_serpe | outils |
| town_cle | clé grise |
| town_arc | arc en bois |

## Rejetés — kenney_tiny-town

- `_rejetes/kenney_tiny-town/tilemap.png` + `tilemap_packed.png` : planches d'origine (tuiles séparées toutes présentes).
- `_rejetes/kenney_tiny-town/Tilesheet.txt` : infos techniques Kenney.

## Douteux — validés par John le 14/07/2026

- `town_trappe_echelle` : trappe en pierre avec échelle qui descend — validé.
- `town_serpe` : serpe ou faux — validé (ressemblance serpe).
- Bords de `town_place_pavee` : muret à créneaux → `passable: non` (choix Claude, non contesté).


---

# Passe du 14/07/2026 — kenney_roguelike-characters (préfixe `rogchar_`)

> Usage : kit de personnage en COUCHES à superposer (corps + ceinture + haut +
> coiffure/barbe + chapeau + arme + bouclier) pour composer le perso jouable
> et les PNJ. ⚠️ **Face uniquement, aucune frame de marche** : prévoir
> miroir/assumer l'orientation unique dans les jeux.
> Source : planche `roguelikeChar_transparent.png` (16×16, 1 px d'espacement,
> 54×12) découpée par Claude — 448 cases pleines, 438 tuiles gardées
> (10 doublons pixel-exacts non extraits), tout en `perso/`.

## Catégorie : perso — kenney_roguelike-characters

| famille | nb | contenu |
|---|---|---|
| corps | 8 | 4 teintes (clair, hale, brun, vert orc) × 2 (sans / avec traits du visage) |
| exemple | 14 | personnages pré-assemblés par Kenney (femme_blonde, mamie, barbare_roux, pirate, mage_blanc…) — servent de modèles de superposition |
| ceinture | 20 | large / fine × 10 couleurs (2 formes courbées "tombantes") |
| haut | 92 | chemises, gilets, tuniques, robes col V, bustiers, écharpes… × couleurs (couleur calculée pixel par pixel) |
| manches | 24 | manches seules à poser sur un corps, par couleur |
| cheveux | 40 | courts, longs, mi-longs, mèches, tresses, nattes… × brun, roux, blond, noir, blanc |
| barbe/moustache | 40 | barbes (collier, carrée, pointue, bouc, barbiches) et moustaches × 5 couleurs |
| casque | 12 | casques à cimier (blanc/beige × orange, vert, teal, violet) + casques à cornes |
| coiffe | 16 | coiffes plates et pointues, blanches/beiges, liserés orange/teal/violet/vert |
| capuche | 4 | teal, blanche, violette, verte |
| chapeau | 4 | chapeaux pointus à larges bords (orange, teal, violet, vert) |
| bouclier | 60 | 10 formes (rond, écu, pavois, carré…) × 6 matières (bois, métal blanc, os, bois+fer, quartiers orange-vert, quartiers teal) |
| arme | 104 | bâtons à gemme (4 couleurs × 5 manches), épées/épées courtes/glaives/dagues (bois, cuivre, fer, os, cristal), haches, marteaux, masses, pioches, pics (fer/os/cristal), gourdins courbés, arcs |

Détail complet par fichier : `catalogue.json` (chaque entrée donne la case
d'origine `(l,c)` dans la planche).

### Superposition (ordre des couches, du fond vers l'avant)

```
corps → ceinture → haut (ou manches) → barbe/moustache → cheveux →
casque/coiffe/capuche/chapeau ; arme et bouclier par-dessus, dans les mains
```

## Rejetés — kenney_roguelike-characters

- `_rejetes/kenney_roguelike-characters/roguelikeChar_transparent.png` : planche source (découpée en tuiles).
- `_rejetes/kenney_roguelike-characters/roguelikeChar_magenta.png` : même planche à fond magenta (couleur-clé, inutilisable telle quelle).
- `_rejetes/kenney_roguelike-characters/spritesheetInfo.txt` : infos techniques (16×16, marge 1 px).

## Douteux / interprétations — kenney_roguelike-characters

- Les noms des **hauts** et des **armes** sont des interprétations visuelles
  (à 16 px un "gilet" et un "plastron" se ressemblent) ; l'origine exacte
  (l,c) est dans catalogue.json pour re-vérifier au besoin.
- `rogchar_arc_beige` : forme en S beige-orange lue comme un arc détendu.
- Les 2 tuiles c52-53 rangée 1 lues comme gourdins courbés renforcés.
- Rangées "cotte" et "chemise_bandes" identiques dans les 6 blocs de
  couleur de la planche : 1 seul exemplaire gardé de chaque.

---

## Pack kenney_roguelike-rpg-pack — passe du 14/07/2026 (préfixe `rogrpg_`)

**1704 tuiles 16×16** découpées de la planche unique (`roguelikeSheet_transparent.png`,
marge 1 px), toutes renommées et réparties. Le détail fichier par fichier est dans
`catalogue.json` (origine = ligne/colonne dans la planche source). Usage : tuiles de
MONDE et d'INTÉRIEUR RPG — même style et même taille que les persos `rogchar_`.

**Notices d'assemblage** : les 2 cartes d'exemple du pack ont été rendues en images →
`_references/rogrpg_apercu_village.png` (village : chemins organiques, lac à berges de
sable, camp, cimetière, maisons montées) et `_references/rogrpg_apercu_interieur.png`
(manoir : murs, sols, tapis, banquet, chambre, cuisine). Ce sont les modèles à imiter
pour construire des maps.

**Planches contact** : `_references/planche_rogrpg_<categorie>.png` (7 planches, nom
sous chaque tuile) pour contrôle visuel rapide.

### Répartition

| Catégorie | n | Contenu principal |
|---|---|---|
| decor | 719 | meubles complets (lits, chaises, tables, armoires, commodes, miroirs), arbres/sapins (petits + grands 1×2), buissons, haies, tapis 3×3 (6 modèles), tables de banquet vues de haut (nappe pleine/liseré, H et V), clôtures, tombes/croix, bannières/rideaux/tentures (3 couleurs), cheminées, torches/bougeoirs, rochers, bibliothèques |
| batiment | 583 | 5 familles de murs (sable, gris, ardoise, bois, adobe) : caps vus de haut, faces, corniches, arches 3 tuiles, fresques, piliers ; toits plats 3×3 ×6 couleurs ×2 variantes ; toits pentus (pointes, pignons, pans 3×3) ; ~80 portes/fenêtres/niches ; tour-clocher beige (2×9) ; tentes 2×2 (verte, beige) |
| sol | 208 | herbe/terre/roche/sable pleins, pavés ×3, planchers ×10, **chemin_terre / chemin_pierre / plage_sable** (parcelles organiques : coins ronds/carrés/déchiquetés, 3×3 complet, bouts, seul), 6 taches colorées 3×3, rails complets (virages, T, croix, bouts, plaque tournante 2×2, grandes courbes 2×2) |
| objet | 97 | tonneaux, sacs, coffres (2 tuiles), or/gemmes, potions, livres, nourriture, leviers |
| eau | 37 | eau pleine, îlot et dalle en 2×2 (motif au coin commun), étang herbe 3×3, bassin margelle 3×3, rochers émergés, nénuphars |
| ui | 36 | flèches directionnelles + boutons ronds, 6 palettes de couleur |
| vehicule | 24 | wagonnets de mine (vide/terre/pierres/or/charbon × profil/face × 2 cadres), barques |

### Familles terrain (rôles vérifiés sur planche contact)

- `chemin_terre`, `chemin_pierre`, `plage_sable` : même gabarit — 3×3 complet
  (coins/bords/centre) + coins arrondis/carrés/déchiquetés 2×2 + bouts + `seul`.
  Pas de virages/T/croix : ce sont des taches organiques, on dessine les chemins
  en juxtaposant (voir aperçu village). `plage_sable` = berge du lac.
- `rails` : horizontal/vertical, 4 virages, t_haut/t_bas, croix, 4 bouts (butoir),
  plaque tournante 2×2, 2 grandes courbes 2×2, croisement 2×2, doubles voies.
- `toit_<couleur>` (bois, gris, beige, vert, rouille, turquoise) : 3×3 complet ×2
  variantes (lisse, à crochets). `pan_toit_<sable|marron|ardoise|bois>` : 3×3 + pointes
  et pignons pour maisons (voir maisons montées dans l'aperçu village).
- `tapis_<vert|orange|turquoise>` (+ `_orne`) : 3×3 complets.

### Ensembles multi-tuiles (plans de montage)

```
maison type village (voir apercu_village) :
toit_pente_X_pointe_g | toit_pente_X_pointe_d      grande armoire (2×2) :
toit_pente_X_milieu_g | toit_pente_X_milieu_d      grande_armoire_haut_gauche | _haut_droit
mur_X_face + porte/fenêtre au choix                grande_armoire_bas_gauche  | _bas_droit

tour-clocher (c13-14) : créneaux / corniche / chapiteaux / fûts / bases /
  flèche 2×3 / avant-toits — colonne gauche + colonne droite à juxtaposer.
tente (2×2) : tente_X_hg|hd / tente_X_bg|bd.
bibliothèque : rangée haute (livres) / milieu (vide) / basse (livres) × gauche,
  centre_v1..v4, droite — longueur libre.
arche (3 tuiles) : arche_X_linteau_gauche|centre|droit au-dessus de
  arche_X_montant_gauche | passage | montant_droit (passage passable).
eau : îlot et dalle = 2×2 dont le motif est au COIN COMMUN des 4 tuiles.
```

### Douteux — à contrôler par John (108 tuiles, par famille)

| Famille | Mon interprétation | Doute |
|---|---|---|
| buisson_automne / buisson_fleuri (2×2+3×3 ×2) | gros massifs orange/violet | buissons ou champs de culture ? |
| tache_lin/verte/blanche/orange/creme/turquoise (54) | taches de sol colorées | usage réel inconnu (neige ? zones peintes ?) |
| silhouette_capuche / silhouette_bandeau | statues noires | ou personnages-ombres ? |
| etendage_* / filet_* (6) | corde à linge + filet | ou pont de corde / filet de pêche ? |
| fontaine_orbe | fontaine d'eau | ou sort/orbe magique ? |
| sac_couchage_vert | sac de couchage (camp) | ou panier ? |
| socles/dalles (socle_*, dalle_*) | socles et dalles posables | ou plaques de pression (mécanisme) ? |
| girouette_aigle | girouette/trophée aigle | aigle ou coq ? |
| outil_mural_v1/v2, chevalet vu ailleurs | outils accrochés | nature exacte ? |
| papiers_v1/v2, pot_fente, entonnoir, sabot_bois, etabli_portant, bouton_mural_v1/v2, levier «petits», dossier_planche | petits objets | interprétation incertaine |

**Reste du pack** : dossiers vides `kenney_roguelike-rpg-pack/` insupprimables côté
Claude (montage) — à supprimer sous Windows. Sources en `_rejetes/kenney_roguelike-rpg-pack/`
(2 planches, 2 .tmx, 1 info).

**Journal 14/07/2026** : passe complète en une session. 1704/1704 tuiles mappées
(vérification de couverture programmée : 0 manquante, 0 en trop, 0 doublon de nom),
copies vérifiées bit à bit, catalogue.json +1704 entrées. Correction en cours de passe :
bouts de rails inversés (butoir), paires d'armoires recalées (c30-39), tables de banquet
re-mappées après zoom correctif. PAS de commit (décision John).
