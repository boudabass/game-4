/*
 * Engine.Clock (socle partagé v2)
 * Horloge de jeu : 1 minute réelle = 1 heure en jeu (défaut), un jour = 24 min.
 * Le temps s'écoule pareil partout, et se met en PAUSE pendant les
 * mini-jeux/dialogues/menus (le jeu appelle pause()/resume()).
 *
 * Utilisation :
 *   Engine.Clock.configure({ startHour: 7, onNewDay: (day) => {...} });
 *   Engine.Clock.update(deltaTime);   // à chaque frame (deltaTime p5, en ms)
 *   Engine.Clock.timeString();        // "07:30"
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.Clock = {
        // 1 min réelle = 1 h de jeu  ->  1 min de jeu = 1000 ms réelles.
        msPerGameMinute: 1000,

        day: 1,
        hour: 7,
        minute: 0,
        paused: false,

        _acc: 0,          // accumulateur de ms réelles
        _onNewDay: null,  // callback(dayNumber) à minuit
        _onHour: null,    // callback(hour) à chaque heure pleine

        configure: function (opts) {
            opts = opts || {};
            if (typeof opts.msPerGameMinute === "number") this.msPerGameMinute = opts.msPerGameMinute;
            if (typeof opts.startHour === "number") this.hour = opts.startHour;
            if (typeof opts.startDay === "number") this.day = opts.startDay;
            if (typeof opts.onNewDay === "function") this._onNewDay = opts.onNewDay;
            if (typeof opts.onHour === "function") this._onHour = opts.onHour;
            return this;
        },

        pause: function () { this.paused = true; },
        resume: function () { this.paused = false; },

        // Avance le temps. dt = millisecondes réelles écoulées (p5 deltaTime).
        update: function (dt) {
            if (this.paused) return;
            this._acc += dt;
            while (this._acc >= this.msPerGameMinute) {
                this._acc -= this.msPerGameMinute;
                this.minute++;
                if (this.minute >= 60) {
                    this.minute = 0;
                    this.hour++;
                    if (this.hour >= 24) {
                        this.hour = 0;
                        this.day++;
                        if (this._onNewDay) this._onNewDay(this.day);
                    }
                    if (this._onHour) this._onHour(this.hour);
                }
            }
        },

        // Restaure un état sauvegardé.
        setTime: function (day, hour, minute) {
            this.day = Math.max(1, day || 1);
            this.hour = Math.min(23, Math.max(0, hour || 0));
            this.minute = Math.min(59, Math.max(0, minute || 0));
            this._acc = 0;
        },

        timeString: function () {
            var h = (this.hour < 10 ? "0" : "") + this.hour;
            var m = (this.minute < 10 ? "0" : "") + this.minute;
            return h + ":" + m;
        },

        // Saison basée sur le jour (cycle de 4 jours par saison pour le test).
        getSeason: function () {
            var r = this.day % 4;
            if (r === 1) return 'printemps';
            if (r === 2) return 'ete';
            if (r === 3) return 'automne';
            return 'hiver';
        }
    };
})();
