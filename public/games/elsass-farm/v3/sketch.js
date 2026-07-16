/*
 * sketch.js — Elsass Farm v3, Phase 02 Vertical Slice
 *
 * Ajouts vs Phase 01 :
 *   - 1 PNJ (Le Maraîcher) avec dialogue, cadeau, relation
 *   - 1 catastrophe (gel tardif) fonctionnelle
 *   - Cycle visuel jour/nuit (teinte selon l'heure)
 *   - Sommeil (clic sur le lit → lendemain matin + sauvegarde)
 *   - Score cumulatif soumis via GameSystem.Score.submit()
 *   - HUD : or, énergie, saison, météo
 *   - Interface de vente/achat chez le maraîcher
 *   - Rendu spécifique par zone (village, maison)
 */

const C = window.FarmConfig;

let player = null;        // marcheur (Engine.Mover)
let wasMoving = false;    // pour détecter la fin d'un trajet (-> save locale)
let moveMarker = null;    // { x, y, t } dernière destination cliquée
let actionFlash = null;   // { c, r, t, type } tuile "actionnée"
let zoomBtns = {};        // zones cliquables des boutons + / −

// Systèmes de culture Phase 02
let soilSystem = null;    // Engine.SoilSystem
let cropGrowth = null;   // Engine.CropGrowth
let harvestSystem = null; // Engine.HarvestSystem
let culturesData = null;  // données cultures.json chargées
let outilsData = null;     // données outils.json chargées
let selectedTool = null;   // outil sélectionné (id), null = aucun
let toolbarSlots = [];     // zones cliquables de chaque slot [{x,y,w,h,tool}]

// Systèmes Phase 02 — Vertical Slice
let npcSystem = null;      // Engine.NPCSystem
let disasterSystem = null; // Engine.DisasterSystem
let pnjsData = null;       // données pnjs.json
let catastrophesData = null; // données catastrophes.json
let playerEnergy = 100;    // jauge d'énergie
let playerGoldEarned = 0;  // or total gagné (cumul vie entière, pour le score)
let lastDisaster = null;   // {msg, t} dernière catastrophe (pour notification)
let npcDialogue = null;    // {npcId, lines: [], type: 'talk'|'gift'|'shop', t}
let dialogueSystem = null; // Engine.DialogueSystem
let dialoguesData = null;  // données dialogues.json
let dialogueGiftMode = null; // {npcId, items: [{id,label,qty}], startY, itemH}
let shopMode = null;       // {npcId, npcData, sellMode: bool} — mode vente/achat
let bedTriggerZone = null; // zone cliquable du lit (coords monde)
let sleepBlocked = false;  // empêche de dormir plusieurs fois le même jour
let dayTintAlpha = 0;      // alpha courant du filtre jour/nuit
let dayTintColor = [255,255,255,0];
let _rainyToday = false;   // météo pluvieuse du jour (calculée une fois par jour)
let _rainComputedDay = -1; // jour pour lequel _rainyToday a été calculé

// Transition de zone (fondue)
let zoneTransition = null;
let portalChoice = null;

// u(n) = n % du plus petit côté de l'écran — pour TOUT le HUD.
function u(n) {
    return (min(width, height) * n) / 100;
}

function preload() {
    var base = C.assets.base;

    function loadCat(cat) {
        var list = C.assets[cat];
        if (!list) return;
        var cache = {};
        for (var i = 0; i < list.length; i++) {
            var path = list[i];
            var key = path.replace(cat + "/", "").replace(".png", "");
            cache[key] = loadImage(base + path);
        }
        C.assets[cat + "_loaded"] = cache;
    }

    loadCat("sol");
    loadCat("decor");
    loadCat("perso");
    loadCat("batiment");
    loadCat("objet");

    C._zonesData = loadJSON("data/zones/zones.json");

    // Charger cultures et forcer la conversion en tableau si c'est un objet
    culturesData = loadJSON("data/cultures.json", function(data) {
        culturesData = Array.isArray(data) ? data : Object.values(data);
    });

    outilsData = loadJSON("data/outils.json");
    pnjsData = loadJSON("data/pnjs.json");
    catastrophesData = loadJSON("data/catastrophes.json");
    dialoguesData = loadJSON("data/dialogues.json");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);

    // --- Zones & Portails ---
    if (Engine.WorldZone && C._zonesData) {
        Engine.WorldZone.configure({ zones: C._zonesData });
    }

    if (Engine.Portal && C._zonesData) {
        var allPortals = [];
        for (var zid in C._zonesData) {
            if (!C._zonesData.hasOwnProperty(zid)) continue;
            var z = C._zonesData[zid];
            if (z.portals && z.portals.length) {
                for (var pi = 0; pi < z.portals.length; pi++) {
                    var p = z.portals[pi];
                    if (!p.from) p.from = {};
                    if (!p.from.zone) p.from.zone = zid;
                    allPortals.push(p);
                }
            }
        }
        Engine.Portal.configure(allPortals);
    }

    // --- Grille + obstacles (zone par défaut) ---
    Engine.Grid.configure(C.grid);
    C.obstacles.rects.forEach(function (o) {
        for (var dc = 0; dc < o.w; dc++)
            for (var dr = 0; dr < o.h; dr++)
                Engine.Grid.setWalkable(o.c + dc, o.r + dr, false);
    });
    C.obstacles.singles.forEach(function (o) {
        Engine.Grid.setWalkable(o.c, o.r, false);
    });

    // --- Personnage ---
    player = Engine.Mover.create({
        grid: Engine.Grid,
        c: C.player.c, r: C.player.r,
        speed: C.player.speed
    });

    // --- Zone d'action ---
    Engine.ActionZone.configure({ range: C.actionRange });

    // --- Caméra ---
    Engine.Camera.configure({ minZoom: 0.5, maxZoom: 2.2, zoom: 1 });
    Engine.Camera.setWorldBounds(Engine.Grid.worldWidth(), Engine.Grid.worldHeight());
    Engine.Camera.snapTo(player.x, player.y);

    // --- Horloge ---
    Engine.Clock.configure({
        startHour: 7,
        onNewDay: function () {
            if (cropGrowth) cropGrowth.onNewDay(Engine.Clock.day);
            // Réinitialiser l'arrosage quotidien (les tuiles plantées perdent leur statut watered)
            if (soilSystem) _resetDailyWatering();
            // Vérifier les catastrophes
            if (disasterSystem) {
                var season = Engine.Clock.getSeason();
                var disaster = disasterSystem.check(season, Engine.Clock.day);
                if (disaster) {
                    var result = disasterSystem.apply(disaster, soilSystem, cropGrowth);
                    disaster._result = result;
                    lastDisaster = { msg: disaster.msg, t: millis(), detail: result };
                }
            }
            // Réinitialiser le flag de sommeil
            sleepBlocked = false;
            // Sauvegarde nuage à chaque nouveau jour
            if (window.Engine && Engine.Save) Engine.Save.save();
        }
    });

    // --- Système de sol ---
    soilSystem = new Engine.SoilSystem();
    var farmZone = C._zonesData && C._zonesData.ferme;
    var ct = farmZone && farmZone.cultivableTiles;
    if (ct) {
        for (var sc = ct.c1; sc <= ct.c2; sc++) {
            for (var sr = ct.r1; sr <= ct.r2; sr++) {
                soilSystem.setCultivable(sc, sr, true);
            }
        }
    }

    // --- Système de pousse ---
    cropGrowth = new Engine.CropGrowth();
    if (culturesData) cropGrowth.configure({ cultures: culturesData });

    // --- Système de récolte ---
    harvestSystem = new Engine.HarvestSystem();

    // --- Système PNJ (Phase 02) ---
    npcSystem = new Engine.NPCSystem();
    if (pnjsData) npcSystem.configure({ npcs: pnjsData, cultures: culturesData });

    // --- Système de dialogue (Phase 02, Groupe 527) ---
    dialogueSystem = new Engine.DialogueSystem();
    if (dialoguesData) {
        dialogueSystem.configure({
            dialogues: dialoguesData,
            npcSystem: npcSystem,
            harvestSystem: harvestSystem
        });
    }

    // --- Système catastrophes (Phase 02) ---
    disasterSystem = new Engine.DisasterSystem();
    if (catastrophesData) disasterSystem.configure({ disasters: catastrophesData });

    // --- Énergie de départ ---
    playerEnergy = C.energy.max;

    boot();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

