let player;
let floor;
let platform1, platform2, platform3;
let platforms;

function setup() {
    createCanvas(800, 600);
    
    // Gravité plus forte (25) pour éviter l'effet "Lune"
    world.gravity.y = 25;
    
    // --- GROUPE STATIQUE (SOL & PLATEFORMES) ---
    platforms = new Group();
    platforms.collider = 'static';
    platforms.color = 'green';
    
    // Sol
    floor = new platforms.Sprite(400, 580, 800, 40);
    floor.color = 'gray';
    
    // Plateformes
    platform1 = new platforms.Sprite(200, 450, 200, 20);
    platform2 = new platforms.Sprite(600, 300, 200, 20);
    platform3 = new platforms.Sprite(300, 150, 150, 20);
    
    // --- JOUEUR ---
    player = new Sprite(400, 300, 50, 50);
    player.color = 'blue';
    player.collider = 'dynamic';
    player.rotationLock = true; 
    player.bounciness = 0;
    player.friction = 0;
}

function draw() {
    background(50);
    
    let isGrounded = player.colliding(platforms);

    if (isGrounded) {
        // --- SOL ---
        let targetSpeed = 0;
        if (kb.pressing('left')) targetSpeed = -5;
        if (kb.pressing('right')) targetSpeed = 5;

        // Inertie
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.1); // Un peu plus réactif (0.05 -> 0.1)
        
        // Saut (Force augmentée pour compenser la gravité)
        if (kb.presses('space') || kb.presses('up')) {
            player.vel.y = -12; // -9 -> -12
        }
    } else {
        // --- AIR ---
        // Pas de contrôle
    }
    
    allSprites.draw();
}