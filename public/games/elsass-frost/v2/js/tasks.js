/*
 * tasks.js — Le moteur des objectifs : 1 tâche principale + 1 secondaire
 * par saison. Réussite immédiate pour les objectifs "à atteindre" (stock,
 * construction, population...), vérification en fin de saison pour les
 * objectifs "à tenir" (malades, faim, moral). Les principales débloquent
 * des bâtiments ; les échecs appliquent des pénalités thématiques.
 */
window.EFTasks = {

    // Appelé au lancement d'une partie et à chaque nouvelle saison (minuit)
    assign: function () {
        const S = window.EFState;
        const seasonIdx = window.EFTime.seasonIdx(S.day);
        const year = window.EFTime.yearOf(S.day);
        const script = window.EFConfig.TASKS.script;
        const slot = (year - 1) * 4 + seasonIdx;
        const defs = slot < script.length ? script[slot]
            : window.EFConfig.TASKS.generic[seasonIdx];
        S.tasks = {
            main: this.instantiate(defs.main, year),
            side: this.instantiate(defs.side, year)
        };
    },

    // Crée l'instance d'une tâche : cible mise à l'échelle + état initial
    instantiate: function (def, year) {
        const S = window.EFState;
        let target = def.base || 0;
        if (def.perYear) target += def.perYear * (year - 1);
        if (def.perPop) target += def.perPop * S.totalPop();
        target = Math.round(target);
        return {
            def: def,
            target: target,
            deadlineDay: S.day,       // fin de la saison = minuit de ce jour
            done: false,
            failed: false,
            // références de départ pour les types "progression"
            startPop: S.totalPop(),
            startBuilt: S.builtTotal,
            hungerSeen: false
        };
    },

    // Progression courante (pour l'affichage et la réussite immédiate)
    progress: function (t) {
        const S = window.EFState;
        const d = t.def;
        switch (d.type) {
            case "stock": return { cur: Math.floor(S.res[d.res]), goal: t.target, instant: true };
            case "build": {
                const n = S.buildings.filter(b => b.type === d.building).length;
                return { cur: n, goal: t.target, instant: true };
            }
            case "buildany": return { cur: S.builtTotal - t.startBuilt, goal: t.target, instant: true };
            case "pop": return { cur: S.totalPop(), goal: t.target, instant: true };
            case "popgrow": return { cur: S.totalPop() - t.startPop, goal: t.target, instant: true };
            case "housed": {
                const cap = window.EFBuildings.housingCapacity();
                return { cur: Math.min(S.totalPop(), cap), goal: S.totalPop(), instant: true };
            }
            // Objectifs "à tenir" : évalués en fin de saison
            case "sickmax": {
                const pct = S.totalPop() > 0 ? Math.round(S.sick / S.totalPop() * 100) : 0;
                return { cur: pct, goal: t.target, instant: false, keepBelow: true, unit: "%" };
            }
            case "nohunger": return { cur: t.hungerSeen ? 1 : 0, goal: 0, instant: false, keepBelow: true };
            case "hopemin": return { cur: Math.round(S.hope), goal: t.target, instant: false };
            case "discmax": return { cur: Math.round(S.discontent), goal: t.target, instant: false, keepBelow: true };
            default: return { cur: 0, goal: 1, instant: false };
        }
    },

    // Condition remplie en cet instant ?
    isMet: function (t) {
        const p = this.progress(t);
        return p.keepBelow ? p.cur <= p.goal : p.cur >= p.goal;
    },

    // Appelé chaque minute par la sim
    tick: function () {
        const S = window.EFState;
        if (!S.tasks) return;
        // Mémoriser la faim pour les tâches "nohunger"
        if (S.flags.hungerToday) {
            if (S.tasks.main && !S.tasks.main.done) S.tasks.main.hungerSeen = true;
            if (S.tasks.side && !S.tasks.side.done) S.tasks.side.hungerSeen = true;
        }
        for (const key of ["main", "side"]) {
            const t = S.tasks[key];
            if (!t || t.done || t.failed) continue;
            const p = this.progress(t);
            if (p.instant && this.isMet(t)) this.succeed(t, key);
        }
    },

    // Appelé à minuit AVANT le changement de tâches : résout la saison finie
    resolveSeasonEnd: function () {
        const S = window.EFState;
        if (!S.tasks) return;
        for (const key of ["main", "side"]) {
            const t = S.tasks[key];
            if (!t || t.done || t.failed) continue;
            if (this.isMet(t)) this.succeed(t, key);
            else this.fail(t, key);
        }
    },

    succeed: function (t, key) {
        const S = window.EFState, Sim = window.EFSim;
        t.done = true;
        S.tasksDone++;
        if (t.def.reward && t.def.reward.hope) Sim.moral(t.def.reward.hope, 0);
        // Déblocage de bâtiments (principales surtout)
        if (t.def.unlocks) {
            for (const b of t.def.unlocks) {
                if (!S.unlocked.includes(b)) {
                    S.unlocked.push(b);
                    const def = window.EFConfig.BUILDINGS[b];
                    Sim.notify("🔓", "Nouveau bâtiment : " + def.icon + " " + def.name + " !");
                }
            }
            if (window.EFUI) window.EFUI.renderShelf();
        }
        Sim.notify("✅", (key === "main" ? "Tâche accomplie : " : "Bonus : ") + t.def.title);
    },

    fail: function (t, key) {
        const S = window.EFState, Sim = window.EFSim;
        t.failed = true;
        const p = t.def.penalty;
        if (!p) return; // les secondaires sans pénalité ne coûtent rien
        if (p.hope) Sim.moral(p.hope, 0);
        if (p.discontent) Sim.moral(0, p.discontent);
        if (p.sick) S.sick = Math.min(S.totalPop(), S.sick + p.sick);
        if (p.deaths) Sim.applyDeaths(p.deaths);
        if (p.res) for (const k in p.res) S.addRes(k, p.res[k]);
        Sim.notify("❌", "Tâche échouée : " + t.def.title);
    },

    // Heures restantes avant la fin de la saison
    hoursLeft: function () {
        const S = window.EFState;
        return 24 - S.hour - (S.minute > 0 ? 1 : 0);
    }
};
