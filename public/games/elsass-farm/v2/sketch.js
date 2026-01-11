// Fonction utilitaire pour obtenir les données de la zone actuelle
function getCurrentZone() {
    const zoneId = GameState.currentZoneId;
    return Config.zones.find(z => z.id === zoneId) || Config.zones[0]; // Fallback sur première zone si non trouvée
}

// Fonction de changement de zone (Rendue globale)
window.changeZone = function (newZoneId, entryPoint) {
    const newZone = Config.zones.find(z => z.id === newZoneId);
    if (!newZone) {
        console.error(`Zone ID ${newZoneId} non trouvée.`);
        return;
    }

    console.log(`Transition de ${GameState.currentZoneId} vers ${newZoneId} via ${entryPoint}`);
    GameState.currentZoneId = newZoneId;

    // Réinitialiser la position de la caméra dans la nouvelle zone
    if (window.GridSystem) {
        GridSystem.updateConfigDimensions();
    }

    // Positions de grille par défaut pour l'entrée
    let targetCol = Math.floor(Config.GRID_SIZE / 2);
    let targetRow = Math.floor(Config.GRID_SIZE / 2);

    if (entryPoint === 'N') {
        // Vient du Nord (portal haut), donc arrive au Sud (bas)
        camera.y = Config.zoneHeight / 2 - 100;
        targetRow = Config.GRID_SIZE - 4; // Juste au-dessus du portail Sud
    } else if (entryPoint === 'S') {
        // Vient du Sud (portal bas), donc arrive au Nord (haut)
        camera.y = -Config.zoneHeight / 2 + 100;
        targetRow = 3; // Juste en dessous du portail Nord
    } else if (entryPoint === 'W') {
        // Vient de l'Ouest (portal gauche), donc arrive à l'Est (droite)
        camera.x = Config.zoneWidth / 2 - 100;
        targetCol = Config.GRID_SIZE - 4; // Juste à gauche du portail Est
    } else if (entryPoint === 'E') {
        // Vient de l'Est (portal droite), donc arrive à l'Ouest (gauche)
        camera.x = -Config.zoneWidth / 2 + 100;
        targetCol = 3; // Juste à droite du portail Ouest
    } else {
        camera.x = 0;
        camera.y = 0;
    }

    // Repositionner le joueur
    if (window.PlayerSystem && PlayerSystem.player) {
        const worldPos = GridSystem.gridToWorld(targetCol, targetRow);
        PlayerSystem.player.sprite.x = worldPos.x;
        PlayerSystem.player.sprite.y = worldPos.y;
        PlayerSystem.player.gridCol = targetCol;
        PlayerSystem.player.gridRow = targetRow;
        PlayerSystem.player.targetWorldX = worldPos.x;
        PlayerSystem.player.targetWorldY = worldPos.y;
        PlayerSystem.player.isMoving = false;
        PlayerSystem.player.path = [];
        PlayerSystem.player.sprite.vel.x = 0;
        PlayerSystem.player.sprite.vel.y = 0;
    }

    // Force le redraw - nécessaire pour mobile
    if (typeof redraw === 'function') {
        redraw();
    }
}
// --- CHARGEMENT DES ASSETS ---
window.groundTextures = [];

function preload() {
    console.log("📦 Préchargement des assets...");

    // Charger les textures de sol
    const path = Config.assets.groundPath;
    const prefix = Config.assets.groundPrefix;
    const count = Config.assets.groundCount;

    for (let i = 1; i <= count; i++) {
        const id = String(i).padStart(2, '0');
        const fileName = `${prefix}${id}.png`;
        groundTextures.push(loadImage(path + fileName));
    }

    console.log(`✅ ${groundTextures.length} textures de sol chargées.`);
}

