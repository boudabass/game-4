// main.js - Le jeu le plus simple possible pour valider la stack.

q5.setup = () => {
    // 1. Créer le canvas en mode 2D compatible pour éviter les erreurs GPU
    new Canvas(800, 600, 'p2d');

    // 2. Dire au système que le jeu est prêt (bonne pratique)
    if (window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
        console.log("[Q5-Test] Jeu prêt et notifié au système.");
    } else {
        console.error("[Q5-Test] GameSystem non trouvé !");
    }
};

q5.draw = () => {
    // 3. Dessiner quelque chose de simple pour prouver que le rendu fonctionne
    clear(); // Fond noir par défaut
    fill('cyan');
    noStroke();
    circle(width / 2, height / 2, 100); // Un simple cercle cyan au centre
};