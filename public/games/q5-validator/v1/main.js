// La configuration q5.mode est maintenant gérée dans index.html, avant le chargement du script.

q5.setup = () => {
    // Syntaxe q5.js
    new Canvas(800, 600);
    frameRate(30);

    console.log("✅ q5.js seul est initialisé en mode 2D.");

    if (window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
    }
    
    noLoop();
};

q5.draw = () => {
    // Syntaxe q5.js
    clear();
    fill('cyan');
    noStroke();
    circle(width / 2, height / 2, 150);
};