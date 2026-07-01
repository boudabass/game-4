// public/games/test-system/sketch.js

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('game-layer');

    // Initialisation Système Core
    Layout.init();
    LoadingManager.init(5);
    LoadingManager.advanceStep("Démarrage...");

    SaveManager.init(window.DyadGame);
    LoadingManager.advanceStep("Sauvegarde...");

    InputManager.init();
    LoadingManager.advanceStep("Entrées...");

    TimeManager.init({ minutesPerSecond: 10 });
    LoadingManager.advanceStep("Chrono...");

    PersonSystem.init();
    LoadingManager.advanceStep("Citoyens...");

    // Initialisation Config Map
    if (window.World_00) {
        Config.GRID_SIZE = World_00.config.GRID_SIZE;
        Config.TILE_SIZE = World_00.config.TILE_SIZE;
    }

    GridSystem.init(); // <--- AJOUTÉ
    BuildingSystem.init(); // <--- AJOUTÉ

    // Initialisation Ressources
    // GameState s'initialise automatiquement via ses fichiers core
    GameState.coal = 1000;
    GameState.wood = 1000;
    GameState.iron = 1000;
    GameState.food = 1000;

    // Chargement de la map depuis World_00
    if (window.World_00 && World_00.elements) {
        World_00.elements.forEach(el => {
            if (el.type === 'building') {
                BuildingSystem.spawnBuilding(el.col, el.row, el.id, { is_map: el.is_map });
                // Le grid place est souvent géré par spawnBuilding mais on assure
                GridSystem.place(el.col, el.row, el.id, el.w, el.h);
            } else if (el.type === 'zone') {
                GridSystem.place(el.col, el.row, el.id, el.w, el.h);
                if (el.amount !== undefined) {
                    GridSystem.registerMapElement(el.col, el.row, el.w, el.h, el);
                }
            }
        });
    }



    UIManager.init();
    LoadingManager.advanceStep("Interface...");

    // Enregistrement des raccourcis UX
    QuickAction.register('tool_1', {
        icon: '🔨',
        action: () => console.log("Action 1 activée !")
    });
    QuickAction.register('tool_2', {
        icon: '🪓',
        action: () => console.log("Action 2 activée !")
    });

    QuickAction.onUpdate = function () {
        document.getElementById('slot-1').classList.toggle('active', QuickAction.selectedSlot === 'tool_1');
        document.getElementById('slot-2').classList.toggle('active', QuickAction.selectedSlot === 'tool_2');
    };

    // Chargement de la partie
    SaveManager.load().then(() => {
        LoadingManager.advanceStep("Prêt pour le test !");
        document.getElementById('play-button').style.display = 'block';
    });
}

function draw() {
    background(30);


    // Update Système
    TimeManager.update();
    PersonSystem.update();
    if (window.BuildingSystem) BuildingSystem.update(); // <--- AJOUTÉ

    // Caméra p5play
    InputManager.constrainCamera(camera, width, height, { width: 2000, height: 2000, margin: 100 });


    // Rendu Monde
    camera.on();

    // Rendu Grille et Zones
    const halfSize = (GridSystem.GRID_SIZE * GridSystem.TILE_SIZE) / 2;
    for (let c = 0; c < GridSystem.GRID_SIZE; c++) {
        for (let r = 0; r < GridSystem.GRID_SIZE; r++) {
            let pos = GridSystem.gridToWorld(c, r);
            let cell = GridSystem.grid[c][r];

            // Rendu de base (Grille)
            stroke(50);
            noFill();
            rect(pos.x - 16, pos.y - 16, 32, 32);

            // Rendu des zones spéciales
            if (cell === 'natural') {
                fill(0, 100, 255, 60); // Bleu Gisement
                noStroke();
                rect(pos.x - 16, pos.y - 16, 32, 32);
            } else if (cell === 'manual') {
                fill(46, 204, 113, 60); // Vert Serre
                noStroke();
                rect(pos.x - 16, pos.y - 16, 32, 32);
            } else if (cell === 'wood_wall') {
                fill(101, 67, 33, 80); // Marron Bois
                noStroke();
                rect(pos.x - 16, pos.y - 16, 32, 32);
            } else if (cell === 'wood_stack') {
                fill(255, 255, 255, 80); // Marron claire
                noStroke();
                rect(pos.x - 16, pos.y - 16, 32, 32);
            } else if (cell === 'coal_stack') {
                fill(0, 0, 0, 80); // noir claire
                noStroke();
                rect(pos.x - 16, pos.y - 16, 32, 32);
            } else if (cell === 'coal_wall') {
                fill(0, 0, 0, 80); // noir
                noStroke();
                rect(pos.x - 16, pos.y - 16, 32, 32);
            }
        }
    }

    // Highlight Mouse
    const worldMouseX = camera.x + (mouseX - width / 2) / camera.zoom;
    const worldMouseY = camera.y + (mouseY - height / 2) / camera.zoom;
    const hoverGrid = GridSystem.worldToGrid(worldMouseX, worldMouseY);

    if (hoverGrid.col >= 0 && hoverGrid.col < GridSystem.GRID_SIZE &&
        hoverGrid.row >= 0 && hoverGrid.row < GridSystem.GRID_SIZE) {
        fill(255, 255, 255, 30);
        let hp = GridSystem.gridToWorld(hoverGrid.col, hoverGrid.row);
        rect(hp.x - 16, hp.y - 16, 32, 32);
    }

    // Origine monde
    fill(255, 0, 0);
    circle(0, 0, 5);

    camera.off();

    // HUD
    if (window.GameState) {
        const goldEl = document.getElementById('val-gold');
        const energyEl = document.getElementById('val-energy');
        const dayEl = document.getElementById('day-counter');
        const clockEl = document.getElementById('clock');

        if (goldEl) goldEl.innerText = GameState.gold;
        if (energyEl) energyEl.innerText = Math.floor(GameState.energy);
        if (dayEl) dayEl.innerText = `JOUR ${GameState.day}`;
        if (clockEl) clockEl.innerText = GameState.getTimeString();
    }
}

