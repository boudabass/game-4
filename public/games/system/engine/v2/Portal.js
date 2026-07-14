/*
 * Engine.Portal (socle partagé v2)
 * Gestion des portails entre zones : détection de déclenchement et données.
 * Deux types : simple (transition directe) et à choix (popup).
 *
 * Format données (article 433 §4) :
 *   Portail simple  : { id, from: { zone, cells: [[c,r],...] }, to: { zone, entry: { col, row } } }
 *   Portail à choix : { id, from: { zone, cells: [[c,r],...] }, choices: [{ label, to: {...} }] }
 *
 * Utilisation :
 *   Engine.Portal.configure([{ id: "p1", from: {...}, to: {...} }, ...]);
 *   var p = Engine.Portal.checkTrigger("ferme", 27, 9);
 *   // p = null ou l'objet portail déclenché { id, type: "simple"|"choice", ... }
 *
 * Pattern IIFE window.Engine.
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.Portal = {
        _portals: [],

        /*
         * configure(portalsData)
         * portalsData : tableau d'objets portail (format article 433 §4).
         */
        configure: function (portalsData) {
            this._portals = portalsData || [];
            console.log("[Portal] " + this._portals.length + " portail(s) configuré(s)");
            return this;
        },

        /*
         * checkTrigger(zoneId, col, row)
         * Vérifie si la position (col, row) déclenche un portail dans la zone zoneId.
         * Retourne l'objet portail enrichi avec .type = "simple"|"choice", ou null.
         *
         * Accepte col/row OU c/r (normalisation).
         */
        checkTrigger: function (zoneId, col, row) {
            for (var i = 0; i < this._portals.length; i++) {
                var p = this._portals[i];
                var from = p.from;
                if (!from || from.zone !== zoneId) continue;

                var cells = from.cells;
                if (!cells) continue;

                for (var j = 0; j < cells.length; j++) {
                    var cell = cells[j];
                    var cc = cell[0]; // col (ou c)
                    var rr = cell[1]; // row (ou r)
                    if (cc === col && rr === row) {
                        // Enrichir avec le type
                        var result = {
                            id: p.id,
                            from: p.from
                        };
                        if (p.choices) {
                            result.type = "choice";
                            result.choices = p.choices;
                        } else if (p.to) {
                            result.type = "simple";
                            result.to = p.to;
                        }
                        return result;
                    }
                }
            }
            return null;
        },

        /*
         * getPortalsForZone(zoneId)
         * Retourne tous les portails dont from.zone === zoneId.
         */
        getPortalsForZone: function (zoneId) {
            var result = [];
            for (var i = 0; i < this._portals.length; i++) {
                if (this._portals[i].from && this._portals[i].from.zone === zoneId) {
                    result.push(this._portals[i]);
                }
            }
            return result;
        },

        /* Liste tous les IDs de portails. */
        listPortals: function () {
            var ids = [];
            for (var i = 0; i < this._portals.length; i++) {
                ids.push(this._portals[i].id);
            }
            return ids;
        }
    };

    console.log("🚪 Engine.Portal v2 chargé");
})();
