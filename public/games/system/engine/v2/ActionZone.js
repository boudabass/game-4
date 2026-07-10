/*
 * Engine.ActionZone (socle partagé v2)
 * Zone d'action autour du personnage : les tuiles sur lesquelles une action
 * est possible (récolter, arroser, parler...). C'est LE pivot d'interaction
 * de la V2 : clic DANS la zone = action, clic HORS zone = déplacement.
 *
 * Distance en "anneaux" (Chebyshev) : range 1 = les 8 tuiles voisines + la
 * tuile du personnage.
 *
 * Utilisation :
 *   Engine.ActionZone.configure({ range: 1 });
 *   if (Engine.ActionZone.contains(perso.tile(), tuileCliquee)) { ...action... }
 *   Engine.ActionZone.drawDebug(Engine.Grid, perso.tile());
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.ActionZone = {
        range: 1,

        configure: function (opts) {
            opts = opts || {};
            if (typeof opts.range === "number") this.range = opts.range;
            return this;
        },

        // La tuile cible est-elle dans la zone d'action ?
        contains: function (centerTile, targetTile) {
            if (!centerTile || !targetTile) return false;
            var dc = Math.abs(targetTile.c - centerTile.c);
            var dr = Math.abs(targetTile.r - centerTile.r);
            return Math.max(dc, dr) <= this.range;
        },

        // Liste des tuiles de la zone (praticables ou non, mais dans la grille).
        tiles: function (grid, centerTile) {
            var out = [];
            if (!centerTile) return out;
            for (var dc = -this.range; dc <= this.range; dc++) {
                for (var dr = -this.range; dr <= this.range; dr++) {
                    var c = centerTile.c + dc, r = centerTile.r + dr;
                    if (grid.inBounds(c, r)) out.push({ c: c, r: r });
                }
            }
            return out;
        },

        // Rendu debug : contour de chaque tuile de la zone.
        drawDebug: function (grid, centerTile, color) {
            var list = this.tiles(grid, centerTile);
            var s = grid.tileSize;
            noFill();
            stroke(color || "rgba(255,235,59,0.55)");
            strokeWeight(2);
            for (var i = 0; i < list.length; i++) {
                rect(list[i].c * s + 3, list[i].r * s + 3, s - 6, s - 6, 6);
            }
            noStroke();
        }
    };
})();