async function boot() {
    if (window.Engine && Engine.Loader) Engine.Loader.start(2);

    if (window.Engine && Engine.Save) {
        Engine.Save.configure({
            key: "elsass-farm-v3",
            gather: function () {
                var t = player.tile() || { c: C.player.c, r: C.player.r };
                var data = {
                    day: Engine.Clock.day,
                    hour: Engine.Clock.hour,
                    minute: Engine.Clock.minute,
                    c: t.c, r: t.r,
                    energy: playerEnergy,
                    goldEarned: playerGoldEarned
                };
                if (Engine.WorldZone && Engine.WorldZone.getCurrent()) {
                    data.zoneId = Engine.WorldZone.getCurrent().id;
                }
                if (soilSystem) data.soil = soilSystem.gather();
                if (cropGrowth) data.crops = cropGrowth.gather();
                if (harvestSystem) data.harvest = harvestSystem.gather();
                if (npcSystem) data.npcs = npcSystem.gather();
                if (dialogueSystem) data.dialogues = dialogueSystem.gather();
                if (disasterSystem) data.disasters = disasterSystem.gather();
                return data;
            },
            apply: function (data) {
                if (!data) return;
                if (data.zoneId && Engine.WorldZone) {
                    Engine.WorldZone.setCurrent(data.zoneId);
                }
                if (typeof data.day === "number")
                    Engine.Clock.setTime(data.day, data.hour, data.minute);
                if (typeof data.c === "number" && Engine.Grid.isWalkable(data.c, data.r)) {
                    player.placeAt(data.c, data.r);
                    Engine.Camera.snapTo(player.x, player.y);
                }
                if (typeof data.energy === "number") playerEnergy = data.energy;
                if (typeof data.goldEarned === "number") playerGoldEarned = data.goldEarned;
                if (soilSystem && data.soil) soilSystem.apply(data.soil);
                if (cropGrowth && data.crops) cropGrowth.apply(data.crops);
                if (harvestSystem && data.harvest) harvestSystem.apply(data.harvest);
                if (npcSystem && data.npcs) npcSystem.apply(data.npcs);
                if (dialogueSystem && data.dialogues) dialogueSystem.apply(data.dialogues);
                if (disasterSystem && data.disasters) disasterSystem.apply(data.disasters);
            }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
        await Engine.Save.load();
    }

    if (Engine.WorldZone && !Engine.WorldZone.getCurrent()) {
        Engine.WorldZone.setCurrent('ferme');
    }

    if (window.Engine && Engine.Loader) Engine.Loader.finish();
}

/* ─── Réinitialisation quotidienne de l'arrosage ─── */
function _resetDailyWatering() {
    var season = Engine.Clock.getSeason();
    var isRainy = _isRainyDay(season);
    var keys = Object.keys(soilSystem._tiles);
    for (var i = 0; i < keys.length; i++) {
        var tile = soilSystem._tiles[keys[i]];
        if (tile && tile.state === 'planted') {
            // Pluie = arrosage auto, sinon reset
            tile.watered = isRainy;
        }
    }
}

/* Simule un jour de pluie aléatoire (~30% de chance), déterministe par jour */
function _isRainyDay(season) {
    var day = Engine.Clock.day;
    if (_rainComputedDay !== day) {
        _rainComputedDay = day;
        if (season === 'ete')      _rainyToday = Math.random() < 0.20;
        else if (season === 'automne') _rainyToday = Math.random() < 0.40;
        else if (season === 'printemps') _rainyToday = Math.random() < 0.40;
        else _rainyToday = false;
    }
    return _rainyToday;
}

/* ─── Teinte jour/nuit avec interpolation lisse (carte 526) ─── */
function _getDayTint(hour, minute) {
    var dt = C.dayTint;
    // Heure décimale pour interpolation précise
    var t = hour + (minute || 0) / 60;

    // Phases ordonnées par heure
    var phases = [
        { hour: dt.dawn.hour,  color: dt.dawn.color  },
        { hour: dt.day.hour,   color: dt.day.color   },
        { hour: dt.dusk.hour,  color: dt.dusk.color  },
        { hour: dt.night.hour, color: dt.night.color }
    ];

    // Trouver l'intervalle [prev, next]
    var prev = phases[3]; // night (dernière)
    var next = phases[0]; // dawn
    var prevHour = prev.hour;
    var nextHour = next.hour;

    // Cas spécial : avant la première phase (entre night et dawn)
    if (t < phases[0].hour) {
        prev = phases[3];       // night (21h)
        next = phases[0];       // dawn (5h)
        prevHour = prev.hour;
        nextHour = next.hour + 24; // lendemain
    } else {
        for (var i = 0; i < phases.length; i++) {
            if (t < phases[i].hour) {
                prev = i === 0 ? phases[phases.length - 1] : phases[i - 1];
                next = phases[i];
                prevHour = prev.hour;
                nextHour = next.hour;
                break;
            }
            if (i === phases.length - 1) {
                // Après night (21h) → wrap vers dawn lendemain
                prev = phases[i];
                next = { hour: phases[0].hour + 24, color: phases[0].color };
                prevHour = prev.hour;
                nextHour = next.hour;
            }
        }
    }

    var range = nextHour - prevHour;
    if (range <= 0) range = 24;
    var progress = (t - prevHour) / range;
    progress = Math.max(0, Math.min(1, progress));

    // Smoothstep pour transition douce
    var p = progress * progress * (3 - 2 * progress);

    return [
        Math.round(prev.color[0] + (next.color[0] - prev.color[0]) * p),
        Math.round(prev.color[1] + (next.color[1] - prev.color[1]) * p),
        Math.round(prev.color[2] + (next.color[2] - prev.color[2]) * p),
        Math.round(prev.color[3] + (next.color[3] - prev.color[3]) * p)
    ];
}

function draw() {
    background(C.colors.bg);

    // --- Simulation ---
    if (!zoneTransition && !sleepTransition) {
        Engine.Clock.update(deltaTime);
        player.update(deltaTime);
    }
    // Mise à jour de la transition sommeil (même si bloquée)
    if (sleepTransition) _updateSleepTransition();
    Engine.Camera.follow(player.x, player.y);

    // Fin de trajet
    if (wasMoving && !player.isMoving()) {
        if (Engine.Portal && Engine.WorldZone) {
            var curZone = Engine.WorldZone.getCurrent();
            if (curZone) {
                var t = player.tile();
                if (t) {
                    var portal = Engine.Portal.checkTrigger(curZone.id, t.c, t.r);
                    if (portal) {
                        if (portal.type === "simple") {
                            var entry = portal.to && portal.to.entry ? portal.to.entry : null;
                            switchToZone(portal.to.zone, entry);
                        } else if (portal.type === "choice") {
                            showPortalChoice(portal);
                        }
                        wasMoving = false;
                        return;
                    }
                }
            }
        }
        if (window.Engine && Engine.Save) {
            Engine.Save.saveLocal();
        }
    }
    wasMoving = player.isMoving();

    // --- Monde ---
    push();
    Engine.Camera.apply();
    drawWorld();
    pop();

    // --- Filtre jour/nuit (après le monde, avant le HUD) ---
    var tint = _getDayTint(Engine.Clock.hour, Engine.Clock.minute);
    // Lissage progressif
    dayTintColor = [
        dayTintColor[0] + (tint[0] - dayTintColor[0]) * 0.05,
        dayTintColor[1] + (tint[1] - dayTintColor[1]) * 0.05,
        dayTintColor[2] + (tint[2] - dayTintColor[2]) * 0.05,
        dayTintColor[3] + (tint[3] - dayTintColor[3]) * 0.05
    ];
    noStroke();
    fill(dayTintColor[0], dayTintColor[1], dayTintColor[2], dayTintColor[3]);
    rect(0, 0, width, height);

    // --- HUD ---
    drawHud();

    // --- Fondu de transition zone ---
    drawZoneFade();

    // --- Fondu de sommeil (par-dessus tout) ---
    _drawSleepFade();

    // --- Notification catastrophe ---
    drawDisasterNotice();

    // --- Dialogue PNJ ---
    drawNPCDialogue();

    // --- Interface boutique ---
    drawShopInterface();
}

/* ─── Helpers de rendu Tiny Farm ─── */

function img(cat, key) {
    var cache = C.assets[cat + "_loaded"];
    return cache ? cache[key] : null;
}

function drawTileImg(img, c, r, ts) {
    if (!img) return;
    ts = ts || Engine.Grid.tileSize;
    image(img, c * ts, r * ts, ts, ts);
}

function drawGround() {
    var ts = Engine.Grid.tileSize;
    var cols = Engine.Grid.cols;
    var rows = Engine.Grid.rows;
    var centre1 = img("sol", "farm_sol_sillon_horizontal_clair_centre1");
    var centre2 = img("sol", "farm_sol_sillon_horizontal_clair_centre2");
    var def = centre1;

    for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
            var tile = (c + r) % 2 === 0 ? centre1 : centre2;
            drawTileImg(tile || def, c, r, ts);
        }
    }
}

/* Sol vert herbe pour le village */
function drawVillageGround() {
    var ts = Engine.Grid.tileSize;
    var cols = Engine.Grid.cols;
    var rows = Engine.Grid.rows;
    for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
            noStroke();
            var shade = 130 + ((c + r) % 3) * 15;
            fill(80, shade, 50);
            rect(c * ts, r * ts, ts, ts);
            // Légère variation d'herbe
            fill(90, shade + 5, 55, 60);
            rect(c * ts + 2, r * ts + 2, ts - 4, ts - 4, 2);
        }
    }
}

/* Sol intérieur pour la maison */
function drawIndoorGround() {
    var ts = Engine.Grid.tileSize;
    var cols = Engine.Grid.cols;
    var rows = Engine.Grid.rows;
    for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
            noStroke();
            fill(180, 150, 110);
            rect(c * ts, r * ts, ts, ts);
            // Lattes de parquet
            stroke(160, 130, 90, 100);
            strokeWeight(1);
            line(c * ts + 2, r * ts + ts/2, c * ts + ts - 2, r * ts + ts/2);
            noStroke();
        }
    }
}

