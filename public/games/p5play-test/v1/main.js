let square;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Créer un sprite carré au centre
    square = new Sprite(width / 2, height / 2, 50);
    square.color = 'coral';
    square.collider = 'static'; // Le carré ne bouge pas
}

function draw() {
    background(20);
    // Le rendu des sprites est automatique avec p5play
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Repositionner le carré si la fenêtre change de taille
    if (square) {
        square.x = width / 2;
        square.y = height / 2;
    }
}