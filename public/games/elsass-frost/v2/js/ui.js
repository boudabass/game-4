/*
 * ui.js — Toute l'interface HTML : HUD, menu construction, panneau détail,
 * dilemmes, population, toasts, écrans menu/fin. Le canvas p5 est derrière.
 */
window.EFUI = {
    selectedBuilding: -1,   // index du bâtiment ouvert dans le panneau détail
    activeCat: "Logement",

    $: function (id) { return document.getElementById(id); },

    init: function () {
        this.renderTabs();
        this.renderShelf();
        // Fermer la construction si on clique sur l'onglet actif
        this.$("btn-build").addEventListener("click", () => this.toggleShelf());
        this.$("btn-road").addEventListener("click", () => this.setTool("road"));
        this.$("btn-demolish").addEventListener("click", () => this.setTool("demolish"));
        this.$("btn-pop").addEventListener("click", () => this.togglePopPanel());
        // Vitesses
        for (const s of [0, 1, 2, 3])
            this.$("speed-" + s).addEventListener("click", () => this.setSpeed(s));
        // Générateur
        this.$("gen-minus").addEventListener("click", () => this.setGenLevel(-1));
        this.$("gen-plus").addEventListener("click", () => this.setGenLevel(1));
        // Détail
        this.$("detail-close").addEventListener("click", () => this.hideDetail());
        this.$("detail-staff-minus").addEventListener("click", () => this.staff(-1));
        this.$("detail-staff-plus").addEventListener("click", () => this.staff(1));
        this.$("detail-demolish").addEventListener("click", () => this.demolishSelected());
        this.$("pop-close").addEventListener("click", () => this.togglePopPanel(false));
    },

    // ---------- OUTILS / CONSTRUCTION ----------
    toggleShelf: function (force) {
        const shelf = this.$("build-shelf");
        const show = force !== undefined ? force : shelf.classList.contains("hidden");
        shelf.classList.toggle("hidden", !show);
        this.$("btn-build").classList.toggle("active", show);
        if (!show) window.EFInput.setMode(null);
    },

    setTool: function (tool) {
        const I = window.EFInput;
        if (I.mode === tool) { I.setMode(null); }
        else I.setMode(tool);
        this.$("btn-road").classList.toggle("active", I.mode === "road");
        this.$("btn-demolish").classList.toggle("active", I.mode === "demolish");
        this.refreshShelfSelection();
    },

    renderTabs: function () {
        const C = window.EFConfig;
        const row = this.$("build-tabs");
        row.innerHTML = "";
        for (const cat of C.CATEGORIES) {
            const btn = document.createElement("button");
            btn.className = "tab-btn" + (cat === this.activeCat ? " active" : "");
            btn.textContent = cat;
            btn.addEventListener("click", () => {
                this.activeCat = cat;
                this.renderTabs();
                this.renderShelf();
            });
            row.appendChild(btn);
        }
    },

    renderShelf: function () {
        const C = window.EFConfig;
        const row = this.$("build-items");
        row.innerHTML = "";
        for (const key in C.BUILDINGS) {
            const def = C.BUILDINGS[key];
            if (def.noBuild || def.cat !== this.activeCat) continue;
            const unlocked = window.EFBuildings.isUnlocked(key);
            const item = document.createElement("div");
            item.className = "build-item" + (unlocked ? "" : " sealed");
            item.dataset.type = key;
            const cost = def.cost ? Object.entries(def.cost)
                .map(([k, v]) => v + " " + this.resIcon(k)).join(" ") : "—";
            item.innerHTML = '<div class="bi-icon">' + (unlocked ? def.icon : "🔒") + '</div>' +
                '<div class="bi-name">' + def.name + '</div>' +
                '<div class="bi-cost">' + (unlocked ? cost : "À débloquer") + '</div>';
            item.title = unlocked ? def.desc : "Débloqué en accomplissant les tâches.";
            if (unlocked) {
                item.addEventListener("click", () => {
                    const I = window.EFInput;
                    if (I.mode === "build" && I.buildType === key) I.setMode(null);
                    else I.setMode("build", key);
                    this.refreshShelfSelection();
                });
            }
            row.appendChild(item);
        }
        this.refreshShelfSelection();
    },

    refreshShelfSelection: function () {
        const I = window.EFInput;
        document.querySelectorAll(".build-item").forEach(el => {
            el.classList.toggle("active", I.mode === "build" && I.buildType === el.dataset.type);
            el.classList.toggle("locked",
                window.EFBuildings.isUnlocked(el.dataset.type) &&
                !window.EFBuildings.canAfford(el.dataset.type));
        });
    },

    resIcon: function (k) {
        return { coal: "⚫", wood: "🪵", steel: "🔩", cores: "🔋", rawFood: "🥩", rations: "🍲" }[k] || k;
    },

    // ---------- HUD (appelé chaque frame, mais ne touche le DOM que si changement) ----------
    _cache: {},
    setText: function (id, txt) {
        if (this._cache[id] !== txt) {
            this._cache[id] = txt;
            const el = this.$(id);
            if (el) el.textContent = txt;
        }
    },

    updateHUD: function () {
        const S = window.EFState, C = window.EFConfig;
        for (const k of ["coal", "wood", "steel", "cores", "rawFood", "rations"])
            this.setText("val-" + k, String(Math.floor(S.res[k])));
        this.setText("val-pop", S.totalPop() + (S.sick >= 1 ? " (🤒" + Math.round(S.sick) + ")" : ""));
        const season = window.EFTime.seasonOf(S.day);
        const year = window.EFTime.yearOf(S.day);
        this.setText("day-counter", season.icon + " " + season.name + " · An " + year);
        this.setText("clock", window.EFTime.clock());
        this.setText("temp-val", S.outsideTemp + "°C");
        this.setText("gen-level", S.generatorLevel === 0 ? "OFF" : "Niv " + S.generatorLevel);

        const gen = S.buildings.find(b => b.type === "generator");
        const gauge = this.$("temp-gauge");
        if (gauge) gauge.classList.toggle("gen-off", !gen || !gen.on || S.generatorLevel === 0);

        // Prévisions météo
        const f = S.forecast;
        for (let i = 0; i < 5; i++) {
            const el = this.$("forecast-" + i);
            if (el && f[i]) {
                if (this._cache["fc" + i] !== f[i].temp + "/" + f[i].day) {
                    this._cache["fc" + i] = f[i].temp + "/" + f[i].day;
                    el.textContent = f[i].icon + " " + f[i].temp + "°";
                    el.title = window.EFTime.seasonOf(f[i].day).name +
                        " — Année " + window.EFTime.yearOf(f[i].day);
                    const prev = i > 0 ? f[i - 1].temp : f[i].temp;
                    el.classList.toggle("trend-down", f[i].temp <= prev - 8);
                }
            }
        }

        // Jauges de moral
        const hopeEl = this.$("fill-hope"), discEl = this.$("fill-discontent");
        if (hopeEl) hopeEl.style.width = S.hope + "%";
        if (discEl) discEl.style.width = S.discontent + "%";

        // Panneau détail ouvert : rafraîchir la température/staff en direct
        if (this.selectedBuilding >= 0) this.fillDetail();

        // Panneau des tâches
        this.updateTasks();

        // Toasts en attente
        const q = window.EFSim.msgQueue;
        while (q.length) this.toast(q.shift());

        // Dilemme en attente
        if (S.pendingEvent && !this._eventShown) this.showEvent();
    },

    // ---------- VITESSE / GÉNÉRATEUR ----------
    setSpeed: function (s) {
        const S = window.EFState;
        S.speed = s;
        if (s > 0) S.lastSpeed = s;
        for (const i of [0, 1, 2, 3])
            this.$("speed-" + i).classList.toggle("active", i === s);
    },

    setGenLevel: function (delta) {
        const S = window.EFState;
        S.generatorLevel = Math.max(0, Math.min(3, S.generatorLevel + delta));
    },

    // ---------- PANNEAU DÉTAIL ----------
    showDetail: function (idx) {
        this.selectedBuilding = idx;
        this.fillDetail();
        this.$("detail-panel").classList.remove("hidden");
    },

    fillDetail: function () {
        const S = window.EFState, C = window.EFConfig;
        const b = S.buildings[this.selectedBuilding];
        if (!b) { this.hideDetail(); return; }
        const def = C.BUILDINGS[b.type];
        this.setText("detail-icon", def.icon);
        this.setText("detail-name", def.name.toUpperCase());
        this.setText("detail-desc", def.desc);

        const temp = window.EFBuildings.innerTemp(b);
        const lvl = window.EFBuildings.tempLevel(temp);
        this.setText("detail-temp", temp + "°C — " + lvl.label);
        const t = this.$("detail-temp");
        t.className = "detail-temp lvl-" + lvl.id;

        const staffRow = this.$("detail-staff-row");
        if (def.staff) {
            staffRow.classList.remove("hidden");
            const who = def.staffType === "engineers" ? "🧑‍🔬 Ingénieurs" : "👷 Ouvriers";
            this.setText("detail-staff-label", who);
            this.setText("detail-staff-val", b.staff + " / " + def.staff);
        } else staffRow.classList.add("hidden");

        const extra = [];
        if (def.capacity) extra.push("🏠 Capacité : " + def.capacity);
        if (window.EFGrid.isConnected(this.selectedBuilding))
            extra.push("🛤️ Relié : production +" + Math.round(C.ROAD_BONUS * 100) + "%");
        this.setText("detail-extra", extra.join("  ·  "));

        this.$("detail-demolish").classList.toggle("hidden", !!def.noDemolish);
        // Contrôles du générateur visibles seulement pour lui
        this.$("gen-controls").classList.toggle("hidden", b.type !== "generator");
    },

    hideDetail: function () {
        this.selectedBuilding = -1;
        this.$("detail-panel").classList.add("hidden");
    },

    staff: function (delta) {
        window.EFBuildings.modifyStaff(this.selectedBuilding, delta);
        this.fillDetail();
    },

    demolishSelected: function () {
        if (window.EFBuildings.demolish(this.selectedBuilding)) this.hideDetail();
    },

    // ---------- POPULATION ----------
    togglePopPanel: function (force) {
        const p = this.$("pop-panel");
        const show = force !== undefined ? force : p.classList.contains("hidden");
        p.classList.toggle("hidden", !show);
        if (show) this.fillPopPanel();
    },

    fillPopPanel: function () {
        const S = window.EFState;
        this.setText("pp-workers", String(S.pop.workers));
        this.setText("pp-engineers", String(S.pop.engineers));
        this.setText("pp-children", String(S.pop.children));
        this.setText("pp-sick", String(Math.round(S.sick)));
        this.setText("pp-free-workers", String(Math.max(0, S.freeStaff("workers"))));
        this.setText("pp-free-engineers", String(Math.max(0, S.freeStaff("engineers"))));
        const cap = window.EFBuildings.housingCapacity();
        this.setText("pp-housing", S.totalPop() + " / " + cap);
        this.setText("pp-deaths", String(S.deathsTotal));
    },

    // ---------- DILEMMES ----------
    _eventShown: false,
    showEvent: function () {
        const C = window.EFConfig, S = window.EFState;
        const ev = C.EVENTS.find(e => e.id === S.pendingEvent);
        if (!ev) return;
        this._eventShown = true;
        this.setText("ev-icon", ev.icon);
        this.setText("ev-title", ev.title);
        this.setText("ev-text", ev.text);
        const a = this.$("ev-choice-a"), b = this.$("ev-choice-b");
        a.textContent = ev.a.label;
        b.textContent = ev.b.label;
        a.onclick = () => this.resolveEvent("a");
        b.onclick = () => this.resolveEvent("b");
        this.$("event-modal").classList.remove("hidden");
    },

    resolveEvent: function (choice) {
        this._eventShown = false;
        this.$("event-modal").classList.add("hidden");
        window.EFSim.resolveEvent(choice);
    },

    // ---------- PANNEAU DES TÂCHES ----------
    updateTasks: function () {
        const S = window.EFState;
        if (!S.tasks) return;
        for (const key of ["main", "side"]) {
            const t = S.tasks[key];
            const box = this.$("task-" + key);
            if (!t) { box.classList.add("hidden"); continue; }
            box.classList.remove("hidden");
            const p = window.EFTasks.progress(t);
            const status = t.done ? "done" : (t.failed ? "failed" : "");
            const sig = key + t.def.title + p.cur + "/" + p.goal + status + window.EFTasks.hoursLeft();
            if (this._cache["task" + key] === sig) continue;
            this._cache["task" + key] = sig;
            box.className = "task " + key + " " + status;
            const unit = p.unit || "";
            const goalTxt = p.keepBelow ? "≤ " + p.goal + unit : p.cur + unit + " / " + p.goal + unit;
            const cur = p.keepBelow ? p.cur + unit + " (" + goalTxt + ")" : goalTxt;
            box.querySelector(".task-icon").textContent = t.done ? "✅" : (t.failed ? "❌" : t.def.icon);
            box.querySelector(".task-title").textContent = t.def.title;
            box.querySelector(".task-progress").textContent =
                t.done ? "Accompli !" : (t.failed ? "Échoué" : cur + " · " + window.EFTasks.hoursLeft() + "h");
            const fill = box.querySelector(".task-fill");
            let ratio = p.goal > 0 ? Math.min(1, p.cur / p.goal) : (p.cur <= p.goal ? 1 : 0);
            if (p.keepBelow) ratio = t.done ? 1 : Math.max(0, 1 - (p.cur / Math.max(1, p.goal)) * 0.5);
            if (t.done) ratio = 1;
            fill.style.width = Math.round(ratio * 100) + "%";
        }
    },

    // ---------- TOASTS ----------
    toast: function (msg) {
        const box = this.$("toasts");
        const el = document.createElement("div");
        el.className = "toast";
        el.textContent = msg.icon + " " + msg.text;
        box.appendChild(el);
        setTimeout(() => el.classList.add("out"), 4500);
        setTimeout(() => el.remove(), 5100);
    },

    // ---------- ÉCRANS ----------
    showScreen: function (id) {
        for (const s of ["screen-menu", "screen-over", "game-ui"])
            this.$(s).classList.add("hidden");
        if (id) this.$(id).classList.remove("hidden");
    },

    fillGameOver: function () {
        const S = window.EFState, W = window.EFConfig.SCORE_WEIGHTS;
        const year = window.EFTime.yearOf(S.day);
        this.setText("over-reason", S.gameOverReason);
        this.setText("over-days", S.day + " (an " + year + ")");
        this.setText("over-tasks", String(S.tasksDone));
        this.setText("over-pop", String(S.peakPop));
        this.setText("over-built", String(S.builtTotal));
        this.setText("over-detail",
            S.day + "×" + W.days + " + " + S.tasksDone + "×" + W.tasks + " + " +
            S.peakPop + "×" + W.peakPop + " + " + S.builtTotal + "×" + W.built);
        this.setText("over-score", String(window.EFSim.finalScore()));
    }
};
