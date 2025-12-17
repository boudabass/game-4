// Règle d'or : Forcer le mode 2D pour une compatibilité maximale
q5.mode = '2d';

let circleSprite;

function setup() {
    // Créer le canvas
    createCanvas(800, 600);
    
    // Limiter les FPS pour la stabilité
    frameRate(60);

    // Créer un "Sprite" p5play au lieu d'un simple cercle
    circleSprite = new Sprite();
    circleSprite.x = width / 2;
    circleSprite.y = height / 2;
    circleSprite.diameter = 150;
    circleSprite.color = 'cyan';
    circleSprite.stroke = null; // Pas de bordure

    // Lui donner une vitesse horizontale
    circleSprite.vel.x = 3;

    // Notifier le système que le jeu est prêt
    if (window.GameSystem) {
        window.GameSystem.Lifecycle.notifyReady();
        console.log("[Q5-Validator] Jeu prêt.");
    }
}

function draw() {
    // Dessiner le fond
    background(10, 10, 30); // Fond bleu nuit

    // Si le sprite sort de l'écran, il réapparaît de l'autre côté
    if (circleSprite.x > width + circleSprite.diameter / 2) {
        circleSprite.x = -circleSprite.diameter / 2;
    }
}