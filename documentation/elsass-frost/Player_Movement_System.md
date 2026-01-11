# Système de Déplacement de Personnage - Guide d'Intégration

## Vue d'ensemble

Ce document décrit le système de déplacement de personnage développé et testé dans `test-personnage/v1`, prêt à être intégré dans Elsass Frost.

## Architecture

### Composants Créés

#### 1. PathfindingSystem.js
**Localisation**: `systems/PathfindingSystem.js`

Système de pathfinding A* pour calculer les chemins sur la grille.

**Fonctionnalités**:
- Algorithme A* optimisé avec protection contre les boucles infinies
- Navigation stricte sur cases de type `road` uniquement
- Retourne un tableau de positions `{col, row}` ou `null` si aucun chemin

**API**:
```javascript
PathfindingSystem.findPath(startCol, startRow, targetCol, targetRow)
// Retourne: [{col, row}, ...] ou null
```

**Fichier complet**: [PathfindingSystem.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/PathfindingSystem.js)

---

#### 2. Player.js
**Localisation**: `systems/Player.js`

Classe représentant un personnage mobile sur la grille.

**Propriétés importantes**:
```javascript
this.sprite.collider = 'kinematic'  // Permet le mouvement sans collision
this.sprite.layer = 100             // Toujours au-dessus des bâtiments
this.speed = 4                      // Pixels par frame
```

**Méthodes**:
- `setPath(path)`: Définit le chemin à suivre
- `update()`: Appelé chaque frame pour gérer le mouvement
- `moveAlongPath()`: Logique de déplacement fluide

**Fichier complet**: [Player.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/Player.js)

---

#### 3. PlayerSystem.js
**Localisation**: `systems/PlayerSystem.js`

Gestionnaire global du joueur.

**Méthodes**:
- `init()`: Initialise le joueur à une position de départ
- `update()`: Appelé chaque frame dans `draw()`
- `moveTo(targetCol, targetRow)`: Déclenche le pathfinding et le déplacement

**Fichier complet**: [PlayerSystem.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/PlayerSystem.js)

---

## Modifications Nécessaires

### 1. BuildingSystem.js

**Ajout requis** (ligne ~461):
```javascript
b.layer = 0; // Tous les bâtiments en dessous du joueur
```

Cette ligne garantit que tous les bâtiments (routes, maisons, etc.) sont rendus sous le personnage.

**Localisation exacte**: Dans la fonction `placeBuilding()`, après `b.gridPos = { col, row };`

---

### 2. UIManager.js

**Nouvelle fonction à ajouter**:
```javascript
movePlayerToCurrent: function() {
    if (this.currentDetailBuilding && window.PlayerSystem) {
        const b = this.currentDetailBuilding;
        const gridCol = b.gridPos.col;
        const gridRow = b.gridPos.row;
        const bInfo = Config.BUILDINGS[b.buildingId];
        const w = bInfo.width || 1;
        const h = bInfo.height || 1;
        
        // Trouver la route la plus proche autour du bâtiment
        let nearestRoad = null;
        let minDistance = Infinity;
        
        const playerCol = PlayerSystem.player.gridCol;
        const playerRow = PlayerSystem.player.gridRow;
        
        // Parcourir le périmètre autour du bâtiment
        for (let i = -1; i <= w; i++) {
            for (let j = -1; j <= h; j++) {
                // Ignorer les cases à l'intérieur du bâtiment
                if (i >= 0 && i < w && j >= 0 && j < h) continue;
                
                const checkCol = gridCol + i;
                const checkRow = gridRow + j;
                
                // Vérifier limites
                if (checkCol < 0 || checkCol >= Config.GRID_SIZE || 
                    checkRow < 0 || checkRow >= Config.GRID_SIZE) continue;
                
                // Vérifier si c'est une route
                if (GridSystem.grid[checkCol][checkRow] === 'road') {
                    // Calculer distance Manhattan depuis le joueur
                    const dist = Math.abs(checkCol - playerCol) + Math.abs(checkRow - playerRow);
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearestRoad = { col: checkCol, row: checkRow };
                    }
                }
            }
        }
        
        if (nearestRoad) {
            console.log(`Déplacement vers route adjacente à ${bInfo.name} [${nearestRoad.col}, ${nearestRoad.row}]`);
            PlayerSystem.moveTo(nearestRoad.col, nearestRoad.row);
        } else {
            console.log(`Aucune route trouvée autour de ${bInfo.name}`);
        }
    }
}
```