// Logique de clic du monde (accepte les coordonnées monde directement)
function handleWorldClick(worldX, worldY) {
    // Ne pas traiter le clic si l'éditeur est actif
    if (window.EditorManager && EditorManager.isEditorActive) {
        return;
    }

    // Ne pas traiter le clic si une modale est ouverte
    if (UIManager && UIManager.isAnyModalOpen()) {
        return;
    }

    console.log('Clic Monde détecté !');

    // Vérifier si le clic est sur la grille
    if (GridSystem) {
        const gridPos = GridSystem.worldToGrid(worldX, worldY);

        if (gridPos.valid) {
            console.log(`Clic Grille: (${gridPos.col}, ${gridPos.row})`);

            const tile = GridSystem.getTile(gridPos.col, gridPos.row);
            const tool = Inventory ? Inventory.getSelectedTool() : null;
            const seed = Inventory ? Inventory.getSelectedSeed() : null;

            // --- NOUVEAU : DÉTECTION D'ACTION ET DISTANCE ---
            const canPlant = (tile.type === GridSystem.CELL_TYPES.FIELD_ZONE && seed && seed.qty > 0);
            const canHarvest = (tile.type === GridSystem.CELL_TYPES.READY);
            const canWater = (tool && tool.id === 'watering_can' &&
                (tile.type === GridSystem.CELL_TYPES.PLANTED ||
                    tile.type === GridSystem.CELL_TYPES.GROWING));

            const isInteracting = canPlant || canHarvest || canWater;

            // Calcul de la distance (Chebyshev)
            const p = PlayerSystem.player;
            const distance = Math.max(Math.abs(p.gridCol - gridPos.col), Math.abs(p.gridRow - gridPos.row));

            if (isInteracting && distance > 2) {
                console.log(`Trop loin pour agir (dist: ${distance}), déplacement...`);
                PlayerSystem.moveTo(gridPos.col, gridPos.row);
                return;
            }
            // ------------------------------------------------

            let result = null;

            // 1. Tenter une action de farming si applicable
            if (canPlant) {
                // Planter
                result = GridSystem.plant(gridPos.col, gridPos.row, seed.id);
                if (result.success && Inventory) {
                    Inventory.useSeed(seed.id);
                }
            } else if (canHarvest) {
                // Récolter
                result = GridSystem.harvest(gridPos.col, gridPos.row);
                if (result.success && result.item && Inventory) {
                    Inventory.addLoot(result.item, 1);
                }
            } else if (canWater) {
                // Arroser
                result = GridSystem.water(gridPos.col, gridPos.row);
            }

            // 2. Si aucune action de farming n'a été faite, déplacer le personnage
            if (!result && window.PlayerSystem) {
                console.log("Mouvement du personnage vers la case cliquée");
                PlayerSystem.moveTo(gridPos.col, gridPos.row);
            } else if (result) {
                console.log(result.message);
            }
        }
    }
}

