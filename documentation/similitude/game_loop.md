# 🔄 Game Loop — Similitude (Logique de Puzzle)

Le cycle de jeu est basé sur l'interaction simple du joueur avec la grille, suivie d'une cascade de calculs automatiques.

## 1. 🖱️ Actions du Joueur (InputManager & sketch.js)

Le jeu utilise un système de clic en deux étapes :

| Étape | Action | Résultat | Coût |
| :--- | :--- | :--- | :--- |
| **Clic 1** | Tap sur un item | L'item est marqué `SELECTED` (Glow statique). | 0 ⚡ |
| **Clic 2** | Tap sur une case vide | L'item sélectionné est déplacé (`snap-move`). | -1 ⚡ |
| **Clic 2** | Tap sur un autre item | L'item précédent est désélectionné, le nouveau est sélectionné. | 0 ⚡ |
| **Clic 2** | Tap sur l'item sélectionné | Désélection. | 0 ⚡ |

> **Règle :** Le déplacement n'est possible que vers une case adjacente ou éloignée, tant qu'elle est vide.

## 2. ⚙️ Logique de Déplacement (GridSystem.moveItem)

Après un déplacement réussi :

1.  `GameState.energy` est décrémenté de 1.
2.  L'item est déplacé.
3.  `GridSystem.applyGravity()` est appelé.
4.  `GridSystem.checkAndProcessFusions()` est appelé.

## 3. 💥 Fusion et Gravité (GridSystem)

### A. Gravité (`applyGravity`)
*   Les items tombent pour combler les trous créés par le déplacement ou la fusion.
*   De nouveaux items aléatoires (`getRandomItem`) sont générés en haut de la colonne pour remplir la grille.

### B. Fusion (`checkAndProcessFusions`)
*   Le système scanne la grille pour trouver des alignements de 3, 4 ou 5+ items identiques (horizontalement ou verticalement).
*   Les tuiles fusionnées sont marquées pour suppression (`itemId = null`).
*   Le score est calculé et ajouté à `GameState.score`.
*   La gravité est appliquée à nouveau (pour gérer les réactions en chaîne, bien que la version actuelle ne fasse qu'une passe simple).

## 4. ⏱️ Cycle Temporel (ChronoManager)

*   Le `ChronoManager` décrémente `GameState.chrono` de 1 chaque seconde réelle (via `setInterval`).
*   Si `GameState.chrono` atteint 0, l'état passe à `GAMEOVER`.