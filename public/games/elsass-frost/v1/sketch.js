const snowflakes = [];

function setup() {
    // Utiliser createCanvas pour avoir accès à l'élément DOM
    let c = createCanvas(windowWidth, windowHeight);
    let canvasEl = c.elt;

    world.gravity.y = 0;

    // Initialisation des systèmes
    GridSystem.init();
    BuildingSystem.init();
    InputManager.init();

    // Fix: Centrer la caméra sur le monde (0,0) où se trouve le générateur
    camera.x = 0;
    camera.y = 0;

    // SCALING JEU : Ajuster le zoom initial pour correspondre à la largeur de référence
    // Si l'écran est plus large que 1920 (ex: tablette 2620), on dézoome ou on garde l'échelle 1:1 ?
    // L'objectif est que les sprites aient la même taille APPARENTE.
    // Donc si l'écran est plus grand (plus de pixels), pour que le sprite prenne la même proportion d'écran, il faut ZOOMER.
    // Zoom = window.width / 1920
    const referenceWidth = 1920;
    let initialZoom = windowWidth / referenceWidth;
    camera.zoom = initialZoom;
    console.log(`Game Zoom set to ${initialZoom.toFixed(2)}`);

    // --- GESTION INPUTS ---
    // Fonction utilitaire pour obtenir les coordonnées
    const getCoords = (e) => {
        const rect = canvasEl.getBoundingClientRect();
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    // 1. DÉBUT
    const handleStart = (e) => {
        // Ignorer HUD
        const { x, y } = getCoords(e);
        if (y < 60) return; // Top bar height

        if (e.type === 'touchstart') {
            // e.preventDefault(); // Peut bloquer le scroll, à voir
        }
        InputManager.startDrag(x, y);
    };

    // 2. MOUVEMENT
    const handleMove = (e) => {
        const { x, y } = getCoords(e);
        if (InputManager.isDragging) {
            e.preventDefault(); // Important pour éviter scroll pendant drag
            InputManager.moveDrag(x, y, camera);
        }
    };

    // 3. FIN
    const handleEnd = (e) => {
        if (InputManager.isDragging) {
            const wasClick = InputManager.endDrag();
            if (wasClick) {
                // Conversion CLIC ECRAN -> MONDE
                // InputManager.lastX/Y contient la pos écran
                const screenX = InputManager.lastX;
                const screenY = InputManager.lastY;

                // Formule de conversion inverse de p5play camera
                // World = Camera + (Screen - Center) / Zoom
                const worldX = camera.x + (screenX - width / 2) / camera.zoom;
                const worldY = camera.y + (screenY - height / 2) / camera.zoom;

                if (window.BuildingSystem) {
                    BuildingSystem.handleWorldClick(worldX, worldY);
                }
            }
        }
    };

    // Listeners
    canvasEl.addEventListener('mousedown', handleStart);
    canvasEl.addEventListener('touchstart', handleStart, { passive: false });

    // Document pour move/end pour ne pas perdre le focus si on sort du canvas
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);


    background(11, 16, 21);
    console.log("P5 Setup Complete");
}

function draw() {
    background(11, 16, 21);

    // 1. Contrôler la caméra (Zoom uniquement ici, Pan géré par événements)
    // Zoom via molette
    if (mouse.wheel !== 0) {
        let zoomAmount = mouse.wheel * 0.001;
        camera.zoom -= zoomAmount;
        camera.zoom = constrain(camera.zoom, 0.5, 2);
    }

    // Contraintes
    InputManager.constrainCamera(camera);

    // 2. Grille
    GridSystem.draw();

    // 3. Logique Temps & Bâtiments
    if (window.TimeManager) {
        TimeManager.update();
    }

    if (window.BuildingSystem) {
        BuildingSystem.update();
    }

    // Effet de neige
    drawSnow();
}
function drawSnow() {
    // Ajouter
    if (frameCount % 5 === 0) {
        snowflakes.push({
            x: random(width),
            y: -10,
            size: random(2, 5),
            speed: random(1, 3)
        });
    }

    fill(255, 255, 255, 150);
    noStroke();

    for (let i = snowflakes.length - 1; i >= 0; i--) {
        const f = snowflakes[i];
        f.y += f.speed;
        f.x += sin(frameCount * 0.01 + f.y * 0.01) * 0.5; // Vent léger
        circle(f.x, f.y, f.size);

        if (f.y > height) {
            snowflakes.splice(i, 1);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    // Recalculer le zoom pour maintenir l'échelle visuelle
    const referenceWidth = 1920;
    let newZoom = windowWidth / referenceWidth;
    // On conserve le ratio de zoom actuel par rapport à la base si l'utilisateur a zoomé manuellement ?
    // Pour l'instant on reset au zoom "idéal" pour la résolution
    camera.zoom = newZoom;

    if (window.UIManager) UIManager.handleResize();
}
