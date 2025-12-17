# 🚀 Patterns : Physique & Mouvement (Standard Q5/P5Play)

La simulation physique est désormais gérée par **P5Play** (basé sur Box2D), ce qui simplifie grandement le code.

## 1. La Puissance des Sprites

Au lieu de gérer manuellement les vecteurs, nous manipulons les propriétés des objets `Sprite` de P5Play.

### Le Trio Sacré (Propriétés de Sprite) :
1.  **Position (`sprite.x`, `sprite.y`)** : Où je suis.
2.  **Vitesse (`sprite.vel.x`, `sprite.vel.y`)** : De combien je bouge à chaque frame.
3.  **Accélération (`sprite.acc.x`, `sprite.acc.y`)** : La force du moteur / gravité.

```javascript
/* Dans votre logique de jeu (ex: Ship.js) */

// Création d'un sprite
let ship = new Sprite(width/2, height/2, 50);

// Appliquer une force (ex: moteur)
function applyThrust() {
    // P5Play gère l'application de la force et la mise à jour de la vitesse/position
    ship.applyForce(0.5, ship.rotation); 
}

// Mise à jour (Automatique)
// P5Play met à jour la position du sprite automatiquement dans la boucle draw().
// Vous n'avez plus besoin d'une fonction update() manuelle pour la physique.
```

## 2. Le Mouvement de Caméra ("Scrolling")

Pour un jeu plus grand que l'écran (comme l'ancien Forest), P5Play offre une gestion de caméra intégrée.

### Technique : `camera`
Utilisez l'objet `camera` global pour suivre un sprite.

```javascript
/* Dans q5.setup() */
let player = new Sprite(0, 0, 20);
camera.x = player.x;
camera.y = player.y;

/* Dans q5.draw() */
// La caméra suit automatiquement le joueur
camera.x = player.x;
camera.y = player.y;

// Le HUD (Score) doit être dessiné en utilisant camera.off()
camera.off();
    fill(255);
    text("Score: " + score, 20, 20);
camera.on();
```

## 3. L'Espace Infini ("Wrap Around")

Utilisé dans **Asteroids**. Si on sort à droite, on rentre à gauche.

### Technique : `sprite.wrap()`
C'est désormais une méthode intégrée à chaque sprite.

```javascript
function q5.draw() {
    // Le sprite réapparaît de l'autre côté de l'écran
    ship.wrap(); 
}