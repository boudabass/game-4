// main.js
// Point d'entrée principal - Initialisation de tous les managers

console.log("🚜 Elsass Farm v1 Initializing...");

// Vérification du chargement des dépendances
(function checkDependencies() {
    const required = [
        { name: 'Config', obj: typeof Config !== 'undefined' ? Config : null },
        { name: 'GameState', obj: window.GameState },
        { name: 'InputManager', obj: window.InputManager },
        { name: 'UIManager', obj: window.UIManager },
        { name: 'DebugManager', obj: window.DebugManager },
        { name: 'MinimapRenderer', obj: window.MinimapRenderer }
    ];

    const missing = required.filter(dep => !dep.obj);

    if (missing.length > 0) {
        console.error("❌ Dépendances manquantes:", missing.map(d => d.name).join(', '));
        return false;
    }

    console.log("✅ Toutes les dépendances chargées");
    return true;
})();

// Initialisation du HUD avec les valeurs de GameState
function initializeHUD() {
    UIManager.updateHUD({
        energy: GameState.energy,
        gold: GameState.gold,
        day: GameState.day,
        time: GameState.getTimeString()
    });
    console.log("✅ HUD initialisé");
}

// Fonction globale pour mettre à jour le HUD (appelée par d'autres modules)
window.refreshHUD = function () {
    UIManager.updateHUD({
        energy: GameState.energy,
        gold: GameState.gold,
        day: GameState.day,
        time: GameState.getTimeString()
    });
};

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    initializeHUD();
});

console.log("✅ main.js chargé");