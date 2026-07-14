/*
 * Engine.WorldZone (socle partagé v2)
 * Gestion des zones de jeu : chaque zone a sa propre grille, ses obstacles,
 * et un point d'entrée. Une seule zone active à la fois.
 *
 * Utilisation :
 *   Engine.WorldZone.configure({ zones: { ferme: {...}, village: {...} } });
 *   Engine.WorldZone.setCurrent('ferme');
 *   var z = Engine.WorldZone.getCurrent();  // { id, cols, rows, tileSize, obstacles, entryPoint }
 *
 * Pattern IIFE window.Engine.
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.WorldZone = {
        _zones: {},
        _currentId: null,

        /*
         * configure({ zones: { id: { cols, rows, tileSize, obstacles, entryPoint }, ... } })
         * tileSize est optionnel (défaut: 64). entryPoint = { c, r }.
         * obstacles = { rects: [{c,r,w,h}], singles: [{c,r}] }.
         */
        configure: function (opts) {
            opts = opts || {};
            if (opts.zones) {
                this._zones = {};
                for (var id in opts.zones) {
                    if (!opts.zones.hasOwnProperty(id)) continue;
                    var z = opts.zones[id];
                    this._zones[id] = {
                        id: id,
                        cols: z.cols || 1,
                        rows: z.rows || 1,
                        tileSize: z.tileSize || 64,
                        obstacles: z.obstacles || { rects: [], singles: [] },
                        entryPoint: z.entryPoint || { c: Math.floor(z.cols / 2), r: Math.floor(z.rows / 2) }
                    };
                }
            }
            return this;
        },

        /* Retourne la zone active, ou null si aucune. */
        getCurrent: function () {
            if (!this._currentId) return null;
            return this._zones[this._currentId] || null;
        },

        /*
         * Active la zone zoneId. Reconfigure Engine.Grid, replace les obstacles.
         * Retourne true si la zone existe, false sinon.
         */
        setCurrent: function (zoneId) {
            var z = this._zones[zoneId];
            if (!z) {
                console.warn("[WorldZone] Zone inconnue : " + zoneId);
                return false;
            }
            this._currentId = zoneId;

            // Reconfigurer la grille
            Engine.Grid.configure({
                cols: z.cols,
                rows: z.rows,
                tileSize: z.tileSize
            });

            // Poser les obstacles
            if (z.obstacles.rects) {
                z.obstacles.rects.forEach(function (o) {
                    for (var dc = 0; dc < o.w; dc++)
                        for (var dr = 0; dr < o.h; dr++)
                            Engine.Grid.setWalkable(o.c + dc, o.r + dr, false);
                });
            }
            if (z.obstacles.singles) {
                z.obstacles.singles.forEach(function (o) {
                    Engine.Grid.setWalkable(o.c, o.r, false);
                });
            }

            console.log("[WorldZone] Zone active : " + zoneId);
            return true;
        },

        /* Retourne la définition d'une zone par son ID, ou null. */
        getZone: function (zoneId) {
            return this._zones[zoneId] || null;
        },

        /* Liste des IDs de toutes les zones configurées. */
        listZones: function () {
            var ids = [];
            for (var id in this._zones) {
                if (this._zones.hasOwnProperty(id)) ids.push(id);
            }
            return ids;
        }
    };

    console.log("🗺️ Engine.WorldZone v2 chargé");
})();
