/*
 * Engine.ChallengeSystem (socle partagé v2)
 * Système de défis météo/article 528. Remplace/étend DisasterSystem
 * avec le format enrichi article 432/528 (challenges.json).
 *
 * Chaque nouveau jour, un défi peut survenir via son trigger (météo, etc.).
 * L'effet est appliqué (crop-damage, etc.), une notification est émise,
 * et les données de réconciliation sont préparées.
 *
 * Utilisation :
 *   var cs = new ChallengeSystem();
 *   cs.configure({ challenges: challengesData });
 *   var triggered = cs.check(season, day);   // → [] ou null
 *   cs.apply(triggered, soilSystem, cropGrowth, day);
 *   cs.getLastNotification();                // → {icon, title, msg, t, detail}
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class ChallengeSystem {
    constructor() {
        this._challenges = {};       // challengeId → challengeData (deep copy)
        this._history = [];          // [{day, challengeId, season, affected, tiles}]
        this._activeEffects = {};    // "c,r" → {visual, endDay}
        this._lastNotification = null; // {icon, title, msg, t, detail}
    }

    // --- Configuration ---
    configure(opts) {
        opts = opts || {};
        if (opts.challenges) {
            this._challenges = {};
            for (var i = 0; i < opts.challenges.length; i++) {
                var c = opts.challenges[i];
                this._challenges[c.id] = JSON.parse(JSON.stringify(c));
            }
        }
        return this;
    }

    // --- Vérification des déclencheurs ---
    /*
     * Vérifie si un ou plusieurs défis se déclenchent ce jour.
     * season : 'printemps'|'ete'|'automne'|'hiver'
     * day : numéro du jour
     * Retourne un tableau d'objets {id, label, season, day, effect,
     *         notification, reconciliation, mitigation, mitigationLabel}
     * ou null si aucun défi ne se déclenche.
     */
    check(season, day) {
        var triggered = [];
        for (var id in this._challenges) {
            if (!this._challenges.hasOwnProperty(id)) continue;
            var c = this._challenges[id];
            if (c.season !== season) continue;

            var trig = c.trigger;
            if (!trig) continue;

            if (trig.type === 'weather') {
                if (Math.random() < (trig.chance || 0.1)) {
                    triggered.push({
                        id: c.id,
                        label: c.label,
                        season: season,
                        day: day,
                        effect: c.effect,
                        notification: c.notification,
                        reconciliation: c.reconciliation,
                        mitigation: c.mitigation,
                        mitigationLabel: c.mitigationLabel
                    });
                }
            }
        }
        return triggered.length > 0 ? triggered : null;
    }

    // --- Application des effets ---
    /*
     * Applique les effets des défis déclenchés.
     * challenges : tableau retourné par check()
     * soilSystem : instance Engine.SoilSystem
     * cropGrowth : instance Engine.CropGrowth
     * day : numéro du jour courant
     * Retourne {affected: N, details: [{challengeId, cropsAffected, tiles}]}
     */
    apply(challenges, soilSystem, cropGrowth, day) {
        if (!challenges || !challenges.length) return null;

        var totalResult = { affected: 0, details: [] };

        for (var ci = 0; ci < challenges.length; ci++) {
            var ch = challenges[ci];
            var cdef = this._challenges[ch.id];
            if (!cdef) continue;

            var eff = cdef.effect;
            var result = { challengeId: ch.id, cropsAffected: 0, tiles: [] };

            if (eff && eff.type === 'crop-damage' && soilSystem && cropGrowth) {
                // Collecter toutes les tuiles plantées non protégées
                var keys = Object.keys(soilSystem._tiles);
                var targets = [];
                for (var i = 0; i < keys.length; i++) {
                    var tile = soilSystem._tiles[keys[i]];
                    if (tile && tile.state === 'planted') {
                        // filtre non-protege : toutes sont non-protégées
                        // (la serre n'est pas encore implémentée côté jeu)
                        targets.push(keys[i]);
                    }
                }

                if (targets.length > 0) {
                    var ratio = eff.ratio || 0.4;
                    var maxAffected = eff.maxAffected || 2;
                    var toDamage = Math.min(maxAffected,
                        Math.max(1, Math.ceil(targets.length * ratio)));

                    // Mélange Fisher-Yates
                    for (var j = targets.length - 1; j > 0; j--) {
                        var ri = Math.floor(Math.random() * (j + 1));
                        var tmp = targets[j];
                        targets[j] = targets[ri];
                        targets[ri] = tmp;
                    }

                    var stateAfter = eff.stateAfter || 'tilled';
                    var endDay = (day || 0) + (eff.durationDays || 1);

                    for (var k = 0; k < toDamage; k++) {
                        var parts = targets[k].split(',');
                        var cc = parseInt(parts[0]), rr = parseInt(parts[1]);
                        var key = targets[k];

                        // Sauvegarder l'état avant pour la réconciliation
                        result.tiles.push({
                            c: cc, r: rr,
                            previousState: 'planted',
                            previousCropId: soilSystem._tiles[key].cropId
                        });

                        // Réinitialiser au stateAfter (tilled par défaut)
                        soilSystem._tiles[key] = {
                            state: stateAfter,
                            cropId: null,
                            watered: false
                        };
                        cropGrowth.resetTile(cc, rr);

                        // Marquer l'effet visuel
                        this._activeEffects[key] = {
                            visual: eff.visual || 'frost',
                            endDay: endDay
                        };

                        result.cropsAffected++;
                    }
                }
            }

            totalResult.affected += result.cropsAffected;
            totalResult.details.push(result);

            // Historique avec données de réconciliation
            this._history.push({
                day: ch.day,
                challengeId: ch.id,
                season: ch.season,
                affected: result.cropsAffected,
                tiles: result.tiles,
                reconciliation: cdef.reconciliation || null
            });

            // Définir la notification (la dernière gagne si plusieurs)
            if (cdef.notification) {
                this._lastNotification = {
                    icon: cdef.notification.icon || '',
                    title: cdef.notification.title || '',
                    msg: cdef.notification.msg || '',
                    t: null, // sera rempli par le jeu (millis())
                    detail: result
                };
            }
        }

        return totalResult;
    }

    // --- Nettoyage des effets visuels expirés ---
    cleanEffects(currentDay) {
        var keys = Object.keys(this._activeEffects);
        for (var i = 0; i < keys.length; i++) {
            if (this._activeEffects[keys[i]].endDay < currentDay) {
                delete this._activeEffects[keys[i]];
            }
        }
    }

    // --- Requêtes ---
    getEffectAt(c, r) {
        var key = c + ',' + r;
        return this._activeEffects[key] || null;
    }

    getHistory() {
        return this._history.slice();
    }

    getLastNotification() {
        return this._lastNotification;
    }

    clearNotification() {
        this._lastNotification = null;
    }

    // --- Persistance ---
    gather() {
        return {
            history: JSON.parse(JSON.stringify(this._history)),
            activeEffects: JSON.parse(JSON.stringify(this._activeEffects))
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
        this._activeEffects = {};
        if (data.activeEffects) {
            var keys = Object.keys(data.activeEffects);
            for (var j = 0; j < keys.length; j++) {
                this._activeEffects[keys[j]] = JSON.parse(
                    JSON.stringify(data.activeEffects[keys[j]])
                );
            }
        }
        this._lastNotification = null;
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.ChallengeSystem = ChallengeSystem;
}
