/*
 * Engine.SoilSystem (socle partagé v2)
 * Gestion des états du sol pour la ferme.
 * États : empty → tilled → planted (+ watered flag)
 *
 * Utilisation :
 *   var soil = new SoilSystem();
 *   soil.setCultivable(5, 5, true);
 *   soil.till(5, 5);           // empty → tilled
 *   soil.plant(5, 5, 'asperge'); // tilled → planted
 *   soil.water(5, 5);          // watered = true
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class SoilSystem {
    constructor() {
        this._tiles = {};       // "c,r" → { state, cropId, watered }
        this._cultivable = {};  // "c,r" → true
    }

    _key(c, r) {
        return c + "," + r;
    }

    // --- Gestion des zones cultivables ---
    setCultivable(c, r, bool) {
        var k = this._key(c, r);
        if (bool) {
            this._cultivable[k] = true;
        } else {
            delete this._cultivable[k];
            // Nettoyer la tuile si elle n'est plus cultivable
            delete this._tiles[k];
        }
    }

    isCultivable(c, r) {
        return !!this._cultivable[this._key(c, r)];
    }

    // --- Actions sur le sol ---
    till(c, r) {
        if (!this.isCultivable(c, r)) return false;
        var k = this._key(c, r);
        var tile = this._tiles[k];
        if (!tile || tile.state === 'empty') {
            this._tiles[k] = { state: 'tilled', cropId: null, watered: false };
            return true;
        }
        return false;
    }

    plant(c, r, cropId) {
        var k = this._key(c, r);
        var tile = this._tiles[k];
        if (tile && tile.state === 'tilled') {
            tile.state = 'planted';
            tile.cropId = cropId || null;
            tile.watered = false;
            return true;
        }
        return false;
    }

    water(c, r) {
        var k = this._key(c, r);
        var tile = this._tiles[k];
        if (tile && tile.state === 'planted') {
            tile.watered = true;
            return true;
        }
        return false;
    }

    // --- État ---
    getState(c, r) {
        var tile = this._tiles[this._key(c, r)];
        return tile ? tile.state : 'empty';
    }

    getCropId(c, r) {
        var tile = this._tiles[this._key(c, r)];
        return tile ? tile.cropId : null;
    }

    isWatered(c, r) {
        var tile = this._tiles[this._key(c, r)];
        return tile ? !!tile.watered : false;
    }

    // --- Persistance ---
    gather() {
        return {
            tiles: JSON.parse(JSON.stringify(this._tiles))
            // cultivable = config statique de la map, pas de l'état de jeu → PAS sauvé
        };
    }

    apply(data) {
        if (!data) return;
        this._tiles = {};
        if (data.tiles) {
            var keys = Object.keys(data.tiles);
            for (var i = 0; i < keys.length; i++) {
                this._tiles[keys[i]] = JSON.parse(JSON.stringify(data.tiles[keys[i]]));
            }
        }
        // cultivable = config statique → PAS restauré (géré par setup)
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.SoilSystem = SoilSystem;
}
