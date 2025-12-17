let player;
let floor;
let platform1, platform2, platform3;
let platforms;

function setup() {
    createCanvas(800, 600);
    
    world.gravity.y = 10;
    
    // --- GROUPE STATIQUE (SOL & PLATEFORMES) ---
    platforms = new Group();
    platforms.collider = 'static'; // CRUCIAL : Tout ce qui naît ici est IMMOBILE
    platforms.color = 'green';
    
    // --- CRÉATION VIA LE GROUPE ---
    // Notez la syntaxe : new platforms.Sprite(...)
    
    // Sol
    floor = new platforms.Sprite(400, 580, 800, 40);
    floor.color = 'gray'; // On peut surcharger la couleur après
    
    // Plateformes
    platform1 = new platforms.Sprite(200, 450, 200, 20);
    platform2 = new platforms.Sprite(600, 300, 200, 20);
    platform3 = new platforms.Sprite(300, 150, 150, 20);
    
    // --- JOUEUR (Dynamique) ---
    player = new Sprite(400, 300, 50, 50);
    player.color = 'blue';
    player.collider = 'dynamic';
    player.rotationLock = true; 
    player.bounciness = 0;
    player.friction = 0; // On gère l'inertie manuellement
}

function draw() {
    background(50);
    
    // Collision avec le groupe entier 'platforms'
    let isGrounded = player.colliding(platforms);

    if (isGrounded) {
        // --- SOL : CONTROLE AVEC INERTIE ---
        
        let targetSpeed = 0;
        if (kb.pressing('left')) targetSpeed = -5;
        if (kb.pressing('right')) targetSpeed = 5;

        // 0.05 = Inertie lourde (glisse un peu)
        player.vel.x = lerp(player.vel.x, targetSpeed, 0.05);
        
        // Saut
        if (kb.presses('space') || kb.presses('up')) {
            player.vel.y = -9;
        }
    } else {
        // --- AIR : RIEN ! (Trajectoire balistique) ---
        // Le joueur garde sa vitesse X acquise au sol.
        // Impossible de freiner ou d'accélérer en l'air.
    }
    
    allSprites.draw();
}