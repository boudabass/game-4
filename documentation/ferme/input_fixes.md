# 🖱️ Fixes Critiques : Gestion des Inputs (Mobile & Desktop)

Ce document consigne les solutions apportées aux problèmes de conflit entre le drag de la caméra et le clic d'action (tap) sur les plateformes desktop et mobile.

## 1. 🔄 Architecture d'Input Unifiée (Solution Finale)

Le système a été refactorisé pour **abandonner** les fonctions d'événements p5.js (`mouseClicked`, `touchStarted`, `touchEnded`) au profit d'un gestionnaire d'événements DOM unifié (`mousedown`/`touchstart`, `mousemove`/`touchmove`, `mouseup`/`touchend`).

**Principe :** Le code vérifie explicitement la distance parcourue entre `start` et `end` pour déterminer si l'interaction est un `drag` (déplacement de la caméra) ou un `click` (action sur le monde).

### Implémentation Clé (`sketch.js` / `setup`)

```javascript
// Écouteurs DOM unifiés
canvasElement.addEventListener('mousedown', handleStart);
canvasElement.addEventListener('touchstart', handleStart, { passive: false });
// ...
document.addEventListener('mouseup', handleEnd);
document.addEventListener('touchend', handleEnd);
```

## 2. 🔴 Problème : Conflit Clic/Drag (Mobile & Desktop)

### Symptôme
*   **Desktop :** Le clic simple était souvent interprété comme un drag, ou la logique de clic était exécutée deux fois (double-clic).
*   **Mobile :** Le tap simple pour planter/arroser était ignoré car le mouvement involontaire du doigt était interprété comme un drag.

### Solution
1.  **Seuil de Drag Augmenté :** Le `DRAG_THRESHOLD` dans `InputManager.js` a été augmenté à **30px** pour les appareils tactiles, permettant aux taps naturels d'être reconnus comme des clics.
2.  **Logique `handleEnd` :** La logique de clic est exécutée **uniquement** dans `handleEnd` (mouseup/touchend) si `InputManager.endDrag()` retourne `true` (pas de mouvement significatif).

## 3. 🚀 Problème : Saut de Caméra au Toucher (Mobile)

### Symptôme
Lors du premier contact tactile, la caméra sautait immédiatement vers le coin bas-droit du monde, rendant le jeu injouable.

### Cause
Lors du premier frame après `touchStarted`, le delta de déplacement (`mouseX - pmouseX`) était énorme car `pmouseX` était souvent `0` ou une ancienne valeur non pertinente.

### Solution
Le flag `InputManager.ignoreNextDelta` a été introduit. Il est défini à `true` dans `mousePressed`/`touchStarted` et consommé dans `InputManager.updateCamera` pour ignorer le delta du premier frame, stabilisant ainsi la caméra.

## 4. ⚙️ Problème : Erreur d'Initialisation du Canvas

### Symptôme
Erreur `Cannot read properties of undefined (reading 'addEventListener')` dans `setup()`.

### Cause
Utilisation de `new Canvas()` au lieu de `createCanvas()`, ce qui empêchait d'obtenir la référence DOM correcte (`canvas.elt`) pour attacher les écouteurs d'événements.

### Solution
Remplacement de `new Canvas()` par `const p5Canvas = createCanvas(...)` et utilisation de `p5Canvas.elt` pour attacher les écouteurs.