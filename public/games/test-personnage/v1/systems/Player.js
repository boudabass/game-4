class Player {
    constructor(startCol, startRow) {
        this.gridCol = startCol;
        this.gridRow = startRow;

        let worldPos = GridSystem.gridToWorld(startCol, startRow);

        this.sprite = new Sprite(worldPos.x, worldPos.y);
        this.sprite.width = Config.TILE_SIZE * 0.6;
        this.sprite.height = Config.TILE_SIZE * 0.6;
        this.sprite.color = 'yellow';
        this.sprite.collider = 'kinematic'; // IMPORTANT: permet le mouvement sans collision
        this.sprite.layer = 100; // IMPORTANT: toujours au-dessus de TOUT (bâtiments, routes, etc.)
        // this.sprite.image = 'asset_path'; // Plus tard

        this.path = [];
        this.isMoving = false;
        this.speed = 2; // Vitesse de déplacement (pixels par frame, à ajuster)

        this.targetWorldX = worldPos.x;
        this.targetWorldY = worldPos.y;

        console.log("Player sprite created at world pos:", worldPos.x, worldPos.y);
    }

    setPath(path) {
        this.path = path;
        console.log("Player.setPath called with:", path);
        console.log("Current player state:", {
            gridCol: this.gridCol,
            gridRow: this.gridRow,
            spriteX: this.sprite.x,
            spriteY: this.sprite.y,
            isMoving: this.isMoving,
            pathLength: this.path.length
        });
    }

    update() {
        // Log seulement quand il y a du mouvement
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

            console.log("Starting move to:", nextNode, "world pos:", nextWorldPos);

            // On retire le noeud du chemin car on "l'entame"
            this.path.shift();

            // Mettre à jour la grille (virtuelle) du joueur
            this.gridCol = nextNode.col;
            this.gridRow = nextNode.row;
        }

        // Déplacement fluide vers targetWorldX/Y
        let dx = this.targetWorldX - this.sprite.x;
        let dy = this.targetWorldY - this.sprite.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.speed) {
            // Arrivé
            this.sprite.x = this.targetWorldX;
            this.sprite.y = this.targetWorldY;
            this.isMoving = false;

            console.log("✓ Arrivé à destination!");

            // Arrêt clean physics
            this.sprite.vel.x = 0;
            this.sprite.vel.y = 0;
        } else {
            // Normaliser et appliquer vitesse
            let angle = Math.atan2(dy, dx);
            this.sprite.vel.x = Math.cos(angle) * this.speed;
            this.sprite.vel.y = Math.sin(angle) * this.speed;
        }
    }
}

window.Player = Player;
