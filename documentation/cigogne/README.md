# Cigogne — jeu arcade (v1)

> Jeu de test physique type Flappy Bird, sur le socle `system/` + `engine/v1`.
> Chemin : `public/games/cigogne/v1/`.

## Concept

Une cigogne vole entre des obstacles à colombage (thème alsacien) au lieu de
tuyaux verts génériques. Clic / ESPACE = battement d'aile (impulsion vers le
haut), gravité constante sinon. Un point par obstacle franchi.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Charge p5.js, `system.js`, l'engine v1, puis `config.js` et `sketch.js` |
| `config.js` | Constantes de gameplay (gravité, vitesse, couleurs, hitbox…) exposées sur `window.CigogneConfig` |
| `sketch.js` | Logique du jeu (machine d'états MENU/GAME/OVER, physique, collisions, dessin) |
| `assets/cigogne_vol.png` | Spritesheet d'animation de vol : 8 frames de 256×256px, alignées sur une seule ligne (2048×256 au total), fond transparent |

## Animation de la cigogne

Le sprite est découpé dans `draw()` via les paramètres source de `image()` :

```js
image(birdImg, x, y, w, h, spriteFrame * 256, 0, 256, 256);
```

`spriteFrame` avance de 1 toutes les 5 frames p5 (`frameCount % 5 === 0`) et
boucle sur 8 valeurs (`SPRITE_NB_FRAMES`). Pas besoin que la dernière frame
soit identique à la première : la boucle `% NB_FRAMES` gère l'enchaînement.

## Hitbox

Le sprite 256×256 contient beaucoup de marge transparente (les ailes
déployées prennent large sur certaines frames mais pas sur d'autres). Utiliser
toute la case comme hitbox donnait des collisions trop généreuses (on touchait
un tuyau juste en frôlant le bout d'une aile).

Solution retenue : une hitbox carrée fixe, centrée sur `bird.x/y`, dont la
taille est `bird.size * C.hitboxRatio` (actuellement `0.5`). Le corps de la
cigogne reste à peu près à la même position sur toutes les frames ; seules
les ailes bougent, et elles ne comptent pas pour la collision. C'est le même
principe que Flappy Bird original (hitbox toujours plus petite que le sprite
affiché). Ajustable dans `config.js` sans toucher au code.

## Obstacles — colombage alsacien

Remplace les tuyaux verts par un rendu procédural (pas d'assets images,
tout dessiné en code dans `sketch.js`) :

- **Bas** (`drawColombageBas`) : façade crème, poutre horizontale en haut,
  poutres verticales sur les bords, croix de Saint-André si assez de hauteur,
  petite fenêtre sombre près du haut.
- **Haut** (`drawColombageHaut`) : pan de toit couleur tuile, poutres
  verticales, avant-toit qui dépasse légèrement en bas — pour donner
  l'impression de voler entre deux bâtiments dans une ruelle.

Les rectangles de collision (`p.x`, `p.w`, `p.gapY`, `p.gapH`) n'ont pas
changé, seul l'habillage visuel a été modifié.

Couleurs dans `config.js` : `wallFacade`, `beam`, `roof`, `roofEdge`, `window`.

## Historique des décisions

- **05/07/2026** : ajout du spritesheet de vol (8 frames 256×256, fond
  transparent) à la place de l'image fixe `cigogne.png`. Génération de
  l'asset galère avec Gemini (grilles mal comprises, boucles mal formées) —
  finalement fait par John manuellement.
- **05/07/2026** : réduction de la hitbox (`hitboxRatio: 0.5`) pour éviter
  les collisions injustes sur les frames ailes déployées.
- **05/07/2026** : remplacement des tuyaux par des obstacles à colombage
  (rendu procédural, pas d'assets) pour coller au thème alsaco de l'arcade.

## Pistes non traitées

- Hitbox par frame (plus précis mais plus lourd à maintenir) : jugé pas
  nécessaire, le ratio fixe centré sur le corps suffit pour un gameplay
  agréable.
- Variantes d'obstacles (largeurs différentes, assets de vraies maisons à
  colombage) : évoqué mais pas implémenté, le procédural actuel suffit pour
  l'instant.
