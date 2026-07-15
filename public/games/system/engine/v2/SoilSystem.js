/*
 * Engine.SoilSystem (socle partagé v2)
 * Gère l'état du sol par cellule : labourer, planter, arroser.
 *
 * États : empty → tilled → planted (+ watered booléen)
 *
 * Persistance : expose gather()/apply(data) à brancher dans SaveManager.
 *
 * Utilisation :
 *   const soil = new Engine.SoilSystem();
 *   soil.setCultivable(c, r, true);   // définir les parcelles cultivables
 *   soil.till(c, r);                  // labourer
 *   soil.plant(c, r, 'asperge');      // planter une culture
 *   soil.water(c, r);                 // arroser
 *   soil.getState(c, r);              // 'empty' | 'tilled' | 'planted' | null
 *   soil.getCropId(c, r);             // id de la culture plantée ou null
 *   soil.isWatered(c, r);             // true/false
 *
 *   // Sauvegarde :
 *   Engine.Save.configure({
 *     key: 'elsass-farm',
 *     gather: () => ({ soil: soil.gather() }),
 *     apply: (data) => { if (data.soil) soil.apply(data.soil); }
 *   });
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.SoilSystem = class SoilSystem {
        constructor() {
            // _cells : { "c,r": { state: 'tilled'|'planted', cropId: 'asperge'|null, watered: bool } }
            this._cells = {};
            // _cultivable : { "c,r": true } — seules ces cellules sont cultivables
            this._cultivable = {};
        }

        // --- Helpers ---
        _key(c, r) {
            return c + ',' + r;
        }

        // --- Parcelles cultivables ---
        setCultivable(c, r, bool) {
            this._cultivable[this._key(c, r)] = !!bool;
        }

        isCultivable(c, r) {
            return !!this._cultivable[this._key(c, r)];
        }

        // --- Actions ---
        till(c, r) {
            if (!this.isCultivable(c, r)) return false;
            var key = this._key(c, r);
            this._cells[key] = { state: 'tilled', cropId: null, watered: false };
            return true;
        }

        plant(c, r, cropId) {
            if (!this.isCultivable(c, r)) return false;
            var key = this._key(c, r);
            var cell = this._cells[key];
            if (!cell || cell.state !== 'tilled') return false;
            cell.state = 'planted';
            cell.cropId = cropId;
            return true;
        }

        water(c, r) {
            if (!this.isCultivable(c, r)) return false;
            var key = this._key(c, r);
            var cell = this._cells[key];
            if (!cell || (cell.state !== 'tilled' && cell.state !== 'planted')) return false;
            cell.watered = true;
            return true;
        }

        // --- Requêtes ---
        getState(c, r) {
            var cell = this._cells[this._key(c, r)];
            if (!cell) {
                return this.isCultivable(c, r) ? 'empty' : null;
            }
            return cell.state;
        }

        getCropId(c, r) {
            var cell = this._cells[this._key(c, r)];
            return cell && cell.cropId ? cell.cropId : null;
        }

        isWatered(c, r) {
            var cell = this._cells[this._key(c, r)];
            return cell ? !!cell.watered : false;
        }

        // --- Persistance (gather/apply pour SaveManager) ---
        gather() {
            return {
                cells: JSON.parse(JSON.stringify(this._cells)),
                cultivable: JSON.parse(JSON.stringify(this._cultivable))
            };
        }

        apply(data) {
            this._cells = JSON.parse(JSON.stringify(data.cells || {}));
            this._cultivable = JSON.parse(JSON.stringify(data.cultivable || {}));
        }
    };

    console.log("🌱 Engine.SoilSystem v2 chargé");
})();
