window.PathfindingSystem = {
    // Trouve un chemin de [startCol, startRow] à [targetCol, targetRow]
    // Retourne un tableau d'objets {col, row} ou null si aucun chemin
    findPath: function (startCol, startRow, targetCol, targetRow) {
        // Validation des limites
        if (!GridSystem.grid[startCol] || !GridSystem.grid[targetCol]) return null;

        // Si la destination n'est pas accessible (pas une route et pas le point final accessible), on annule
        // Note: L'utilisateur veut que le perso aille vers un batiment en suivant la route. 
        // Donc la case finale PEUT être un bâtiment, mais les intermédiaires DOIVENT être des routes.

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
                if (neighbor.col < 0 || neighbor.col >= GridSystem.size ||
                    neighbor.row < 0 || neighbor.row >= GridSystem.size) {
                    continue;
                }

                // Vérifier si déjà visité
                if (closedList.find(n => n.col === neighbor.col && n.row === neighbor.row)) {
                    continue;
                }

                // Vérifier si traversable
                // Uniquement les routes sont traversables
                if (!this.isRoad(neighbor.col, neighbor.row)) {
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

        return null; // Pas de chemin trouvé
    },

    isRoad: function (col, row) {
        const cell = GridSystem.grid[col][row];
        // 'road' est l'ID défini dans config.js pour les routes
        // On accepte aussi null (case vide) pour permettre le passage
        // Mais en réalité, on veut SEULEMENT les routes pour les cases intermédiaires
        // La destination peut être n'importe quoi (bâtiment)
        return cell === 'road';
    },

    isWalkable: function (col, row, targetCol, targetRow) {
        // Une case est traversable si :
        // 1. C'est une route
        // 2. OU c'est la destination finale (même si c'est un bâtiment)
        const isRoad = this.isRoad(col, row);
        const isDestination = (col === targetCol && row === targetRow);
        return isRoad || isDestination;
    }
};
