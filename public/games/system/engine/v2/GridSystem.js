/*
 * Engine.Grid (socle partagé v2)
 * Grille de tuiles : conversions monde <-> tuile, praticabilité (obstacles),
 * rendu debug. Une seule grille active à la fois (suffisant pour nos jeux).
 *
 * Utilisation :
 *   Engine.Grid.configure({ cols: 30, rows: 20, tileSize: 64 });
 *   Engine.Grid.setWalkable(5, 3, false);       // poser un obstacle
 *   var t = Engine.Grid.toTile(worldX, worldY); // {c, r} ou null hors grille
 *   var p = Engine.Grid.toWorld(c, r);          // centre de la tuile {x, y}
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.Grid = {
        cols: 1,
        rows: 1,
        tileSize: 64,
        _blocked: {}, // clés "c,r" des tuiles non praticables

        configure: function (opts) {
            opts = opts || {};
            if (typeof opts.cols === "number") this.cols = opts.cols;
            if (typeof opts.rows === "number") this.rows = opts.rows;
            if (typeof opts.tileSize === "number") this.tileSize = opts.tileSize;
            this._blocked = {};
            return this;
        },

        worldWidth: function () { return this.cols * this.tileSize; },
        worldHeight: function () { return this.rows * this.tileSize; },

        inBounds: function (c, r) {
            return c >= 0 && r >= 0 && c < this.cols && r < this.rows;
        },

        setWalkable: function (c, r, walkable) {
            var k = c + "," + r;
            if (walkable) delete this._blocked[k];
            else this._blocked[k] = true;
        },

        isWalkable: function (c, r) {
            return this.inBounds(c, r) && !this._blocked[c + "," + r];
        },

        // Centre de la tuile en coordonnées monde.
        toWorld: function (c, r) {
            return {
                x: c * this.tileSize + this.tileSize / 2,
                y: r * this.tileSize + this.tileSize / 2
            };
        },

        // Tuile contenant un point monde, ou null hors grille.
        toTile: function (wx, wy) {
            var c = Math.floor(wx / this.tileSize);
            var r = Math.floor(wy / this.tileSize);
            return this.inBounds(c, r) ? { c: c, r: r } : null;
        },

        // Rendu debug : lignes de grille + obstacles remplis.
        // colors = { line: "...", blocked: "..." } (optionnel).
        drawDebug: function (colors) {
            colors = colors || {};
            var s = this.tileSize;
            stroke(colors.line || "rgba(255,255,255,0.15)");
            strokeWeight(1);
            noFill();
            for (var c = 0; c <= this.cols; c++) line(c * s, 0, c * s, this.rows * s);
            for (var r = 0; r <= this.rows; r++) line(0, r * s, this.cols * s, r * s);
            noStroke();
            fill(colors.blocked || "rgba(120,120,120,0.8)");
            for (var k in this._blocked) {
                var parts = k.split(",");
                rect(parts[0] * s + 2, parts[1] * s + 2, s - 4, s - 4, 4);
            }
        }
    };
})();
