/*
 * Engine.DisasterSystem (socle partagé v2)
 * Système de catastrophes/défis. Chaque nouveau jour, une catastrophe
 * peut survenir selon la saison et la probabilité configurée.
 *
 * Utilisation :
 *   var ds = new DisasterSystem();
 *   ds.configure({ disasters: catastrophesData });
 *   ds.check(season, day);   // → null ou {id, label, msg, effect}
 *   ds.apply(disaster);      // applique les effets
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class DisasterSystem {
    constructor() {
        this._disasters = {};     // disasterId → disasterData
        this._history = [];       // [{day, disasterId, season}]
    }

    configure(opts) {
        opts = opts || {};
        if (opts.disasters) {
            this._disasters = {};
            for (var i = 0; i < opts.disasters.length; i++) {
                var d = opts.disasters[i];
                this._disasters[d.id] = JSON.parse(JSON.stringify(d));
            }
        }
        return this;
    }

    /*
     * Vérifie si une catastrophe survient ce jour.
     * season : 'printemps'|'ete'|'automne'|'hiver'
     * day : numéro du jour
     * Retourne un objet {id, label, msg, type} ou null.
     */
    check(season, day) {
        var candidates = [];
        for (var id in this._disasters) {
            if (!this._disasters.hasOwnProperty(id)) continue;
            var d = this._disasters[id];
            if (d.season === season) {
                candidates.push(d);
            }
        }
        if (candidates.length === 0) return null;

        // Tirage pondéré par probabilité
        for (var i = 0; i < candidates.length; i++) {
            var prob = candidates[i].probability || 0.1;
            if (Math.random() < prob) {
                return {
                    id: candidates[i].id,
                    label: candidates[i].label,
                    msg: candidates[i].msg,
                    type: candidates[i].type,
                    season: season,
                    day: day
                };
            }
        }
        return null;
    }

    /* Applique les effets d'une catastrophe.
     * Pour gel: détruit une partie des cultures de la saison.
     * Retourne {cropsDestroyed: N} ou null. */
    apply(disaster, soilSystem, cropGrowth) {
        if (!disaster || !soilSystem || !cropGrowth) return null;

        var d = this._disasters[disaster.id];
        if (!d) return null;

        var result = { cropsDestroyed: 0 };

        if (d.type === 'destroy_crops') {
            // Trouver toutes les cultures plantées de la saison
            var keys = Object.keys(soilSystem._tiles);
            var targetTiles = [];
            for (var i = 0; i < keys.length; i++) {
                var tile = soilSystem._tiles[keys[i]];
                if (tile && tile.state === 'planted') {
                    var cropData = cropGrowth.getCropData(tile.cropId);
                    if (cropData && cropData.season === disaster.season) {
                        targetTiles.push(keys[i]);
                    }
                }
            }
            // Détruire jusqu'à maxAffected cultures (ou 1 si non spécifié)
            var maxDestroy = d.maxAffected || 1;
            var toDestroy = Math.min(maxDestroy, targetTiles.length);
            // Shuffle + take
            for (var j = targetTiles.length - 1; j > 0; j--) {
                var ri = Math.floor(Math.random() * (j + 1));
                var tmp = targetTiles[j];
                targetTiles[j] = targetTiles[ri];
                targetTiles[ri] = tmp;
            }
            for (var k = 0; k < toDestroy; k++) {
                var parts = targetTiles[k].split(',');
                var c = parseInt(parts[0]), r = parseInt(parts[1]);
                // Réinitialiser la tuile (remet à tilled — le joueur peut replanter)
                soilSystem._tiles[targetTiles[k]] = { state: 'tilled', cropId: null, watered: false };
                cropGrowth.resetTile(c, r);
                result.cropsDestroyed++;
            }
        }

        // Enregistrer dans l'historique
        this._history.push({
            day: disaster.day,
            disasterId: disaster.id,
            season: disaster.season
        });

        return result;
    }

    getHistory() {
        return this._history.slice();
    }

    // --- Persistance ---
    gather() {
        return {
            history: JSON.parse(JSON.stringify(this._history))
        };
    }

    apply(data) {
        if (!data) return;
        this._history = [];
        if (data.history) {
            for (var i = 0; i < data.history.length; i++) {
                this._history.push(JSON.parse(JSON.stringify(data.history[i])));
            }
        }
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.DisasterSystem = DisasterSystem;
}
