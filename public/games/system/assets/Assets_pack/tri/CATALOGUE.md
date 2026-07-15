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