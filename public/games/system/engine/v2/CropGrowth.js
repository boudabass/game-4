/*
 * Engine.CropGrowth (socle partagé v2)
 * Gère la croissance des cultures plantées, basée sur les jours de jeu.
 *
 * Chaque jour (Engine.Clock.onNewDay), le compteur daysRemaining décrémente.
 * Quand il atteint 0, la culture est mature et prête à être récoltée.
 *
 * Utilisation :
 *   const crops = new Engine.CropGrowth();
 *   crops.register(c, r, { id: 'asperge', growthDays: 6 });
 *   crops.onNewDay(day);              // appeler à chaque nouveau jour
 *   crops.getStage(c, r);             // { stage, daysRemaining, cropId, ... }
 *   crops.isMature(c, r);             // true/false
 *   crops.harvest(c, r);              // retourne { cropId } ou null
 *
 *   // Brancher sur l'horloge :
 *   Engine.Clock.configure({
 *     onNewDay: (day) => { crops.onNewDay(day); }
 *   });
 *
 *   // Sauvegarde :
 *   Engine.Save.configure({
 *     gather: () => ({ crops: crops.gather() }),
 *     apply: (data) => { if (data.crops) crops.apply(data.crops); }
 *   });
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.CropGrowth = class CropGrowth {
        constructor() {
            // _crops : { "c,r": { cropId, growthDays, daysRemaining, mature } }
            this._crops = {};
        }

        _key(c, r) {
            return c + ',' + r;
        }

        // --- Actions ---

        /**
         * Enregistre une culture plantée sur une cellule.
         * @param {number} c - colonne
         * @param {number} r - ligne
         * @param {object} cropData - { id, growthDays }
         */
        register(c, r, cropData) {
            var key = this._key(c, r);
            this._crops[key] = {
                cropId: cropData.id,
                growthDays: cropData.growthDays,
                daysRemaining: cropData.growthDays,
                mature: false
            };
        }

        /**
         * Appelé à chaque nouveau jour de jeu pour faire progresser les cultures.
         * @param {number} day - numéro du jour (non utilisé, conservé pour compatibilité)
         */
        onNewDay(day) {
            for (var key in this._crops) {
                if (!this._crops.hasOwnProperty(key)) continue;
                var crop = this._crops[key];
                if (!crop.mature && crop.daysRemaining > 0) {
                    crop.daysRemaining--;
                    if (crop.daysRemaining <= 0) {
                        crop.daysRemaining = 0;
                        crop.mature = true;
                    }
                }
            }
        }

        // --- Requêtes ---

        /**
         * Retourne le stade de croissance d'une culture.
         * @returns {object|null} { cropId, growthDays, daysRemaining, mature, stage }
         */
        getStage(c, r) {
            var crop = this._crops[this._key(c, r)];
            if (!crop) return null;
            return {
                cropId: crop.cropId,
                growthDays: crop.growthDays,
                daysRemaining: crop.daysRemaining,
                mature: crop.mature,
                stage: crop.mature ? 'mature'
                    : (crop.daysRemaining < crop.growthDays ? 'growing' : 'seed')
            };
        }

        /**
         * Vérifie si la culture est prête à récolter.
         */
        isMature(c, r) {
            var crop = this._crops[this._key(c, r)];
            return crop ? crop.mature : false;
        }

        /**
         * Récolte une culture mature et la retire de la grille.
         * @returns {object|null} { cropId } ou null si pas mature
         */
        harvest(c, r) {
            var key = this._key(c, r);
            var crop = this._crops[key];
            if (!crop || !crop.mature) return null;
            delete this._crops[key];
            return { cropId: crop.cropId };
        }

        /**
         * Supprime une culture sans récolter (ex. destruction par gel).
         */
        remove(c, r) {
            delete this._crops[this._key(c, r)];
        }

        // --- Persistance (gather/apply pour SaveManager) ---

        gather() {
            return {
                crops: JSON.parse(JSON.stringify(this._crops))
            };
        }

        apply(data) {
            this._crops = JSON.parse(JSON.stringify(data.crops || {}));
        }
    };

    console.log("🌿 Engine.CropGrowth v2 chargé");
})();
