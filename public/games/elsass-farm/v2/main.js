// main.js
// Point d'entrée principal - Initialisation de tous les managers

console.log("🚜 Elsass Farm v1 Initializing...");

// Vérification du chargement des dépendances
(function checkDependencies() {
    if (window.LoadingManager) LoadingManager.advanceStep("Vérification des dépendances...");

    const required = [
        { name: 'Config', obj: typeof Config !== 'undefined' ? Config : null },
        { name: 'GameState', obj: window.GameState },
        { name: 'TimeManager', obj: window.TimeManager },
        { name: 'SaveManager', obj: window.SaveManager },
        { name: 'InputManager', obj: window.InputManager },
        { name: 'UIManager', obj: window.UIManager },
        { name: 'DebugManager', obj: window.DebugManager },
        { name: 'MinimapRenderer', obj: window.MinimapRenderer },
        { name: 'GridSystem', obj: window.GridSystem },
        { name: 'Inventory', obj: window.Inventory },
        { name: 'QuickAction', obj: window.QuickAction }
    ];

    const missing = required.filter(dep => !dep.obj);

    if (missing.length > 0) {
        console.error("❌ Dépendances manquantes:", missing.map(d => d.name).join(', '));
        if (window.LoadingManager) LoadingManager.updateStatus(`ERREUR: ${missing.map(d => d.name).join(', ')} manquants.`);
        return false;
    }

    if (window.LoadingManager) LoadingManager.advanceStep("✅ Toutes les dépendances chargées.");
    return true;
})();

// Initialisation du HUD avec les valeurs de GameState
function initializeHUD() {
    if (window.LoadingManager) LoadingManager.advanceStep("Initialisation de l'interface HUD...");
    UIManager.updateHUD({
        energy: GameState.energy,
        gold: GameState.gold,
        day: GameState.day,
        time: GameState.getTimeString()
    });
    if (window.LoadingManager) LoadingManager.advanceStep("✅ HUD initialisé.");
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

// Fonction d'initialisation finale (appelée après le chargement de la sauvegarde)
window.finalizeGameSetup = function () {
    if (window.LoadingManager) LoadingManager.advanceStep("Finalisation des systèmes de jeu...");

    // Initialisation des systèmes qui dépendent de GameState chargé
    if (window.QuickAction && QuickAction.refresh) {
        QuickAction.refresh();
        if (window.LoadingManager) LoadingManager.advanceStep("Raccourcis QuickAction rafraîchis.");
    }

    // La grille est maintenant initialisée globalement dans GridSystem.init()
    if (window.GridSystem) {
        if (window.LoadingManager) LoadingManager.advanceStep("GridSystem unifié prêt.");
    }

    // Repositionner le joueur si une sauvegarde a été chargée
    if (window.PlayerSystem && PlayerSystem.repositionFromGameState) {
        PlayerSystem.repositionFromGameState();
    }

    // Reste des étapes de progression pour atteindre 50
    for (let i = LoadingManager.currentStep; i < LoadingManager.MAX_STEPS - 1; i++) {
        LoadingManager.advanceStep("Préparation des assets et du rendu...");
    }

    if (window.LoadingManager) LoadingManager.advanceStep("Démarrage du moteur p5.js...");

    // Déclencher la fin du chargement
    LoadingManager.finishLoading();

    console.log("✅ main.js: Finalisation OK.");
};


// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', async function () {
    // 1. Initialisation synchrone des managers
    initializeHUD();

    // 2. Initialisation asynchrone du GridSystem (Chargement des cartes JSON)
    if (window.GridSystem) {
        LoadingManager.advanceStep("Chargement des cartes du monde...");
        await GridSystem.init();
    }

    // 3. Lancement du chargement asynchrone de la sauvegarde
    if (typeof SaveManager !== 'undefined') {
        await SaveManager.load();
    } else {
        console.error("❌ SaveManager non chargé !");
    }

    // 4. Finalisation après le chargement de la sauvegarde
    finalizeGameSetup();
});

console.log("✅ main.js chargé");