function drawDecor() {
    var ts = Engine.Grid.tileSize;
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    var rects = zone && zone.obstacles ? zone.obstacles.rects || [] : C.obstacles.rects;
    var singles = zone && zone.obstacles ? zone.obstacles.singles || [] : C.obstacles.singles;

    for (var ri = 0; ri < rects.length; ri++) {
        var o = rects[ri];
        var area = o.w * o.h;
        if (area >= 6) {
            _drawGrange(o.c, o.r, o.w, o.h, ts);
        } else if (area >= 3) {
            var eau_g = img("decor", "farm_bac_eau_gauche");
            var eau_d = img("decor", "farm_bac_eau_droit");
            for (var dc = 0; dc < o.w; dc++) {
                for (var dr = 0; dr < o.h; dr++) {
                    var tile = dc < o.w / 2 ? eau_g : eau_d;
                    drawTileImg(tile, o.c + dc, o.r + dr, ts);
                }
            }
        } else {
            var pierres = img("decor", "farm_tas_pierres");
            for (var dc = 0; dc < o.w; dc++) {
                for (var dr = 0; dr < o.h; dr++) {
                    drawTileImg(pierres, o.c + dc, o.r + dr, ts);
                }
            }
        }
    }

    var singleDecor = [
        img("decor", "farm_herbe_touffe"),
        img("decor", "farm_arbre_sapin_jeune"),
        img("decor", "farm_arbre_sapin_moyen"),
        img("decor", "farm_buisson_baies"),
        img("decor", "farm_tournesol"),
        img("decor", "farm_ble_mure"),
        img("decor", "farm_carotte_mure"),
        img("decor", "farm_tomate_mure"),
        img("decor", "farm_chou_mure"),
        img("decor", "farm_mais_mure"),
        img("decor", "farm_aubergine_mure"),
        img("decor", "farm_pousse_en_pot")
    ];

    for (var si = 0; si < singles.length; si++) {
        var s = singles[si];
        var spr = singleDecor[si % singleDecor.length];
        drawTileImg(spr, s.c, s.r, ts);
    }
}

/* Dessine des bâtiments simplifiés pour le village */
function drawVillageBuildings() {
    var ts = Engine.Grid.tileSize;
    // Marché couvert (c5,r5 → 3x3) et bâtiment secondaire (c14,r3 → 2x2)
    // Marché : toit rouge reconnaissable
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || !zone.obstacles || !zone.obstacles.rects) return;
    var rects = zone.obstacles.rects;
    for (var ri = 0; ri < rects.length; ri++) {
        var o = rects[ri];
        if (o.w * o.h >= 4) {
            // Toit de bâtiment village
            fill(160, 70, 50, 230);
            var roofY = o.r * ts - ts * 0.3;
            triangle(
                o.c * ts - ts * 0.2, (o.r + o.h) * ts,
                (o.c + o.w / 2) * ts, roofY,
                (o.c + o.w) * ts + ts * 0.2, (o.r + o.h) * ts
            );
            // Corps du bâtiment
            fill(240, 220, 180);
            rect(o.c * ts, o.r * ts + ts * 0.1, o.w * ts, o.h * ts - ts * 0.1);
            // Colombages
            stroke(120, 70, 40, 180);
            strokeWeight(2);
            for (var dc = 0; dc < o.w; dc++) {
                line((o.c + dc) * ts, o.r * ts + ts * 0.1, (o.c + dc) * ts, (o.r + o.h) * ts);
            }
            noStroke();
        }
    }
}

function _drawGrange(cc, rr, w, h, ts) {
    if (w < 3 || h < 2) return;
    var tg = img("batiment", "farm_grange_toit_bas_gauche");
    var tc = img("batiment", "farm_grange_toit_bas_centre");
    var td = img("batiment", "farm_grange_toit_bas_droit");
    drawTileImg(tg || tc, cc,       rr, ts);
    for (var i = 1; i < w-1; i++) drawTileImg(tc || tg, cc + i, rr, ts);
    drawTileImg(td || tc, cc + w-1, rr, ts);

    var mg = img("batiment", "farm_grange_mur_brique1_gauche");
    var mc = img("batiment", "farm_grange_mur_brique1_centre");
    var md = img("batiment", "farm_grange_mur_brique1_droit");
    var pg = img("batiment", "farm_grange_porte_gauche");
    var pd = img("batiment", "farm_grange_porte_droit");
    var fen = img("batiment", "farm_grange_fenetre");

    var r = rr + 1;
    drawTileImg(fen || mc, cc,       r, ts);
    drawTileImg(mc  || fen, cc + 1,   r, ts);
    drawTileImg(pg  || mc, cc + 2,   r, ts);
    drawTileImg(pd  || mc, cc + 3,   r, ts);
    drawTileImg(fen || mc, cc + w-1, r, ts);
}

/* Rendu visuel des cultures */
function drawCrops() {
    if (!soilSystem) return;
    var ts = Engine.Grid.tileSize;
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || zone.id !== 'ferme') return;

    var keys = Object.keys(soilSystem._cultivable);
    for (var i = 0; i < keys.length; i++) {
        var parts = keys[i].split(',');
        var c = parseInt(parts[0]), r = parseInt(parts[1]);
        var state = soilSystem.getState(c, r);
        var x = c * ts, y = r * ts;
        var cx = x + ts/2, cy = y + ts/2;

        noStroke();
        fill(80, 55, 30, 180);
        rect(x + 2, y + 2, ts - 4, ts - 4, 4);

        if (state === 'tilled') {
            stroke(110, 85, 45, 200);
            strokeWeight(1);
            for (var s = 0; s < 3; s++) {
                var ly = y + ts * (0.25 + s * 0.2);
                line(x + 4, ly, x + ts - 4, ly);
            }
            noStroke();
        } else if (state === 'planted') {
            var cropId = cropGrowth ? cropGrowth.getCropId(c, r) : null;
            var stage = cropGrowth ? cropGrowth.getGrowthStage(c, r) : 0;
            var isMature = cropGrowth ? cropGrowth.isMature(c, r) : false;
            var cropData = cropId ? cropGrowth.getCropData(cropId) : null;

            if (cropData) {
                var emojiSize = ts * (0.35 + 0.35 * stage);
                textAlign(CENTER, CENTER);
                textSize(emojiSize);
                if (isMature) {
                    fill(255, 255, 100, 60);
                    rect(x + 2, y + 2, ts - 4, ts - 4, 4);
                    fill(255);
                    text(cropData.emoji, cx, cy);
                } else {
                    fill(255, 255, 255, 140 + 80 * stage);
                    text('🌱', cx, cy);
                    textSize(ts * 0.15);
                    fill(255, 255, 255, 180);
                    text(cropData.label.substring(0, 3), cx, y + ts * 0.85);
                }

                if (soilSystem.isWatered(c, r)) {
                    textSize(ts * 0.4);
                    fill(100, 180, 255, 220);
                    text('💧', x + ts * 0.75, y + ts * 0.25);
                }

                if (!isMature) {
                    var remaining = cropGrowth.getDaysUntilMature(c, r);
                    textSize(ts * 0.2);
                    fill(255, 255, 255, 200);
                    text(remaining + 'j', cx, y + ts * 0.15);
                }
                textAlign(CENTER, CENTER);
            } else {
                textSize(ts * 0.45);
                fill(100, 200, 80, 200);
                text('🌱', cx, cy);
            }
        } else {
            textSize(ts * 0.22);
            fill(180, 160, 120, 140);
            textAlign(CENTER, CENTER);
            text('clic', cx, cy);
        }
        textAlign(CENTER, CENTER);
    }
}

/* Rendu visuel des portails */
function drawPortals() {
    if (!Engine.Portal || !Engine.WorldZone) return;
    var zone = Engine.WorldZone.getCurrent();
    if (!zone) return;

    var portals = Engine.Portal.getPortalsForZone(zone.id);
    if (!portals || !portals.length) return;

    var ts = Engine.Grid.tileSize;
    var t = millis();
    textAlign(CENTER, CENTER);

    for (var pi = 0; pi < portals.length; pi++) {
        var portal = portals[pi];
        var cells = portal.from && portal.from.cells;
        if (!cells) continue;

        var color = portal.type === 'choice' || portal.choices
            ? [255, 193, 7]
            : [79, 195, 247];

        for (var ci = 0; ci < cells.length; ci++) {
            var cell = cells[ci];
            var cc = cell[0], rr = cell[1];
            var cx2 = cc * ts + ts / 2;
            var cy2 = rr * ts + ts / 2;

            var pulse = 0.55 + 0.25 * sin(t * 0.004);
            noStroke();
            fill(color[0], color[1], color[2], 60 + 40 * pulse);
            ellipse(cx2, cy2, ts * 0.9, ts * 0.9);

            noFill();
            stroke(color[0], color[1], color[2], 180);
            strokeWeight(2);
            ellipse(cx2, cy2, ts * 0.6, ts * 0.6);

            noStroke();
            fill(255, 255, 255, 220);
            textSize(ts * 0.45);
            text('\uD83D\uDEAA', cx2, cy2 - ts * 0.05);
        }
    }
    textAlign(CENTER, CENTER);
}

/* ─── Rendu des PNJ dans le monde ─── */
function drawNPCs() {
    if (!npcSystem || !Engine.WorldZone) return;
    var zone = Engine.WorldZone.getCurrent();
    if (!zone) return;

    var npcs = npcSystem.getNPCsInZone(zone.id);
    if (!npcs.length) return;
    var ts = Engine.Grid.tileSize;

    for (var i = 0; i < npcs.length; i++) {
        var n = npcs[i];
        var cx = n.c * ts + ts / 2;
        var cy = n.r * ts + ts / 2;

        // Fond du PNJ
        noStroke();
        fill(100, 80, 60, 180);
        ellipse(cx, cy - ts * 0.15, ts * 0.7, ts * 0.7);

        // Emoji
        textAlign(CENTER, CENTER);
        textSize(ts * 0.5);
        fill(255);
        text(n.emoji || '\uD83E\uDDD1', cx, cy - ts * 0.15);

        // Nom
        textSize(ts * 0.2);
        fill(255, 255, 255, 200);
        text(n.label, cx, cy + ts * 0.35);
        textAlign(CENTER, CENTER);
    }
}

