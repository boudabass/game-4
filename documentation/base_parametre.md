# ⚙️ Paramètres de Base & Tuning (Game Feel)

Ce document référence les valeurs utilisées pour obtenir des contrôles fluides et réactifs ("snappy") pour un jeu de plateforme p5.play.

## 1. 🌍 Physique & Monde
*   **Gravité (`world.gravity.y`) :** `25`
    *   *Note :* Une gravité élevée (par défaut ~10) rend le saut plus rapide et moins "flottant".
*   **Taille du Monde :** `2000` (Largeur) x `1200` (Hauteur).
*   **Framerate :** 60 FPS (par défaut).

## 2. 🏃 Le Joueur (Mouvements)
*   **Vitesse Cible :** `5` (pixels/frame).
*   **Force de Saut :** `-12` (impulsion instantanée).
*   **Inertie (Lerp) :**
    *   **Au sol :** `0.2` (Réactif, s'arrête vite).
    *   **En l'air :** `0.05` (Plus d'inertie, contrôle aérien réduit).

## 3. 🎮 Game Feel (Fluidité des contrôles)
Ces paramètres corrigent les frustrations du joueur (sauts ratés).

*   **Coyote Time (`groundTimer`) :** `6 frames` (~100ms)
    *   *Définition :* Temps pendant lequel on peut encore sauter après avoir quitté une plateforme.
    *   *Effet :* Évite la frustration de "tomber" juste avant de sauter.
*   **Jump Buffer (`jumpTimer`) :** `8 frames` (~130ms)
    *   *Définition :* Temps pendant lequel une commande de saut est mémorisée avant de toucher le sol.
    *   *Effet :* Permet d'appuyer sur saut *légèrement avant* l'atterrissage et de sauter immédiatement.

## 4. 🎥 Caméra
*   **Lissage (`lerp`) :** `0.1`
    *   *Effet :* La caméra a un léger retard sur le joueur, évitant les mouvements brusques.
*   **Contraintes (`constrain`) :** Bornée aux limites du monde pour ne jamais afficher de zones vides (hors map).

## 5. 🎨 Couleurs & Styles
*   **Joueur :** `blue`
*   **Plateformes :** `gray`
*   **Ennemis :** `red`
*   **Pièces :** `gold`