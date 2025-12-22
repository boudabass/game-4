# 🪟 UI System — Similitude (Interfaces)

L'interface utilisateur suit le standard DOM Overlay (Z-Index 500+) pour garantir que les clics sur les boutons n'interfèrent pas avec le canvas p5.js.

## 1. 🔝 HUD Permanent (Top Bar)

Le HUD est fixé en haut (`z-index: 1000`) et affiche les statistiques vitales du niveau :

| Élément | Rôle | ID HTML |
| :--- | :--- | :--- |
| **⚡ Énergie** | Clics restants. | `val-energy` |
| **💰 Or** | Monnaie accumulée. | `val-gold` |
| **📊 Score** | Score actuel. | `val-score` |
| **⏱ Chrono** | Temps restant (MM:SS). | `val-chrono` |
| **≡ MENU** | Bouton Pause/Menu. | `toggleMenu()` |

## 2. 🖼️ Rendu de la Grille (Canvas)

*   **Centrage :** La grille est toujours centrée sur l'écran, quelle que soit la taille de la fenêtre.
*   **Items :** Rendu via des emojis (`textSize` ajusté à `tileSize * 0.7`).
*   **Sélection :** L'item sélectionné est entouré d'un contour lumineux (`stroke(Config.colors.selectionGlow)`).

## 3. 🛑 Modales (Overlays)

Toutes les modales utilisent un overlay opaque (`z-index: 500`) qui bloque les interactions avec le jeu en dessous.

### A. Menu Pause (`menu-modal`)
*   **Déclenchement :** Clic sur `≡ MENU` ou touche `P`.
*   **Fonctionnalités :** Reprendre, Plein Écran, Debug, Quitter.

### B. Game Over (`gameover-modal`)
*   **Déclenchement :** `GameState.chrono` atteint 0.
*   **Fonctionnalités :** Affiche le score final, Rejouer, Quitter.

### C. Debug (`debug-modal`)
*   **Fonctionnalités :** Contrôles pour forcer la fusion, réinitialiser la grille, ajouter des ressources/temps.

## 4. 🖱️ Inputs (Rappel)

*   **Interaction Monde :** Gérée par les écouteurs DOM (`mousedown`/`mouseup`) pour garantir la détection du clic pur (pas de drag).
*   **Interaction UI :** Gérée par les `onclick` HTML avec `event.stopPropagation()` pour éviter les clics fantômes.

### ⏸️ Gestion de la Pause/Reprise (Critique)

La gestion de la boucle de rendu p5.js (`draw()`) est synchronisée avec l'état du jeu (`GameState.currentState`).

| Action | État du Jeu | Boucle p5.js | Mécanisme |
| :--- | :--- | :--- | :--- |
| **Ouverture Modale** | `PAUSED` | `noLoop()` | Appel à `window.toggleGameLoop(false)` dans `UIManager.toggle*`. |
| **Fermeture Modale** | `PLAYING` | `loop()` | Appel à `startGame()` dans `UIManager.toggle*` si la modale se ferme et qu'aucune autre n'est visible. |
| **Bouton Reprendre** | `PLAYING` | `loop()` | Appel direct à `startGame()` dans `index.html`. |

> **Note de Maintenance :** La fonction `startGame()` est le point de contrôle unique pour relancer le jeu (état + boucle p5.js). Toute nouvelle modale doit appeler `window.toggleGameLoop(false)` à l'ouverture et s'assurer que `startGame()` est appelé à la fermeture pour garantir la reprise automatique.