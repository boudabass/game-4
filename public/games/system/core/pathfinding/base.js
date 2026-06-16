// public/games/system/core/pathfinding/base.js
// Système de pathfinding A* générique

(function () {
    console.log("🧭 Pathfinding System Initializing...");

    window.PathfindingSystem = {
        // Trouve un chemin de [startCol, startRow] à [targetCol, targetRow]
        // Utilise window.GridSystem par défaut s'il existe
        findPath: function (startCol, startRow, targetCol, targetRow, customGridSystem, onlyRoads = false) {
            const gridSys = customGridSystem || window.GridSystem;
            if (!gridSys) {
                console.error("❌ PathfindingSystem: No GridSystem available");
                return null;
            }

            const startNode = { col: startCol, row: startRow, f: 0, g: 0, h: 0, parent: null };
            const endNode = { col: targetCol, row: targetRow };

            let openList = [startNode];
            let closedList = [];
            let maxIterations = 5000;
            let iter = 0;

            while (openList.length > 0 && iter < maxIterations) {
                iter++;

                let lowInd = 0;
                for (let i = 0; i < openList.length; i++) {
                    if (openList[i].f < openList[lowInd].f) lowInd = i;
                }
                let currentNode = openList[lowInd];

                if (currentNode.col === endNode.col && currentNode.row === endNode.row) {
                    let curr = currentNode;
                    let ret = [];
                    while (curr.parent) {
                        ret.push({ col: curr.col, row: curr.row });
                        curr = curr.parent;
                    }
                    return ret.reverse();
                }

                openList.splice(lowInd, 1);
                closedList.push(currentNode);

                let neighbors = [
                    // Cardinaux (coût 1)
                    { col: currentNode.col + 1, row: currentNode.row, cost: 1 },
                    { col: currentNode.col - 1, row: currentNode.row, cost: 1 },
                    { col: currentNode.col, row: currentNode.row + 1, cost: 1 },
                    { col: currentNode.col, row: currentNode.row - 1, cost: 1 },
                    // Diagonaux (coût ~1.414)
                    { col: currentNode.col + 1, row: currentNode.row + 1, cost: 1.414 },
                    { col: currentNode.col - 1, row: currentNode.row + 1, cost: 1.414 },
                    { col: currentNode.col + 1, row: currentNode.row - 1, cost: 1.414 },
                    { col: currentNode.col - 1, row: currentNode.row - 1, cost: 1.414 }
                ];

                for (let i = 0; i < neighbors.length; i++) {
                    let neighbor = neighbors[i];

                    if (closedList.find(n => n.col === neighbor.col && n.row === neighbor.row)) continue;

                    // Condition de traversabilité
                    let traversable = gridSys.isTraversable(neighbor.col, neighbor.row);

                    if (onlyRoads) {
                        const cellType = gridSys.grid[neighbor.col][neighbor.row];
                        // Si onlyRoads est activé, on ne peut marcher que sur les routes.
                        // Exception: la destination peut être un bâtiment (ou n'importe quoi d'autre si on veut l'atteindre)
                        // mais ici on s'arrête devant le bâtiment sur la route, donc destination = route.
                        if (cellType !== 'road' && !(neighbor.col === targetCol && neighbor.row === targetRow)) {
                            traversable = false;
                        }
                    }

                    if (!traversable) continue;

                    let gScore = currentNode.g + neighbor.cost;
                    let existingNeighbor = openList.find(n => n.col === neighbor.col && n.row === neighbor.row);

                    if (!existingNeighbor) {
                        const dx = Math.abs(neighbor.col - endNode.col);
                        const dy = Math.abs(neighbor.row - endNode.row);
                        neighbor.h = (dx + dy) + (1.414 - 2) * Math.min(dx, dy);

                        neighbor.parent = currentNode;
                        neighbor.g = gScore;
                        neighbor.f = neighbor.g + neighbor.h;
                        openList.push(neighbor);
                    } else if (gScore < existingNeighbor.g) {
                        existingNeighbor.g = gScore;
                        existingNeighbor.f = existingNeighbor.g + existingNeighbor.h;
                        existingNeighbor.parent = currentNode;
                    }
                }
            }
            return null;
        }
    };
})();
