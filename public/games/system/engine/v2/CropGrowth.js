/*
 * Engine.CropGrowth (socle partagé v2)
 * Suivi de la pousse des cultures plantées.
 * Chaque jour de jeu (via onNewDay), incrémente le compteur des cultures arrosées.
 * Quand growthDays est atteint → mature, prêt à récolter.
 *
 * Utilisation :
 *   var crops = new CropGrowth();
 *   crops.register(3, 5, { id: 'ble', growthDays: 4 });
 *   // Dans la boucle onNewDay :
 *   Engine.Clock.configure({ onNewDay: function(day) { crops.onNewDay(day); } });
 *   crops.isMature(3, 5);   // true après 4 jours arrosés
 *   crops.harvest(3, 5);    // retourne 'ble', nettoie la tuile
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class CropGrowth {
    constructor() {
        this._crops = {};  // "c,r" → { cropId, growthDays, daysElapsed, watered }
    }

    _key(c, r) {
        return c + "," + r;
    }

    // --- Enregistrement ---
    register(c, r, cropData) {
        var k = this._key(c, r);
        this._crops[k] = {
            cropId: cropData.id || cropData.cropId || null,
            growthDays: cropData.growthDays || 4,
            daysElapsed: 0,
            watered: true  // commence arrosé (le jour de plantation)
        };
    }

    // --- Appelé chaque nouveau jour de jeu ---
    onNewDay(day) {
        var keys = Object.keys(this._crops);
        for (var i = 0; i < keys.length; i++) {
            var crop = this._crops[keys[i]];
            // Ne pousse que si arrosé ET pas encore mature
            if (crop.watered && crop.daysElapsed < crop.growthDays) {
                crop.daysElapsed++;
                crop.watered = false;  // doit être ré-arrosé chaque jour
            }
        }
    }

    // --- État ---
    getStage(c, r) {
        var crop = this._crops[this._key(c, r)];
        if (!crop) return null;
        return {
            cropId: crop.cropId,
            daysElapsed: crop.daysElapsed,
            growthDays: crop.growthDays,
            daysRemaining: Math.max(0, crop.growthDays - crop.daysElapsed),
            mature: crop.daysElapsed >= crop.growthDays,
            watered: crop.watered
        };
    }

    isMature(c, r) {
        var crop = this._crops[this._key(c, r)];
        return crop ? crop.daysElapsed >= crop.growthDays : false;
    }

    // --- Récolte ---
    harvest(c, r) {
        var k = this._key(c, r);
        var crop = this._crops[k];
        if (!crop || !this.isMature(c, r)) return null;
        var cropId = crop.cropId;
        delete this._crops[k];
        return cropId;
    }

    // Marque comme arrosé (appelé par le système d'arrosage)
    setWatered(c, r, val) {
        var crop = this._crops[this._key(c, r)];
        if (crop) {
            crop.watered = !!val;
            return true;
        }
        return false;
    }

    isWatered(c, r) {
        var crop = this._crops[this._key(c, r)];
        return crop ? !!crop.watered : false;
    }

    // --- Persistance ---
    gather() {
        return {
            crops: JSON.parse(JSON.stringify(this._crops))
        };
    }

    apply(data) {
        if (!data) return;
        this._crops = {};
        if (data.crops) {
            var keys = Object.keys(data.crops);
            for (var i = 0; i < keys.length; i++) {
                this._crops[keys[i]] = JSON.parse(JSON.stringify(data.crops[keys[i]]));
            }
        }
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.CropGrowth = CropGrowth;
}
