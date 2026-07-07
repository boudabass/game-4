/*
 * time.js — Avancée du temps + météo SAISONNIÈRE.
 * 1 saison = 1 jour de jeu (24h). Année = 4 jours.
 * Température du jour = base de la saison + aggravation annuelle + bruit,
 * puis une variation jour/nuit est appliquée chaque heure.
 * Les températures générées sont stockées dans EFState.weather.temps
 * (sérialisées avec la sauvegarde : pas besoin de seed).
 */
window.EFTime = {

    // Saison d'un jour donné (index 0-3) et année (1+)
    seasonIdx: function (day) { return (day - 1) % 4; },
    yearOf: function (day) { return Math.floor((day - 1) / 4) + 1; },
    seasonOf: function (day) {
        return window.EFConfig.SEASONS[this.seasonIdx(day)];
    },

    initWeather: function () {
        const S = window.EFState;
        S.weather = { temps: {} };
        S.outsideTemp = this.tempOfDay(1);
        this.refreshForecast();
    },

    // Température de base (avant variation diurne) d'un jour donné
    tempOfDay: function (day) {
        const S = window.EFState;
        if (!S.weather) S.weather = { temps: {} };
        const W = S.weather;
        if (W.temps[day] !== undefined) return W.temps[day];
        const season = this.seasonOf(day);
        const year = this.yearOf(day);
        const t = season.temp + season.driftPerYear * (year - 1) +
            (Math.random() * 2 - 1) * season.noise;
        W.temps[day] = Math.round(t);
        return W.temps[day];
    },

    // Variation jour/nuit : nuit plus froide, après-midi plus doux
    diurnal: function (hour) {
        const D = window.EFConfig.DIURNAL;
        if (hour >= 22 || hour < 6) return D.NIGHT;
        if (hour >= 13 && hour < 17) return D.AFTERNOON;
        return 0;
    },

    // Température extérieure effective (mise à jour chaque heure par la sim)
    currentTemp: function () {
        const S = window.EFState;
        return this.tempOfDay(S.day) + this.diurnal(S.hour);
    },

    // Prévisions : jour courant + 4 suivants (avec icône de saison)
    refreshForecast: function () {
        const S = window.EFState;
        S.forecast = [];
        for (let d = S.day; d < S.day + 5; d++) {
            S.forecast.push({
                day: d,
                temp: this.tempOfDay(d),
                icon: this.seasonOf(d).icon
            });
        }
    },

    isWorkTime: function () {
        const S = window.EFState, C = window.EFConfig;
        return S.hour >= C.WORK_START && S.hour < C.WORK_END;
    },

    isNight: function () {
        const S = window.EFState;
        return S.hour >= 21 || S.hour < 6;
    },

    // Avance d'une minute de jeu
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
                this.refreshForecast();
            }
            S.outsideTemp = this.currentTemp();
        }
        return out;
    },

    clock: function () {
        const S = window.EFState;
        return String(S.hour).padStart(2, "0") + ":" + String(S.minute).padStart(2, "0");
    }
};
