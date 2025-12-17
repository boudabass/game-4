let player;
let floor;
let platform1, platform2, platform3;

function setup() {
    createCanvas(800, 600);
    
    // --- PHYSIQUE GLOBALE ---
    world.gravity.y = 10;
    
    // --- JOUEUR ---
    player = new Sprite(400, 300, 50, 50);
    player.color = 'blue';
    player.collider = 'dynamic';
    player.rotationLock = true; 
    player.bounciness = 0;
    
    // --- SOL ---
    floor = new Sprite(400, 580, 800, 40);
    floor.color = 'gray';
    floor.collider = 'static';
    
    // --- PLATEFORMES ---
    // Plateforme gauche
    platform1 = new Sprite(200, 450, 200, 20);
    platform1.color = 'green';
    platform1.collider = 'static';
    
    // Plateforme droite
    platform2 = new Sprite(600, 300, 200, 20);
    platform2.color = 'green';
    platform2.collider = 'static';
    
    // Plateforme haute (Nouvelle)
    platform3 = new Sprite(300, 150, 150, 20);
    platform3.color = 'green';
    platform3.collider = 'static';
}

function draw() {
    background(50);
    
    // --- CONTROLES ---
    player.vel.x = 0;

    if (kb.pressing('left')) {
        player.vel.x = -5;
    }
    if (kb.pressing('right')) {
        player.vel.x = 5;
    }

    // Saut conditionnel
    if ((kb.presses('space') || kb.presses('up')) && player.colliding(allSprites)) {
        // On vérifie si on touche N'IMPORTE QUEL sprite (sol ou plateforme)
        // C'est plus simple que de lister floor || p1 || p2 || p3...
        // Note: cela permet de sauter si on touche un mur, mais c'est ok pour ce niveau.
        player.vel.y = -9;
    }
    
    // --- AFFICHAGE ---
    // On dessine explicitement tous les sprites à la fin
    allSprites.draw();
}