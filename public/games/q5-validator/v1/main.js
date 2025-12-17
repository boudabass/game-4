// Règle d'or : Forcer le mode 2D pour une compatibilité maximale
q5.mode = '2d';

function setup() {
    // Créer le canvas
    createCanvas(800, 600);
    
    // Limiter les FPS pour la stabilité
    frameRate(60);

    // Notifier le système que le jeu est prêt
    if (window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
        console.log("[Q5-Validator] Jeu prêt.");
    }
    
    // Pas besoin de boucle pour un affichage statique
    noLoop();
}

function draw() {
    // Dessiner un fond et un cercle pour valider le rendu
    background(10, 10, 30); // Fond bleu nuit
    fill('cyan');
    noStroke();
    circle(width / 2, height / 2, 150);
}