/* Lit : rendu visuel dans la maison */
function drawBed() {
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || zone.id !== 'maison-rdc') return;
    var ts = Engine.Grid.tileSize;
    var b = C.bed;

    // Oreiller
    fill(255, 250, 240);
    rect(b.c * ts + ts * 0.1, b.r * ts + ts * 0.1, ts * 0.8, ts * 0.4, ts * 0.15);
    // Couverture
    fill(180, 60, 50);
    rect(b.c * ts + ts * 0.1, b.r * ts + ts * 0.5, ts * 2.8, ts * 0.45, ts * 0.1);

    // Indicateur cliquable
    var t = millis();
    var pulse = 0.4 + 0.3 * sin(t * 0.003);
    fill(255, 255, 200, 100 * pulse);
    textAlign(CENTER, CENTER);
    textSize(ts * 0.3);
    text('💤', b.c * ts + ts * 1.5, b.r * ts - ts * 0.2);
    textAlign(CENTER, CENTER);

    // Zone cliquable (coords monde)
    bedTriggerZone = {
        x: b.c * ts,
        y: b.r * ts,
        w: b.w * ts,
        h: b.h * ts
    };
}

function drawWorld() {
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    var zoneId = zone ? zone.id : 'ferme';

    // Sol selon la zone
    if (zoneId === 'village') {
        drawVillageGround();
    } else if (zoneId === 'maison-rdc' || zoneId === 'maison-etage') {
        drawIndoorGround();
    } else {
        drawGround();
    }

    // Grille de debug
    Engine.Grid.drawDebug({ line: C.colors.gridLine });

    // Décor selon la zone
    if (zoneId === 'village') {
        drawVillageBuildings();
    } else {
        drawDecor();
    }

    // Cultures (ferme uniquement)
    drawCrops();

    // Portails
    drawPortals();

    // PNJ
    drawNPCs();

    // Lit (maison)
    drawBed();

    // Marqueur de destination
    if (moveMarker && millis() - moveMarker.t < 1000) {
        var a = 1 - (millis() - moveMarker.t) / 1000;
        noFill();
        stroke("rgba(79,195,247," + a.toFixed(2) + ")");
        strokeWeight(3);
        circle(moveMarker.x, moveMarker.y, Engine.Grid.tileSize * 0.6);
        noStroke();
    }

    // Flash action
    if (actionFlash && millis() - actionFlash.t < 600) {
        var s = Engine.Grid.tileSize;
        var flashColors = {
            till: 'rgba(139,90,43,0.8)',
            plant: 'rgba(76,175,80,0.75)',
            water: 'rgba(33,150,243,0.75)',
            harvest: 'rgba(255,193,7,0.8)',
            gift: 'rgba(255,105,180,0.8)',
            chop: 'rgba(156,39,176,0.75)',
            mine: 'rgba(96,125,139,0.75)',
            blocked: 'rgba(244,67,54,0.6)',
            action: C.colors.actionFlash
        };
        var fc = flashColors[actionFlash.type] || flashColors.action;
        fill(fc);
        rect(actionFlash.c * s + 2, actionFlash.r * s + 2, s - 4, s - 4, 6);
    }

    // Zone d'action + chemin
    Engine.ActionZone.drawDebug(Engine.Grid, player.tile(), C.colors.zone);
    player.drawDebugPath(C.colors.path);

    // Personnage
    var farmer = img("perso", "farm_fermier_brun");
    var d = Engine.Grid.tileSize;
    if (farmer) {
        image(farmer, player.x - d/2, player.y - d/2, d, d);
    } else {
        fill(C.colors.player);
        circle(player.x, player.y, d * 0.7);
        textSize(d * 0.5);
        text("\uD83E\uDDD1\u200D\uD83C\uDF3E", player.x, player.y - d * 0.05);
    }
}

function drawHud() {
    // Bandeau horloge (haut centre)
    var season = Engine.Clock.getSeason();
    var seasonEmoji = { printemps: '🌸', ete: '☀️', automne: '🍂', hiver: '❄️' };
    var label = "Jour " + Engine.Clock.day + " " + (seasonEmoji[season] || '') + " — " + Engine.Clock.timeString();
    textSize(u(3.2));
    var w = textWidth(label) + u(6);
    fill(C.colors.hudPanel);
    rect(width / 2 - w / 2, u(2), w, u(6), u(1.5));
    fill(C.colors.hudText);
    text(label, width / 2, u(2) + u(3));

    // Or (haut droite)
    var gold = harvestSystem ? harvestSystem.getGold() : 0;
    var goldLabel = "🪙 " + gold;
    textSize(u(3));
    var gw = textWidth(goldLabel) + u(4);
    fill(C.colors.hudPanel);
    rect(width - gw - u(2), u(2), gw, u(6), u(1.5));
    fill(255, 215, 0);
    text(goldLabel, width - u(2) - gw/2, u(2) + u(3));

    // Énergie (haut gauche)
    var energyPct = Math.max(0, playerEnergy / C.energy.max);
    var energyColor = energyPct > 0.5 ? [100, 220, 80] : (energyPct > 0.25 ? [255, 200, 40] : [255, 80, 80]);
    var barW = u(18);
    var barH = u(2.5);
    var barX = u(2);
    var barY = u(2);
    fill(C.colors.hudPanel);
    rect(barX - u(0.5), barY - u(0.5), barW + u(1), barH + u(1), u(1));
    // Fond barre
    fill(40, 40, 40, 200);
    rect(barX, barY, barW, barH, u(0.5));
    // Barre énergie
    fill(energyColor[0], energyColor[1], energyColor[2], 220);
    rect(barX, barY, barW * energyPct, barH, u(0.5));
    // Texte
    fill(255);
    textSize(u(2));
    textAlign(LEFT, CENTER);
    text("⚡ " + playerEnergy, barX + u(1), barY + barH/2);
    textAlign(CENTER, CENTER);

    // Météo du jour
    var weatherLabel = _isRainyDay(season) ? '🌧️ Pluie' : '☀️ Beau';
    textSize(u(2.5));
    fill(C.colors.hudPanel);
    var ww = textWidth(weatherLabel) + u(3);
    rect(barX, barY + barH + u(1), ww, u(4.5), u(1));
    fill(C.colors.hudText);
    text(weatherLabel, barX + ww/2, barY + barH + u(3.2));

    // Boutons zoom + / − (bas droite)
    var size = u(9);
    var x = width - size - u(3);
    var yPlus = height - size * 2 - u(5);
    var yMinus = height - size - u(3);
    zoomBtns.plus = { x: x, y: yPlus, w: size, h: size };
    zoomBtns.minus = { x: x, y: yMinus, w: size, h: size };
    fill(C.colors.button);
    rect(x, yPlus, size, size, u(2));
    rect(x, yMinus, size, size, u(2));
    fill(C.colors.buttonText);
    textSize(u(5));
    text("+", x + size / 2, yPlus + size / 2);
    text("−", x + size / 2, yMinus + size / 2);

    // Barre d'outils
    drawToolbar();

    // Popup de portail
    drawPortalChoice();
}

function drawToolbar() {
    if (!outilsData || !outilsData.length) return;

    var slotSize = u(11);
    var gap = u(2);
    var totalW = outilsData.length * slotSize + (outilsData.length - 1) * gap;
    var startX = width / 2 - totalW / 2;
    var y = height - slotSize - u(3);

    toolbarSlots = [];

    for (var i = 0; i < outilsData.length; i++) {
        var tool = outilsData[i];
        var x = startX + i * (slotSize + gap);
        var isSelected = selectedTool === tool.id;

        if (isSelected) {
            fill(255, 215, 0, 220);
        } else {
            fill(C.colors.hudPanel);
        }
        stroke(C.colors.hudText);
        strokeWeight(u(0.3));
        rect(x, y, slotSize, slotSize, u(1.5));
        noStroke();

        textSize(slotSize * 0.55);
        fill(isSelected ? 0 : C.colors.hudText);
        textAlign(CENTER, CENTER);
        text(tool.emoji, x + slotSize / 2, y + slotSize / 2);

        if (isSelected) {
            noFill();
            stroke(255, 215, 0, 255);
            strokeWeight(u(0.5));
            rect(x, y, slotSize, slotSize, u(1.5));
            noStroke();
        }

        toolbarSlots.push({ x: x, y: y, w: slotSize, h: slotSize, tool: tool });
    }

    textAlign(CENTER, CENTER);
}

/* ─── Notification de catastrophe ─── */
function drawDisasterNotice() {
    if (!lastDisaster) return;
    var elapsed = millis() - lastDisaster.t;
    if (elapsed > 6000) { lastDisaster = null; return; }

    var alpha = elapsed < 500 ? (elapsed / 500) * 220 : (elapsed > 5000 ? (6000 - elapsed) / 1000 * 220 : 220);

    // Fond bandeau
    var h = u(7);
    var y = u(11);
    noStroke();
    fill(180, 40, 40, alpha);
    rect(u(5), y, width - u(10), h, u(1.5));

    textSize(u(2.8));
    fill(255, 255, 255, alpha);
    textAlign(CENTER, CENTER);
    var txt = lastDisaster.msg;
    if (lastDisaster.detail && lastDisaster.detail.cropsDestroyed > 0) {
        txt += " (" + lastDisaster.detail.cropsDestroyed + " culture(s) perdue(s))";
    }
    text(txt, width / 2, y + h / 2);
    textAlign(CENTER, CENTER);
}

