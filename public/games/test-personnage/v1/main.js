// Main Entry Point
window.onload = function () {
    console.log("❄️ Elsass Frost Initializing...");

    // 1. Charger la sauvegarde si existe
    if (SaveManager) {
        SaveManager.load();
    } else {
        GameState.init();
    }

    // Init Scaling UI
    if (window.UIManager) {
        UIManager.init();
    }

    // 2. Initialiser P5 via le sketch (automatique)
    // P5play démarre quand le script est chargé

    // 3. Masquer le chargement (Simulation)
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        console.log("❄️ Prêt.");
    }, 1000);
};
