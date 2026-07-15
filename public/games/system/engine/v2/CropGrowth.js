/*
 * Engine.CropGrowth (socle partagé v2)
 * Pousse des cultures basée sur les jours de jeu.
 * Incrémente les stades de croissance à chaque onNewDay().
 *
 * Utilisation :
 *   var growth = new CropGrowth();
 *   growth.configure({ cultures: culturesData });
 *   growth.plant(5, 5, 'ble', Engine.Clock.day);
 *   growth.onNewDay(Engine.Clock.day);  // appelé par le jeu chaque nouveau jour
 *   growth.isMature(5, 5);             // true si croissance terminée
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class CropGrowth {
    constructor() {
        this._growth = {};     // "c,r" → { cropId, plantedDay, currentDay }
        this._cultures = {};   // cropId → cropData (cache rapide)
    }

    _key(c, r) {
        return c + "," + r;
    }

    // --- Configuration ---
    configure(opts) {
        opts = opts || {};
        if (opts.cultures) {
            this._cultures = {};
            for (var i = 0; i < opts.cultures.length; i++) {
                this._cultures[opts.cultures[i].id] = opts.cultures[i];
            }
        }
        return this;
    }

    // --- Actions ---
    plant(c, r, cropId, plantedDay) {
        var k = this._key(c, r);
        this._growth[k] = {
            cropId: cropId,
            plantedDay: plantedDay || 1,
            currentDay: plantedDay || 1
        };
    }

    // Appelé chaque nouveau jour de jeu.
    // day = numéro du nouveau jour (Engine.Clock.day)
    onNewDay(day) {
        var keys = Object.keys(this._growth);
        for (var i = 0; i < keys.length; i++) {
            this._growth[keys[i]].currentDay = day;
        }
    }

    // --- État ---
    isMature(c, r) {
        var g = this._growth[this._key(c, r)];
        if (!g) return false;
        var crop = this._cultures[g.cropId];
        if (!crop) return false;
        return (g.currentDay - g.plantedDay) >= crop.growthDays;
    }

    // Fraction de croissance 0..1 pour le rendu visuel
    getGrowthStage(c, r) {
        var g = this._growth[this._key(c, r)];
        if (!g) return -1;
        var crop = this._cultures[g.cropId];
        if (!crop || crop.growthDays <= 0) return 0;
        var elapsed = Math.max(0, g.currentDay - g.plantedDay);
        return Math.min(1.0, elapsed / crop.growthDays);
    }

    getDaysUntilMature(c, r) {
        var g = this._growth[this._key(c, r)];
        if (!g) return -1;
        var crop = this._cultures[g.cropId];
        if (!crop) return -1;
        var remaining = crop.growthDays - (g.currentDay - g.plantedDay);
        return Math.max(0, remaining);
    }

    getCropData(cropId) {
        return this._cultures[cropId] || null;
    }

    getCropId(c, r) {
        var g = this._growth[this._key(c, r)];
        return g ? g.cropId : null;
    }

    resetTile(c, r) {
        delete this._growth[this._key(c, r)];
    }

    // --- Persistance ---
    gather() {
        return {
            growth: JSON.parse(JSON.stringify(this._growth))
        };
    }

    apply(data) {
        if (!data) return;
        this._growth = {};
        if (data.growth) {
            var keys = Object.keys(data.growth);
            for (var i = 0; i < keys.length; i++) {
                this._growth[keys[i]] = JSON.parse(JSON.stringify(data.growth[keys[i]]));
            }
        }
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.CropGrowth = CropGrowth;
}
