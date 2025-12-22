# 🔄 Game Loop — Similitude (Logique de Puzzle)

Le cycle de jeu est basé sur l'interaction simple du joueur avec la grille, suivie d'une cascade de calculs automatiques.

## 1. 🖱️ Actions du Joueur (InputManager & sketch.js)

Le jeu utilise un système de clic en deux étapes :

| Étape | Action | Résultat | Coût |
| :--- | :--- | :--- | :--- |
| **Clic 1** | Tap sur un item | L'item est marqué `SELECTED` (Glow statique). | 0 ⚡ |
| **Clic 2** | Tap sur une case vide | L'item sélectionné est déplacé (`snap-move`). | -1 ⚡ |
| **Clic 2** | Tap sur un autre item | **Swap permanent** des deux items. | -1 ⚡ |
| **Clic 2** | Tap sur l'item sélectionné | Désélection. | 0 ⚡ |

> **Règle :** Le déplacement (vers vide) et l'échange (swap) sont toujours possibles et permanents, même s'ils ne créent pas de combo.

## 2. ⚙️ Logique de Déplacement (GridSystem.moveItem / swapItems)

Après un mouvement réussi (déplacement ou swap) :

1.  `GameState.energy` est décrémenté de 1.
2.  L'item est déplacé/échangé.
3.  `GridSystem.checkAndProcessFusions()` est appelé.

## 3. 💥 Fusion et Gravité (GridSystem)

### A. Gravité (`applyGravity`)
*   La gravité est **désactivée** dans ce mode de jeu. Les cases fusionnées restent vides, créant des trous que le joueur doit gérer.

### B. Fusion (`checkAndProcessFusions`)
*   Le système scanne la grille pour trouver des alignements de 3 ou plus.
*   Si fusion trouvée :
    *   Les tuiles sont marquées `MATCHED` (effet visuel).
    *   Le score est calculé et ajouté à `GameState.score`.
    *   Après un délai de 300ms, les tuiles sont supprimées (`itemId = null`).

## 4. ⏱️ Cycle Temporel (ChronoManager)

*   Le `ChronoManager` décrémente `GameState.chrono` de 1 chaque seconde réelle (via `setInterval`).
*   Si `GameState.chrono` atteint 0, l'état passe à `GAMEOVER`.