function setup() {
    // Forcer la densité de pixels à 1 pour éviter les problèmes de jointures de grille sur mobile/retina
    pixelDensity(1);

    // Utiliser createCanvas() pour initialiser correctement le canvas p5.js
    const p5Canvas = createCanvas(windowWidth, windowHeight);

    world.gravity.y = 0;

    if (typeof allSprites === 'undefined') {
        allSprites = new Group();
    }

    // --- FIX: Assurer l'état initial ---
    if (window.GameState && !GameState.currentZoneId) {
        GameState.currentZoneId = 'C_C'; // Default Zone
    }
    // -----------------------------------

    camera.zoom = Config.zoom.start;

    // Initialiser le GridSystem unifié (Géré par main.js désormais)
    // if (window.GridSystem) {
    //     GridSystem.init();
    // }

    // Initialiser le PlayerSystem
    if (window.PlayerSystem) {
        PlayerSystem.init();
    }

    // Fix: Centrer la caméra sur le joueur s'il existe, sinon sur (0,0)
    if (window.PlayerSystem && PlayerSystem.player) {
        camera.x = PlayerSystem.player.sprite.x;
        camera.y = PlayerSystem.player.sprite.y;
    } else {
        camera.x = 0;
        camera.y = 0;
    }

    // Le GameSystem.Lifecycle.notifyReady() est maintenant appelé par LoadingManager.finishLoading()
    // pour s'assurer que le jeu est prêt AVANT de masquer l'écran de chargement.

    InputManager.init();

    // --- GESTION DES INPUTS UNIFIÉE (DOM) ---
    const canvasElement = p5Canvas.elt;

    // Fonction utilitaire pour obtenir les coordonnées (souris ou touch)
    const getCoords = (e) => {
        const rect = canvasElement.getBoundingClientRect();
        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    // 1. DÉBUT (mousedown/touchstart)
    const handleStart = (e) => {
        // Ne pas traiter si l'éditeur est actif
        if (window.EditorManager && EditorManager.isEditorActive) {
            return;
        }

        e.preventDefault();
        const { x, y } = getCoords(e);

        // Ignorer si clic sur HUD
        if (y < 60) return;

        InputManager.startDrag(x, y);
    };

    // 2. MOUVEMENT (mousemove/touchmove)
    const handleMove = (e) => {
        e.preventDefault();
        const { x, y } = getCoords(e);

        if (InputManager.isDragging) {
            InputManager.moveDrag(x, y, camera);
        }
    };

    // 3. FIN (mouseup/touchend)
    const handleEnd = (e) => {
        // e.preventDefault(); // Ne pas bloquer ici pour laisser les événements DOM se propager si besoin

        if (InputManager.isDragging) {
            const wasClick = InputManager.endDrag();

            if (wasClick) {
                // Si c'était un clic pur, nous utilisons les coordonnées de fin (lastX/Y)
                const screenX = InputManager.lastX;
                const screenY = InputManager.lastY;

                // Conversion manuelle des coordonnées écran en coordonnées monde
                const worldX = camera.x + (screenX - width / 2) / camera.zoom;
                const worldY = camera.y + (screenY - height / 2) / camera.zoom;

                handleWorldClick(worldX, worldY);
            }
        }
    };

    // Écouteurs
    canvasElement.addEventListener('mousedown', handleStart);
    canvasElement.addEventListener('touchstart', handleStart, { passive: false });

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    // Gestion du zoom (inchangé)
    canvasElement.addEventListener('wheel', (e) => {
        if (e.clientY < 60) return true;
        e.preventDefault();
        let zoomAmount = e.deltaY * Config.zoom.sensitivity;
        camera.zoom -= zoomAmount;
        camera.zoom = constrain(camera.zoom, Config.zoom.min, Config.zoom.max);
    }, { passive: false });

    // La boucle de jeu est active par défaut pour les animations fluides
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (typeof redraw === 'function') {
        redraw();
    }
}

window.redraw = function () {
    if (typeof redraw === 'function') {
        redraw();
    }
};

function draw() {
    const currentZone = getCurrentZone();

    // 1. Fond de la zone
    background(currentZone.bgColor);

    // 2. Rendu Monde (Active la transformation de la caméra)
    camera.on();
    rect(-Config.zoneWidth / 2, -Config.zoneHeight / 2, Config.zoneWidth, Config.zoneHeight);
    camera.off();

    // La grille mondiale unifiée gère son propre affichage de debug (interne camera.on/off)
    if (GridSystem) {
        GridSystem.draw();
    }

    // Le dessin des sprites est géré automatiquement par p5play à la fin de draw()
    // si loop() est actif. On évite le dessin manuel ici.

    // Mettre à jour et dessiner le personnage
    if (window.PlayerSystem) {
        PlayerSystem.update();
    }



    // 3. Mise à jour de la caméra (Déplacement et Contraintes)
    InputManager.constrainCamera(camera, width, height);

    // 4. Mise à jour automatique du temps (Game Loop)
    if (window.TimeManager) {
        if (typeof window.lastTimeCheck === 'undefined') {
            window.lastTimeCheck = millis();
        }

        if (millis() - window.lastTimeCheck >= 1000) {
            window.lastTimeCheck = millis();
            TimeManager.advanceMinutes(TimeManager.MINUTES_PER_REAL_SECOND);
        }
    }

    // 5. Mise à jour des infos de debug dans le UIManager (HUD fixe)
    if (Config.debug && window.UIManager) {
        UIManager.updateDebugInfo({
            zoneId: currentZone.id,
            zoneName: currentZone.name,
            zoom: camera.zoom,
            camX: camera.x,
            camY: camera.y,
            worldX: mouse.x,
            worldY: mouse.y,
            mousePressed: InputManager.isDragging,
            mouseY: mouseY
        });
    }
}

// Fonctions p5.js inutilisées après refactor (laisser vides pour éviter les avertissements)
function mouseClicked() { }
function mousePressed() { }
function mouseReleased() { }
function touchStarted() { }
function touchMoved() { return false; }
function touchEnded() { }