function mousePressed() {
    InputManager.startDrag(mouseX, mouseY, 'mouse');
}

function mouseDragged() {
    InputManager.moveDrag(mouseX, mouseY, camera);
}

function mouseReleased() {
    const wasClick = InputManager.endDrag();

    if (window.UIManager && UIManager.isClickBlocked()) {
        console.log("🛡️ Clic bloqué par l'UI");
        return;
    }

    if (wasClick) {
        handleWorldClick(mouseX, mouseY);
    }
}

// === TOUCH SUPPORT (Mobile-First) ===

/**
 * Vérifie si un point (coordonnées viewport) est sur le canvas du jeu
 * @param {number} clientX - Coordonnée X viewport (clientX)
 * @param {number} clientY - Coordonnée Y viewport (clientY)
 * @returns {boolean} true si le point est sur le canvas
 */
function isTouchOnCanvas(clientX, clientY) {
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return false;

    return element.tagName === 'CANVAS' ||
        element.id === 'game-layer' ||
        element.id === 'game-container';
}

/**
 * Convertit les coordonnées viewport (clientX/Y) en coordonnées canvas (p5.js)
 * @param {number} clientX - Coordonnée X viewport
 * @param {number} clientY - Coordonnée Y viewport
 * @returns {{x: number, y: number}} Coordonnées relatives au canvas
 */
function viewportToCanvas(clientX, clientY) {
    const canvas = document.querySelector('#game-layer canvas');
    if (!canvas) return { x: clientX, y: clientY };

    const rect = canvas.getBoundingClientRect();
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function touchStarted(event) {
    if (touches.length === 1) {
        // Récupérer les coordonnées viewport du touch natif
        const touch = event?.changedTouches?.[0] || event?.touches?.[0];
        const clientX = touch ? touch.clientX : touches[0].x;
        const clientY = touch ? touch.clientY : touches[0].y;

        // Vérifier si le touch est sur le canvas (en coordonnées viewport)
        if (isTouchOnCanvas(clientX, clientY)) {
            // Convertir en coordonnées canvas pour p5.js
            const canvasCoords = viewportToCanvas(clientX, clientY);
            console.log(`📱 Touch Start sur canvas: viewport(${clientX.toFixed(0)}, ${clientY.toFixed(0)}) → canvas(${canvasCoords.x.toFixed(0)}, ${canvasCoords.y.toFixed(0)})`);

            InputManager.startDrag(canvasCoords.x, canvasCoords.y, 'touch');
            return false; // Empêche le comportement par défaut sur le canvas
        }
        console.log(`📱 Touch Start sur UI: (${clientX.toFixed(0)}, ${clientY.toFixed(0)})`);
    }
    // Laisser les touches sur l'UI se propager normalement
    return true;
}

function touchMoved(event) {
    if (touches.length === 1 && InputManager.isDragging && InputManager.lastInputType === 'touch') {
        // Récupérer les coordonnées viewport du touch natif
        const touch = event?.changedTouches?.[0] || event?.touches?.[0];
        const clientX = touch ? touch.clientX : touches[0].x;
        const clientY = touch ? touch.clientY : touches[0].y;

        // Convertir en coordonnées canvas
        const canvasCoords = viewportToCanvas(clientX, clientY);
        InputManager.moveDrag(canvasCoords.x, canvasCoords.y, camera);
        return false; // Empêche le scroll sur le canvas
    }
    return true;
}

function touchEnded(event) {
    // Ne traiter que si on était en train de faire un drag touch
    if (InputManager.lastInputType !== 'touch') {
        return true; // Laisser l'événement se propager pour l'UI
    }

    const wasClick = InputManager.endDrag();

    if (window.UIManager && UIManager.isClickBlocked()) {
        console.log("🛡️ Touch bloqué par l'UI");
        return false;
    }

    if (wasClick) {
        // Utiliser les dernières coordonnées canvas enregistrées
        console.log(`📱 Touch Click: canvas(${InputManager.lastX.toFixed(0)}, ${InputManager.lastY.toFixed(0)})`);
        handleWorldClick(InputManager.lastX, InputManager.lastY);
    }
    return false;
}

/**
 * Gère un clic/tap dans le monde du jeu
 * @param {number} canvasX - Coordonnée X relative au canvas
 * @param {number} canvasY - Coordonnée Y relative au canvas
 */
function handleWorldClick(canvasX, canvasY) {
    // Convertir les coordonnées canvas en coordonnées monde
    const worldX = camera.x + (canvasX - width / 2) / camera.zoom;
    const worldY = camera.y + (canvasY - height / 2) / camera.zoom;

    console.log(`🎯 World Click: canvas(${canvasX.toFixed(0)}, ${canvasY.toFixed(0)}) → world(${worldX.toFixed(0)}, ${worldY.toFixed(0)})`);

    // 1. Interaction BuildingSystem
    if (window.BuildingSystem) {
        // Mode Construction ou Démolition
        if (BuildingSystem.isPlacing || BuildingSystem.isDemolishing) {
            BuildingSystem.handleWorldClick(worldX, worldY);
            return; // Bloque le mouvement
        }

        // Mode Normal : Sélection
        const building = BuildingSystem.findBuildingAt(worldX, worldY);
        if (building) {
            BuildingSystem.selectBuilding(building);
            return; // Bloque le mouvement si on clique sur un bâtiment
        }
        // Si on clique dans le vide, on désélectionne (et on bouge)
        BuildingSystem.deselectBuilding();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
