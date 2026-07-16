/*
 * Engine.SleepSystem (socle partagé v2)
 * Gestion du sommeil : interaction avec le lit, transition jour/nuit,
 * jauge d'énergie. Le joueur clique sur un lit dans sa zone d'action
 * → fondu → avance au lendemain matin → énergie restaurée.
 *
 * Utilisation :
 *   var sleep = new SleepSystem();
 *   sleep.configure({ bed: FarmConfig.bed, energy: FarmConfig.energy, dayTint: FarmConfig.dayTint });
 *   sleep.render();                        // dans drawWorld()
 *   sleep.renderOverlay();                 // dans drawHud()
 *   sleep.handleBedClick(zoneId, c, r);   // dans mousePressed()
 *   sleep.update(deltaTime);              // dans draw() (gère les transitions)
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class SleepSystem {
    constructor() {
        this._bed = null;            // { zone, c, r, w, h }
        this._energy = 100;
        this._maxEnergy = 100;
        this._energyCfg = null;      // config energy
        this._dayTint = null;         // config dayTint
        this._isSleeping = false;     // true pendant la transition sommeil
        this._sleepPhase = null;      // 'fadeOut' | 'advance' | 'fadeIn'
        this._sleepTimer = 0;
        this._sleepDuration = 400;    // ms pour le fondu
        this._sleepAlpha = 0;         // alpha du fondu sommeil
        this._sleepCallback = null;   // appelé après le réveil
    }

    // --- Configuration ---
    configure(opts) {
        opts = opts || {};
        if (opts.bed) this._bed = JSON.parse(JSON.stringify(opts.bed));
        if (opts.energy) {
            this._energyCfg = JSON.parse(JSON.stringify(opts.energy));
            this._maxEnergy = opts.energy.max || 100;
            this._energy = this._maxEnergy;
        }
        if (opts.dayTint) this._dayTint = JSON.parse(JSON.stringify(opts.dayTint));
        return this;
    }

    // --- Requêtes lit ---

    /* Vérifie si une tuile fait partie d'un lit dans la zone donnée. */
    isBed(zoneId, c, r) {
        if (!this._bed || this._bed.zone !== zoneId) return false;
        var b = this._bed;
        return c >= b.c && c < b.c + b.w && r >= b.r && r < b.r + b.h;
    }

    /* Retourne toutes les cellules du lit pour la zone donnée, ou []. */
    getBedTiles(zoneId) {
        if (!this._bed || this._bed.zone !== zoneId) return [];
        var tiles = [];
        for (var dc = 0; dc < this._bed.w; dc++) {
            for (var dr = 0; dr < this._bed.h; dr++) {
                tiles.push({ c: this._bed.c + dc, r: this._bed.r + dr });
            }
        }
        return tiles;
    }

    /* Le lit est-il dans la zone courante ? */
    isBedInZone(zoneId) {
        return this._bed && this._bed.zone === zoneId;
    }

    // --- Énergie ---
    getEnergy() { return this._energy; }
    getMaxEnergy() { return this._maxEnergy; }

    /* Consomme de l'énergie. Retourne false si plus d'énergie. */
    consume(amount) {
        if (this._energy < amount) return false;
        this._energy -= amount;
        return true;
    }

    /* Restaure l'énergie (sommeil, évanouissement). */
    restore(amount) {
        this._energy = Math.min(this._maxEnergy, this._energy + (amount || this._maxEnergy));
    }

    // --- Sommeil ---

    /* Déclenche la séquence de sommeil (appelé depuis mousePressed). */
    triggerSleep() {
        if (this._isSleeping) return;
        this._isSleeping = true;
        this._sleepPhase = 'fadeOut';
        this._sleepTimer = 0;
        this._sleepAlpha = 0;
    }

    /* Est-on en train de dormir (transition en cours) ? */
    isSleeping() {
        return this._isSleeping;
    }

    /* Mise à jour chaque frame : gère la machine d'état du sommeil. */
    update(dt) {
        if (!this._isSleeping) return;

        this._sleepTimer += dt || 0;

        if (this._sleepPhase === 'fadeOut') {
            this._sleepAlpha = Math.min(255, (this._sleepTimer / this._sleepDuration) * 255);
            if (this._sleepTimer >= this._sleepDuration) {
                // Passage à la phase d'avancement du temps
                this._sleepPhase = 'advance';
                this._sleepTimer = 0;
                this._advanceTime();
            }
        } else if (this._sleepPhase === 'advance') {
            // Courte pause (100ms) pour laisser le temps de voir le noir
            if (this._sleepTimer >= 100) {
                this._sleepPhase = 'fadeIn';
                this._sleepTimer = 0;
            }
        } else if (this._sleepPhase === 'fadeIn') {
            this._sleepAlpha = Math.max(0, 255 - (this._sleepTimer / this._sleepDuration) * 255);
            if (this._sleepTimer >= this._sleepDuration) {
                // Réveil complet
                this._isSleeping = false;
                this._sleepPhase = null;
                this._sleepAlpha = 0;
                if (this._sleepCallback) this._sleepCallback();
                this._sleepCallback = null;
            }
        }
    }

    /* Avance le temps au lendemain matin (6h) et restaure l'énergie. */
    _advanceTime() {
        // Avancer d'un jour, régler l'heure à 6h (aube)
        if (window.Engine && Engine.Clock) {
            Engine.Clock.setTime(Engine.Clock.day + 1, 6, 0);
            // Déclencher onNewDay manuellement pour les systèmes de culture
            if (Engine.Clock._onNewDay) Engine.Clock._onNewDay(Engine.Clock.day);
        }

        // Restaurer l'énergie
        var restoreAmt = this._energyCfg ? (this._energyCfg.restoreSleep || 100) : 100;
        this.restore(restoreAmt);

        // Sauvegarder
        if (window.Engine && Engine.Save) Engine.Save.save();
    }

    /* Callback appelé après le réveil (ex: sauvegarde). */
    onWake(cb) {
        this._sleepCallback = cb;
    }

    // --- Rendu du lit ---

    /* Dessine le lit dans la zone courante. Appelé depuis drawWorld(). */
    render(zoneId) {
        if (!this._bed || this._bed.zone !== zoneId) return;
        if (!Engine.Grid) return;

        var ts = Engine.Grid.tileSize;
        var b = this._bed;
        var t = millis();

        // Fond du lit (brun chaud, style bois)
        noStroke();
        fill(160, 110, 60, 220);
        rect(b.c * ts + 2, b.r * ts + 2, b.w * ts - 4, b.h * ts - 4, 6);

        // Oreiller (gauche) — zone la plus à gauche du lit
        fill(240, 235, 220, 240);
        rect(b.c * ts + 6, b.r * ts + 4, ts * 0.55, ts * 0.35, 4);

        // Couverture (reste du lit) — rouge/écossais
        fill(180, 60, 50, 230);
        rect(b.c * ts + ts * 0.65, b.r * ts + 4, (b.w - 1) * ts + ts * 0.3, ts * 0.45, 4);

        // Motif couverture (lignes écossaises)
        stroke(220, 180, 60, 150);
        strokeWeight(1);
        for (var lx = b.c * ts + ts * 0.7; lx < (b.c + b.w) * ts - 4; lx += 12) {
            line(lx, b.r * ts + 6, lx, b.r * ts + ts * 0.42);
        }
        noStroke();

        // Icône Zzz animée au-dessus du lit
        var pulse = 0.6 + 0.4 * sin(t * 0.003);
        fill(255, 255, 255, 160 + 60 * pulse);
        textAlign(CENTER, CENTER);
        textSize(ts * 0.35);
        var cx = (b.c + b.w / 2) * ts;
        var cy = b.r * ts - ts * 0.25;
        text('\uD83D\uDCA4', cx, cy); // 💤

        // Liseré brillant (interactif)
        var glow = 0.3 + 0.2 * sin(t * 0.005);
        noFill();
        stroke(255, 215, 0, 80 + 60 * glow);
        strokeWeight(2);
        rect(b.c * ts + 2, b.r * ts + 2, b.w * ts - 4, b.h * ts - 4, 6);
        noStroke();
        textAlign(CENTER, CENTER);
    }

    // --- Overlay jour/nuit ---

    /*
     * Retourne la teinte actuelle { r, g, b, a } selon l'heure.
     * Interpolation lissée entre les bornes dayTint.
     */
    getCurrentTint() {
        if (!this._dayTint || !Engine.Clock) return [0, 0, 0, 0];

        var hour = Engine.Clock.hour;
        var minute = Engine.Clock.minute;
        var t = hour + minute / 60; // heure décimale

        var phases = [
            { key: 'dawn',  hour: this._dayTint.dawn  ? this._dayTint.dawn.hour  : 5,  color: this._dayTint.dawn  ? this._dayTint.dawn.color  : [255, 200, 150, 40] },
            { key: 'day',   hour: this._dayTint.day   ? this._dayTint.day.hour   : 7,  color: this._dayTint.day   ? this._dayTint.day.color   : [255, 255, 255, 0] },
            { key: 'dusk',  hour: this._dayTint.dusk  ? this._dayTint.dusk.hour  : 19, color: this._dayTint.dusk  ? this._dayTint.dusk.color  : [255, 150, 80, 50] },
            { key: 'night', hour: this._dayTint.night ? this._dayTint.night.hour : 21, color: this._dayTint.night ? this._dayTint.night.color : [20, 20, 60, 160] }
        ];

        // Trouver les deux phases entre lesquelles on se trouve
        // Le cycle : night(21) → dawn(5) → day(7) → dusk(19) → night(21)
        var prev = phases[3]; // night par défaut (dernière phase du cycle)
        var next = phases[0]; // dawn par défaut

        // Trier par heure croissante
        phases.sort(function(a, b) { return a.hour - b.hour; });

        // Trouver l'intervalle
        for (var i = 0; i < phases.length; i++) {
            if (t < phases[i].hour) {
                prev = i === 0 ? phases[phases.length - 1] : phases[i - 1];
                next = phases[i];
                break;
            }
            if (i === phases.length - 1) {
                // Après la dernière phase (night 21h) → wrap vers dawn (5h du lendemain)
                prev = phases[i];
                next = phases[0];
                next = { key: next.key, hour: next.hour + 24, color: next.color };
            }
        }

        // Calculer la progression
        var prevHour = prev.hour;
        var nextHour = next.hour;
        if (t < phases[0].hour) {
            // Avant la première phase : entre night (jour précédent) et dawn
            prev = phases[phases.length - 1]; // night (21h)
            next = phases[0];                  // dawn (5h)
            prevHour = prev.hour;
            nextHour = next.hour + 24;         // lendemain
        }

        var range = nextHour - prevHour;
        if (range <= 0) range = 24;
        var progress = (t - prevHour) / range;
        progress = Math.max(0, Math.min(1, progress));

        // Interpolation lissée (smoothstep)
        var p = progress * progress * (3 - 2 * progress);

        return [
            Math.round(prev.color[0] + (next.color[0] - prev.color[0]) * p),
            Math.round(prev.color[1] + (next.color[1] - prev.color[1]) * p),
            Math.round(prev.color[2] + (next.color[2] - prev.color[2]) * p),
            Math.round(prev.color[3] + (next.color[3] - prev.color[3]) * p)
        ];
    }

    /* Dessine l'overlay jour/nuit plein écran. Appelé depuis drawHud(). */
    renderOverlay() {
        if (!this._dayTint) return;
        var tint = this.getCurrentTint();
        if (!tint || tint[3] <= 0) return;

        noStroke();
        fill(tint[0], tint[1], tint[2], tint[3]);
        rect(0, 0, width, height);
    }

    /* Dessine le fondu noir de la transition sommeil. Appelé depuis drawHud(). */
    renderSleepFade() {
        if (!this._isSleeping || this._sleepAlpha <= 0) return;
        noStroke();
        fill(0, 0, 0, this._sleepAlpha);
        rect(0, 0, width, height);

        // Texte "Zzz..." au centre pendant la transition
        if (this._sleepPhase === 'fadeOut' || this._sleepPhase === 'advance') {
            textAlign(CENTER, CENTER);
            textSize(u(6));
            fill(255, 255, 255, Math.min(255, this._sleepAlpha + 40));
            text('Zzz...', width / 2, height / 2);
        }
    }

    // --- Gestion du clic sur le lit ---

    /*
     * Tente d'interagir avec le lit. Appelé depuis mousePressed().
     * zoneId : zone courante, c/r : tuile cliquée.
     * Retourne true si l'interaction a été déclenchée.
     */
    handleBedClick(zoneId, c, r) {
        if (!this.isBed(zoneId, c, r)) return false;
        if (this._isSleeping) return true; // déjà en train de dormir

        this.triggerSleep();
        return true;
    }

    // --- Persistance ---
    gather() {
        return {
            energy: this._energy
        };
    }

    apply(data) {
        if (!data) return;
        if (typeof data.energy === 'number') {
            this._energy = Math.min(this._maxEnergy, Math.max(0, data.energy));
        }
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.SleepSystem = SleepSystem;
}
