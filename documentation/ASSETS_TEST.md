# Assets Test — outil de tri et validation des packs (jeu interne)

> Créé le 10/07/2026. Jeu-outil sur le socle engine/v1, dans
> `public/games/assets-test/v1/`. À enregistrer via `/admin` et à laisser
> **masqué** : c'est un outil pour John, pas un jeu client.
> Doc liée : `ASSETS_TEXTURE_PACKS.md` (liste des packs et leur usage).

## À quoi ça sert

Les packs Kenney dans `public/games/system/assets/Assets_pack/` sont livrés
"en vrac" et ne se ressemblent pas entre eux. Avant de les utiliser dans les
jeux, il faut les passer en revue : garder, modifier ou rejeter chaque
fichier, et décider dans quelle catégorie il sera rangé. L'outil sert à faire
ce tri directement en jeu, sur PC comme sur mobile, 100% clic/tap.

**L'outil ne déplace PAS les fichiers.** Il enregistre des *décisions*
(statut + catégorie + raisons). Le rangement physique dans `assets/` et les
retouches (recoloration, redécoupe...) sont faits ensuite par Claude en
session, à partir de l'export JSON ou de la sauvegarde cloud.

## Les 4 écrans

1. **Packs** — liste des packs avec avancement du tri (barre verte/orange/
   rouge). Boutons : Bac à sable, Export JSON.
2. **Fichiers** — grille de vignettes d'un pack, filtres (à trier / OK /
   à modifier / rejetés). Cadre coloré = statut. Les sons (♪) s'écoutent.
3. **Visionneuse** — zoom (molette ou boutons), déplacement au doigt, fond
   sombre/clair/damier (transparence), grille de découpe (T:8→64),
   navigation ‹ › dans le pack. Classement : statut (Validé / À modifier /
   Rejeté), catégorie de destination, raisons si "À modifier".
   Mode SÉLECT. : taper des tuiles puis →BAC pour les envoyer au bac à sable.
4. **Bac à sable** — on peint les tuiles retenues sur une grille (peindre /
   gomme, zoom) pour juger assemblage et échelle ; l'outil AVATAR pose un
   personnage qui se déplace vers la case tapée (proportions perso/décor).

## Où vont les données

- **Sauvegarde cloud** : table `save` de PostgreSQL via `Engine.Save`
  (clé du jeu assets-test), auto-save 1,5 s après chaque modif — badge 💾 en
  bas à droite. Contenu : décisions, palette du bac à sable, grille peinte.
- **Export JSON** : bouton sur l'écran Packs → télécharge
  `assets-decisions.json` (à donner à Claude pour appliquer le tri).
