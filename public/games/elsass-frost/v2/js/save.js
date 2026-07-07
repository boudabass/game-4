/*
 * save.js — Sérialisation de la ville via Engine.Save (local + cloud).
 * On sauvegarde l'état complet pour reprendre la partie, plus le meilleur
 * score. Le score n'est envoyé au classement qu'à la fin de partie (main.js).
 */
window.EFSaveGame = {
    best: 0,

    configure: function () {
        if (!(window.Engine && Engine.Save)) return;
        Engine.Save.configure({
            key: "elsass-frost",
            gather: () => this.gather(),
            apply: (data) => this.apply(data)
        });
    },

    gather: function () {
        const S = window.EFState;
        const data = { best: this.best };
        // Une partie en cours ? On l'embarque.
        if (!S.gameOver && S.buildings.length > 0) {
            data.city = {
                res: S.res, pop: S.pop, sick: S.sick, deathsTotal: S.deathsTotal,
                hope: S.hope, discontent: S.discontent,
                day: S.day, hour: S.hour, minute: S.minute,
                outsideTemp: S.outsideTemp, weather: S.weather,
                generatorLevel: S.generatorLevel,
                buildings: S.buildings, roads: S.roads,
                peakPop: S.peakPop, builtTotal: S.builtTotal,
                lastEventDay: S.lastEventDay, usedEvents: S.usedEvents,
                nextNewcomersDay: S.nextNewcomersDay || 0,
                tasks: S.tasks, tasksDone: S.tasksDone, unlocked: S.unlocked
            };
        }
        return data;
    },

    apply: function (data) {
        if (!data) return;
        if (typeof data.best === "number") this.best = data.best;
        this.savedCity = data.city || null;   // restaurée au clic sur "Continuer"
    },

    hasCity: function () {
        return !!this.savedCity;
    },

    // Restaure la partie sauvegardée dans EFState
    restore: function () {
        const c = this.savedCity;
        if (!c) return false;
        const S = window.EFState;
        S.reset();
        S.buildings = [];   // reset a préplacé le générateur : on repart de la save
        Object.assign(S.res, c.res);
        Object.assign(S.pop, c.pop);
        S.sick = c.sick || 0;
        S.deathsTotal = c.deathsTotal || 0;
        S.hope = c.hope; S.discontent = c.discontent;
        S.day = c.day; S.hour = c.hour; S.minute = c.minute;
        S.outsideTemp = c.outsideTemp;
        S.weather = c.weather;
        S.generatorLevel = c.generatorLevel;
        S.buildings = c.buildings || [];
        S.roads = c.roads || [];
        S.peakPop = c.peakPop || S.totalPop();
        S.builtTotal = c.builtTotal || 0;
        S.lastEventDay = c.lastEventDay || 0;
        S.usedEvents = c.usedEvents || [];
        S.nextNewcomersDay = c.nextNewcomersDay || 0;
        S.tasksDone = c.tasksDone || 0;
        S.unlocked = c.unlocked || window.EFConfig.START_UNLOCKED.slice();
        S.tasks = c.tasks || null;
        if (!S.tasks) window.EFTasks.assign();
        window.EFTime.refreshForecast();
        window.EFGrid.rebuild();
        return true;
    },

    // Sauvegarde silencieuse (appelée périodiquement et aux moments clés)
    persist: async function () {
        if (window.Engine && Engine.Save) await Engine.Save.save();
    },

    // Efface la ville sauvegardée (fin de partie)
    clearCity: async function () {
        this.savedCity = null;
        await this.persist();
    }
};
