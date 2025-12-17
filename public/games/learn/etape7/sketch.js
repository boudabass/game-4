let player;
let platforms;

function setup() {
    createCanvas(800, 600);
    
    // Physique dynamique (validée à l'étape 6)
    world.gravity.y = 25;
    
    // --- GROUPE STATIQUE (SOL & PLATEFORMES) ---
    platforms = new Group();
    platforms.collider = 'static';
    platforms.color = 'green';
    
    // Sol de départ
    let floor = new platforms.Sprite(400, 580, 800, 40);
    floor.color = 'gray';
    
    // --- GÉNÉRATION NIVEAU (Escalier) ---
    // On crée 10 plateformes qui montent
    for(let i = 0; i < 10; i++) {
        let w = random(80, 150);
        let x = random(100, 700);
        let y = 500 - (i * 55 + 50);
        new platforms.Sprite(x, y, w, 20);
    }
    
    // --- JOUEUR ---
    player = new Sprite(100, 500, 30, 30);
    player.color = 'blue';
    player.collider = 'dynamic';
    player.rotationLock = true; 
    player.bounciness = 0;
    player.friction = 0;
}

function draw() {
    background(50);
    
    let isGrounded = player.colliding(platforms);

    // --- INPUTS ---
    let targetSpeed = 0;
    if (kb.pressing('left')) targetSpeed = -5;
    if (kb.pressing('right')) targetSpeed = 5;

    // --- PHYSIQUE DE DÉPLACEMENT ---
    if (isGrounded) {
        // AU SOL : Assez réactif (0.2)
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.2);
        
        // SAUT
        if (kb.presses('space') || kb.presses('up')) {
            player.vel.y = -12;
        }
    } else {
        // EN L'AIR : Moins réactif (0.05) pour le contrôle aérien
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.05);
    }
    
    // --- RESPAWN (Mort par chute) ---
    if (player.y > height + 50) {
        resetPlayer();
    }
    
    allSprites.draw();
}

function resetPlayer() {
    // Retour case départ
    player.pos = {x: 100, y: 500};
    player.vel = {x: 0, y: 0};
}