**Fichier de référence**: [UIManager.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/UIManager.js#L235-L284)

---

### 3. index.html

**Ajout des scripts** (après les autres scripts systems):
```html
<script src="systems/PathfindingSystem.js"></script>
<script src="systems/Player.js"></script>
<script src="systems/PlayerSystem.js"></script>
```

**Ajout du bouton dans le panneau de détail**:
```html
<div class="detail-footer">
    <button class="hud-btn" onclick="UIManager.movePlayerToCurrent()">VENIR ICI</button>
    <button class="hud-btn dismantle-btn" onclick="BuildingSystem.dismantleCurrent()">DÉMANTELER</button>
</div>
```

**Fichier de référence**: [index.html](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/index.html#L348)

---

### 4. sketch.js

**Dans `setup()`**:
```javascript
if (window.PlayerSystem) PlayerSystem.init();
```

**Dans `draw()`**:
```javascript
if (window.PlayerSystem) {
    PlayerSystem.update();
}
```

**Fichier de référence**: [sketch.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/sketch.js)

---

## Points Critiques

### 1. Ordre des Layers
- **Bâtiments**: `layer = 0`
- **Joueur**: `layer = 100`
- Cet ordre garantit que le joueur est toujours visible

### 2. Collider du Sprite
Le joueur doit avoir `collider = 'kinematic'` pour se déplacer sans être bloqué par les collisions physiques de p5play.

### 3. Position Initiale
Choisir une position de départ sur une route existante pour éviter les erreurs de pathfinding.

### 4. Pathfinding Strict
Le système ne permet que le déplacement sur les routes. Si aucun chemin n'existe, `findPath()` retourne `null`.

---

## Problèmes Résolus

| Problème | Solution |
|----------|----------|
| Sprite ne bouge pas | `sprite.collider = 'kinematic'` |
| Sprite caché sous les routes | `sprite.layer = 100` et `building.layer = 0` |
| Chemin vide | Vérifier position initiale sur une route |
| Logs excessifs | Supprimer logs frame-by-frame |

---

## Tests Effectués

✅ Déplacement sur routes du générateur  
✅ Déplacement sur routes placées manuellement  
✅ Pathfinding A* fonctionnel  
✅ Sprite toujours visible au-dessus des bâtiments  
✅ Bouton "Venir ici" dans le panneau de détail  
✅ Ciblage automatique de la route la plus proche  

---

## Prochaines Étapes

1. **Intégration dans Elsass Frost**
   - Copier les 3 fichiers systèmes
   - Appliquer les modifications listées ci-dessus
   - Tester avec la grille et les bâtiments existants

2. **Améliorations Futures**
   - Animations de marche
   - Système de PNJ utilisant le même pathfinding
   - Optimisation de la vitesse selon le terrain
   - Effets visuels (trail, particules)

---

## Fichiers de Référence

Tous les fichiers sources sont disponibles dans:
`c:\Users\George\dyad-apps\game-4\public\games\test-personnage\v1\`

- [systems/PathfindingSystem.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/PathfindingSystem.js)
- [systems/Player.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/Player.js)
- [systems/PlayerSystem.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/PlayerSystem.js)
- [systems/UIManager.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/UIManager.js)
- [systems/BuildingSystem.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/systems/BuildingSystem.js)
- [sketch.js](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/sketch.js)
- [index.html](file:///c:/Users/George/dyad-apps/game-4/public/games/test-personnage/v1/index.html)