/* ─── Dialogue PNJ (avec arbre de dialogue, Groupe 527) ─── */
function drawNPCDialogue() {
    // Priorité au mode cadeau (sélection d'item dans l'inventaire)
    if (dialogueGiftMode) {
        drawGiftSelection();
        return;
    }

    if (!npcDialogue) return;
    var elapsed = millis() - npcDialogue.t;

    // Le dialogue ne s'auto-ferme plus — le joueur doit cliquer un choix
    // (sauf si ended, on nettoie après un délai)
    if (npcDialogue.ended && elapsed > 3000) {
        npcDialogue = null;
        dialogueGiftMode = null;
        return;
    }

    var state = npcDialogue;
    var npc = state.npc;
    if (!npc) { npcDialogue = null; return; }

    var alpha = elapsed < 300 ? (elapsed / 300) * 230 : 230;
    var choices = state.choices || [];
    var hasChoices = choices.length > 0;

    // Hauteur dynamique selon nombre de choix
    var choiceCount = choices.length;
    var dh = u(22) + (hasChoices ? choiceCount * u(6.5) : 0) + u(4);
    var dw = width * 0.75;
    var dx = width / 2 - dw / 2;
    var dy = height - dh - u(8);

    // Fond de dialogue
    noStroke();
    fill(20, 20, 40, alpha);
    rect(dx, dy, dw, dh, u(2));
    stroke(255, 215, 0, alpha * 0.6);
    strokeWeight(1.5);
    rect(dx, dy, dw, dh, u(2));
    noStroke();

    // Nom et emoji du PNJ
    textSize(u(3.5));
    fill(255, 215, 0, alpha);
    textAlign(LEFT, CENTER);
    var nameLabel = (npc.emoji || '') + ' ' + (npc.label || '???');
    text(nameLabel, dx + u(3), dy + u(5));
    textAlign(CENTER, CENTER);

    // Texte du dialogue
    textSize(u(2.8));
    fill(255, 255, 255, alpha);
    textAlign(LEFT, TOP);
    var textX = dx + u(3);
    var textY = dy + u(10);
    var textW = dw - u(6);
    var dialogueText = state.text || '';
    text(dialogueText, textX, textY, textW);
    textAlign(CENTER, CENTER);

    // Jauge de relation
    var rel = npcSystem ? npcSystem.getRelationLevel(state.npcId) : 0;
    var barW2 = dw - u(10);
    var barH2 = u(1.8);
    var bx = dx + u(5);
    var barY = dy + u(4);
    fill(40, 40, 60, alpha);
    rect(bx, barY, barW2, barH2, u(0.4));
    var heartColor = rel >= 15 ? [255, 80, 120] : (rel >= 5 ? [255, 150, 100] : [255, 180, 180]);
    fill(heartColor[0], heartColor[1], heartColor[2], alpha);
    rect(bx, barY, barW2 * (rel / 20), barH2, u(0.4));
    textSize(u(2.2));
    fill(255, 255, 255, alpha * 0.8);
    textAlign(LEFT, CENTER);
    text('❤️ ' + rel + '/20', bx + barW2 + u(1.5), barY + barH2/2);
    textAlign(CENTER, CENTER);

    // --- Effets spéciaux (paliers de relation débloqués) ---
    if (!npcDialogue._tiersChecked) {
        npcDialogue._tiersChecked = true;
        var unlocked = dialogueSystem ? dialogueSystem.checkTierEffects(state.npcId) : [];
        if (unlocked.length > 0) {
            npcDialogue._newTiers = unlocked;
            npcDialogue._tierFlashT = millis();
        }
    }
    if (npcDialogue._newTiers && npcDialogue._tierFlashT) {
        var tierElapsed = millis() - npcDialogue._tierFlashT;
        if (tierElapsed < 5000) {
            var tierAlpha = tierElapsed < 500 ? tierElapsed / 500 : (tierElapsed > 4000 ? (5000 - tierElapsed) / 1000 : 1);
            var tierY = dy - u(14);
            for (var ti = 0; ti < npcDialogue._newTiers.length; ti++) {
                var tier = npcDialogue._newTiers[ti];
                var lineY = tierY + ti * u(6);
                fill(0, 0, 0, 200 * tierAlpha);
                var tW2 = dw - u(4);
                rect(dx + u(2), lineY, tW2, u(5), u(1));
                fill(255, 215, 0, 255 * tierAlpha);
                textSize(u(2.5));
                textAlign(CENTER, CENTER);
                var tierMsg = '';
                if (tier.effect.type === 'discount') {
                    tierMsg = '🏷️ Remise de ' + Math.round(tier.effect.value * 100) + '% chez ' + npc.label + ' !';
                } else if (tier.effect.type === 'recipe') {
                    tierMsg = '📜 Nouvelle recette : ' + tier.effect.id + ' !';
                }
                text(tierMsg, dx + dw/2, lineY + u(2.5));
            }
        } else {
            npcDialogue._newTiers = null;
            npcDialogue._tierFlashT = null;
        }
        textAlign(CENTER, CENTER);
    }

    // --- Boutons de choix ---
    if (hasChoices) {
        var btnStartY = textY + u(12); // sous le texte
        var btnW = dw - u(8);
        var btnH = u(5.5);
        var btnGap = u(1.5);
        var btnX = dx + u(4);

        npcDialogue._choiceBtns = [];

        for (var ci = 0; ci < choices.length; ci++) {
            var choice = choices[ci];
            var by = btnStartY + ci * (btnH + btnGap);

            // Fond du bouton
            var isEndAction = choice.action === 'end';
            var isShopAction = choice.action === 'open_shop_sell' || choice.action === 'open_shop_buy';
            var isGiftAction = choice.action === 'open_gift';

            if (isEndAction) {
                fill(150, 60, 60, alpha * 0.85);
            } else if (isShopAction) {
                fill(80, 140, 80, alpha * 0.85);
            } else if (isGiftAction) {
                fill(200, 120, 160, alpha * 0.85);
            } else {
                fill(60, 80, 140, alpha * 0.85);
            }
            stroke(255, 255, 255, alpha * 0.4);
            strokeWeight(1);
            rect(btnX, by, btnW, btnH, u(1.2));
            noStroke();

            fill(255, 255, 255, alpha);
            textSize(u(2.5));
            textAlign(CENTER, CENTER);
            text(choice.label, btnX + btnW/2, by + btnH/2);

            npcDialogue._choiceBtns.push({
                x: btnX, y: by, w: btnW, h: btnH,
                index: ci, label: choice.label, action: choice.action
            });
        }
    }

    textAlign(CENTER, CENTER);

    // Indication de fermeture
    if (!hasChoices) {
        textSize(u(2));
        fill(255, 255, 255, 100);
        text('Échap pour fermer', dx + dw/2, dy + dh - u(3));
    }
}

/* Sélection de cadeau dans l'inventaire */
function drawGiftSelection() {
    if (!dialogueGiftMode) return;

    var gm = dialogueGiftMode;
    var items = gm.items;
    var dw = width * 0.65;
    var itemH = u(6);
    var count = Math.min(items.length, 6);
    var dh = u(14) + count * itemH + u(4);
    var dx = width / 2 - dw / 2;
    var dy = height / 2 - dh / 2;

    // Fond
    noStroke();
    fill(20, 20, 45, 240);
    rect(dx, dy, dw, dh, u(2));
    stroke(255, 180, 200, 180);
    strokeWeight(2);
    rect(dx, dy, dw, dh, u(2));
    noStroke();

    textSize(u(3.5));
    fill(255, 200, 220);
    textAlign(CENTER, CENTER);
    text('🎁 Choisissez un cadeau', dx + dw/2, dy + u(5));

    gm._slots = [];
    var startY = dy + u(10);
    for (var i = 0; i < count; i++) {
        var item = items[i];
        var iy = startY + i * itemH;

        fill(i % 2 === 0 ? 'rgba(60,60,100,0.4)' : 'rgba(30,30,60,0.4)');
        rect(dx + u(2), iy, dw - u(4), itemH, u(1));

        textSize(u(2.5));
        fill(255);
        textAlign(LEFT, CENTER);
        text(item.label, dx + u(4), iy + itemH/2);
        textAlign(RIGHT, CENTER);
        text('x' + item.qty + '  [OFFRIR]', dx + dw - u(3), iy + itemH/2);

        gm._slots.push({ x: dx + u(2), y: iy, w: dw - u(4), h: itemH, item: item });
    }

    textAlign(CENTER, CENTER);
    if (count === 0) {
        textSize(u(2.5));
        fill(255, 255, 255, 150);
        text('Aucun objet à offrir.', dx + dw/2, startY + u(3));
    }

    // Bouton fermer
    var closeBy = startY + count * itemH + u(3);
    var closeBw = u(25);
    var closeBh = u(5);
    fill(120, 60, 60, 200);
    rect(dx + dw/2 - closeBw/2, closeBy, closeBw, closeBh, u(1));
    fill(255);
    textSize(u(2.5));
    text('Annuler', dx + dw/2, closeBy + closeBh/2);
    gm._closeBtn = { x: dx + dw/2 - closeBw/2, y: closeBy, w: closeBw, h: closeBh };

    textAlign(CENTER, CENTER);
}

