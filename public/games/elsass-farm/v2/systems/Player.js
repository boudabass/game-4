// systems/Player.js
// Classe représentant un personnage mobile sur la grille
// Adapté depuis test-personnage/v1

class Player {
    constructor(startCol, startRow) {
        this.gridCol = startCol;
        this.gridRow = startRow;

        let worldPos = GridSystem.gridToWorld(startCol, startRow);

        this.sprite = new Sprite(worldPos.x, worldPos.y);
        this.sprite.width = GridSystem.TILE_SIZE * 0.6;
        this.sprite.height = GridSystem.TILE_SIZE * 0.6;
        this.sprite.color = 'yellow';
        this.sprite.collider = 'kinematic'; // IMPORTANT: permet le mouvement sans collision
        this.sprite.layer = 100; // IMPORTANT: toujours au-dessus de TOUT
        // this.sprite.image = 'asset_path'; // Plus tard pour sprite personnalisé

        this.path = [];
        this.isMoving = false;
        this.speed = 2; // Vitesse de déplacement (pixels par frame)

        this.targetWorldX = worldPos.x;
        this.targetWorldY = worldPos.y;

        console.log(`👤 Player créé à (${startCol},${startRow}) = monde (${worldPos.x}, ${worldPos.y})`);
    }

    setPath(path) {
        this.path = path;
        console.log(`🗺️ Nouveau chemin défini: ${path.length} étapes`);
    }

    update() {
        // Mouvement le long du chemin
        if (this.path.length > 0 || this.isMoving) {
            this.moveAlongPath();
        }
    }

    moveAlongPath() {
        // Si on n'est pas en mouvement vers une case spécifique, on prend la suivante
        if (!this.isMoving) {
            if (this.path.length === 0) return;

            // Prendre le prochain noeud
            let nextNode = this.path[0];

            // Calculer la position monde cible
            let nextWorldPos = GridSystem.gridToWorld(nextNode.col, nextNode.row);

            this.targetWorldX = nextWorldPos.x;
            this.targetWorldY = nextWorldPos.y;
            this.isMoving = true;

            // On retire le noeud du chemin car on "l'entame"
            this.path.shift();

            // Mettre à jour la grille (virtuelle) du joueur
            this.gridCol = nextNode.col;
            this.gridRow = nextNode.row;

            // --- DÉTECTION DE PORTAIL ---
            const tile = GridSystem.getTile(this.gridCol, this.gridRow);
            if (tile && tile.type === GridSystem.CELL_TYPES.PORTAL && (window.GameState && GameState.currentZoneId === 'C_C')) {
                console.log("🌀 Portail détecté !");
                let targetZone = null;
                let entryPoint = '';

                if (this.gridRow <= 2) { targetZone = 'N_C'; entryPoint = 'N'; }
                else if (this.gridRow >= GridSystem.GRID_SIZE - 3) { targetZone = 'S_C'; entryPoint = 'S'; }
                else if (this.gridCol <= 2) { targetZone = 'C_W'; entryPoint = 'W'; }
                else if (this.gridCol >= GridSystem.GRID_SIZE - 3) { targetZone = 'C_E'; entryPoint = 'E'; }

                if (targetZone && window.changeZone) {
                    this.isMoving = false;
                    this.path = [];
                    this.sprite.vel.x = 0;
                    this.sprite.vel.y = 0;
                    window.changeZone(targetZone, entryPoint);
                    return;
                }
            }
        }

        // Déplacement fluide vers targetWorldX/Y (En dehors du if (!this.isMoving))
        let dx = this.targetWorldX - this.sprite.x;
        let dy = this.targetWorldY - this.sprite.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.speed) {
            this.sprite.x = this.targetWorldX;
            this.sprite.y = this.targetWorldY;
            this.isMoving = false;
            this.sprite.vel.x = 0;
            this.sprite.vel.y = 0;
        } else {
            let angle = Math.atan2(dy, dx);
            this.sprite.vel.x = Math.cos(angle) * this.speed;
            this.sprite.vel.y = Math.sin(angle) * this.speed;
        }
    }
}

window.Player = Player;
console.log("✅ Player.js chargé");
