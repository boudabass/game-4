/*
 * sim.js — Simulation : production, chaleur, faim, maladie, moral, événements.
 * Rythme : tickMinute() est appelée pour chaque minute de jeu écoulée.
 * Les taux journaliers de la config sont répartis :
 *   - production/conso des bâtiments : sur les heures de travail (600 min)
 *   - charbon du générateur et des bornes : sur 24h (1440 min)
 *   - probabilités de maladie/mort et dérives de moral : par heure (/24)
 */
window.EFSim = {
    WORK_MINUTES: 600,
    DAY_MINUTES: 1440,
    msgQueue: [],       // messages à afficher (toasts), consommés par l'UI

    notify: function (icon, text) {
        this.msgQueue.push({ icon: icon, text: text });
        if (this.msgQueue.length > 4) this.msgQueue.shift();
    },

    // ---------- TICK PRINCIPAL ----------
    tickMinute: function () {
        const S = window.EFState;
        if (S.gameOver || S.pendingEvent) return;

        this.produce();
        this.burnCoal();

        const t = window.EFTime.advanceMinute();
        if (t.newHour) this.tickHour();
        if (t.newDay) this.tickDay();

        // Repas du soir à 18h00
        if (S.hour === 18 && S.minute === 0) this.mealTime();
        // Événement possible à 10h00
        if (S.hour === 10 && S.minute === 0) this.maybeEvent();

        this.checkGameOver();
    },

    // ---------- PRODUCTION (par minute) ----------
    produce: function () {
        const C = window.EFConfig, S = window.EFState;
        const work = window.EFTime.isWorkTime();
        const night = window.EFTime.isNight();

        for (let i = 0; i < S.buildings.length; i++) {
            const b = S.buildings[i];
            const def = C.BUILDINGS[b.type];
            if (!def.rate || !b.on) continue;
            // Les équipes de nuit (chasseurs) produisent la nuit, les autres le jour
            if (def.nightShift ? !night : !work) continue;
            if (def.staff && b.staff <= 0) continue;

            const eff = def.staff ? b.staff / def.staff : 1;
            const bonus = window.EFGrid.isConnected(i) ? 1 + C.ROAD_BONUS : 1;

            // Vérifier la consommation d'intrants au prorata
            let ok = true;
            if (def.consume) {
                for (const k in def.consume) {
                    const need = def.consume[k] * eff / this.WORK_MINUTES;
                    if (S.res[k] < need) { ok = false; break; }
                }
                if (ok) for (const k in def.consume)
                    S.res[k] -= def.consume[k] * eff / this.WORK_MINUTES;
            }
            if (!ok) continue;
            for (const k in def.rate)
                S.addRes(k, def.rate[k] * eff * bonus / this.WORK_MINUTES);
        }
    },

    // ---------- CHARBON : générateur + bornes (24h/24) ----------
    burnCoal: function () {
        const C = window.EFConfig, S = window.EFState;
        const gen = S.buildings.find(b => b.type === "generator");
        if (gen && S.generatorLevel > 0) {
            const need = C.GENERATOR.COAL_BY_LEVEL[S.generatorLevel] / this.DAY_MINUTES;
            if (S.res.coal >= need) {
                S.res.coal -= need;
                if (!gen.on) { gen.on = true; this.notify("🔥", "Le générateur redémarre."); }
            } else if (gen.on) {
                gen.on = false;
                this.notify("🥶", "Plus de charbon : le générateur s'est éteint !");
            }
        }
        for (const hub of S.buildings) {
            if (hub.type !== "steam_hub") continue;
            const need = C.STEAM_HUB.COAL_PER_DAY / this.DAY_MINUTES;
            if (S.res.coal >= need) { S.res.coal -= need; hub.on = true; }
            else hub.on = false;
        }
    },

    // ---------- CHAQUE HEURE : maladie, soins, moral ----------
    tickHour: function () {
        const C = window.EFConfig, S = window.EFState;
        const total = S.totalPop();
        if (total <= 0) return;

        // 1. Répartition des habitants dans les logements (au prorata des capacités)
        const homes = S.buildings.filter(b => C.BUILDINGS[b.type].capacity);
        const capacity = window.EFBuildings.housingCapacity();
        const homeless = Math.max(0, total - capacity);
        if (homeless > 0) S.flags.homelessToday = true;

        // 2. Nouveaux malades selon la température des logements
        let newSick = 0;
        let housedLeft = total - homeless;
        for (const h of homes) {
            const def = C.BUILDINGS[h.type];
            const occupants = Math.min(def.capacity, housedLeft);
            housedLeft -= occupants;
            if (occupants <= 0) continue;
            const lvl = window.EFBuildings.tempLevel(window.EFBuildings.innerTemp(h));
            const pHour = lvl.sickPerDay / 24;
            for (let i = 0; i < occupants; i++)
                if (Math.random() < pHour) newSick++;
            // Guérison passive au chaud
            if (lvl.id === "comfy" && S.sick > 0 &&
                Math.random() < C.HEAL_COMFY_BONUS * occupants / total / 24 * S.sick)
                S.sick--;
        }
        // Sans-abri : risque fort
        for (let i = 0; i < homeless; i++)
            if (Math.random() < C.HOMELESS_SICK_PER_DAY / 24) newSick++;

        const adults = S.pop.workers + S.pop.engineers;
        S.sick = Math.min(S.sick + newSick, total);
        if (newSick >= 3) this.notify("🤒", newSick + " personnes sont tombées malades.");

        // 3. Soins : capacité de guérison des postes/hôpitaux staffés
        let healPerDay = 0;
        for (const b of S.buildings) {
            const def = C.BUILDINGS[b.type];
            if (def.healPerDay && b.staff > 0)
                healPerDay += def.healPerDay * (b.staff / def.staff);
        }
        const healed = Math.min(S.sick, healPerDay / 24 * (0.5 + Math.random()));
        S.sick = Math.max(0, S.sick - healed);

        // 4. Décès : malades au-delà de la capacité de soins
        const untreated = Math.max(0, S.sick - healPerDay);
        let deaths = 0;
        for (let i = 0; i < untreated; i++)
            if (Math.random() < C.UNTREATED_DEATH_PER_DAY / 24) deaths++;
        if (deaths > 0) this.applyDeaths(deaths);

        // 5. Dérive du moral (répartie par heure)
        const M = C.MORAL;
        const gen = S.buildings.find(b => b.type === "generator");
        if (gen && (!gen.on || S.generatorLevel === 0))
            this.moral(M.GENERATOR_OFF_HOPE / 24, 0);
        if (homeless > 0) this.moral(M.HOMELESS_HOPE / 24, M.HOMELESS_DISCONTENT / 24);
        else this.moral(M.ALL_HOUSED_HOPE / 24, 0);
        // Retour au calme : les besoins de base couverts apaisent la ville
        if (!S.flags.hungerToday && !S.flags.homelessToday)
            this.moral(0, M.CALM_DISCONTENT / 24);
        if (adults > 0 && S.sick > total * 0.25) this.moral(0, M.SICK_MANY_DISCONTENT / 24);

        // Bâtiments de moral (pub...)
        for (const b of S.buildings) {
            const def = C.BUILDINGS[b.type];
            if (def.moralPerDay && b.staff > 0) {
                const eff = b.staff / def.staff;
                this.moral((def.moralPerDay.hope || 0) * eff / 24,
                           (def.moralPerDay.discontent || 0) * eff / 24);
            }
        }
    },

    // ---------- CHAQUE JOUR (minuit) ----------
    tickDay: function () {
        const S = window.EFState;
        S.flags.hungerToday = false;
        S.flags.homelessToday = false;
        this.maybeNewcomers();
        if (S.outsideTemp <= (window.EFState.forecast[0] ? S.outsideTemp : S.outsideTemp)) {
            // Info tempête : si demain chute de 10° ou plus, prévenir
            const f = S.forecast;
            if (f.length > 1 && f[1].temp <= f[0].temp - 10)
                this.notify("🌨️", "Tempête en approche : " + f[1].temp + "°C demain !");
        }
    },

    // ---------- REPAS (18h) ----------
    mealTime: function () {
        const C = window.EFConfig, S = window.EFState;
        const need = S.totalPop() * C.RATION_PER_CITIZEN;
        if (S.res.rations >= need) {
            S.res.rations -= need;
            this.moral(C.MORAL.ALL_FED_HOPE, 0);
        } else {
            const fed = Math.floor(S.res.rations / C.RATION_PER_CITIZEN);
            S.res.rations = 0;
            const hungry = S.totalPop() - fed;
            S.flags.hungerToday = true;
            this.moral(C.MORAL.HUNGER_HOPE, C.MORAL.HUNGER_DISCONTENT);
            // La faim rend malade
            let newSick = 0;
            for (let i = 0; i < hungry; i++) if (Math.random() < 0.2) newSick++;
            S.sick = Math.min(S.totalPop(), S.sick + newSick);
            this.notify("🍽️", hungry + " citoyens n'ont pas mangé ce soir !");
        }
    },

    // ---------- DÉCÈS ----------
    applyDeaths: function (n) {
        const C = window.EFConfig, S = window.EFState;
        for (let i = 0; i < n; i++) {
            // On retire dans la catégorie la plus nombreuse
            const cats = ["workers", "engineers", "children"];
            cats.sort((a, b) => S.pop[b] - S.pop[a]);
            if (S.pop[cats[0]] > 0) S.pop[cats[0]]--;
            if (S.sick > 0) S.sick--;
        }
        S.deathsTotal += n;
        this.clampStaff();
        const hasCemetery = S.buildings.some(b => b.type === "cemetery");
        const M = C.MORAL;
        const dh = hasCemetery ? M.DEATH_HOPE_CEMETERY : M.DEATH_HOPE;
        const dd = hasCemetery ? M.DEATH_DISCONTENT_CEMETERY : M.DEATH_DISCONTENT;
        this.moral(dh * n, dd * n);
        this.notify("⚰️", n === 1 ? "Un citoyen est mort." : n + " citoyens sont morts.");
    },

    // Après une baisse de population, s'assurer que le staff assigné reste valide
    clampStaff: function () {
        const C = window.EFConfig, S = window.EFState;
        for (const type of ["workers", "engineers"]) {
            let over = -S.freeStaff(type);
            if (over <= 0) continue;
            for (const b of S.buildings) {
                if (over <= 0) break;
                const def = C.BUILDINGS[b.type];
                if (def.staff && def.staffType === type && b.staff > 0) {
                    const take = Math.min(b.staff, over);
                    b.staff -= take;
                    over -= take;
                }
            }
        }
    },

    // ---------- MORAL ----------
    moral: function (dHope, dDiscontent) {
        const S = window.EFState;
        S.hope = Math.max(0, Math.min(100, S.hope + dHope));
        S.discontent = Math.max(0, Math.min(100, S.discontent + dDiscontent));
    },

    // ---------- ARRIVÉES DE SURVIVANTS ----------
    maybeNewcomers: function () {
        const C = window.EFConfig, S = window.EFState;
        if (S.hope < C.NEWCOMERS_MIN_HOPE) return;
        if (!S.nextNewcomersDay)
            S.nextNewcomersDay = S.day + C.NEWCOMERS_EVERY_MIN +
                Math.floor(Math.random() * (C.NEWCOMERS_EVERY_MAX - C.NEWCOMERS_EVERY_MIN + 1));
        if (S.day < S.nextNewcomersDay) return;
        S.nextNewcomersDay = S.day + C.NEWCOMERS_EVERY_MIN +
            Math.floor(Math.random() * (C.NEWCOMERS_EVERY_MAX - C.NEWCOMERS_EVERY_MIN + 1));
        const n = 6 + Math.floor(Math.random() * 7); // 6 à 12
        const w = Math.round(n * 0.6), e = Math.round(n * 0.2);
        S.pop.workers += w;
        S.pop.engineers += e;
        S.pop.children += n - w - e;
        if (S.totalPop() > S.peakPop) S.peakPop = S.totalPop();
        this.notify("🚶", n + " survivants ont rejoint la ville !");
    },

    // ---------- ÉVÉNEMENTS À CHOIX ----------
    maybeEvent: function () {
        const C = window.EFConfig, S = window.EFState;
        if (S.day < C.EVENT_FIRST_DAY) return;
        if (S.day === S.lastEventDay) return;
        if (Math.random() > C.EVENT_CHANCE) return;
        const pool = C.EVENTS.filter(e => !S.usedEvents.includes(e.id));
        if (pool.length === 0) { S.usedEvents = []; return; }
        const ev = pool[Math.floor(Math.random() * pool.length)];
        S.lastEventDay = S.day;
        S.usedEvents.push(ev.id);
        if (S.usedEvents.length > 4) S.usedEvents.shift(); // rotation
        S.pendingEvent = ev.id;   // met la simulation en pause, l'UI affiche le dilemme
    },

    resolveEvent: function (choice) {
        const C = window.EFConfig, S = window.EFState;
        const ev = C.EVENTS.find(e => e.id === S.pendingEvent);
        S.pendingEvent = null;
        if (!ev) return;
        const fx = (choice === "a" ? ev.a : ev.b).effects || {};
        if (fx.hope) this.moral(fx.hope, 0);
        if (fx.discontent) this.moral(0, fx.discontent);
        for (const k of ["coal", "wood", "steel", "rations", "rawFood"])
            if (fx[k]) window.EFState.addRes(k, fx[k]);
        if (fx.sick) S.sick = Math.min(S.totalPop(), S.sick + fx.sick);
        if (fx.pop) {
            if (fx.pop > 0) {
                const w = Math.round(fx.pop * 0.6), e = Math.round(fx.pop * 0.2);
                S.pop.workers += w; S.pop.engineers += e; S.pop.children += fx.pop - w - e;
            } else {
                for (let i = 0; i < -fx.pop; i++) {
                    const cats = ["workers", "engineers", "children"];
                    cats.sort((a, b) => S.pop[b] - S.pop[a]);
                    if (S.pop[cats[0]] > 0) S.pop[cats[0]]--;
                }
                this.clampStaff();
            }
            if (S.totalPop() > S.peakPop) S.peakPop = S.totalPop();
        }
    },

    // ---------- FIN DE PARTIE ----------
    checkGameOver: function () {
        const S = window.EFState;
        if (S.gameOver) return;
        let reason = "";
        if (S.totalPop() <= 0) reason = "Toute la population a péri.";
        else if (S.hope <= 0) reason = "L'espoir a disparu : la ville vous a chassé.";
        else if (S.discontent >= 100) reason = "Le mécontentement a explosé : révolte générale.";
        if (reason) {
            S.gameOver = true;
            S.gameOverReason = reason;
        }
    },

    // ---------- SCORE COMPOSITE ----------
    // SCORE = jours x 100 + pic de population x 25 + bâtiments construits x 15
    finalScore: function () {
        const W = window.EFConfig.SCORE_WEIGHTS, S = window.EFState;
        return S.day * W.days + S.peakPop * W.peakPop + S.builtTotal * W.built;
    }
};
