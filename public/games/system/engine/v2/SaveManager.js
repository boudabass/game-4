/*
 * Engine.Save (socle partagé v2)
 * Sauvegarde HYBRIDE : localStorage (rapide) + cloud Odoo (via GameSystem.Save).
 * Le jeu fournit deux callbacks : gather() -> objet à sauvegarder, apply(data).
 *
 * Chaque sauvegarde embarque un horodatage `_savedAt` : au chargement, on
 * compare local vs cloud et on applique la plus récente (self-contained, ne
 * dépend pas du write_date renvoyé par l'API).
 *
 * Chaque jeu déclare sa version de schéma et ses migrations via
 * configure({version, migrations}) : _wrap() embarque _v dans la sauvegarde,
 * et load() applique les migrations de _v+1 jusqu'à version avant apply().
 *
 * Utilisation dans un jeu :
 *   Engine.Save.configure({
 *     key: 'monjeu',
 *     version: 2,
 *     migrations: { 2: function (d) { d.nouveauChamp = 0; return d; } },
 *     gather: () => ({ score: state.score }),
 *     apply: (data) => { state.score = data.score; }
 *   });
 *   await Engine.Save.load();   // au démarrage
 *   Engine.Save.saveLocal();    // souvent (gratuit)
 *   await Engine.Save.saveCloud(); // ponctuel (fin de partie, quitte)
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.Save = {
        _key: null,
        _version: 1,
        _migrations: {},
        _gather: function () { return {}; },
        _apply: function () {},

        configure: function (opts) {
            opts = opts || {};
            if (opts.key) this._key = "engine-save-" + opts.key;
            if (typeof opts.gather === "function") this._gather = opts.gather;
            if (typeof opts.apply === "function") this._apply = opts.apply;
            if (typeof opts.version === "number") this._version = opts.version;
            if (opts.migrations) this._migrations = opts.migrations;
            return this;
        },

        _wrap: function () {
            return { _savedAt: Date.now(), _v: this._version, data: this._gather() };
        },

        // --- Migration de schéma ---
        // Applique les migrations de fromV+1 jusqu'à _version sur le payload
        _migrate: function (data, fromV) {
            var v = fromV;
            while (v < this._version) {
                var next = v + 1;
                if (typeof this._migrations[next] === "function") {
                    data = this._migrations[next](data);
                }
                v = next;
            }
            return data;
        },

        // --- Écriture locale (synchrone, fréquente) ---
        saveLocal: function () {
            if (!this._key) return false;
            try {
                localStorage.setItem(this._key, JSON.stringify(this._wrap()));
                return true;
            } catch (e) {
                console.error("[Engine.Save] localStorage échec:", e);
                return false;
            }
        },

        // --- Écriture cloud (async, ponctuelle) ---
        saveCloud: async function () {
            if (!(window.GameSystem && window.GameSystem.Save)) return false;
            return await window.GameSystem.Save.write(this._wrap());
        },

        // --- Écriture complète (local + cloud) ---
        save: async function () {
            this.saveLocal();
            return await this.saveCloud();
        },

        _readLocal: function () {
            if (!this._key) return null;
            try {
                var raw = localStorage.getItem(this._key);
                return raw ? JSON.parse(raw) : null;
            } catch (e) { return null; }
        },

        _readCloud: async function () {
            if (!(window.GameSystem && window.GameSystem.Save)) return null;
            try {
                return await window.GameSystem.Save.read();
            } catch (e) { return null; }
        },

        // --- Chargement : la sauvegarde la plus récente gagne ---
        load: async function () {
            var local = this._readLocal();
            var cloud = await this._readCloud();

            var localAt = local && local._savedAt ? local._savedAt : 0;
            var cloudAt = cloud && cloud._savedAt ? cloud._savedAt : 0;

            var chosen = null;
            if (!local && !cloud) {
                return false; // aucune sauvegarde -> nouvelle partie
            } else if (cloudAt >= localAt) {
                chosen = cloud;
                // remet le cache local à jour si le cloud était plus récent
                if (this._key && chosen) {
                    try { localStorage.setItem(this._key, JSON.stringify(chosen)); } catch (e) {}
                }
            } else {
                chosen = local;
            }

            var payload = chosen && chosen.data ? chosen.data : chosen;
            if (payload) {
                // migration de schéma avant apply()
                var saveV = chosen && chosen._v ? chosen._v : 1;
                if (saveV < this._version) {
                    payload = this._migrate(payload, saveV);
                }
                this._apply(payload);
            }
            return true;
        }
    };

    console.log("💾 Engine.Save v2 chargé");
})();