/* ─── Interface boutique ─── */
function drawShopInterface() {
    if (!shopMode) return;
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || zone.id !== 'village') { shopMode = null; return; }

    var dw = width * 0.75;
    var dh = height * 0.5;
    var dx = width / 2 - dw / 2;
    var dy = height / 2 - dh / 2;

    // Fond
    noStroke();
    fill(20, 20, 50, 235);
    rect(dx, dy, dw, dh, u(2));
    stroke(255, 215, 0, 180);
    strokeWeight(2);
    rect(dx, dy, dw, dh, u(2));
    noStroke();

    var title = shopMode.sellMode
        ? ("🛒 VENDRE à " + npcData.label)
        : ("🛍️ ACHETER chez " + npcData.label);
    textSize(u(4));
    fill(255, 215, 0);
    text(title, dx + dw/2, dy + u(5));

    // Or disponible
    var gold = harvestSystem ? harvestSystem.getGold() : 0;
    textSize(u(2.8));
    fill(255, 255, 255);
    text("🪙 " + Math.floor(gold) + " or", dx + dw/2, dy + u(9));

    var npcData = shopMode.npcData;
    var startY = dy + u(13);
    var itemH = u(5);
    var items = [];

    if (shopMode.sellMode) {
        // Vente : lister l'inventaire du joueur
        var inv = harvestSystem ? harvestSystem.getInventory() : {};
        var multiplier = npcSystem ? npcSystem.getSellMultiplier(shopMode.npcId) : 1.0;
        // Filtrer par catégorie si le PNJ n'achète que certaines catégories
        var buyCategories = npcData.buysCategories || null;
        for (var cropId in inv) {
            if (!inv.hasOwnProperty(cropId)) continue;
            var cropData = cropGrowth.getCropData(cropId) || (culturesData ? culturesData.find(function(cc) { return cc.id === cropId; }) : null);
            if (!cropData) continue;
            // Filtre par catégorie si le PNJ a des préférences d'achat
            if (buyCategories && cropData.category && buyCategories.indexOf(cropData.category) === -1) continue;
            var price = Math.floor((cropData.sell || 0) * multiplier);
            items.push({ id: cropId, label: (cropData.emoji || '') + ' ' + cropData.label, qty: inv[cropId], price: price, sell: true });
        }
    } else {
        // Achat : lister ce que le PNJ vend
        // Priorité : liste sells explicite > seedPrices > buyGifts
        if (npcData.sells && npcData.sells.length > 0) {
            // PNJ qui vend des items spécifiques (ex: boulangère → farine)
            for (var si = 0; si < npcData.sells.length; si++) {
                var sellId = npcData.sells[si];
                // Chercher dans culturesData pour le prix
                var sCropData = cropGrowth ? cropGrowth.getCropData(sellId) : null;
                if (!sCropData && culturesData) {
                    sCropData = culturesData.find(function(cc) { return cc.id === sellId; });
                }
                var sPrice = sCropData ? (sCropData.sell || 10) : 10;
                items.push({ id: sellId, label: (sCropData ? sCropData.emoji + ' ' : '') + sellId, qty: '∞', price: sPrice, sell: false });
            }
        } else if (npcData.seedPrices) {
            var seedPrices = npcData.seedPrices;
            for (var seedId in seedPrices) {
                if (!seedPrices.hasOwnProperty(seedId)) continue;
                var cropData2 = cropGrowth.getCropData(seedId);
                if (!cropData2) continue;
                items.push({ id: seedId, label: cropData2.emoji + ' ' + cropData2.label, qty: '∞', price: seedPrices[seedId], sell: false });
            }
        } else if (npcData.buyGifts && npcData.buyGifts.length > 0) {
            // PNJ qui vend des gifts (produits transformés)
            for (var gi = 0; gi < npcData.buyGifts.length; gi++) {
                var giftId = npcData.buyGifts[gi];
                var gData = cropGrowth ? cropGrowth.getCropData(giftId) : null;
                items.push({ id: giftId, label: (gData ? gData.emoji + ' ' : '🍞 ') + giftId, qty: '∞', price: 8 + gi * 2, sell: false });
            }
        }
    }

    // Scroll si trop d'items
    var maxVisible = 6;
    for (var i = 0; i < Math.min(items.length, maxVisible); i++) {
        var item = items[i];
        var iy = startY + i * itemH;

        // Fond ligne
        fill(i % 2 === 0 ? 'rgba(60,60,100,0.5)' : 'rgba(30,30,60,0.5)');
        rect(dx + u(2), iy, dw - u(4), itemH, u(1));

        textSize(u(2.5));
        fill(255);
        textAlign(LEFT, CENTER);
        text(item.label, dx + u(4), iy + itemH/2);
        textAlign(RIGHT, CENTER);
        if (item.sell) {
            text("x" + item.qty + "  →  🪙" + item.price + "/u  [VENDRE]", dx + dw - u(3), iy + itemH/2);
        } else {
            text("🪙" + item.price + "  [ACHETER]", dx + dw - u(3), iy + itemH/2);
        }
    }

    if (items.length === 0) {
        textSize(u(3));
        fill(255, 255, 255, 150);
        textAlign(CENTER, CENTER);
        text(shopMode.sellMode ? "Rien à vendre pour le moment." : "Pas de graines disponibles.", dx + dw/2, startY + itemH * 2);
    }

    textAlign(CENTER, CENTER);
    // Fermeture
    textSize(u(2.2));
    fill(255, 255, 255, 120);
    text("Échap ou clic hors boutique pour fermer", dx + dw/2, dy + dh - u(3));
}

/* ─── Input ─── */

function inRect(mx, my, b) {
    return b && mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h;
}

function mousePressed() {
    if (zoneTransition || sleepTransition) return;

    // Popup portail
    if (portalChoice) {
        for (var i = 0; i < portalChoice.buttons.length; i++) {
            var b = portalChoice.buttons[i];
            if (inRect(mouseX, mouseY, b)) {
                portalChoice = null;
                switchToZone(b.zone, b.entry);
                return;
            }
        }
        portalChoice = null;
        return;
    }

    // Sélection de cadeau (prioritaire car overlay)
    if (dialogueGiftMode) {
        _handleGiftClick(mouseX, mouseY);
        return;
    }

    // Fermer la boutique si clic hors zone
    if (shopMode) {
        var dw2 = width * 0.75;
        var dh2 = height * 0.5;
        var dx2 = width / 2 - dw2 / 2;
        var dy2 = height / 2 - dh2 / 2;
        if (!inRect(mouseX, mouseY, { x: dx2, y: dy2, w: dw2, h: dh2 })) {
            shopMode = null;
            return;
        }
        // Gestion des clics dans la boutique
        _handleShopClick(mouseX, mouseY, dx2, dy2, dw2);
        return;
    }

    // 1. HUD
    if (inRect(mouseX, mouseY, zoomBtns.plus)) { Engine.Camera.zoomIn(); return; }
    if (inRect(mouseX, mouseY, zoomBtns.minus)) { Engine.Camera.zoomOut(); return; }

    // Boutons de choix de dialogue (arbre de dialogue, Groupe 527)
    if (npcDialogue && npcDialogue._choiceBtns) {
        for (var ci = 0; ci < npcDialogue._choiceBtns.length; ci++) {
            var cb = npcDialogue._choiceBtns[ci];
            if (inRect(mouseX, mouseY, cb)) {
                _handleDialogueChoice(cb.index);
                return;
            }
        }
    }

    // Barre d'outils
    for (var ti = 0; ti < toolbarSlots.length; ti++) {
        var slot = toolbarSlots[ti];
        if (inRect(mouseX, mouseY, slot)) {
            selectedTool = (selectedTool === slot.tool.id) ? null : slot.tool.id;
            return;
        }
    }

    // 2. Monde
    var w = Engine.Camera.screenToWorld(mouseX, mouseY);
    var tile = Engine.Grid.toTile(w.x, w.y);
    if (!tile) return;

    // Vérifier le lit (sommeil)
    if (bedTriggerZone && inRect(w.x, w.y, bedTriggerZone)) {
        _doSleep();
        return;
    }

    // Vérifier interaction PNJ
    if (npcSystem && Engine.WorldZone) {
        var curZoneId = Engine.WorldZone.getCurrent() ? Engine.WorldZone.getCurrent().id : '';
        var npcAtTile = npcSystem.getNPCAt(curZoneId, tile.c, tile.r);
        if (npcAtTile && Engine.ActionZone.contains(player.tile(), tile)) {
            // Fermer tout dialogue existant avant d'en ouvrir un nouveau
            _interactNPC(npcAtTile);
            return;
        }
    }

    if (Engine.ActionZone.contains(player.tile(), tile)) {
        // Action dans la zone — outil prioritaire (carte 525)
        if (selectedTool) {
            _doToolAction(selectedTool, tile);
        } else if (soilSystem && soilSystem.isCultivable(tile.c, tile.r)) {
            _doFarmAction(tile);
        } else {
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'action' };
        }
    } else {
        // Déplacement
        player.moveTo(tile.c, tile.r);
        var center = Engine.Grid.toWorld(tile.c, tile.r);
        moveMarker = { x: center.x, y: center.y, t: millis() };
    }
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        if (dialogueGiftMode) { dialogueGiftMode = null; return false; }
        if (shopMode) { shopMode = null; return false; }
        if (npcDialogue) {
            npcDialogue = null;
            dialogueGiftMode = null;
            return false;
        }
    }
}

/* ─── Action ferme ─── */
function _doFarmAction(tile) {
    var state = soilSystem.getState(tile.c, tile.r);
    if (state === 'empty') {
        if (playerEnergy < C.energy.tillCost) return;
        soilSystem.till(tile.c, tile.r);
        playerEnergy -= C.energy.tillCost;
        actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'till' };
    } else if (state === 'tilled') {
        if (playerEnergy < C.energy.plantCost) return;
        var season = Engine.Clock.getSeason();
        var crops = (culturesData && Array.isArray(culturesData)) ? culturesData : [];
        var toPlant = null;
        for (var ci = 0; ci < crops.length; ci++) {
            if (crops[ci].season === season) { toPlant = crops[ci]; break; }
        }
        if (toPlant) {
            soilSystem.plant(tile.c, tile.r, toPlant.id);
            cropGrowth.plant(tile.c, tile.r, toPlant.id, Engine.Clock.day);
            playerEnergy -= C.energy.plantCost;
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'plant' };
        }
    } else if (state === 'planted') {
        if (!soilSystem.isWatered(tile.c, tile.r)) {
            if (playerEnergy < C.energy.waterCost) return;
            soilSystem.water(tile.c, tile.r);
            playerEnergy -= C.energy.waterCost;
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'water' };
        } else if (cropGrowth && cropGrowth.isMature(tile.c, tile.r)) {
            if (playerEnergy < C.energy.harvestCost) return;
            var cropId = cropGrowth.getCropId(tile.c, tile.r);
            var cropData = cropId ? cropGrowth.getCropData(cropId) : null;
            if (cropData && harvestSystem) {
                harvestSystem.addToInventory(cropId, 1);
                var earned = cropData.sell || 0;
                harvestSystem.addGold(earned);
                playerGoldEarned += earned;
            }
            soilSystem.till(tile.c, tile.r);
            cropGrowth.resetTile(tile.c, tile.r);
            playerEnergy -= C.energy.harvestCost;
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'harvest' };
        }
    }
    if (window.Engine && Engine.Save) Engine.Save.saveLocal();
}

