const PersonStates = {
    IDLE: 'IDLE',
    GOING_TO_WORK: 'GOING_TO_WORK',
    WORKING: 'WORKING',
    RESTING: 'RESTING'
};

class Person {
    constructor(id, startCol, startRow, color = 'yellow', group = null) {
        this.id = id;
        this.gridCol = startCol;
        this.gridRow = startRow;
        this.isMoving = false;
        this.path = [];
        this.speed = 1.5; // Légèrement plus lent pour le réalisme
        this.color = color;
        this.isVisible = true;
        this.state = PersonStates.IDLE;
        this.targetBuilding = null; // Bâtiment de destination pour l'entrée visuelle

        // Position monde (p5play)
        if (window.GridSystem && typeof GridSystem.gridToWorld === 'function') {
            let worldPos = GridSystem.gridToWorld(startCol, startRow);
            this.targetWorldX = worldPos.x;
            this.targetWorldY = worldPos.y;

            if (window.Sprite) {
                // Utiliser le groupe s'il existe, sinon créer un sprite libre
                this.sprite = group ? new group.Sprite(worldPos.x, worldPos.y) : new Sprite(worldPos.x, worldPos.y);
                this.sprite.width = 16;
                this.sprite.height = 16;
                this.sprite.color = this.color;
                this.sprite.collider = 'kinematic';
                this.sprite.layer = 200; // S'assurer que les citoyens sont au dessus

                // Ajout d'une petite ombre pour le look "premium"
                this.sprite.draw = () => {
                    push();
                    fill(0, 0, 0, 50);
                    noStroke();
                    ellipse(0, 7, 12, 6); // Ombre au sol

                    fill(this.color);
                    stroke(0, 0, 0, 80);
                    rect(0, 0, 16, 16, 2); // Corps avec coins arrondis
                    pop();
                };
            }
        }
    }

    setPath(path) {
        this.path = path;
    }

    update() {
        if (!this.sprite) return;

        // Gestion visibilité basée sur l'état
        if (this.state === PersonStates.WORKING) {
            this.sprite.visible = false;
        } else {
            this.sprite.visible = this.isVisible;
        }

        if (this.path.length > 0 || this.isMoving) {
            this.moveAlongPath();
        }
    }

    moveAlongPath() {
        if (!this.isMoving) {
            if (this.path.length === 0) return;

            let nextNode = this.path.shift();
            let nextWorldPos = GridSystem.gridToWorld(nextNode.col, nextNode.row);

            this.targetWorldX = nextWorldPos.x;
            this.targetWorldY = nextWorldPos.y;
            this.isMoving = true;
            this.gridCol = nextNode.col;
            this.gridRow = nextNode.row;
        }

        let dx = this.targetWorldX - this.sprite.x;
        let dy = this.targetWorldY - this.sprite.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.speed) {
            this.sprite.x = this.targetWorldX;
            this.sprite.y = this.targetWorldY;
            this.isMoving = false;
            this.sprite.vel.x = 0;
            this.sprite.vel.y = 0;

            // Événements de fin de trajet complet
            if (this.path.length === 0) {
                // Callback d'arrivée
                if (this.onArrival) {
                    this.onArrival();
                    this.onArrival = null;
                }

                // Si on a un bâtiment cible vers lequel entrer (phase finale visuelle)
                if (this.targetBuilding && this.state === PersonStates.GOING_TO_WORK) {
                    const bPos = GridSystem.gridToWorld(this.targetBuilding.gridPos.col, this.targetBuilding.gridPos.row);
                    this.targetWorldX = bPos.x;
                    this.targetWorldY = bPos.y;
                    this.isMoving = true;
                    this.targetBuilding = null; // On y est presque
                    return; // On continue le mouvement vers le centre
                }

                // Transition d'état finale (si on n'avait pas de targetBuilding ou si phase terminée)
                if (this.state === PersonStates.GOING_TO_WORK) {
                    this.state = PersonStates.WORKING;
                }
            }
        } else {
            let angle = Math.atan2(dy, dx);
            this.sprite.vel.x = Math.cos(angle) * this.speed;
            this.sprite.vel.y = Math.sin(angle) * this.speed;
        }
    }

    teleport(col, row) {
        this.gridCol = col;
        this.gridRow = row;
        let worldPos = GridSystem.gridToWorld(col, row);
        if (this.sprite) {
            this.sprite.x = worldPos.x;
            this.sprite.y = worldPos.y;
        }
        this.targetWorldX = worldPos.x;
        this.targetWorldY = worldPos.y;
        this.isMoving = false;
        this.path = [];

        // Si on téléporte, on repasse en IDLE si on n'est pas en train de travailler
        if (this.state !== PersonStates.WORKING) {
            this.state = PersonStates.IDLE;
        }
    }
}

window.Person = Person;
window.PersonStates = PersonStates;
console.log("👥 Person Class and States Loaded");
