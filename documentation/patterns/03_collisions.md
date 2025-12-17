# 💥 Patterns : Collisions & Interactions (Standard Q5/P5Play)

## 1. Remplacement des calculs manuels de distance
Ancien paradigme p5.js : vérifications manuelles avec `dist()` et conditions `if`.

Nouveau paradigme p5play : méthodes intégrées `overlaps()`, `collides()`, `overlapping()` avec hitboxes automatiques.

```javascript
// ❌ AVANT (p5.js manuel - Snake)
eat(food) {
    let d = dist(this.pos.x, this.pos.y, food.x, food.y);
    if(d < 1) {  // Calcul manuel
        this.total++;
        return true;
    }
}

// ✅ APRÈS (p5play - 1 ligne)
if(snake.overlaps(foodGroup)) {  // Détection auto
    let eaten = snake.overlapping(foodGroup);  // Sprite touché
    eaten.remove();
    snake.life++;  // Compteur auto
}
```
## 2. Méthodes de collision officielles p5play
| Méthode | Retour | Usage | Exemple Snake |
|---|---|---|---|
| `sprite.overlaps(other)` | `boolean` | Détection sans destruction | `snake.overlaps(foodGroup)` |
| `sprite.collides(other)` | `boolean` | Collision avec callback | `snake.collides = () => gameOver()` |
| `sprite.overlapping(group)` | `array<Sprite>` | Liste des sprites touchés | `let eaten = snake.overlapping(food)` |
| `group.overlaps(group)` | `boolean` | Groupe vs groupe | `bullets.overlaps(enemies)` |

## 3. Configuration des hitboxes (doc officielle)
```javascript
// Hitbox par défaut = taille du sprite
let snake = sprite(100, 100, 20);  // Hitbox 20x20

// Hitbox personnalisée
snake.hitbox = rect(10, 10);  // Plus petite que visuel
snake.debug = true;           // Affichage hitbox (dev)

// Collision pixel-perfect (images)
snake.img = 'snake.png';
snake.useImageHitbox = true;  // Basé sur pixels transparents
```
## 4. Callbacks de collision (gameplay)
```javascript
// 1. Callback global sur sprite
snake.collides = () => {
    if(window.GameSystem) {
        window.GameSystem.Score.submit(snake.life * 100);
    }
    states.next('gameover');
};

// 2. Collision conditionnelle
snake.overlaps(foodGroup, () => {
    let eaten = snake.overlapping(foodGroup);
    eaten.remove();
    // Nouveau food auto
    newFood();
});

// 3. Collision avec filtre
if(snake.overlaps(enemies, true)) {  // true = callback
    snake.life--;
}
```
## 5. Groupes vs collisions optimisées
```javascript
// ❌ MAUVAIS : vérifications individuelles
for(let enemy of enemies) {
    if(player.overlaps(enemy)) enemy.remove();
}

// ✅ BON : groupe optimisé (Quadtree interne)
player.overlaps(enemiesGroup, enemy => enemy.remove());

// Performance : O(1) vs O(n²) grâce à Box2D + Quadtree
```
## 6. Flux de collision automatique
```javascript
q5.draw = () => {
    clear();
    
    // TOUTES LES COLLISIONS SONT AUTOMATIQUES
    // 1. overlaps() / collides() vérifiées chaque frame
    // 2. Callbacks exécutés
    // 3. Hitbox mises à jour
    
    allSprites.draw();  // Rendu avec collisions appliquées
};
```
## 7. Bonnes pratiques vérifiées (doc p5play)
Configuration collision World :

```javascript
World.check = true;      // Active collisions (défaut)
allSprites.collider = 'dynamic';  // Physique complète
foodGroup.collider = 'static';    // Nourriture immobile
```
Debug collisions (dev) :

```javascript
allSprites.debug = true;  // Hitbox + vecteurs visibles
camera.debug = true;      // Zone caméra
// Performance : max 500 sprites en collisions actives recommandées.
```
Intégration GameSystem Snake
```javascript
// Collision serpent → queue (auto)
snake.collides(tailGroup, () => {
    window.GameSystem.Score.submit(snake.life * 100);
    states.next('gameover');
});