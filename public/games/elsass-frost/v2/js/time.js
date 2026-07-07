/*
 * time.js — Avancée du temps + génération météo sans fin.
 * La météo est générée jour par jour (pas de seed nécessaire : l'historique
 * généré est stocké dans EFState.weather et sérialisé avec la sauvegarde).
 */
window.EFTime = {

    // Initialise la météo d'une nouvelle partie
    initWeather: function () {
        const C = window.EFConfig.WEATHER;
        const S = window.EFState;
        S.weather = {
            base: C.START_TEMP,        // température de fond (dérive lente)
            stormCount: 0,             // nombre de tempêtes passées
            nextStormDay: 4 + Math.floor(Math.random() * (C.STORM_EVERY_MAX - C.STORM_EVERY_MIN + 1)),
            stormLeft: 0,              // jours de tempête restants
            stormDrop: 0,              // intensité de la tempête en cours
            temps: {}                  // {day: temp} déjà générés
        };
        // Jours 1 à 3 : stables pour laisser le joueur s'installer
        S.weather.temps[1] = C.START_TEMP;
        S.weather.temps[2] = C.START_TEMP;
        S.weather.temps[3] = C.START_TEMP - 2;
        this.refreshForecast();
        S.outsideTemp = S.weather.temps[1];
    },

    // Retourne (et génère si besoin) la température d'un jour donné
    tempOfDay: function (day) {
        const C = window.EFConfig.WEATHER;
        const W = window.EFState.weather;
        if (W.temps[day] !== undefined) return W.temps[day];
        // Générer tous les jours manquants dans l'ordre
        let last = Math.max(...Object.keys(W.temps).map(Number));
        while (last < day) {
            last++;
            // Dérive de fond + bruit
            W.base += C.DRIFT_PER_DAY + (Math.random() * 2 - 1) * C.NOISE * 0.4;
            let t = W.base + (Math.random() * 2 - 1) * C.NOISE;

            // Gestion des tempêtes
            if (W.stormLeft > 0) {
                t -= W.stormDrop;
                W.stormLeft--;
                if (W.stormLeft === 0) {
                    // Fin de tempête : on planifie la suivante (la chute de la
                    // tempête est transitoire, la base continue sa dérive lente)
                    W.nextStormDay = last + C.STORM_EVERY_MIN +
                        Math.floor(Math.random() * (C.STORM_EVERY_MAX - C.STORM_EVERY_MIN + 1));
                }
            } else if (last >= W.nextStormDay) {
                W.stormCount++;
                W.stormDrop = C.STORM_BASE_DROP + W.stormCount * C.STORM_GROWTH;
                W.stormLeft = C.STORM_DURATION;
                t -= W.stormDrop;
            }
            W.temps[last] = Math.round(t);
        }
        return W.temps[day];
    },

    // Met à jour EFState.forecast (jour courant + 4 suivants)
    refreshForecast: function () {
        const S = window.EFState;
        S.forecast = [];
        for (let d = S.day; d < S.day + 5; d++) {
            S.forecast.push({ day: d, temp: this.tempOfDay(d) });
        }
    },

    // Vrai pendant les heures de travail
    isWorkTime: function () {
        const S = window.EFState, C = window.EFConfig;
        return S.hour >= C.WORK_START && S.hour < C.WORK_END;
    },

    isNight: function () {
        const S = window.EFState;
        return S.hour >= 21 || S.hour < 6;
    },

    // Avance d'une minute de jeu. Retourne des drapeaux pour la simulation.
    advanceMinute: function () {
        const S = window.EFState;
        const out = { newHour: false, newDay: false };
        S.minute++;
        if (S.minute >= 60) {
            S.minute = 0;
            S.hour++;
            out.newHour = true;
            if (S.hour >= 24) {
                S.hour = 0;
                S.day++;
                out.newDay = true;
                S.outsideTemp = this.tempOfDay(S.day);
                this.refreshForecast();
            }
        }
        return out;
    },

    clock: function () {
        const S = window.EFState;
        const h = String(S.hour).padStart(2, "0");
        const m = String(S.minute).padStart(2, "0");
        return h + ":" + m;
    }
};
