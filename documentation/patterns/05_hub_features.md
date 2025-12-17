# 🎮 Patterns : Le Hub & Fonctionnalités Système (Standard Q5/P5Play)

Ce guide détaille les fonctionnalités centralisées par le **GameSystem** (le Hub) dans le contexte de **Q5.js + P5Play**.

## 1. Interface Système (Automatique)

Le **GameSystem injecte automatiquement une interface standard** par-dessus votre jeu.

Cette interface contient :
*   Un bouton **Menu (☰)** en haut à gauche.
*   Un bouton **Plein Écran**.

## 2. Gestion de l'Écran (Display)

### Le Redimensionnement (Resizing)
Le jeu doit toujours occuper 100% de la fenêtre. `new Canvas()` de Q5.js gère cela de manière plus robuste.

**Code Standard (q5.js) :**
```javascript
// Dans q5.setup()
new Canvas(windowWidth, windowHeight);

// Fonction de rappel pour le redimensionnement
q5.windowResized = () => {
    resizeCanvas(windowWidth, windowHeight);
    // Si vous utilisez la caméra, vous pourriez vouloir la réinitialiser ici
    // camera.x = player.x;
};
```

### Le Plein Écran
Est géré par le bouton du menu système.

Vous pouvez toujours le déclencher par code si voulu : `window.GameSystem.Display.toggleFullscreen()`.

## 2. Gestion du Score (Scoring)

### Sauvegarde & Leaderboard
Plus besoin de `fetch()` manuels compliqués.

**Soumettre un score :**
```javascript
// En fin de partie
window.GameSystem.Score.submit(points);
```

**Afficher le Leaderboard (Optionnel) :**
Vous pouvez récupérer les meilleurs scores pour les afficher dans vos menus.
```javascript
let topScores = await window.GameSystem.Score.getLeaderboard();
// returns [{ playerName: "Bob", score: 1500 }, ...]
```

## 3. Cycle de Vie (Lifecycle)

Permet au Hub de savoir ce que fait le jeu (Pause, Chargement fini).

### Signaler "Prêt"
Dans votre `q5.setup()`, une fois que tout est chargé :
```javascript
q5.setup = () => {
    new Canvas(...);
    // ... chargement des assets ...
    
    // Dit au Hub "C'est bon, tu peux enlever l'écran de chargement" (Futur)
    if(window.GameSystem.Lifecycle) {
        window.GameSystem.Lifecycle.notifyReady();
    }
};
```

### Gestion de la Pause
Le Hub pourra demander au jeu de se mettre en pause (ex: menu overlay).

```javascript
window.GameSystem.Lifecycle.onPause(() => {
    noLoop(); // Stoppe la boucle q5.js
    // Mettre en pause les sons
});

window.GameSystem.Lifecycle.onResume(() => {
    loop(); // Reprend la boucle q5.js
    // Reprendre les sons
});