/* ─── Action outil (carte 525) ───
   Utilise l'outil sélectionné sur la tuile cliquée dans la zone d'action.
   Chaque outil vérifie l'état du sol avant d'agir. */
function _doToolAction(toolId, tile) {
    // Trouver les données de l'outil
    var tool = null;
    if (outilsData) {
        for (var i = 0; i < outilsData.length; i++) {
            if (outilsData[i].id === toolId) { tool = outilsData[i]; break; }
        }
    }
    if (!tool) return;

    var action = tool.action;
    var state = soilSystem ? soilSystem.getState(tile.c, tile.r) : 'none';

    switch (action) {
        case 'till': // Pelle — labourer un sol vide
            if (soilSystem && soilSystem.isCultivable(tile.c, tile.r) && state === 'empty') {
                if (playerEnergy < C.energy.tillCost) return;
                soilSystem.till(tile.c, tile.r);
                playerEnergy -= C.energy.tillCost;
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'till' };
            } else {
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
            }
            break;

        case 'plant': // Graines — planter sur sol labouré
            if (soilSystem && soilSystem.isCultivable(tile.c, tile.r) && state === 'tilled') {
                if (playerEnergy < C.energy.plantCost) return;
                var season = Engine.Clock.getSeason();
                var crops = (culturesData && Array.isArray(culturesData)) ? culturesData : [];
                var toPlant = null;
                for (var ci = 0; ci < crops.length; ci++) {
                    if (crops[ci].season === season) { toPlant = crops[ci]; break; }
                }
                if (toPlant) {
                    soilSystem.plant(tile.c, tile.r, toPlant.id);
                    cropGrowth.plant(tile.c, tile.r, toPlant.id, Engine.Clock.day);
                    playerEnergy -= C.energy.plantCost;
                    actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'plant' };
                }
            } else {
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
            }
            break;

        case 'water': // Arrosoir — arroser une culture plantée
            if (soilSystem && soilSystem.isCultivable(tile.c, tile.r) && state === 'planted' && !soilSystem.isWatered(tile.c, tile.r)) {
                if (playerEnergy < C.energy.waterCost) return;
                soilSystem.water(tile.c, tile.r);
                playerEnergy -= C.energy.waterCost;
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'water' };
            } else {
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
            }
            break;

        case 'chop': // Hache — couper (placeholder, flash seulement)
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'chop' };
            break;

        case 'mine': // Pioche — miner (placeholder, flash seulement)
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'mine' };
            break;

        default:
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'action' };
    }

    if (window.Engine && Engine.Save) Engine.Save.saveLocal();
}

/* ─── Interaction PNJ (nouveau système de dialogue, Groupe 527) ─── */
function _interactNPC(npc) {
    if (!dialogueSystem) return;

    // Si dialogue déjà en cours, un nouveau clic redémarre
    if (npcDialogue && npcDialogue.npcId === npc.id && !npcDialogue.ended) {
        // Relancer le dialogue (reset)
        npcDialogue = null;
        dialogueGiftMode = null;
    }

    var result = dialogueSystem.start(npc.id);
    if (result) {
        npcDialogue = {
            npcId: result.npcId,
            npc: result.npc,
            text: result.text,
            choices: result.choices,
            nodeId: result.nodeId,
            ended: result.ended,
            t: millis(),
            _tiersChecked: false
        };
        actionFlash = { c: npc.c, r: npc.r, t: millis(), type: 'gift' };
    }
}

/* Gérer un choix dans l'arbre de dialogue */
function _handleDialogueChoice(choiceIndex) {
    if (!dialogueSystem || !npcDialogue) return;

    // Cas spécial : après un cadeau, "Continuer" relance le dialogue
    if (npcDialogue.nodeId === 'gift_done') {
        var npcId = npcDialogue.npcId;
        var npc = npcDialogue.npc;
        var result = dialogueSystem.start(npcId);
        if (result) {
            npcDialogue = {
                npcId: result.npcId,
                npc: result.npc,
                text: result.text,
                choices: result.choices,
                nodeId: result.nodeId,
                ended: result.ended,
                t: millis(),
                _tiersChecked: false
            };
        }
        return;
    }

    var result = dialogueSystem.choose(choiceIndex);
    if (!result) {
        npcDialogue = null;
        dialogueGiftMode = null;
        return;
    }

    // Vérifier les effets spéciaux
    if (result.effects) {
        if (result.effects.openGift) {
            // Ouvrir la sélection de cadeau
            _openGiftSelection(npcDialogue.npcId);
            return;
        }
        if (result.effects.openShop) {
            // Ouvrir la boutique
            npcDialogue = null;
            dialogueGiftMode = null;
            _openShop(result.effects.sellMode);
            return;
        }
    }

    if (result.ended) {
        // Afficher le texte de fin brièvement puis fermer
        npcDialogue = {
            npcId: npcDialogue.npcId,
            npc: npcDialogue.npc,
            text: result.text || 'Au revoir !',
            choices: [],
            nodeId: 'end',
            ended: true,
            t: millis(),
            _tiersChecked: true
        };
        dialogueGiftMode = null;
        return;
    }

    // Mettre à jour l'état du dialogue
    npcDialogue = {
        npcId: result.npcId,
        npc: result.npc,
        text: result.text,
        choices: result.choices,
        nodeId: result.nodeId,
        ended: result.ended,
        t: millis(),
        _tiersChecked: false,
        _newTiers: result.effects ? null : npcDialogue._newTiers,
        _tierFlashT: result.effects ? null : npcDialogue._tierFlashT
    };
}

/* Ouvrir la sélection de cadeau */
function _openGiftSelection(npcId) {
    if (!harvestSystem) return;
    var inv = harvestSystem.getInventory();
    var invKeys = Object.keys(inv);
    if (invKeys.length === 0) return;

    var items = [];
    for (var i = 0; i < invKeys.length; i++) {
        var cropId = invKeys[i];
        var qty = inv[cropId];
        var cropData = cropGrowth ? cropGrowth.getCropData(cropId) : null;
        if (!cropData && culturesData) {
            cropData = culturesData.find(function(cc) { return cc.id === cropId; });
        }
        var label = cropData ? (cropData.emoji || '') + ' ' + (cropData.label || cropId) : cropId;
        items.push({ id: cropId, label: label, qty: qty });
    }

    dialogueGiftMode = { npcId: npcId, items: items };
}

/* Gérer un clic dans la sélection de cadeau */
function _handleGiftClick(mx, my) {
    var gm = dialogueGiftMode;
    if (!gm) return;

    // Vérifier le bouton Annuler
    if (gm._closeBtn && inRect(mx, my, gm._closeBtn)) {
        dialogueGiftMode = null;
        // Revenir au dialogue précédent
        if (npcDialogue && dialogueSystem) {
            var state = dialogueSystem.getState();
            if (state) {
                npcDialogue.text = state.text;
                npcDialogue.choices = state.choices;
                npcDialogue.nodeId = state.nodeId;
                npcDialogue.ended = state.ended;
                npcDialogue.t = millis();
                npcDialogue._tiersChecked = false;
            }
        }
        return;
    }

    // Vérifier les slots d'item
    if (gm._slots) {
        for (var i = 0; i < gm._slots.length; i++) {
            var slot = gm._slots[i];
            if (inRect(mx, my, slot)) {
                _doGiveGift(gm.npcId, slot.item.id, slot.item);
                return;
            }
        }
    }
}

/* Offrir un cadeau depuis le dialogue */
function _doGiveGift(npcId, itemId, itemInfo) {
    if (!dialogueSystem || !harvestSystem || !npcSystem) return;

    var result = dialogueSystem.giveGift(npcId, itemId);
    if (!result) return;

    // Retirer de l'inventaire
    harvestSystem.removeFromInventory(itemId, 1);

    // Afficher la réaction
    dialogueGiftMode = null;

    var giftLabel = itemInfo ? itemInfo.label : itemId;
    var reactionText = result.text + '\n(❤️ +' + (result.liked ? 2 : 1) + ' — Niveau ' + result.newLevel + ')';

    npcDialogue = {
        npcId: npcId,
        npc: npcSystem.getNPC(npcId),
        text: reactionText,
        choices: [{ label: '↩️ Continuer', action: null }],
        nodeId: 'gift_done',
        ended: false,
        t: millis(),
        _tiersChecked: false
    };

    // Vérifier si un palier a été atteint
    if (dialogueSystem) {
        var unlocked = dialogueSystem.checkTierEffects(npcId);
        if (unlocked.length > 0) {
            npcDialogue._newTiers = unlocked;
            npcDialogue._tierFlashT = millis();
        }
    }
}

/* ─── Ouverture boutique ─── */
function _openShop(sellMode) {
    var npcId = npcDialogue ? npcDialogue.npcId : (shopMode ? shopMode.npcId : null);
    if (!npcId) return;
    var npc = npcSystem.getNPC(npcId);
    if (!npc) return;
    npcDialogue = null;
    dialogueGiftMode = null;
    shopMode = { npcId: npc.id, npcData: npc, sellMode: sellMode };
}

