/*
 * buildings.js — Construction, démolition, staff, chaleur des bâtiments.
 */
window.EFBuildings = {

    // Le bâtiment est-il débloqué ?
    isUnlocked: function (type) {
        return window.EFState.unlocked.includes(type);
    },

    // Coût affiché/débité d'un bâtiment
    canAfford: function (type) {
        const def = window.EFConfig.BUILDINGS[type];
        if (!def.cost) return true;
        const R = window.EFState.res;
        for (const k in def.cost) if ((R[k] || 0) < def.cost[k]) return false;
        return true;
    },

    payCost: function (type) {
        const def = window.EFConfig.BUILDINGS[type];
        if (!def.cost) return;
        for (const k in def.cost) window.EFState.res[k] -= def.cost[k];
    },

    refund: function (type) {
        // Démantèlement : on récupère la moitié du coût
        const def = window.EFConfig.BUILDINGS[type];
        if (!def.cost) return;
        for (const k in def.cost)
            window.EFState.addRes(k, Math.floor(def.cost[k] / 2));
    },

    // Tente de poser un bâtiment. Retourne true si OK.
    place: function (type, x, y) {
        const C = window.EFConfig, S = window.EFState;
        const def = C.BUILDINGS[type];
        if (!def || def.noBuild) return false;
        if (!this.isUnlocked(type)) return false;
        if (def.unique && S.buildings.some(b => b.type === type)) return false;
        if (!window.EFGrid.canPlace(x, y, def.w, def.h)) return false;
        if (!this.canAfford(type)) return false;

        this.payCost(type);
        const b = { type: type, x: x, y: y, staff: 0, on: true };
        // Auto-assignation du staff disponible
        if (def.staff) {
            const free = S.freeStaff(def.staffType);
            b.staff = Math.max(0, Math.min(def.staff, free));
        }
        S.buildings.push(b);
        S.builtTotal++;
        window.EFGrid.rebuild();
        return true;
    },

    placeRoad: function (x, y) {
        const C = window.EFConfig, S = window.EFState;
        if (!window.EFGrid.isFree(x, y)) return false;
        if (S.res.wood < C.ROAD_COST_WOOD) return false;
        S.res.wood -= C.ROAD_COST_WOOD;
        S.roads.push({ x: x, y: y });
        window.EFGrid.rebuild();
        return true;
    },

    removeRoad: function (x, y) {
        const S = window.EFState;
        const i = S.roads.findIndex(r => r.x === x && r.y === y);
        if (i < 0) return false;
        S.roads.splice(i, 1);
        window.EFGrid.rebuild();
        return true;
    },

    demolish: function (idx) {
        const S = window.EFState;
        const b = S.buildings[idx];
        if (!b) return false;
        const def = window.EFConfig.BUILDINGS[b.type];
        if (def.noDemolish) return false;
        this.refund(b.type);
        S.buildings.splice(idx, 1);
        window.EFGrid.rebuild();
        return true;
    },

    // Modifie le staff d'un bâtiment (+1/-1), borné par le max et le dispo
    modifyStaff: function (idx, delta) {
        const S = window.EFState;
        const b = S.buildings[idx];
        if (!b) return;
        const def = window.EFConfig.BUILDINGS[b.type];
        if (!def.staff) return;
        if (delta > 0) {
            if (b.staff >= def.staff) return;
            if (S.freeStaff(def.staffType) <= 0) return;
            b.staff++;
        } else {
            if (b.staff <= 0) return;
            b.staff--;
        }
    },

    // Température intérieure d'un bâtiment (chaleur générateur + bornes + isolation)
    innerTemp: function (b) {
        const C = window.EFConfig, S = window.EFState;
        const def = C.BUILDINGS[b.type];
        let t = S.outsideTemp;

        // Chaleur du générateur (si allumé et alimenté)
        const gen = S.buildings.find(x => x.type === "generator");
        if (gen && gen.on && S.generatorLevel > 0) {
            const d = window.EFGrid.distTiles(b, def, gen, C.BUILDINGS.generator);
            if (d <= C.GENERATOR.RADIUS)
                t += C.GENERATOR.HEAT_BY_LEVEL[S.generatorLevel];
        }
        // Bornes de vapeur (la meilleure source seulement, pas de cumul infini :
        // on prend le max entre générateur déjà appliqué et borne — simplification :
        // une borne ajoute sa chaleur seulement si le bâtiment est hors rayon générateur)
        let hubHeat = 0;
        for (const hub of S.buildings) {
            if (hub.type !== "steam_hub" || !hub.on) continue;
            const d = window.EFGrid.distTiles(b, def, hub, C.BUILDINGS.steam_hub);
            if (d <= C.STEAM_HUB.RADIUS) hubHeat = Math.max(hubHeat, C.STEAM_HUB.HEAT);
        }
        const genHeat = t - S.outsideTemp;
        t = S.outsideTemp + Math.max(genHeat, hubHeat);

        // Isolation
        t += (def.insulation || 0) * C.INSULATION_HEAT;
        return Math.round(t);
    },

    // Palier de température pour une valeur donnée
    tempLevel: function (temp) {
        for (const lvl of window.EFConfig.TEMP_LEVELS)
            if (temp >= lvl.min) return lvl;
        return window.EFConfig.TEMP_LEVELS[window.EFConfig.TEMP_LEVELS.length - 1];
    },

    // Capacité de logement totale
    housingCapacity: function () {
        const C = window.EFConfig;
        let cap = 0;
        for (const b of window.EFState.buildings) {
            const def = C.BUILDINGS[b.type];
            if (def.capacity) cap += def.capacity;
        }
        return cap;
    }
};
