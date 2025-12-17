let player;
let floor;
let platform1, platform2;

function setup() {
    createCanvas(800, 600);
    
    // --- JOUEUR ---
    player = new Sprite(400, 300, 50, 50);
    player.color = 'blue';
    player.collider = 'dynamic'; // Physique active (réagit aux chocs)
    player.rotationLock = true;  // Empêche le joueur de rouler sur lui-même
    
    // --- SOL ---
    floor = new Sprite(400, 580, 800, 40);
    floor.color = 'gray';
    floor.collider = 'static'; // Immobile, ne bouge pas sous l'impact
    
    // --- PLATEFORMES ---
    platform1 = new Sprite(200, 400, 200, 20);
    platform1.color = 'green';
    platform1.collider = 'static';
    
    platform2 = new Sprite(600, 250, 200, 20);
    platform2.color = 'green';
    platform2.collider = 'static';
}

function draw() {
    background(50);
    
    // Mouvement par vélocité (mieux pour la physique)
    player.vel.x = 0;
    player.vel.y = 0;

    if (kb.pressing('left')) {
        player.vel.x = -5;
    }
    if (kb.pressing('right')) {
        player.vel.x = 5;
    }
    if (kb.pressing('up')) {
        player.vel.y = -5;
    }
    if (kb.pressing('down')) {
        player.vel.y = 5;
    }

    // p5play gère automatiquement l'affichage et les collisions ici !
    // Pas besoin de vérifier 'if (player.collides(floor))...' manuellement pour le blocage.
}