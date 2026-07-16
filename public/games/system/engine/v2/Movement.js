/*
 * Engine.Path + Engine.Mover (socle partagé v2)
 * Déplacement au clic : trajet simple avec contournement basique des obstacles.
 *
 * - Engine.Path.find(grid, from, to) : chemin en BFS 4 directions (pas de
 *   diagonale — lisible et prévisible pour le joueur). Retourne un tableau de
 *   tuiles {c, r} (sans la tuile de départ), ou null si aucun chemin.
 *   Si la destination est bloquée, on vise la tuile praticable la plus proche.
 *
 * - Engine.Mover.create(...) : fabrique un "marcheur" qui suit ce chemin à
 *   vitesse constante. Plusieurs marcheurs possibles (PNJ plus tard).
 *
 * Utilisation :
 *   var perso = Engine.Mover.create({ grid: Engine.Grid, c: 5, r: 5, speed: 3 });
 *   perso.moveTo(tuile.c, tuile.r);  // au clic
 *   perso.update(deltaTime);         // à chaque frame
 *   // perso.x / perso.y = position monde pour le dessin
 */
(function () {
    window.Engine = window.Engine || {};

    // ---------- Recherche de chemin (BFS) ----------
    window.Engine.Path = {
        _DIRS: [ { c: 1, r: 0 }, { c: -1, r: 0 }, { c: 0, r: 1 }, { c: 0, r: -1 } ],

        find: function (grid, from, to) {
            if (!grid.inBounds(to.c, to.r)) return null;
            // Destination bloquée -> on cherche la tuile libre la plus proche.
            if (!grid.isWalkable(to.c, to.r)) {
                to = this._nearestWalkable(grid, to);
                if (!to) return null;
            }
            if (from.c === to.c && from.r === to.r) return [];

            var start = from.c + "," + from.r;
            var goal = to.c + "," + to.r;
            var queue = [from];
            var cameFrom = {};
            cameFrom[start] = null;

            while (queue.length > 0) {
                var cur = queue.shift();
                var curKey = cur.c + "," + cur.r;
                if (curKey === goal) return this._rebuild(cameFrom, to);
                for (var i = 0; i < this._DIRS.length; i++) {
                    var n = { c: cur.c + this._DIRS[i].c, r: cur.r + this._DIRS[i].r };
                    var key = n.c + "," + n.r;
                    if (cameFrom[key] !== undefined) continue;
                    if (!grid.isWalkable(n.c, n.r)) continue;
                    cameFrom[key] = cur;
                    queue.push(n);
                }
            }
            return null; // aucun chemin
        },

        // Remonte le fil des prédécesseurs pour reconstruire le chemin.
        _rebuild: function (cameFrom, to) {
            var path = [];
            var cur = to;
            while (cur) {
                path.push({ c: cur.c, r: cur.r });
                cur = cameFrom[cur.c + "," + cur.r];
            }
            path.pop();      // retire la tuile de départ
            path.reverse();
            return path;
        },

        // Tuile praticable la plus proche de la cible (recherche en anneaux).
        _nearestWalkable: function (grid, to) {
            for (var radius = 1; radius <= 4; radius++) {
                var best = null, bestD = Infinity;
                for (var dc = -radius; dc <= radius; dc++) {
                    for (var dr = -radius; dr <= radius; dr++) {
                        if (Math.max(Math.abs(dc), Math.abs(dr)) !== radius) continue;
                        var c = to.c + dc, r = to.r + dr;
                        if (!grid.isWalkable(c, r)) continue;
                        var d = dc * dc + dr * dr;
                        if (d < bestD) { bestD = d; best = { c: c, r: r }; }
                    }
                }
                if (best) return best;
            }
            return null;
        }
    };

    // ---------- Marcheur ----------
    window.Engine.Mover = {
        create: function (opts) {
            opts = opts || {};
            var grid = opts.grid;
            var start = grid.toWorld(opts.c || 0, opts.r || 0);

            return {
                grid: grid,
                x: start.x,
                y: start.y,
                speed: opts.speed || 3,  // en tuiles par seconde
                _path: [],               // tuiles restantes à parcourir

                tile: function () {
                    return this.grid.toTile(this.x, this.y);
                },

                isMoving: function () { return this._path.length > 0; },

                // Lance (ou relance) un déplacement vers une tuile.
                // range (optionnel) : nb de cases à retirer de la fin du chemin.
                //   range=0 (défaut) → va sur la case.
                //   range=1 → s'arrête une case avant (reste adjacent).
                moveTo: function (c, r, range) {
                    var from = this.tile();
                    var path = window.Engine.Path.find(this.grid, from, { c: c, r: r });
                    if (!path) return;
                    if (typeof range === 'number' && range > 0 && path.length > range) {
                        path = path.slice(0, path.length - range);
                    }
                    if (path.length > 0) this._path = path;
                },

                stop: function () { this._path = []; },

                // Téléportation (spawn, chargement de sauvegarde).
                placeAt: function (c, r) {
                    var p = this.grid.toWorld(c, r);
                    this.x = p.x; this.y = p.y;
                    this._path = [];
                },

                // Avance le long du chemin. dt en millisecondes réelles.
                update: function (dt) {
                    if (this._path.length === 0) return;
                    var step = (this.speed * this.grid.tileSize) * (dt / 1000);
                    while (step > 0 && this._path.length > 0) {
                        var next = this.grid.toWorld(this._path[0].c, this._path[0].r);
                        var dx = next.x - this.x;
                        var dy = next.y - this.y;
                        var d = Math.sqrt(dx * dx + dy * dy);
                        if (d <= step) {
                            this.x = next.x; this.y = next.y;
                            this._path.shift();
                            step -= d;
                        } else {
                            this.x += (dx / d) * step;
                            this.y += (dy / d) * step;
                            step = 0;
                        }
                    }
                },

                // Rendu debug du chemin restant.
                drawDebugPath: function (color) {
                    if (this._path.length === 0) return;
                    noFill();
                    stroke(color || "rgba(255,235,59,0.8)");
                    strokeWeight(3);
                    beginShape();
                    vertex(this.x, this.y);
                    for (var i = 0; i < this._path.length; i++) {
                        var p = this.grid.toWorld(this._path[i].c, this._path[i].r);
                        vertex(p.x, p.y);
                    }
                    endShape();
                    noStroke();
                }
            };
        }
    };
})();