function _handleShopClick(mx, my, dx, dy, dw) {
    var startY = dy + u(13);
    var itemH = u(5);
    var maxVisible = 6;

    var seller = shopMode.npcId;
    var multiplier = npcSystem ? npcSystem.getSellMultiplier(seller) : 1.0;
    var npcData = shopMode.npcData;

    var items = [];
    if (shopMode.sellMode) {
        var inv = harvestSystem ? harvestSystem.getInventory() : {};
        var buyCategories = npcData.buysCategories || null;
        for (var cropId in inv) {
            if (!inv.hasOwnProperty(cropId)) continue;
            var cropData = cropGrowth ? cropGrowth.getCropData(cropId) : null;
            if (!cropData) {
                // fallback: chercher dans culturesData
                var arr = culturesData || [];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id === cropId) { cropData = arr[i]; break; }
                }
            }
            if (!cropData) continue;
            // Filtre par catégorie
            if (buyCategories && cropData.category && buyCategories.indexOf(cropData.category) === -1) continue;
            items.push({ id: cropId, data: cropData, qty: inv[cropId], price: Math.floor((cropData.sell || 0) * multiplier), sell: true });
        }
    } else {
        // Achat : priorité sells > seedPrices > buyGifts (comme dans drawShopInterface)
        if (npcData.sells && npcData.sells.length > 0) {
            for (var si = 0; si < npcData.sells.length; si++) {
                var sellId = npcData.sells[si];
                var sCropData = cropGrowth ? cropGrowth.getCropData(sellId) : null;
                if (!sCropData && culturesData) {
                    sCropData = culturesData.find(function(cc) { return cc.id === sellId; });
                }
                var sPrice = sCropData ? (sCropData.sell || 10) : 10;
                items.push({ id: sellId, data: sCropData || { label: sellId }, qty: 999, price: sPrice, sell: false });
            }
        } else if (npcData.seedPrices) {
            var seedPrices = npcData.seedPrices;
            for (var seedId in seedPrices) {
                if (!seedPrices.hasOwnProperty(seedId)) continue;
                var cropData2 = cropGrowth ? cropGrowth.getCropData(seedId) : null;
                if (!cropData2) continue;
                items.push({ id: seedId, data: cropData2, qty: 999, price: seedPrices[seedId], sell: false });
            }
        }
    }

    for (var i = 0; i < Math.min(items.length, maxVisible); i++) {
        var item = items[i];
        var iy = startY + i * itemH;
        if (my > iy && my < iy + itemH && mx > dx && mx < dx + dw) {
            if (item.sell) {
                // Vendre 1 unité
                var earned = harvestSystem.sell(item.id, 1, item.price);
                if (earned > 0) {
                    playerGoldEarned += earned;
                }
            } else {
                // Acheter 1 graine
                if (harvestSystem && harvestSystem.spendGold(item.price)) {
                    harvestSystem.addToInventory(item.id + '_seed', 1);
                    // Les graines sont un item spécial : on pourrait les stocker,
                    // mais pour simplifier, on les plante directement depuis l'achat ?
                    // Non, on les ajoute juste à l'inventaire.
                }
            }
            return;
        }
    }
}

/* ─── Sommeil avec transition (carte 526) ─── */
let sleepTransition = null; // { phase: 'out'|'wakeup'|'in', t, duration: 600 }

function _doSleep() {
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || zone.id !== 'maison-rdc') return;
    if (sleepBlocked || sleepTransition) return;

    sleepBlocked = true;

    // Démarrer le fondu de sommeil
    sleepTransition = { phase: 'out', t: millis(), duration: 500 };
}

/* Appelé chaque frame depuis draw() pour gérer la transition sommeil */
function _updateSleepTransition() {
    if (!sleepTransition) return;

    var elapsed = millis() - sleepTransition.t;
    var progress = min(elapsed / sleepTransition.duration, 1);

    if (sleepTransition.phase === 'out') {
        if (progress >= 1) {
            // Avancer au lendemain matin (7h)
            var restoreAmount = Engine.Clock.hour < 24 ? C.energy.restoreSleep : C.energy.restoreFaint;
            playerEnergy = Math.min(C.energy.max, playerEnergy + restoreAmount);

            // Calculer le score
            _submitScore();

            // Forcer le passage au jour suivant
            Engine.Clock.hour = 6;
            Engine.Clock.minute = 59;

            // Sauvegarder
            if (window.Engine && Engine.Save) Engine.Save.save();

            sleepTransition.phase = 'wakeup';
            sleepTransition.t = millis();
        }
    } else if (sleepTransition.phase === 'wakeup') {
        if (progress >= 1) {
            sleepTransition.phase = 'in';
            sleepTransition.t = millis();
        }
    } else if (sleepTransition.phase === 'in') {
        if (progress >= 1) {
            sleepTransition = null;
            // Retour à la ferme
            switchToZone('ferme', { c: 14, r: 9 });
        }
    }
}

/* Rendu du fondu de sommeil. Appelé depuis draw() après le monde. */
function _drawSleepFade() {
    if (!sleepTransition) return;

    var elapsed = millis() - sleepTransition.t;
    var progress = min(elapsed / sleepTransition.duration, 1);
    var alpha = 0;

    if (sleepTransition.phase === 'out') {
        alpha = progress * 255;
    } else if (sleepTransition.phase === 'wakeup') {
        alpha = 255;
    } else if (sleepTransition.phase === 'in') {
        alpha = (1 - progress) * 255;
    }

    noStroke();
    fill(0, 0, 0, alpha);
    rect(0, 0, width, height);

    // Texte Zzz pendant le sommeil
    if (sleepTransition.phase === 'out' || sleepTransition.phase === 'wakeup') {
        textAlign(CENTER, CENTER);
        textSize(u(6));
        fill(255, 255, 255, Math.min(255, alpha + 60));
        text('Zzz...', width / 2, height / 2);
        textAlign(CENTER, CENTER);
    }
}

/* ─── Score ─── */
function _submitScore() {
    if (!harvestSystem) return;
    var gold = harvestSystem.getGold();
    var totalGold = playerGoldEarned;
    var days = Engine.Clock.day;

    // Niveaux de compétences cumulés (simplifié : jours joués / 7)
    var skillLevels = Math.floor(days / 7);

    // Paliers de relation PNJ atteints
    var relScore = 0;
    if (npcSystem) {
        for (var npcId in npcSystem._relations) {
            if (!npcSystem._relations.hasOwnProperty(npcId)) continue;
            var lvl = npcSystem._relations[npcId].level;
            relScore += Math.floor(lvl / 5); // paliers de 5
        }
    }

    // Défis surmontés (depuis l'historique)
    var challengesOvercome = disasterSystem ? disasterSystem.getHistory().length : 0;

    var score = Math.floor(
        days * 20
        + totalGold / 10
        + skillLevels * 150
        + relScore * 50
        + challengesOvercome * 100
    );

    if (window.GameSystem && window.GameSystem.Score) {
        window.GameSystem.Score.submit(score);
    }
}

/* ─── Transition entre zones ─── */
function switchToZone(zoneId, entryOverride) {
    if (!Engine.WorldZone || zoneTransition) return;
    zoneTransition = { phase: 'out', zoneId: zoneId, entryOverride: entryOverride, t: millis(), duration: 250 };
}

function showPortalChoice(portal) {
    if (!portal || !portal.choices) return;
    var buttons = [];
    var btnW = u(60);
    var btnH = u(9);
    var startY = height / 2 - (portal.choices.length * (btnH + u(2))) / 2;
    for (var i = 0; i < portal.choices.length; i++) {
        var ch = portal.choices[i];
        buttons.push({
            label: ch.label,
            zone: ch.to.zone,
            entry: ch.to.entry,
            x: width / 2 - btnW / 2,
            y: startY + i * (btnH + u(2)),
            w: btnW,
            h: btnH
        });
    }
    portalChoice = { portal: portal, buttons: buttons };
}

function drawPortalChoice() {
    if (!portalChoice) return;
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    textSize(u(4));
    fill(255);
    text("Où aller ?", width / 2, height / 2 - u(20));

    for (var i = 0; i < portalChoice.buttons.length; i++) {
        var b = portalChoice.buttons[i];
        fill(79, 70, 229, 230);
        rect(b.x, b.y, b.w, b.h, u(1.5));
        fill(255);
        textSize(u(3));
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
}

function drawZoneFade() {
    if (!zoneTransition) return;
    var elapsed = millis() - zoneTransition.t;
    var progress = min(elapsed / zoneTransition.duration, 1);
    var alpha = 0;

    if (zoneTransition.phase === 'out') {
        alpha = progress * 255;
        if (progress >= 1) {
            Engine.WorldZone.switchZone(zoneTransition.zoneId, function (defaultEntry) {
                var entry = zoneTransition.entryOverride || defaultEntry;
                if (entry) {
                    var cc = typeof entry.c !== 'undefined' ? entry.c : entry.col;
                    var rr = typeof entry.r !== 'undefined' ? entry.r : entry.row;
                    if (typeof cc === 'number' && typeof rr === 'number') {
                        player.placeAt(cc, rr);
                        Engine.Camera.snapTo(player.x, player.y);
                    }
                }
                // Réinitialiser bedTriggerZone après transition
                bedTriggerZone = null;
            });
            zoneTransition.phase = 'in';
            zoneTransition.t = millis();
            alpha = 255;
        }
    } else if (zoneTransition.phase === 'in') {
        alpha = (1 - progress) * 255;
        if (progress >= 1) {
            zoneTransition = null;
            alpha = 0;
        }
    }

    noStroke();
    fill(0, 0, 0, alpha);
    rect(0, 0, width, height);
}
