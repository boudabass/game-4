# 💥 Patterns : Collisions & Interactions (Standard Q5/P5Play)

La détection de collision est désormais gérée par le moteur de physique de **P5Play**, ce qui élimine le besoin de calculs manuels.

## 1. Collision entre Sprites ou Groupes

P5Play utilise des méthodes simples pour gérer les interactions.

### Collision avec Callback (Le plus courant)
Détecte la collision et exécute une fonction immédiatement.

```javascript
// Si le joueur touche un powerup (qui est dans le groupe 'powerups')
player.collides(powerups, (playerSprite, powerupSprite) => {
    powerupSprite.remove(); // Le powerup disparaît
    playerSprite.score += 100;
});
```

### Overlap (Chevauchement)
Vérifie si deux sprites se chevauchent sans appliquer de force de rebond (utile pour les zones de déclenchement ou la nourriture).

```javascript
if (player.overlaps(foodGroup)) {
    let eaten = player.overlapping(foodGroup);
    eaten.remove();
}
```

## 2. Hitbox et Formes

P5Play gère les formes de collision automatiquement (cercle, rectangle, polygone).

*   **Cercle vs Cercle :** Par défaut pour les sprites créés sans forme spécifique.
*   **Rectangle vs Rectangle (AABB) :** Spécifiez la forme lors de la création du sprite.

```javascript
// Création d'un sprite rectangulaire
let block = new Sprite(100, 100, 50, 50, 'box'); 
```

## 3. Optimisation : Le Moteur de Physique

L'optimisation des collisions (comme l'ancien Quadtree) est gérée en interne par le moteur de physique (Box2D) utilisé par P5Play. Vous n'avez plus besoin de vous en soucier.

## 4. Gestion des "Hitbox"
La hitbox est définie par la taille du sprite.

**Conseil :** Si vous utilisez une image (sprite.img), vous pouvez ajuster la taille de la hitbox indépendamment de la taille de l'image affichée.

```javascript
class Enemy {
    constructor(x, y) {
        // Crée un sprite de 50x50
        this.sprite = new Sprite(x, y, 50, 50); 
        this.sprite.img = 'assets/monster.png';
        
        // Réduit la hitbox à 30x30 pour un jeu plus indulgent
        this.sprite.collider = 'box';
        this.sprite.w = 30;
        this.sprite.h = 30;
    }
}