- Format d'une décision : `"pack/chemin.png": { s: "ok"|"mod"|"ko",
  cat: "sol|decor|batiment|perso|objet|ui|vehicule|eau|son|autre",
  why: ["recolorer", ...], t: timestamp }`.
  Catégories et raisons modifiables dans `config.js`.

## Route API dédiée

`GET /api/assets/scan` (`src/app/api/assets/scan/route.ts`, session requise)
liste l'arborescence réelle de `Assets_pack/` côté serveur. Avantage : après
un tri/renommage manuel des dossiers, l'outil voit l'état réel sans rebuild
de manifeste. Limites : profondeur 6, 20 000 fichiers.

## Workflow de tri (à répéter pack par pack)

1. John trie dans l'outil (statuts + catégories, tests au bac à sable).
2. Export JSON → session Claude : déplacement des fichiers validés vers la
   bonne arborescence `assets/`, modifications demandées (recolor, découpe),
   suppression des rejetés.
3. **Mise à jour de la doc à chaque passe** : section "Journal des tests"
   ci-dessous + `ASSETS_TEXTURE_PACKS.md` (usage réel constaté des packs).

## Journal des tests

> À compléter au fil des passes de tri. Une entrée par pack testé :
> date, verdict global, décisions notables, modifs faites.

### 10/07/2026 — Rattrapage kenney_minimap-pack (renommage)

Une première passe mécanique (`tri_apply.ps1`, exécutée par John sous
Windows) avait déjà déplacé le pack : 150 tuiles (6 styles × 25) vers
`Assets_pack/tri/ui/` en gardant les noms Kenney bruts (`mmap_a_tile_0000.png`...,
inutilisables tels quels), et les 6 planches + `Tilesheet.txt` vers
`Assets_pack/_rejetes/kenney_minimap-pack/`. Ce rattrapage a consisté à
regarder les 150 tuiles (8×8 px, identiques en forme entre les 6 styles,
seule la couleur change) et à les renommer par rôle :

- **125 tuiles "route"** (`mmap_route_<style>_<role>.png`) : réseau de
  chemins complet par style — horizontal, vertical (+ variantes v2,
  doublons pixel-exacts), croix, 4 T, 4 virages, point isolé, case vide,
  2 ponts simples. Convention de rôles appliquée intégralement (voir
  CLAUDE.md skill tri-assets-game4).
- **25 icônes** (`mmap_icone_<style>_<nom>.png`) : 2 marqueurs pleins
  (jaune/orange, couleur fixe quel que soit le style), crâne, monstre,
  lettres S et X, + pont sur rivière (horizontal/vertical, deviné par la
  couleur violette = eau).

⚠️ **Écart de chemin constaté** : la destination réelle du tri est
`public/games/system/assets/Assets_pack/tri/` (le script `tri_apply.ps1`
crée l'arborescence ici), alors que le skill de tri documente
`public/games/system/assets/tri/` (un niveau au-dessus, hors `Assets_pack/`).
Pas de déplacement fait dans cette passe (risque inutile pour un simple
rattrapage de noms) — à trancher : soit adapter la doc au chemin réel,
soit migrer `tri/` au bon niveau lors d'une prochaine session.

⚠️ **2 rôles à confirmer par John** (nom basé sur la couleur violette
observée = probablement de l'eau, mais l'usage minimap n'est pas encore
implémenté) : `pont_riviere_horizontal` et `pont_riviere_vertical`. Le
reste du classement est certain (formes non ambiguës).

Catalogue créé : `Assets_pack/tri/CATALOGUE.md`.

⚠️ **Commit non fait** : `.git/index` corrompu (`unknown index entry
format`) + `.git/HEAD.lock` et `.git/objects/maintenance.lock` résiduels,
tous deux **impossibles à supprimer côté Claude** (`Operation not permitted`
sur le montage). Idem que la session du 07/07 sur Elsass Frost v2 : John
doit supprimer ces 2 fichiers `.lock` sous Windows avant qu'un commit soit
possible.

### 10/07/2026 — kenney_tiny-farm (tri complet, premier passage)

Montage Cowork illisible pour tout `Assets_pack/kenney_tiny-farm/` (ls/find/
listdir renvoient vide, alors que `git ls-tree`/`git cat-file` y accèdent
sans problème) — même symptôme que documenté dans CLAUDE.md, mais ici sur
un pack qui n'avait encore jamais été touché. Suppression de fichiers
impossible aussi (`Operation not permitted`, testé sur un fichier tout
juste créé). Méthode utilisée : extraction des 132 tuiles via
`git cat-file -p HEAD:...`, analyse visuelle tuile par tuile (planche
`tilemap_packed.png` annotée + zooms individuels), copies déjà renommées
écrites **directement** en tri/ (pas de déplacement des originaux — écrire
de nouveaux fichiers fonctionne sur ce mount, contrairement à supprimer).

**Résultat** : 132 tuiles (16×16 px, grille 12×11, 1px d'espacement) toutes
classées et renommées — aucun `Tilesheet.txt` de Kenney ne donnait les noms
(juste les dimensions), tout a été identifié à l'œil :

- **16 sol** : buttes de terre labourée (isolée, sillon vertical 3 rôles,
  sillon horizontal 4 tuiles × 2 teintes).
- **43 decor** : sapin (3 stades de croissance), 6 familles de cultures
  (carotte, aubergine, maïs, tomate — 5 stades au lieu de 4 —, chou, blé)
  avec leurs tuiles de champ, meubles (bancs, bac à eau, mangeoire),
  buisson à baies, tas de pierres, tournesol, ruche, herbe, pousse en pot.
- **24 batiment** : ensemble `grange` complet (mur 3×4 + toit 3×4 tuiles,
  assemblage vérifié par recomposition de la planche source) — plan de
  montage dans `CATALOGUE.md`.
- **5 perso** : 2 personnages fermiers + mouton/vache/poule.
- **42 objet** : outils (gant, pelle, hache), récipients (seaux, pots,
  coffres, sac), branches ramassables (4 variantes), + 24 icônes de récolte
  (icône/sac/caisse/présentoir × 6 cultures).
- **1 ui** : icône "?".
- **1 rejeté** : tuile quasi vide (idx 130, 2px de bruit résiduel).

Catalogue mis à jour (`tri/CATALOGUE.md`) + premier `tri/catalogue.json`
créé (131 entrées, format machine pour les jeux — n'inclut pas encore les
tuiles minimap de la passe précédente, à fusionner lors d'une prochaine
passe).

⚠️ **4 tuiles douteuses à confirmer par John** : `farm_taupiniere` (rôle
incertain), `farm_ruche` (déduit de la forme, pas garanti), `farm_pain`
(pourrait être un fromage rond), et les rôles précis du set
`sol_butte_seul/vert_haut/centre/bas` (déduits par élimination, jamais
vérifiés par un assemblage en jeu réel).

⚠️ **Suppression de l'original non faite** (même blocage `Operation not
permitted` que pour les `.lock`) : script `tri_apply_tiny-farm.ps1` généré
à la racine du repo (nom différent de `tri_apply.ps1` existant, lui aussi
illisible sur ce mount — probablement un reliquat de la passe minimap).
John doit l'exécuter sous Windows pour supprimer
`Assets_pack/kenney_tiny-farm/` (son contenu est déjà dupliqué et renommé
dans `tri/` + `_rejetes/kenney_tiny-farm/`).

⚠️ **Commit non fait**, même blocage que la passe minimap (`.git/HEAD.lock`
et `.git/objects/maintenance.lock` toujours présents et impossibles à
supprimer côté Claude — confirmé de nouveau ce jour). À faire par John
après avoir lancé le script PowerShell : vérifier `git status`, supprimer
les `.lock` s'ils traînent encore, puis committer via GitHub Desktop.

Planches de contrôle générées : `tri/_references/planche_sol.png`,
`planche_decor.png`, `planche_batiment.png`, `planche_perso.png`,
`planche_objet.png`, `planche_ui.png` (fond damier, nom sous chaque tuile).
