// systems/PathfindingSystem.js
// Système de pathfinding A* pour la grille mondiale
// Adapté depuis test-personnage/v1

window.PathfindingSystem = {
    // Trouve un chemin de [startCol, startRow] à [targetCol, targetRow]
    // Retourne un tableau d'objets {col, row} ou null si aucun chemin
    findPath: function (startCol, startRow, targetCol, targetRow) {
        const grid = GridSystem.getCurrentGrid();
        // Validation des limites
        if (!grid[startCol] || !grid[targetCol]) {
            console.warn("⚠️ PathfindingSystem: positions invalides");
            return null;
        }

        const startNode = { col: startCol, row: startRow, f: 0, g: 0, h: 0, parent: null };
        const endNode = { col: targetCol, row: targetRow };

        let openList = [startNode];
        let closedList = [];

        // Protection boucle infinie
        let maxIterations = 10000;
        let iter = 0;

        while (openList.length > 0 && iter < maxIterations) {
            iter++;

            // Trouver le noeud avec le plus petit f
            let lowInd = 0;
            for (let i = 0; i < openList.length; i++) {
                if (openList[i].f < openList[lowInd].f) {
                    lowInd = i;
                }
            }
            let currentNode = openList[lowInd];

            // Fin trouvée ?
            if (currentNode.col === endNode.col && currentNode.row === endNode.row) {
                let curr = currentNode;
                let ret = [];
                while (curr.parent) {
                    ret.push({ col: curr.col, row: curr.row });
                    curr = curr.parent;
                }
                console.log(`✅ Chemin trouvé: ${ret.length} étapes`);
                return ret.reverse(); // On veut du début à la fin
            }

            // Déplacer courant de open à closed
            openList.splice(lowInd, 1);
            closedList.push(currentNode);

            // Voisins naviguables (Haut, Bas, Gauche, Droite)
            let neighbors = [
                { col: currentNode.col + 1, row: currentNode.row },
                { col: currentNode.col - 1, row: currentNode.row },
                { col: currentNode.col, row: currentNode.row + 1 },
                { col: currentNode.col, row: currentNode.row - 1 }
            ];

            for (let i = 0; i < neighbors.length; i++) {
                let neighbor = neighbors[i];

                // Vérifier limites grille
                if (neighbor.col < 0 || neighbor.col >= GridSystem.GRID_SIZE ||
                    neighbor.row < 0 || neighbor.row >= GridSystem.GRID_SIZE) {
                    continue;
                }

                // Vérifier si déjà visité
                if (closedList.find(n => n.col === neighbor.col && n.row === neighbor.row)) {
                    continue;
                }

                // Vérifier si traversable
                if (!this.isTraversable(neighbor.col, neighbor.row)) {
                    continue;
                }

                // G score (coût du début à ici)
                let gScore = currentNode.g + 1;
                let gScoreIsBest = false;

                let existingNeighbor = openList.find(n => n.col === neighbor.col && n.row === neighbor.row);

                if (!existingNeighbor) {
                    gScoreIsBest = true;
                    neighbor.h = Math.abs(neighbor.col - endNode.col) + Math.abs(neighbor.row - endNode.row);
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    openList.push(neighbor);
                } else if (gScore < existingNeighbor.g) {
                    gScoreIsBest = true;
                    existingNeighbor.g = gScore;
                    existingNeighbor.f = existingNeighbor.g + existingNeighbor.h;
                    existingNeighbor.parent = currentNode;
                }
            }
        }

        console.warn("⚠️ Aucun chemin trouvé");
        return null; // Pas de chemin trouvé
    },

    // Vérifie si une case est traversable
    isTraversable: function (col, row) {
        // Utilise la méthode du GridSystem unifié
        return GridSystem.isTraversable(col, row);
    }
};

console.log("✅ PathfindingSystem.js chargé");
