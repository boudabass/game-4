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

- *(vide — aucun pack encore trié)*
