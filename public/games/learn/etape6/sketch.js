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
    // On ajoute un peu de friction physique pour que ça ne glisse pas indéfiniment
    player.friction = 5; 
    
    // --- SOL ---
    floor = new Sprite(400, 580, 800, 40);
    floor.color = 'gray';
    floor.collider = 'static';
    
    // --- PLATEFORMES ---
    platform1 = new Sprite(200, 450, 200, 20);
    platform1.color = 'green';
    platform1.collider = 'static';
    
    platform2 = new Sprite(600, 300, 200, 20);
    platform2.color = 'green';
    platform2.collider = 'static';
    
    platform3 = new Sprite(300, 150, 150, 20);
    platform3.color = 'green';
    platform3.collider = 'static';
}

function draw() {
    background(50);
    
    // --- CONTROLES AVEC INERTIE ---
    
    // 1. On détermine la vitesse CIBLE (ce qu'on veut atteindre)
    let targetSpeed = 0;
    if (kb.pressing('left')) targetSpeed = -5;
    if (kb.pressing('right')) targetSpeed = 5;

    // 2. On applique l'INERTIE avec lerp()
    // lerp(actuel, cible, facteur)
    // facteur 0.1 = on change la vitesse de 10% vers la cible à chaque frame
    // Plus le chiffre est petit (0.05), plus c'est "lourd/glissant". Plus il est grand (0.5), plus c'est réactif.
    player.vel.x = lerp(player.vel.x, targetSpeed, 0.1);

    // --- SAUT ---
    if ((kb.presses('space') || kb.presses('up')) && player.colliding(allSprites)) {
        player.vel.y = -9;
    }
    
    // --- AFFICHAGE ---
    allSprites.draw();
}