# Gestion des Inputs & Compatibilité Mobile

## Problématique
Sur mobile, l'utilisation native des inputs de la librairie **p5play** (`mouse.x`, `mouse.y`, `mouse.pressed()`) s'est révélée imprécise. En particulier :
- Le redimensionnement du canvas (scaling) fausse les coordonnées de la souris.
- Le centrage de la caméra (offset) n'est pas toujours pris en compte correctement.
- Les interactions tactiles (Touch) ne sont pas parfaitement mappées sur les événements souris.

## Solution Technique : InputManager

Pour garantir une expérience fluide et précise sur tous les appareils (Desktop & Mobile), nous avons implémenté un gestionnaire d'entrées personnalisé : `InputManager.js`.

### Architecture

Le système contourne la gestion interne de p5play en écoutant directement les événements du DOM (`mousedown`, `touchstart`, `touchmove`, `touchend`) sur l'élément Canvas.

1.  **Event Listeners Natifs** :
    -   Nous écoutons directement les événements JS sur le canvas.
    -   Cela permet de supporter le Multi-touch (bien que nous ne gérions qu'un seul doigt pour l'instant) et d'empêcher les comportements par défaut du navigateur (scroll, zoom page) si nécessaire.

2.  **Conversion de Coordonnées** :
    -   L'InputManager récupère les coordonnées brutes (ClientX/Y) relative au canvas.
    -   Une méthode de conversion explicite transforme ces coordonnées écran en coordonnées Monde (World) :
        ```javascript
        WorldX = Camera.x + (ScreenX - CenterX) / Zoom
        WorldY = Camera.y + (ScreenY - CenterY) / Zoom
        ```

3.  **Distinction Click vs Drag** :
    -   Le système différencie intelligemment un "Tap" (Clic) d'un "Pan" (Glisser pour bouger la caméra).
    -   Un seuil de mouvement (`DRAG_THRESHOLD = 10px`) détermine si l'action est un déplacement de caméra ou une sélection.

### Implémentation

#### 1. Fichier `systems/InputManager.js`
Contient toute la logique de state (isDragging, dragStart, etc.) et les calculs de mouvement de caméra.

#### 2. Intégration `sketch.js`
Modifié pour :
- Initialiser `InputManager`.
- Déléguer les événements DOM vers l'InputManager.
- Utiliser `InputManager.constrainCamera()` dans la boucle `draw()`.
- Router les clics validés (EndDrag sans mouvement) vers `BuildingSystem.handleWorldClick()`.

#### 3. Adaptation `BuildingSystem.js`
- Suppression de la logique `if (mouse.pressed())` dans `update()`.
- Création de `handleWorldClick(worldX, worldY)` qui reçoit les coordonnées déjà converties et précises pour placer ou sélectionner des bâtiments.

## Utilisation pour le Développement Futur

Si vous ajoutez de nouvelles fonctionnalités interactives (ex: sélectionner une unité mobile) :
1.  **N'utilisez PAS** `mouse.pressed()` ou `sprite.mouse.pressed()` dans les boucles `update()`.
2.  Ajoutez une méthode de gestion du clic dans votre système (ex: `UnitSystem.handleClick(x, y)`).
3.  Appelez cette méthode depuis le `handleEnd` de `sketch.js`, là où `BuildingSystem.handleWorldClick` est appelé.

Cela garantira que votre nouvelle fonctionnalité bénéficie de la même précision tactile.
