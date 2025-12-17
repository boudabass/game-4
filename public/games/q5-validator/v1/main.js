// Règle d'or : Forcer le mode 2D pour une compatibilité maximale
q5.mode = '2d';

let errorMessage = null;

q5.setup = () => {
    try {
        // On utilise la syntaxe qui a fonctionné : new Canvas avec windowWidth/Height
        new Canvas(windowWidth, windowHeight);
        frameRate(30);
    } catch (e) {
        // Si même le canvas plante, on le saura
        errorMessage = "ERREUR CRITIQUE : new Canvas() a échoué.\n\n" + e.toString();
        console.error(errorMessage, e);
        return;
    }
    
    try {
        // On tente de créer le sprite
        let circle = new Sprite(width / 2, height / 2, 150);
        circle.color = 'lime'; // Vert, comme dans le test qui a marché
        circle.stroke = null;
        console.log("✅ Sprite p5play créé avec succès.");
    } catch (e) {
        // Si le sprite plante, on capture l'erreur pour l'afficher
        errorMessage = "ERREUR : new Sprite() a échoué.\n\n" + e.toString() + "\n\n" + (e.stack || 'Pas de stack trace.');
        console.error("--- ERREUR P5PLAY CAPTURÉE ---", e);
    }

    if (window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
    }
};

q5.draw = () => {
    // On efface l'écran
    clear();

    // S'il y a eu une erreur, on l'affiche en rouge dans le canvas
    if (errorMessage) {
        fill(255, 80, 80); // Rouge vif
        textAlign(LEFT, TOP);
        textSize(16);
        textFont('monospace');
        text(errorMessage, 20, 20, width - 40, height - 40);
    } 
    // Si tout va bien, p5play dessine le sprite automatiquement.
};