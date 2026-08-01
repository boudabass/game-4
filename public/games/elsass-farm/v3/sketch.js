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

// UI-2: Feedbacks visuels (survol, interdit, curseur d'action)
let hoveredTile = null;       // {c, r} tuile survolée (souris) ou null
let hoverType = 'none';       // 'cultivable' | 'blocked' | 'action' | 'none'
let touchHighlight = null;    // {c, r, t} surbrillance tactile (tap avant action)
let isTouchDevice = false;    // détecté via touchStarted

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
let challengeSystem = null; // Engine.ChallengeSystem (article 528)
let pnjsData = null;       // données pnjs.json
let catastrophesData = null; // données catastrophes.json
let challengesData2 = null;  // données challenges.json (article 432/528)
let sleepSystem = null;    // Engine.SleepSystem — sommeil + énergie + teinte jour/nuit
let playerGoldEarned = 0;  // or total gagné (cumul vie entière, pour le score)
let lastDisaster = null;   // {msg, t} dernière catastrophe (pour notification)
let npcDialogue = null;    // {npcId, lines: [], type: 'talk'|'gift'|'shop', t}
let shopMode = null;       // {npcId, npcData, sellMode: bool} — mode vente/achat
let _rainyToday = false;   // météo pluvieuse du jour (calculée une fois par jour)
let _rainComputedDay = -1; // jour pour lequel _rainyToday a été calculé

// Onboarding : fil d'objectifs de la première boucle (persisté, 99 = terminé)
// 0 labourer → 1 planter → 2 arroser → 3 faire pousser → 4 vendre → 99 fini
let _guideStep = 0;
const GUIDE_MESSAGES = [
    "Tape sur ton champ (carrés pointillés) pour labourer 🟫",
    "Tape sur la terre labourée pour planter 🌱",
    "Tape sur ta pousse pour l'arroser 💧",
    "Arrose 💧 chaque matin, dors 🛏 la nuit — récolte quand c'est mûr ✨",
    "Bravo, première récolte ! 🎉 Vends-la au village (passe la porte 🚪)"
];

// Transition de zone (fondue)
let zoneTransition = null;
let portalChoice = null;
let seedChoice = null;     // {tile, buttons} — sélecteur de graine à planter
let giftChoice = null;     // {npcId, buttons} — sélecteur de cadeau à offrir
let _toast = null;         // {msg, t} — message éphémère (échecs, réveil…)
let _faintedTonight = false; // vrai entre l'évanouissement et le réveil (pour le message)
let _cloudSyncTimerId = null;   // ID du setInterval cloud (nettoyé en transition)

// u(n) = n % du plus petit côté de l'écran — pour TOUT le HUD.
// Mobile scaling : en dessous de 768px, on multiplie progressivement
// pour que les cibles tactiles atteignent ~44px même sur petit écran.
function u(n) {
    var base = min(width, height);
    if (base < 768) {
        var t = 1 - base / 768;          // 0 à 768px, 1 à 0px
        base *= (1 + t * 1.0);            // 1× à 768px, ~2× à 0px
    }
    return (base * n) / 100;
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
    loadCat("ui");

    C._zonesData = loadJSON("data/zones/zones.json");

    // Charger cultures et forcer la conversion en tableau si c'est un objet
    culturesData = loadJSON("data/cultures.json", function(data) {
        culturesData = Array.isArray(data) ? data : Object.values(data);
    });

    outilsData = loadJSON("data/outils.json", function(data) {
        outilsData = Array.isArray(data) ? data : Object.values(data);
    });
    pnjsData = loadJSON("data/pnjs.json", function(data) {
        pnjsData = Array.isArray(data) ? data : Object.values(data);
    });
    catastrophesData = loadJSON("data/catastrophes.json", function(data) {
        catastrophesData = Array.isArray(data) ? data : Object.values(data);
    });
    challengesData2 = loadJSON("data/challenges.json", function(data) {
        challengesData2 = Array.isArray(data) ? data : Object.values(data);
    });
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noSmooth();
    textAlign(CENTER, CENTER);
    if (document.fonts && document.fonts.load) { document.fonts.load("16px 'Pixelify Sans'"); }

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
            // Minuit sans dormir → évanouissement (réveil à 6h avec energy.restoreFaint).
            // Si on dort, ce callback vient de SleepSystem._advanceTime : pas d'évanouissement.
            if (sleepSystem && !sleepSystem.isSleeping()) {
                _faintedTonight = true; // pour le message explicatif au réveil
                sleepSystem.triggerFaint();
            }
            if (cropGrowth) cropGrowth.onNewDay(Engine.Clock.day);
            // Réinitialiser l'arrosage quotidien (les tuiles plantées perdent leur statut watered)
            if (soilSystem) _resetDailyWatering();
            // Vérifier les défis météo article 528 (ChallengeSystem — seul système, remplace DisasterSystem)
            // Note: DisasterSystem est déprécié (B2 fix — plus d'appel dans onNewDay).
            // Les données catastrophes.json sont conservées pour compatibilité des sauvegardes existantes.
            if (challengeSystem) {
                var season = Engine.Clock.getSeason();
                // Nettoyer les effets visuels expirés
                challengeSystem.cleanEffects(Engine.Clock.day);
                var triggered = challengeSystem.check(season, Engine.Clock.day);
                if (triggered) {
                    var result = challengeSystem.apply(triggered, soilSystem, cropGrowth, Engine.Clock.day);
                    // Notification : formater comme lastDisaster pour compatibilité
                    var notif = challengeSystem.getLastNotification();
                    if (notif) {
                        notif.t = millis();
                        lastDisaster = {
                            icon: notif.icon,
                            title: notif.title,
                            msg: notif.icon + ' ' + notif.msg,
                            t: notif.t,
                            detail: notif.detail,
                            isChallenge: true
                        };
                    }
                }
            }
            // Le flag de sommeil est géré par SleepSystem
            // Sauvegarde nuage à chaque nouveau jour
            if (window.Engine && Engine.Save) Engine.Save.save();
        }
    });

    // --- Système de sol ---
    soilSystem = new Engine.SoilSystem();
    // Zone cultivable hardcodée — fallback si zones.json échoue
    var farmZone = C._zonesData && C._zonesData.ferme;
    var ct = farmZone && farmZone.cultivableTiles;
    if (ct) {
        for (var sc = ct.c1; sc <= ct.c2; sc++) {
            for (var sr = ct.r1; sr <= ct.r2; sr++) {
                soilSystem.setCultivable(sc, sr, true);
            }
        }
    }
    // FALLBACK : si rien n'a été chargé, zone cultivable par défaut (cols 4-12, rows 6-10)
    if (Object.keys(soilSystem._cultivable).length === 0) {
        for (var fc = 4; fc <= 12; fc++) {
            for (var fr = 6; fr <= 10; fr++) {
                soilSystem.setCultivable(fc, fr, true);
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

    // --- Système catastrophes (Phase 02) ---
    disasterSystem = new Engine.DisasterSystem();
    if (catastrophesData) disasterSystem.configure({ disasters: catastrophesData });

    // --- Système défis article 528 (challenges.json) ---
    challengeSystem = new Engine.ChallengeSystem();
    if (challengesData2) challengeSystem.configure({ challenges: challengesData2 });

    // --- Système sommeil + cycle jour/nuit (engine = source unique de vérité) ---
    if (window.Engine && Engine.SleepSystem) {
        sleepSystem = new Engine.SleepSystem();
        sleepSystem.configure({
            bed: C.bed,
            energy: C.energy,
            dayTint: C.dayTint
        });
        // Hook au réveil complet : soumettre le score, sauvegarder, retour ferme
        sleepSystem.onWake(function() {
            // L'évanouissement ne doit jamais ressembler à un bug : on l'explique.
            if (_faintedTonight) {
                _faintedTonight = false;
                showToast("😴 Tu t'es endormi de fatigue ! Ce soir, va dormir dans ton lit 🛏");
            }
            _submitScore();
            if (window.Engine && Engine.Save) Engine.Save.save();
            // Se réveiller près du lit (zone +1 tuile en dessous, centré horizontalement)
            var wakeC = Math.floor(C.bed.c + C.bed.w / 2);
            var wakeR = C.bed.r + C.bed.h;
            switchToZone(C.bed.zone, { c: wakeC, r: wakeR });
        });
    }

    // Le SleepSystem.configure() initialise l'énergie à C.energy.max
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
            version: 3,
            migrations: {
                2: function (d) {
                    d.rainyToday = false;
                    d.rainComputedDay = -1;
                    return d;
                },
                3: function (d) {
                    // Joueurs existants : le guide de démarrage ne s'affiche pas
                    d.guideStep = 99;
                    return d;
                }
            },
            gather: function () {
                var t = player.tile() || { c: C.player.c, r: C.player.r };
                var data = {
                    day: Engine.Clock.day,
                    hour: Engine.Clock.hour,
                    minute: Engine.Clock.minute,
                    c: t.c, r: t.r,
                    goldEarned: playerGoldEarned
                };
                if (Engine.WorldZone && Engine.WorldZone.getCurrent()) {
                    data.zoneId = Engine.WorldZone.getCurrent().id;
                }
                if (soilSystem) data.soil = soilSystem.gather();
                if (cropGrowth) data.crops = cropGrowth.gather();
                if (harvestSystem) data.harvest = harvestSystem.gather();
                if (npcSystem) data.npcs = npcSystem.gather();
                if (disasterSystem) data.disasters = disasterSystem.gather();
                if (challengeSystem) data.challenges = challengeSystem.gather();
                if (sleepSystem) data.sleep = sleepSystem.gather();
                // B5 fix — persistance météo
                data.rainyToday = _rainyToday;
                data.rainComputedDay = _rainComputedDay;
                data.guideStep = _guideStep;
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
                if (typeof data.goldEarned === "number") playerGoldEarned = data.goldEarned;
                // Restaurer la météo persistée (B5 fix — version 2)
                if (typeof data.rainyToday === "boolean") {
                    _rainyToday = data.rainyToday;
                    _rainComputedDay = Engine.Clock.day;
                }
                if (soilSystem && data.soil) soilSystem.apply(data.soil);
                if (cropGrowth && data.crops) cropGrowth.apply(data.crops);
                if (harvestSystem && data.harvest) harvestSystem.apply(data.harvest);
                if (npcSystem && data.npcs) npcSystem.apply(data.npcs);
                if (disasterSystem && data.disasters) disasterSystem.apply(data.disasters);
                if (challengeSystem && data.challenges) challengeSystem.apply(data.challenges);
                if (sleepSystem && data.sleep) sleepSystem.apply(data.sleep);
                if (typeof data.guideStep === "number") _guideStep = data.guideStep;
            }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
        var hasSave = await Engine.Save.load();
        if (!hasSave) _giveStarterKit();
    }

    if (Engine.WorldZone && !Engine.WorldZone.getCurrent()) {
        Engine.WorldZone.setCurrent('ferme');
    }

    if (window.Engine && Engine.Loader) Engine.Loader.finish();

    // --- Synchro cloud toutes les 5 minutes ---
    _cloudSyncTimerId = setInterval(async function () {
        if (window.Engine && Engine.Save) {
            await Engine.Save.saveCloud();
        }
    }, 5 * 60 * 1000);

    // --- Sauvegarde locale à la fermeture de la page ---
    window.addEventListener('beforeunload', function () {
        if (window.Engine && Engine.Save) {
            Engine.Save.saveLocal();
        }
    });
}

/* ─── Toast : message éphémère qui explique un refus ou un événement ───
   Un enfant ne doit jamais croire que « le jeu est cassé » : chaque échec parle. */
function showToast(msg) {
    _toast = { msg: msg, t: millis() };
}

function drawToast() {
    if (!_toast) return;
    var elapsed = millis() - _toast.t;
    if (elapsed > 3200) { _toast = null; return; }
    var a = elapsed < 250 ? (elapsed / 250) * 235
          : (elapsed > 2600 ? (3200 - elapsed) / 600 * 235 : 235);

    textFont('Pixelify Sans');
    var ts = u(2.8);
    var padX = u(3), padY = u(2);
    textSize(ts);
    var tw = textWidth(_toast.msg);
    var maxTextW = width - u(6) - padX * 2;
    if (tw > maxTextW) { ts = ts * maxTextW / tw; textSize(ts); tw = textWidth(_toast.msg); }
    var bw = tw + padX * 2;
    var bh = ts + padY * 2;
    var bx = width / 2 - bw / 2;
    var by = height * 0.18;

    noStroke();
    fill(245, 231, 200, a);
    rect(bx, by, bw, bh, u(1.2));
    noFill();
    stroke(139, 94, 60, a);
    strokeWeight(u(0.35));
    rect(bx, by, bw, bh, u(1.2));
    noStroke();
    fill(61, 43, 31, a + 20);
    textAlign(CENTER, CENTER);
    text(_toast.msg, width / 2, by + bh / 2);
    textFont('sans-serif');
}

/* Consomme l'énergie ; en cas de refus, le dit au joueur au lieu d'échouer en silence. */
function _consumeEnergy(cost, tile) {
    if (!sleepSystem) return true;
    if (sleepSystem.consume(cost)) return true;
    showToast("😴 Trop fatigué ! Va dormir dans ton lit 🛏");
    if (tile) actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
    return false;
}

/* ─── Kit de départ (nouvelle partie uniquement) ───
   Sans lui, un nouveau joueur démarre avec 0 pièce et 0 graine : la boucle
   planter → récolter → vendre est inaccessible (softlock). */
function _giveStarterKit() {
    if (!harvestSystem) return;
    var season = Engine.Clock.getSeason();
    var crops = (culturesData && Array.isArray(culturesData)) ? culturesData : [];
    // La culture la plus rapide de la saison → première récolte au plus tôt
    var best = null;
    for (var i = 0; i < crops.length; i++) {
        if (crops[i].season !== season) continue;
        if (!best || (crops[i].growthDays || 99) < (best.growthDays || 99)) best = crops[i];
    }
    // Repli (ex. démarrage en hiver, sans culture) : la plus rapide toutes saisons
    if (!best) {
        for (var j = 0; j < crops.length; j++) {
            if (!best || (crops[j].growthDays || 99) < (best.growthDays || 99)) best = crops[j];
        }
    }
    if (best) harvestSystem.addToInventory(best.id + '_seed', 5);
    harvestSystem.addGold(50);
    if (window.Engine && Engine.Save) Engine.Save.saveLocal();
}

/* ─── Bandeau d'objectif (onboarding première boucle) ─── */
function _guideAdvance(fromStep) {
    if (_guideStep === fromStep) _guideStep++;
}

function drawGuideBanner() {
    if (_guideStep >= GUIDE_MESSAGES.length) return;
    // Masqué quand un panneau est ouvert (une seule chose à la fois)
    if (shopMode || npcDialogue || portalChoice || seedChoice || zoneTransition) return;
    if (sleepSystem && sleepSystem.isSleeping()) return;

    var msg = GUIDE_MESSAGES[_guideStep];
    textFont('Pixelify Sans');
    var ts = u(2.6);
    var padX = u(3), padY = u(1.8);
    textSize(ts);
    var tw = textWidth(msg);
    // Écran étroit : réduire la taille plutôt que déborder
    var maxTextW = width - u(4) - padX * 2;
    if (tw > maxTextW) {
        ts = ts * maxTextW / tw;
        textSize(ts);
        tw = textWidth(msg);
    }
    var bw = tw + padX * 2;
    var bh = ts + padY * 2;
    var bx = width / 2 - bw / 2;
    // Juste au-dessus de la barre d'outils (slotSize u(11) + marge u(3))
    var by = height - u(11) - u(3) - bh - u(2);

    noStroke();
    fill(245, 231, 200, 235);
    rect(bx, by, bw, bh, u(1.2));
    noFill();
    stroke(139, 94, 60, 235);
    strokeWeight(u(0.35));
    rect(bx, by, bw, bh, u(1.2));
    noStroke();

    fill(61, 43, 31);
    textAlign(CENTER, CENTER);
    text(msg, width / 2, by + bh / 2);
    textFont('sans-serif');
}

/* ─── Réinitialisation quotidienne de l'arrosage (via l'API SoilSystem) ─── */
function _resetDailyWatering() {
    var season = Engine.Clock.getSeason();
    soilSystem.resetDailyWatering(_isRainyDay(season));
}

/* Tire au sort la pluie du jour (20-40% selon la saison), une seule fois par jour
   (mémoïsé dans _rainyToday, persisté en sauvegarde — B5). */
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

function draw() {
    background(C.colors.bg);

    // --- Simulation ---
    if (!zoneTransition && (!sleepSystem || !sleepSystem.isSleeping())) {
        Engine.Clock.update(deltaTime);
        player.update(deltaTime);
    }
    // Mise à jour de la transition sommeil — gérée par SleepSystem (engine)
    if (sleepSystem && sleepSystem.isSleeping()) sleepSystem.update(deltaTime);
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

    // --- Filtre jour/nuit (après le monde, avant le HUD) — engine source unique ---
    if (sleepSystem) sleepSystem.renderOverlay();

    // --- HUD ---
    drawHud();

    // --- Bandeau d'objectif (première boucle) ---
    drawGuideBanner();

    // --- Fondu de transition zone ---
    drawZoneFade();

    // --- Fondu de sommeil (par-dessus tout) — engine ---
    if (sleepSystem) sleepSystem.renderSleepFade();

    // --- Notification catastrophe ---
    drawDisasterNotice();

    // --- Dialogue PNJ ---
    drawNPCDialogue();

    // --- Interface boutique ---
    drawShopInterface();

    // --- Toast (par-dessus tout : il explique aussi les refus en boutique) ---
    drawToast();
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

/* ─── Helpers de rendu UI — assets pixel art ─── */

/* Calcule un multiple entier >= baseSize qui tient dans available */
function _fitMult(available, baseSize) {
    return Math.max(1, Math.floor(available / baseSize));
}

/* Dessine le sélecteur d'outil avec bordure asset (shmup_hud_cadre) */
function _drawToolSelector(x, y, w, h) {
    var frame = img("ui", "shmup_hud_cadre");
    if (frame) {
        image(frame, x - 2, y - 2, w + 4, h + 4);
    } else {
        // Fallback dessiné
        noFill();
        stroke(255, 215, 0, 255);
        strokeWeight(u(0.5));
        rect(x, y, w, h, u(1.5));
        noStroke();
    }
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
        // Fond de terre cultivable — bien distinct du sol standard
        fill(120, 85, 45, 200);
        rect(x + 1, y + 1, ts - 2, ts - 2, 4);
        // Bordure claire pour bien délimiter
        stroke(180, 140, 80, 160);
        strokeWeight(1.5);
        rect(x + 1, y + 1, ts - 2, ts - 2, 4);
        noStroke();

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
            // Terre cultivable vide — très visible
            noStroke();
            fill(160, 120, 60, 120);
            rect(x + 4, y + 4, ts - 8, ts - 8, 3);
            // Motif de points pour indiquer "prêt à être labouré"
            fill(200, 170, 100, 180);
            var ds2 = ts * 0.12;
            circle(cx - ts*0.2, cy - ts*0.2, ds2);
            circle(cx + ts*0.2, cy - ts*0.2, ds2);
            circle(cx - ts*0.2, cy + ts*0.2, ds2);
            circle(cx + ts*0.2, cy + ts*0.2, ds2);
            circle(cx, cy, ds2 * 1.3);
        }
        textAlign(CENTER, CENTER);

        // Effet visuel de gel (ChallengeSystem article 528)
        if (challengeSystem && zone && zone.id === 'ferme') {
            var fx = challengeSystem.getEffectAt(c, r);
            if (fx && fx.visual === 'frost') {
                // Overlay bleu givré
                noStroke();
                fill(150, 200, 255, 130);
                rect(x + 2, y + 2, ts - 4, ts - 4, 4);
                // Cristaux de glace (❄️ pulsant)
                var t = millis();
                var pulse = 0.6 + 0.4 * sin(t * 0.004 + c + r);
                textSize(ts * 0.35);
                fill(200, 230, 255, 180 * pulse);
                textAlign(CENTER, CENTER);
                text('❄️', cx, cy);
            }
        }
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

/* ─── Rendu du monde ─── */
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

    // Grille de debug (outil de développement — C.debug dans config.js)
    if (C.debug) Engine.Grid.drawDebug({ line: C.colors.gridLine });

    // Décor selon la zone
    if (zoneId === 'village') {
        drawVillageBuildings();
    } else {
        drawDecor();
    }

    // Zone cultivable — contour visible de loin
    if (zoneId === 'ferme' && soilSystem) {
        var cKeys = Object.keys(soilSystem._cultivable);
        if (cKeys.length > 0) {
            var minC = 999, maxC = -1, minR = 999, maxR = -1;
            for (var ki = 0; ki < cKeys.length; ki++) {
                var parts = cKeys[ki].split(',');
                var cc = parseInt(parts[0]), rr = parseInt(parts[1]);
                if (cc < minC) minC = cc; if (cc > maxC) maxC = cc;
                if (rr < minR) minR = rr; if (rr > maxR) maxR = rr;
            }
            var ts = Engine.Grid.tileSize;
            var bx = minC * ts, by = minR * ts;
            var bw = (maxC - minC + 1) * ts, bh = (maxR - minR + 1) * ts;
            // Fond semi-transparent
            noStroke();
            fill(255, 215, 0, 30);
            rect(bx, by, bw, bh);
            // Contour pointillé jaune
            drawingContext.setLineDash([8, 6]);
            stroke(255, 215, 0, 180);
            strokeWeight(3);
            noFill();
            rect(bx + 2, by + 2, bw - 4, bh - 4);
            drawingContext.setLineDash([]);
            noStroke();
        }
    }

    // Cultures (ferme uniquement)
    drawCrops();

    // Portails
    drawPortals();

    // UI-2: Feedbacks visuels (survol, interdit, curseur d'action)
    // Dessiné après le décor/cultures mais avant le player et les overlays HUD
    _drawHoverFeedback();

    // PNJ
    drawNPCs();

    // Lit (maison) — rendu SleepSystem engine
    if (sleepSystem) sleepSystem.render(zoneId);

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

    // Zone d'action + chemin (outils de développement — C.debug dans config.js)
    if (C.debug) {
        Engine.ActionZone.drawDebug(Engine.Grid, player.tile(), C.colors.zone);
        player.drawDebugPath(C.colors.path);
    }

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
    // ── Compteur d'or + zone (haut droite, design John 18/07) ──
    var gold = harvestSystem ? harvestSystem.getGold() : 0;
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    var zoneLabel = zone ? (zone.label || zone.id) : 'Ferme'; // zéro emoji
    var goldStr = Math.floor(gold).toString();

    // Pièce : dimension fixe (plus de _fitMult — une icône seule se réduit proprement)
    var coinSize = u(4);
    var coin = img("objet", "town_piece_or");
    var hasCoin = !!coin;

    // Panneau : ancré à droite, hauteur fixe
    var pad = u(1);
    var gap = u(1);
    var panelY = u(2);
    var panelH = u(6);
    var maxPanelW = 0.30 * width;

    // Tailles de police de départ
    textFont('Pixelify Sans');
    var zoneSize = u(2.5);
    var goldSize = u(4);

    // Mesures initiales
    textSize(zoneSize);
    var zoneW = textWidth(zoneLabel);
    textSize(goldSize);
    var montantW = textWidth(goldStr);
    var panelW = pad + (hasCoin ? coinSize + gap : 0) + montantW + gap + zoneW + pad;

    // Mobile : réduire si > 30 % de la largeur (zone d'abord, montant ensuite)
    if (panelW > maxPanelW) {
        while (zoneSize > 6 && panelW > maxPanelW) {
            zoneSize -= 0.5;
            textSize(zoneSize);
            zoneW = textWidth(zoneLabel);
            panelW = pad + (hasCoin ? coinSize + gap : 0) + montantW + gap + zoneW + pad;
        }
        while (goldSize > 6 && panelW > maxPanelW) {
            goldSize -= 0.5;
            textSize(goldSize);
            montantW = textWidth(goldStr);
            panelW = pad + (hasCoin ? coinSize + gap : 0) + montantW + gap + zoneW + pad;
        }
    }

    // Dernière mesure avec les tailles finales
    textSize(zoneSize);
    zoneW = textWidth(zoneLabel);
    textSize(goldSize);
    montantW = textWidth(goldStr);
    panelW = pad + (hasCoin ? coinSize + gap : 0) + montantW + gap + zoneW + pad;
    var panelX = width - u(2) - panelW;

    // ORDRE DE DESSIN : 1. fond, 2. pièce, 3. montant, 4. zone — de gauche à droite

    // 1. Fond panneau
    fill(C.colors.hudPanel);
    noStroke();
    rect(panelX, panelY, panelW, panelH, u(1.5));

    // 2. Pièce or (gauche)
    var cx = panelX + pad;
    if (coin) {
        var coinY = panelY + (panelH - coinSize) / 2;
        image(coin, cx, coinY, coinSize, coinSize);
        cx += coinSize + gap;
    }

    // 3. Montant or (Pixelify Sans, taille goldSize)
    fill(C.colors.hudText);
    textAlign(LEFT, CENTER);
    textFont('Pixelify Sans');
    textSize(goldSize);
    text(goldStr, cx, panelY + panelH / 2);
    cx += montantW + gap;

    // 4. Nom de zone (Pixelify Sans, taille zoneSize)
    textSize(zoneSize);
    text(zoneLabel, cx, panelY + panelH / 2);

    textFont('sans-serif');

    // ── Panneau Jour + Heure (haut centre, design John 18/07) ──
    // RÈGLE 30% : largeur ≤ 0.30 × width. Texte Pixelify Sans, plus de sprites.
    var season = Engine.Clock.getSeason();
    var timeStr = Engine.Clock.timeString();
    var dayStr = Engine.Clock.day.toString();

    var maxPanelW = 0.30 * width;
    var pad = u(1.5);
    var gap = u(2);
    var jDayGap = u(0.5);
    var panelY = u(2);
    var panelH = u(6);

    // Trouver la taille de police max qui tient dans 30% de la largeur
    textFont('Pixelify Sans');
    var trySize = u(5);
    var jW = 0, dW = 0, tW = 0, pw = 0;
    var leftBlockW = 0, innerW = 0;
    while (trySize >= 6) {
        textSize(trySize);
        jW = textWidth('J');
        dW = textWidth(dayStr);
        tW = textWidth(timeStr);
        leftBlockW = jW + jDayGap + dW;
        innerW = leftBlockW + gap + tW;
        pw = innerW + pad * 2;
        if (pw <= maxPanelW) break;
        trySize -= 0.5;
    }
    // trySize now fits (or is 6 minimum), last iteration's measurements are valid

    // Fond global
    fill(C.colors.hudPanel);
    noStroke();
    rect(width / 2 - pw / 2, panelY, pw, panelH, u(1.5));

    // Sous-encadré GAUCHE (Jour : J + numéro du jour)
    fill(20, 40, 70, 180);
    rect(width / 2 - pw / 2 + pad - u(0.3), panelY + u(0.4), leftBlockW + u(0.6), panelH - u(0.8), u(0.8));

    // Contenu gauche : lettre J + numéro en texte Pixelify Sans
    fill(C.colors.hudText);
    textAlign(LEFT, CENTER);
    textSize(trySize);
    var cx = width / 2 - pw / 2 + pad;
    text('J', cx, panelY + panelH / 2);
    cx += jW + jDayGap;
    text(dayStr, cx, panelY + panelH / 2);

    // Sous-encadré DROITE (Heure)
    fill(15, 30, 55, 180);
    rect(width / 2 - pw / 2 + pad + leftBlockW + gap - u(0.3), panelY + u(0.4), tW + u(0.6), panelH - u(0.8), u(0.8));

    // Contenu droite : heure en texte Pixelify Sans
    fill(C.colors.hudText);
    textAlign(CENTER, CENTER);
    textSize(trySize);
    text(timeStr, width / 2 - pw / 2 + pad + leftBlockW + gap + tW / 2, panelY + panelH / 2);
    textFont('sans-serif');
    textAlign(CENTER, CENTER);

    // ── Énergie (haut gauche) — engine SleepSystem gère la jauge ---
    var energyVal = sleepSystem ? sleepSystem.getEnergy() : 100;
    var energyPct = Math.max(0, energyVal / C.energy.max);
    var energyColor = energyPct > 0.5 ? [100, 220, 80] : (energyPct > 0.25 ? [255, 200, 40] : [255, 80, 80]);
    var barW = u(18);
    var barH = u(2.5);
    var barX = u(2);
    var barY = u(2);

    fill(C.colors.hudPanel);
    rect(barX - u(0.5), barY - u(0.5), barW + u(1), barH + u(1.5) + u(2) + u(1), u(1));
    // Fond barre
    fill(40, 40, 40, 200);
    rect(barX, barY, barW, barH, u(0.5));
    // Barre remplie
    fill(energyColor[0], energyColor[1], energyColor[2], 220);
    rect(barX, barY, barW * energyPct, barH, u(0.5));
    // Icône énergie : cœur pixel-art (le bidon de carburant n'a rien à faire dans une ferme)
    var fuelSize = u(3);
    var fm = _fitMult(fuelSize, 16);
    fuelSize = 16 * fm;
    var fuel = img("ui", "battle_hud_coeur");
    if (fuel) {
        image(fuel, barX + u(0.5), barY + barH + u(0.5), fuelSize, fuelSize);
    }
    // Texte énergie à côté de l'icône
    fill(255);
    textSize(u(3));
    textAlign(LEFT, CENTER);
    text(energyVal, barX + fuelSize + u(1.5), barY + barH + fuelSize / 2 + u(0.5));
    textAlign(CENTER, CENTER);

    // ── Météo du jour ──
    var weatherLabel = _isRainyDay(season) ? '\uD83C\uDF27\uFE0F Pluie' : '\u2600\uFE0F Beau';
    textSize(u(3));
    fill(C.colors.hudPanel);
    var ww = textWidth(weatherLabel) + u(3);
    rect(barX, barY + barH + u(1.5) + fuelSize + u(1), ww, u(4.5), u(1));
    fill(C.colors.hudText);
    text(weatherLabel, barX + ww / 2, barY + barH + u(1.5) + fuelSize + u(3.2));

    // ── Boutons zoom +/− (bas droite) ──
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
    text("\u2212", x + size / 2, yMinus + size / 2);

    // ── Barre d'outils ──
    drawToolbar();

    // ── Popup de portail ──
    drawPortalChoice();
    drawSeedChoice();
    drawGiftChoice();
}

function drawToolbar() {
    if (!outilsData || !outilsData.length) return;

    var slotSize = u(11);
    var gap = u(2);
    var totalW = outilsData.length * slotSize + (outilsData.length - 1) * gap;
    var startX = width / 2 - totalW / 2;
    var y = height - slotSize - u(3);

    // Taille de l'icône outil : multiple entier de 16 (taille native du pixel art)
    var iconSize = 16 * _fitMult(slotSize * 0.65, 16);

    toolbarSlots = [];

    for (var i = 0; i < outilsData.length; i++) {
        var tool = outilsData[i];
        var x = startX + i * (slotSize + gap);
        var isSelected = selectedTool === tool.id;

        // Fond du slot
        if (isSelected) {
            fill(255, 215, 0, 220);
        } else {
            fill(C.colors.hudPanel);
        }
        stroke(C.colors.hudText);
        strokeWeight(u(0.3));
        rect(x, y, slotSize, slotSize, u(1.5));
        noStroke();

        // Icône asset
        var toolImg = _getToolAsset(tool.id);
        if (toolImg) {
            var ix = x + (slotSize - iconSize) / 2;
            var iy = y + (slotSize - iconSize) / 2;
            image(toolImg, ix, iy, iconSize, iconSize);
        } else {
            // Fallback emoji
            textSize(slotSize * 0.55);
            fill(isSelected ? 0 : C.colors.hudText);
            textAlign(CENTER, CENTER);
            text(tool.emoji, x + slotSize / 2, y + slotSize / 2);
        }

        // Cadre de sélection
        if (isSelected) {
            _drawToolSelector(x - u(0.3), y - u(0.3), slotSize + u(0.6), slotSize + u(0.6));
        }

        toolbarSlots.push({ x: x, y: y, w: slotSize, h: slotSize, tool: tool });
    }

    textAlign(CENTER, CENTER);
}

/* Retourne l'image asset pour un outil, ou null */
function _getToolAsset(toolId) {
    switch (toolId) {
        case 'pelle': return img("objet", "farm_pelle");
        case 'arrosoir': return img("objet", "farm_seau_eau");
        case 'graines': return _getSeasonSeedSac();
        case 'hache': return img("objet", "farm_hache");
        case 'pioche': return img("objet", "town_pioche");
        default: return null;
    }
}

/* Retourne le sac de graines de la culture de saison courante */
function _getSeasonSeedSac() {
    if (!culturesData || !culturesData.length) return null;
    var season = Engine.Clock.getSeason();
    // Trouver la première culture de la saison courante
    for (var i = 0; i < culturesData.length; i++) {
        if (culturesData[i].season === season) {
            var cid = culturesData[i].id;
            // Convertir nom culture en nom de fichier sac
            var sacKey = _cropIdToSacKey(cid);
            if (sacKey) return img("objet", sacKey);
            break;
        }
    }
    // Fallback : premier sac disponible
    var sacCandidates = [
        "farm_carotte_sac", "farm_ble_sac", "farm_tomate_sac",
        "farm_mais_sac", "farm_chou_sac", "farm_aubergine_sac"
    ];
    for (var i = 0; i < sacCandidates.length; i++) {
        var s = img("objet", sacCandidates[i]);
        if (s) return s;
    }
    return null;
}

/* Retourne l'asset icône pour une culture (farm_<culture>_icone) */
function _cropIdToIconKey(cropId) {
    var map = {
        "carotte": "farm_carotte_icone",
        "ble": "farm_ble_icone",
        "tomate": "farm_tomate_icone",
        "mais": "farm_mais_icone",
        "choux-choucroute": "farm_chou_icone",
        "aubergine": "farm_aubergine_icone",
        "asperge": "farm_carotte_icone",
        "pomme-de-terre": "farm_carotte_icone",
        "houblon": "farm_ble_icone",
        "orge": "farm_ble_icone",
        "tournesol": "farm_mais_icone",
        "framboise": "farm_tomate_icone",
        "potiron": "farm_chou_icone",
        "raisin": "farm_aubergine_icone",
        "oignon": "farm_carotte_icone",
        "navet": "farm_chou_icone",
        "salade": "farm_chou_icone",
        "poireau": "farm_carotte_icone",
        "fraise": "farm_tomate_icone",
        "mirabelle": "farm_mais_icone",
        "courgette": "farm_tomate_icone",
        "muguet": "farm_carotte_icone"
    };
    return map[cropId] || null;
}

/* Mappe un cropId vers le nom de fichier du sac */
function _cropIdToSacKey(cropId) {
    // Les cultures disponibles : carotte, ble, tomate, mais, chou, aubergine
    // Leurs sacs : farm_carotte_sac, farm_ble_sac, farm_tomate_sac, farm_mais_sac, farm_chou_sac, farm_aubergine_sac
    var map = {
        "carotte": "farm_carotte_sac",
        "ble": "farm_ble_sac",
        "tomate": "farm_tomate_sac",
        "mais": "farm_mais_sac",
        "choux-choucroute": "farm_chou_sac",
        "aubergine": "farm_aubergine_sac",
        "asperge": "farm_carotte_sac",       // fallback carotte
        "pomme-de-terre": "farm_carotte_sac", // fallback carotte
        "houblon": "farm_ble_sac",            // fallback blé
        "orge": "farm_ble_sac",               // fallback blé
        "tournesol": "farm_mais_sac",         // fallback maïs
        "framboise": "farm_tomate_sac",       // fallback tomate
        "potiron": "farm_chou_sac",           // fallback chou
        "raisin": "farm_aubergine_sac",       // fallback aubergine
        "oignon": "farm_carotte_sac",         // fallback carotte
        "navet": "farm_chou_sac",             // fallback chou
        "salade": "farm_chou_sac",            // fallback chou
        "poireau": "farm_carotte_sac",        // fallback carotte
        "fraise": "farm_tomate_sac",          // fallback tomate
        "mirabelle": "farm_mais_sac",         // fallback maïs
        "courgette": "farm_tomate_sac",       // fallback tomate
        "muguet": "farm_carotte_sac"          // fallback carotte
    };
    return map[cropId] || null;
}

/* ─── Notification de catastrophe / défi ─── */
function drawDisasterNotice() {
    if (!lastDisaster) return;
    var elapsed = millis() - lastDisaster.t;
    if (elapsed > 6000) { lastDisaster = null; return; }

    var alpha = elapsed < 500 ? (elapsed / 500) * 220 : (elapsed > 5000 ? (6000 - elapsed) / 1000 * 220 : 220);

    // Fond bandeau — couleur selon type (défi = bleu/violet, catastrophe = rouge)
    var isChallenge = lastDisaster.isChallenge;
    var bgR = isChallenge ? 60 : 180;
    var bgG = isChallenge ? 80 : 40;
    var bgB = isChallenge ? 160 : 40;

    var h = u(9);
    if (lastDisaster.title) h = u(11); // plus haut pour titre + msg
    var y = u(11);
    noStroke();
    fill(bgR, bgG, bgB, alpha);
    rect(u(5), y, width - u(10), h, u(1.5));

    // Titre (défis uniquement)
    if (lastDisaster.title && lastDisaster.icon) {
        textSize(u(3.5));
        fill(255, 255, 255, alpha);
        textAlign(CENTER, CENTER);
        text(lastDisaster.icon + ' ' + lastDisaster.title, width / 2, y + u(4));
    }

    // Message
    textSize(u(2.8));
    fill(255, 255, 255, alpha);
    textAlign(CENTER, CENTER);
    var txt = lastDisaster.msg || '';
    if (lastDisaster.detail && lastDisaster.detail.cropsAffected > 0) {
        txt += " (" + lastDisaster.detail.cropsAffected + " culture(s) touchée(s))";
    } else if (lastDisaster.detail && lastDisaster.detail.cropsDestroyed > 0) {
        txt += " (" + lastDisaster.detail.cropsDestroyed + " culture(s) perdue(s))";
    }
    var msgY = lastDisaster.title ? y + u(7.5) : y + h / 2;
    text(txt, width / 2, msgY);
    textAlign(CENTER, CENTER);
}

/* ─── UI-2: Feedbacks visuels (survol, interdit, curseur d'action) ───
 *   Dessine les overlays hover dans le monde (appelé par drawWorld).
 *   Assets 16×16 du catalogue, agrandissement multiple entier.
 */
function _drawHoverFeedback() {
    var ts = Engine.Grid.tileSize;

    // --- Surbrillance tactile (touch) ---
    if (touchHighlight && millis() - touchHighlight.t < 400) {
        _drawFeedbackOverlay(touchHighlight.c, touchHighlight.r, ts, 'cultivable');
        if (millis() - touchHighlight.t > 380) touchHighlight = null;
        return; // Ne pas mélanger survol et tactile
    }
    if (!hoveredTile || hoverType === 'none') return;

    var c = hoveredTile.c;
    var r = hoveredTile.r;

    switch (hoverType) {
        case 'cultivable':
            _drawFeedbackOverlay(c, r, ts, 'cultivable');
            break;
        case 'action_cultivable':
            _drawFeedbackOverlay(c, r, ts, 'cultivable');
            _drawFeedbackOverlay(c, r, ts, 'action');
            break;
        case 'blocked':
            _drawFeedbackOverlay(c, r, ts, 'blocked');
            break;
        case 'action':
            // Outil sélectionné : curseur main sur la tuile
            _drawFeedbackOverlay(c, r, ts, 'action');
            break;
    }
}

/* Dessine un overlay sur une tuile selon le type de feedback */
function _drawFeedbackOverlay(c, r, ts, type) {
    if (type === 'cultivable') {
        var cadre = img("ui", "battle_cadre_selection");
        if (cadre) {
            var m = _fitMult(ts, 16);
            var sz = 16 * m;
            var ox = (ts - sz) / 2;
            var oy = (ts - sz) / 2;
            image(cadre, c * ts + ox, r * ts + oy, sz, sz);
        }
    } else if (type === 'blocked') {
        var hach = img("ui", "battle_hachures");
        if (hach) {
            var m = _fitMult(ts, 16);
            var sz = 16 * m;
            image(hach, c * ts, r * ts, sz, sz);
        }
    } else if (type === 'action') {
        var hand = img("ui", "battle_hud_curseur_main");
        if (hand) {
            var m = _fitMult(Math.floor(ts * 0.5), 16);
            var sz = 16 * m;
            var ox = ts - sz - (ts * 0.05);
            var oy = ts * 0.05;
            image(hand, c * ts + ox, r * ts + oy, sz, sz);
        }
    }
}

/* ─── Dialogue PNJ ─── */
function drawNPCDialogue() {
    if (!npcDialogue) return;

    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || zone.id !== 'village') { npcDialogue = null; return; }

    var elapsed = millis() - npcDialogue.t;
    var alpha = elapsed < 300 ? (elapsed / 300) * 230 : 230;
    var npc = npcSystem.getNPC(npcDialogue.npcId);

    // Layout : blocs empilés (nom → texte → jauge → boutons)
    var pad = u(4);
    var gap = u(3);
    var nameH = u(8);
    var dw = width * 0.7;

    // Hauteur du texte : multi-lignes (les dialogues font ~100 caractères,
    // une seule ligne débordait du panneau sur mobile)
    var msgSize = u(3.5);
    var msgBoxW = dw - pad * 2;
    textFont('Pixelify Sans');
    textSize(msgSize);
    var msgLines = Math.max(1, Math.ceil(textWidth(npcDialogue.text || '') / msgBoxW));
    var textH = Math.max(u(9), msgLines * msgSize * 1.4 + u(2));

    var gaugeH = npc ? u(6) : 0;
    var btnH = npc ? u(9) : 0;

    var totalH = pad + nameH + gap + textH + gap + gaugeH + gap + btnH + pad;
    var dx = width / 2 - dw / 2;
    var dy = height - totalH - u(15);

    // ── Panneau : fond crème #F5E7C8 + bordure bois #8B5E3C + coins arrondis ──
    noStroke();
    fill(245, 231, 200, alpha * 0.95);  // #F5E7C8
    rect(dx, dy, dw, totalH, u(1.5));
    noFill();
    stroke(139, 94, 60, alpha);  // #8B5E3C
    strokeWeight(u(0.4));
    rect(dx, dy, dw, totalH, u(1.5));
    noStroke();

    // ── Bouton Fermer : shmup_hud_croix (pas d'auto-close) ──
    var croix = img("ui", "shmup_hud_croix");
    if (croix) {
        var cMult = _fitMult(u(9), 16);
        var cSz = 16 * cMult;
        var cx2 = dx + dw - cSz - u(2);
        var cy2 = dy + u(2);
        image(croix, cx2, cy2, cSz, cSz);
        npcDialogue._btnClose = { x: cx2, y: cy2, w: cSz, h: cSz };
    }

    var y = dy + pad;

    // ── Bloc 1 : Nom ──
    textSize(u(3));
    fill(61, 43, 31, alpha);  // texte foncé sur fond crème
    textAlign(LEFT, CENTER);
    text(npc ? npc.emoji + ' ' + npc.label : '???', dx + pad, y + nameH/2);
    y += nameH + gap;

    // ── Bloc 2 : Texte (boîte multi-lignes : x,y = coin haut-gauche de la boîte) ──
    textSize(u(3.5));
    fill(61, 43, 31, alpha * 0.9);
    textAlign(CENTER, CENTER);
    text(npcDialogue.text, dx + pad, y, msgBoxW, textH);
    y += textH + gap;

    if (npc) {
        // ── Bloc 3 : Jauge relation (rangée de coeurs battle_hud_coeur) ──
        _drawRelationHearts(npc, npcDialogue.npcId, dx + pad, y, dw - pad*2, alpha);
        y += gaugeH + gap;

        // ── Bloc 4 : Boutons réponses (rogrpg_bouton_<couleur> + _marque) ──
        // Couleurs alignées sur les onglets boutique : Vendre=orange, Acheter=vert.
        // « Offrir » (turquoise) n'apparaît que si le joueur a quelque chose à offrir.
        var inv2 = harvestSystem ? harvestSystem.getInventory() : {};
        var hasGift = false;
        for (var gk in inv2) { if (inv2.hasOwnProperty(gk) && inv2[gk] > 0) { hasGift = true; break; } }

        var nBtns = hasGift ? 3 : 2;
        var bGap = u(2);
        var bW = u(18), bH = u(9);
        var maxRowW = dw - pad * 2;
        if (bW * nBtns + bGap * (nBtns - 1) > maxRowW) {
            bW = (maxRowW - bGap * (nBtns - 1)) / nBtns;
        }
        var totalBW = bW * nBtns + bGap * (nBtns - 1);
        var bx1 = dx + dw/2 - totalBW/2;
        var bx2 = bx1 + bW + bGap;
        var bx3 = bx2 + bW + bGap;

        // Vendre = orange (comme l'onglet VENDRE de la boutique)
        var sellPressed = npcDialogue._pressedBtn === 'sell' && millis() - npcDialogue._pressedTime < 300;
        var sellImg = img("ui", sellPressed ? "rogrpg_bouton_orange_marque" : "rogrpg_bouton_orange");
        if (sellImg) image(sellImg, bx1, y, bW, bH);

        // Acheter = vert (comme l'onglet ACHETER de la boutique)
        var buyPressed = npcDialogue._pressedBtn === 'buy' && millis() - npcDialogue._pressedTime < 300;
        var buyImg = img("ui", buyPressed ? "rogrpg_bouton_vert_marque" : "rogrpg_bouton_vert");
        if (buyImg) image(buyImg, bx2, y, bW, bH);

        // Offrir = turquoise
        if (hasGift) {
            var giftPressed = npcDialogue._pressedBtn === 'gift' && millis() - npcDialogue._pressedTime < 300;
            var giftImg = img("ui", giftPressed ? "rogrpg_bouton_turquoise_marque" : "rogrpg_bouton_turquoise");
            if (giftImg) image(giftImg, bx3, y, bW, bH);
        }

        // Labels sur les boutons (blanc, centré)
        fill(255, alpha);
        textSize(Math.min(u(3.5), bW * 0.22));
        textAlign(CENTER, CENTER);
        text('Vendre', bx1 + bW/2, y + bH/2);
        text('Acheter', bx2 + bW/2, y + bH/2);
        if (hasGift) text('🎁 Offrir', bx3 + bW/2, y + bH/2);

        npcDialogue._btnSell = { x: bx1, y: y, w: bW, h: bH };
        npcDialogue._btnBuy  = { x: bx2, y: y, w: bW, h: bH };
        npcDialogue._btnGift = hasGift ? { x: bx3, y: y, w: bW, h: bH } : null;
    }
}

/* ─── Jauge de relation PNJ : rangée de coeurs (battle_hud_coeur) ───
 * Remplace l'ancienne barre gradient par 5 coeurs style Stardew Valley.
 * Coeurs pleins = niveaux gagnés, partiel = progression, vides = à débloquer.
 */
function _drawRelationHearts(npc, npcId, gx, gy, gw, alpha) {
    var level = npcSystem.getRelationLevel(npcId);
    var pct = Math.min(100, level * 5);

    var totalHearts = 5;
    var heartsFilled = Math.floor(pct / 20);  // 0-5
    var heartPartial = (pct % 20) / 20;       // 0-0.999...

    // Label "Relation"
    textSize(u(2.2));
    fill(61, 43, 31, alpha * 0.85);
    textAlign(LEFT, CENTER);
    text("Relation", gx, gy + u(1.5));

    var coeur = img("ui", "battle_hud_coeur");
    if (!coeur) return;

    var hMult = _fitMult(u(3.5), 16);
    var hSz = 16 * hMult;
    var hGap = u(1.5);
    var heartAreaWidth = totalHearts * (hSz + hGap);
    var startX = gx + gw - heartAreaWidth;
    if (startX < gx + u(10)) startX = gx + u(10);

    for (var hi = 0; hi < totalHearts; hi++) {
        var hx = startX + hi * (hSz + hGap);
        var hy = gy + u(0.8);

        // Reset tint au début de chaque coeur
        noTint();

        if (hi < heartsFilled) {
            // Coeur plein — 100%
            tint(255, alpha);
        } else if (hi === heartsFilled && heartPartial > 0) {
            // Coeur partiel — atténué selon progression
            var partAlpha = 0.3 + heartPartial * 0.7;
            tint(255, alpha * partAlpha);
        } else {
            // Coeur vide — très atténué
            tint(255, alpha * 0.18);
        }
        image(coeur, hx, hy, hSz, hSz);
    }
    noTint();
}

/* ─── Interface boutique habillée (UI-4) ─── */
/* ─── Boutique : liste d'articles — SOURCE UNIQUE pour le dessin ET les clics ─── */
function _buildShopItemList() {
    var itemList = [];
    if (!shopMode) return itemList;
    if (shopMode.sellMode) {
        var inv = harvestSystem ? harvestSystem.getInventory() : {};
        var multiplier = npcSystem ? npcSystem.getSellMultiplier(shopMode.npcId) : 1.0;
        for (var cropId in inv) {
            if (!inv.hasOwnProperty(cropId)) continue;
            var cropData = cropGrowth.getCropData(cropId) || (culturesData && culturesData.find(function(cc) { return cc.id === cropId; }));
            if (!cropData) continue;
            var price = Math.floor((cropData.sell || 0) * multiplier);
            itemList.push({ id: cropId, data: cropData, qty: inv[cropId], price: price, sell: true });
        }
    } else {
        // Seules les graines de la saison courante sont proposées : une graine
        // hors-saison ne peut pas être plantée (B3b), la vendre serait un piège.
        var season = Engine.Clock.getSeason();
        var seedPrices = shopMode.npcData.seedPrices || {};
        for (var seedId in seedPrices) {
            if (!seedPrices.hasOwnProperty(seedId)) continue;
            var cropData2 = cropGrowth.getCropData(seedId) || (culturesData && culturesData.find(function(cc) { return cc.id === seedId; }));
            if (!cropData2) continue;
            if (cropData2.season !== season) continue;
            itemList.push({ id: seedId, data: cropData2, qty: 999, price: seedPrices[seedId], sell: false });
        }
    }
    return itemList;
}

/* ─── Boutique : géométrie du panneau — SOURCE UNIQUE pour le dessin ET les clics ─── */
function _shopLayout(itemCount) {
    var L = {
        pad: u(3), gap: u(2.5),
        dw: width * 0.78,
        headerH: u(8), goldH: u(8), modeH: u(8),
        itemH: u(8), itemGap: u(1.5)
    };
    L.dx = width / 2 - L.dw / 2;
    var maxVisible = 5;
    var chromeH = L.pad + L.headerH + L.gap + L.goldH + L.gap + L.modeH + L.gap + L.pad;
    var maxH = height - u(4);
    var footerH = Math.max(u(7), 48); // barre de défilement tactile (≥48px)

    // Nombre de lignes qui tiennent à l'écran, avec ou sans barre de défilement
    function fitVisible(withFooter) {
        var avail = maxH - chromeH - (withFooter ? footerH + L.gap : 0);
        var fit = Math.max(1, Math.floor((avail + L.itemGap) / (L.itemH + L.itemGap)));
        return Math.min(itemCount, Math.min(maxVisible, fit));
    }

    L.visibleItems = fitVisible(false);
    if (itemCount > L.visibleItems) L.visibleItems = fitVisible(true);
    L.needScroll = itemCount > L.visibleItems;
    L.footerH = L.needScroll ? footerH : 0;

    L.listH = L.visibleItems > 0 ? L.visibleItems * (L.itemH + L.itemGap) - L.itemGap : L.itemH; // 1 ligne réservée pour le message "liste vide"
    L.totalH = chromeH + L.listH + (L.needScroll ? L.gap + L.footerH : 0);
    L.dy = (height - L.totalH) / 2;
    return L;
}

function drawShopInterface() {
    if (!shopMode) return;
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || zone.id !== 'village') { shopMode = null; return; }

    var alpha = 230;
    var itemList = _buildShopItemList();
    var L = _shopLayout(itemList.length);
    var pad = L.pad, gap = L.gap, dw = L.dw, dx = L.dx, dy = L.dy;
    var headerH = L.headerH, goldH = L.goldH, modeH = L.modeH;
    var itemH = L.itemH, itemGap = L.itemGap;
    var visibleItems = L.visibleItems, totalH = L.totalH;

    // ── PANNEAU CRÈME #F5E7C8 + BORDURE BOIS #8B5E3C (comme UI-3) ──
    noStroke();
    fill(245, 231, 200, alpha * 0.95);
    rect(dx, dy, dw, totalH, u(1.5));
    noFill();
    stroke(139, 94, 60, alpha);
    strokeWeight(u(0.4));
    rect(dx, dy, dw, totalH, u(1.5));
    noStroke();

    var y = dy + pad;

    // ── RANGÉE HAUTE : Aide (gauche) + Titre + Fermer (droite) ──
    // Aide
    var aide = img("ui", "farm_aide_inconnu");
    if (aide) {
        var aMult = _fitMult(u(4), 16);
        var aSz = 16 * aMult;
        image(aide, dx + u(1), y + (headerH - aSz) / 2, aSz, aSz);
    }

    // Titre
    textFont('Pixelify Sans');
    textSize(u(3.5));
    fill(61, 43, 31, alpha);
    textAlign(CENTER, CENTER);
    text("Boutique", dx + dw / 2, y + headerH / 2);

    // Bouton Fermer
    var croix = img("ui", "shmup_hud_croix");
    if (croix) {
        var cMult = _fitMult(u(9), 16);
        var cSz = 16 * cMult;
        var cx2 = dx + dw - cSz - u(1.5);
        var cy2 = y + (headerH - cSz) / 2;
        image(croix, cx2, cy2, cSz, cSz);
        shopMode._btnClose = { x: cx2, y: cy2, w: cSz, h: cSz };
    }
    y += headerH + gap;

    // ── OR (pièce d'or, comme le HUD — plus de dollar dans une ferme alsacienne) ──
    var gold = harvestSystem ? harvestSystem.getGold() : 0;
    var goldStr = Math.floor(gold).toString();
    var dollar = img("objet", "town_piece_or");
    var dMult = _fitMult(u(3.5), 16);
    var dSz = 16 * dMult;
    var dollarX = dx + dw / 2 - u(6);
    var dollarY = y + (goldH - dSz) / 2;
    if (dollar) {
        image(dollar, dollarX, dollarY, dSz, dSz);
    }
    textSize(u(3.2));
    fill(61, 43, 31, alpha * 0.9);
    textAlign(LEFT, CENTER);
    text(goldStr, dollarX + dSz + u(1), y + goldH / 2);
    y += goldH + gap;

    // ── TABS MODE ──
    var tabW = u(20);
    var tabGap = u(2);
    var tabTotalW = tabW * 2 + tabGap;
    var tabX1 = dx + dw / 2 - tabTotalW / 2;
    var tabX2 = tabX1 + tabW + tabGap;

    // Tab "VENDRE" (orange)
    var sellPressed = shopMode.sellMode;
    var sellTabImg = img("ui", sellPressed ? "rogrpg_bouton_orange_marque" : "rogrpg_bouton_orange");
    if (sellTabImg) image(sellTabImg, tabX1, y, tabW, modeH);
    fill(255, alpha);
    textSize(u(3.5));
    textAlign(CENTER, CENTER);
    textFont('Pixelify Sans');
    text("VENDRE", tabX1 + tabW / 2, y + modeH / 2);

    // Tab "ACHETER" (vert)
    var buyPressed = !shopMode.sellMode;
    var buyTabImg = img("ui", buyPressed ? "rogrpg_bouton_vert_marque" : "rogrpg_bouton_vert");
    if (buyTabImg) image(buyTabImg, tabX2, y, tabW, modeH);
    fill(255, alpha);
    text("ACHETER", tabX2 + tabW / 2, y + modeH / 2);

    shopMode._btnSellTab = { x: tabX1, y: y, w: tabW, h: modeH };
    shopMode._btnBuyTab  = { x: tabX2, y: y, w: tabW, h: modeH };
    y += modeH + gap;

    // ── ITEMS ──
    var itemX = dx + u(2);
    var itemW = dw - u(4);
    shopMode._itemAreas = [];

    // Défilement : borner l'offset (la liste peut changer entre deux frames)
    var maxScroll = Math.max(0, itemList.length - visibleItems);
    if (!shopMode._scroll || shopMode._scroll < 0) shopMode._scroll = 0;
    if (shopMode._scroll > maxScroll) shopMode._scroll = maxScroll;
    var scroll = shopMode._scroll;

    for (var ii = 0; ii < visibleItems; ii++) {
        var absIdx = ii + scroll;
        var item = itemList[absIdx];
        var iy = y + ii * (itemH + itemGap);

        // Fond de ligne
        fill(61, 43, 31, 30);
        rect(itemX, iy, itemW, itemH, u(1));

        // Espacement interne
        var innerPad = u(1.5);
        var cx = itemX + innerPad;

        // ── Icône article ──
        var iconImg = null;
        if (item.sell) {
            // Mode vente : icône de récolte
            var iconKey = _cropIdToIconKey(item.id);
            if (iconKey) iconImg = img("objet", iconKey);
        } else {
            // Mode achat : sac de graines
            var sacKey = _cropIdToSacKey(item.id);
            if (sacKey) iconImg = img("objet", sacKey);
        }
        if (iconImg) {
            var iMult = _fitMult(itemH * 0.65, 16);
            var iSz = 16 * iMult;
            image(iconImg, cx, iy + (itemH - iSz) / 2, iSz, iSz);
            cx += iSz + innerPad;
        }

        // ── Nom ──
        textSize(u(3));
        fill(61, 43, 31, alpha * 0.9);
        textAlign(LEFT, CENTER);
        textFont('Pixelify Sans');
        text(item.data.label, cx, iy + itemH / 2);
        cx += textWidth(item.data.label) + u(2);

        // ── Prix ($ + texte Pixelify) ──
        var priceStr = item.price.toString();
        // dollar icon
        if (dollar) {
            var pMult = _fitMult(itemH * 0.35, 16);
            var pSz = 16 * pMult;
            image(dollar, cx, iy + (itemH - pSz) / 2, pSz, pSz);
            cx += pSz + u(0.5);
        }
        textSize(u(3));
        fill(61, 43, 31, alpha);
        text(priceStr, cx, iy + itemH / 2);
        cx += textWidth(priceStr) + u(2);

        // ── Quantité / Action ──
        var rightEdge = itemX + itemW - innerPad;

        if (item.sell) {
            // Mode VENTE : compteur quantité à vendre (initialisé dans _openShop)
            var sellQty = (shopMode._quantities && shopMode._quantities[absIdx]) || 0;
            var sellQtyStr = sellQty.toString();
            // Total disponible en inventaire
            var totalQty = item.qty;

            // Boutons +/- dessinés (B4 fix — remplace les petites flèches 16px)
            var qtyBtnSz = Math.max(u(6), 38);
            var qtyGap = u(1);
            var qtyGroupW = qtyBtnSz * 3 + qtyGap * 2; // [-][qty][+]

            // Bouton moins [-]
            var minusX = rightEdge - qtyGroupW;
            var minusY = iy + (itemH - qtyBtnSz) / 2;
            fill(61, 43, 31, alpha);
            rect(minusX, minusY, qtyBtnSz, qtyBtnSz, u(1));
            fill(255, alpha);
            textSize(qtyBtnSz * 0.6);
            textFont('Pixelify Sans');
            textAlign(CENTER, CENTER);
            text("-", minusX + qtyBtnSz / 2, minusY + qtyBtnSz / 2);
            shopMode._itemAreas.push({ type: 'qty_minus', idx: absIdx, x: minusX, y: minusY, w: qtyBtnSz, h: qtyBtnSz });

            // Quantité (texte Pixelify)
            textSize(u(3));
            fill(61, 43, 31, alpha);
            textAlign(CENTER, CENTER);
            textFont('Pixelify Sans');
            text(sellQtyStr, minusX + qtyBtnSz + qtyGap + (qtyBtnSz / 2), iy + itemH / 2 - u(0.4));

            // Petite indication du total disponible
            textSize(u(1.4));
            fill(61, 43, 31, 120);
            text("(" + totalQty + ")", minusX + qtyBtnSz + qtyGap + (qtyBtnSz / 2), iy + itemH / 2 + u(1.8));

            // Bouton plus [+]
            var plusX = minusX + qtyBtnSz * 2 + qtyGap * 2;
            var plusY = iy + (itemH - qtyBtnSz) / 2;
            fill(61, 43, 31, alpha);
            rect(plusX, plusY, qtyBtnSz, qtyBtnSz, u(1));
            fill(255, alpha);
            textSize(qtyBtnSz * 0.6);
            text("+", plusX + qtyBtnSz / 2, plusY + qtyBtnSz / 2);
            shopMode._itemAreas.push({ type: 'qty_plus', idx: absIdx, x: plusX, y: plusY, w: qtyBtnSz, h: qtyBtnSz });

            // Bouton VENDRE (orange) — recalé à gauche des nouveaux boutons
            var btnW2 = u(14);
            var btnH2 = Math.max(itemH * 0.75, 38);
            var btnX = minusX - btnW2 - u(1.5);
            var sellBtnImg = img("ui", "rogrpg_bouton_orange");
            if (sellBtnImg) image(sellBtnImg, btnX, iy + (itemH - btnH2) / 2, btnW2, btnH2);
            textSize(u(2.8));
            fill(255, alpha);
            textAlign(CENTER, CENTER);
            textFont('Pixelify Sans');
            text("VENDRE", btnX + btnW2 / 2, iy + itemH / 2);

            shopMode._itemAreas.push({ type: 'sell_btn', idx: absIdx, x: btnX, y: iy + (itemH - btnH2) / 2, w: btnW2, h: btnH2 });
        } else {
            // Mode ACHAT : compteur quantité à acheter (initialisé dans _openShop)
            var buyQty = (shopMode._quantities && shopMode._quantities[absIdx]) || 0;
            var buyQtyStr = buyQty.toString();

            // Boutons +/- dessinés (B4 fix — remplace les petites flèches 16px)
            var qtyBtnSz2 = Math.max(u(6), 38);
            var qtyGap2 = u(1);
            var qtyGroupW2 = qtyBtnSz2 * 3 + qtyGap2 * 2;

            // Bouton moins [-]
            var minusX2 = rightEdge - qtyGroupW2;
            var minusY2 = iy + (itemH - qtyBtnSz2) / 2;
            fill(61, 43, 31, alpha);
            rect(minusX2, minusY2, qtyBtnSz2, qtyBtnSz2, u(1));
            fill(255, alpha);
            textSize(qtyBtnSz2 * 0.6);
            textFont('Pixelify Sans');
            textAlign(CENTER, CENTER);
            text("-", minusX2 + qtyBtnSz2 / 2, minusY2 + qtyBtnSz2 / 2);
            shopMode._itemAreas.push({ type: 'qty_minus', idx: absIdx, x: minusX2, y: minusY2, w: qtyBtnSz2, h: qtyBtnSz2 });

            // Quantité (texte Pixelify)
            textSize(u(3));
            fill(61, 43, 31, alpha);
            textAlign(CENTER, CENTER);
            textFont('Pixelify Sans');
            text(buyQtyStr, minusX2 + qtyBtnSz2 + qtyGap2 + (qtyBtnSz2 / 2), iy + itemH / 2);

            // Bouton plus [+]
            var plusX2 = minusX2 + qtyBtnSz2 * 2 + qtyGap2 * 2;
            var plusY2 = iy + (itemH - qtyBtnSz2) / 2;
            fill(61, 43, 31, alpha);
            rect(plusX2, plusY2, qtyBtnSz2, qtyBtnSz2, u(1));
            fill(255, alpha);
            textSize(qtyBtnSz2 * 0.6);
            text("+", plusX2 + qtyBtnSz2 / 2, plusY2 + qtyBtnSz2 / 2);
            shopMode._itemAreas.push({ type: 'qty_plus', idx: absIdx, x: plusX2, y: plusY2, w: qtyBtnSz2, h: qtyBtnSz2 });

            // Bouton ACHETER (vert) — recalé à gauche des nouveaux boutons
            var btnW3 = u(16);
            var btnH3 = Math.max(itemH * 0.75, 38);
            var btnX2 = minusX2 - btnW3 - u(1.5);
            var buyBtnImg = img("ui", "rogrpg_bouton_vert");
            if (buyBtnImg) image(buyBtnImg, btnX2, iy + (itemH - btnH3) / 2, btnW3, btnH3);
            textSize(u(2.8));
            fill(255, alpha);
            textAlign(CENTER, CENTER);
            textFont('Pixelify Sans');
            text("ACHETER", btnX2 + btnW3 / 2, iy + itemH / 2);

            shopMode._itemAreas.push({ type: 'buy_btn', idx: absIdx, x: btnX2, y: iy + (itemH - btnH3) / 2, w: btnW3, h: btnH3 });
        }

        textAlign(LEFT, CENTER);
    }

    // ── Message si liste vide ──
    if (itemList.length === 0) {
        var emptyMsg;
        if (shopMode.sellMode) {
            emptyMsg = "Rien à vendre — récolte d'abord tes cultures !";
        } else {
            emptyMsg = Engine.Clock.getSeason() === 'hiver'
                ? "Pas de semis en hiver — reviens au printemps !"
                : "Rien à acheter.";
        }
        textSize(u(2.5));
        fill(61, 43, 31, 150);
        textAlign(CENTER, CENTER);
        textFont('Pixelify Sans');
        text(emptyMsg, dx + dw / 2, y + itemH / 2);
    }

    // ── Barre de défilement (si plus d'articles que de lignes visibles) ──
    if (L.needScroll) {
        var fy = y + L.listH + gap;
        var fBtn = L.footerH;
        var canUp = scroll > 0;
        var canDown = scroll < maxScroll;
        var upX = dx + dw / 2 - fBtn - u(8);
        var downX = dx + dw / 2 + u(8);

        // Bouton ▲
        fill(61, 43, 31, canUp ? alpha : 60);
        rect(upX, fy, fBtn, fBtn, u(1));
        fill(255, canUp ? alpha : 120);
        textSize(fBtn * 0.5);
        textFont('Pixelify Sans');
        textAlign(CENTER, CENTER);
        text("▲", upX + fBtn / 2, fy + fBtn / 2);
        shopMode._itemAreas.push({ type: 'scroll_up', idx: -1, x: upX, y: fy, w: fBtn, h: fBtn });

        // Position dans la liste ("1-5 / 10")
        textSize(u(2.2));
        fill(61, 43, 31, alpha * 0.8);
        text((scroll + 1) + "-" + (scroll + visibleItems) + " / " + itemList.length, dx + dw / 2, fy + fBtn / 2);

        // Bouton ▼
        fill(61, 43, 31, canDown ? alpha : 60);
        rect(downX, fy, fBtn, fBtn, u(1));
        fill(255, canDown ? alpha : 120);
        textSize(fBtn * 0.5);
        text("▼", downX + fBtn / 2, fy + fBtn / 2);
        shopMode._itemAreas.push({ type: 'scroll_down', idx: -1, x: downX, y: fy, w: fBtn, h: fBtn });
    }

    textFont('sans-serif');
    textAlign(CENTER, CENTER);
}

/* ─── Input ─── */

function inRect(mx, my, b) {
    return b && mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h;
}

/* ─── UI-2: Survol souris (non tactile) ─── */
function mouseMoved() {
    if (zoneTransition || (sleepSystem && sleepSystem.isSleeping()) || shopMode || portalChoice || seedChoice || giftChoice || npcDialogue) {
        hoveredTile = null;
        hoverType = 'none';
        return;
    }
    var w = Engine.Camera.screenToWorld(mouseX, mouseY);
    var tile = Engine.Grid.toTile(w.x, w.y);
    if (!tile || tile.c < 0 || tile.r < 0) {
        hoveredTile = null;
        hoverType = 'none';
        return;
    }
    hoveredTile = tile;

    // Déterminer le type de feedback
    var cultivable = soilSystem && soilSystem.isCultivable(tile.c, tile.r);
    var walkable = Engine.Grid.isWalkable(tile.c, tile.r);
    var hasTool = selectedTool !== null;
    var playerTile = player.tile();
    var inActionZone = playerTile && Engine.ActionZone.contains(playerTile, tile);

    // Priorité : bloqué > cultivable+cadre > main
    if (!walkable) {
        // Case interdite/bloquée → hachures
        hoverType = 'blocked';
    } else if (cultivable) {
        // Case cultivable → cadre de sélection (et main si outil)
        hoverType = hasTool && inActionZone ? 'action_cultivable' : 'cultivable';
    } else if (hasTool && inActionZone) {
        // Outil sélectionné + dans la zone d'action → curseur main
        hoverType = 'action';
    } else {
        hoverType = 'none';
    }
}

/* ─── UI-2: Détection tactile ─── */
function touchStarted() {
    mousePressed();
    return false;
}

/* ─── Molette : défilement de la liste boutique ─── */
function mouseWheel(event) {
    if (!shopMode) return;
    var itemList = _buildShopItemList();
    var L = _shopLayout(itemList.length);
    if (!L.needScroll) return false;
    var maxSc = Math.max(0, itemList.length - L.visibleItems);
    var cur = shopMode._scroll || 0;
    shopMode._scroll = Math.max(0, Math.min(maxSc, cur + (event.delta > 0 ? 1 : -1)));
    return false; // empêche le scroll de la page (iframe)
}

function mousePressed() {
    if (zoneTransition || (sleepSystem && sleepSystem.isSleeping())) return;

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

    // Sélecteur de cadeau à offrir
    if (giftChoice) {
        for (var gi = 0; gi < giftChoice.buttons.length; gi++) {
            var gb = giftChoice.buttons[gi];
            if (inRect(mouseX, mouseY, gb)) {
                var giftNpcId = giftChoice.npcId;
                giftChoice = null;
                _giveGiftTo(giftNpcId, gb.giftId);
                return;
            }
        }
        giftChoice = null; // tap ailleurs = annuler
        return;
    }

    // Sélecteur de graine à planter
    if (seedChoice) {
        for (var si = 0; si < seedChoice.buttons.length; si++) {
            var sb = seedChoice.buttons[si];
            if (inRect(mouseX, mouseY, sb)) {
                var chosenTile = seedChoice.tile;
                seedChoice = null;
                _plantCrop(chosenTile, sb.crop);
                return;
            }
        }
        seedChoice = null; // tap ailleurs = annuler
        return;
    }

    // Boutique — gérée entièrement dans _handleShopClick
    if (shopMode) {
        _handleShopClick(mouseX, mouseY);
        return;
    }

    // 1. HUD
    if (inRect(mouseX, mouseY, zoomBtns.plus)) { Engine.Camera.zoomIn(); return; }
    if (inRect(mouseX, mouseY, zoomBtns.minus)) { Engine.Camera.zoomOut(); return; }

    // Boutons dialogue PNJ
    if (npcDialogue && npcDialogue._btnClose && inRect(mouseX, mouseY, npcDialogue._btnClose)) {
        npcDialogue = null;
        return;
    }
    if (npcDialogue && npcDialogue._btnSell && inRect(mouseX, mouseY, npcDialogue._btnSell)) {
        npcDialogue._pressedBtn = 'sell';
        npcDialogue._pressedTime = millis();
        _openShop(true);
        return;
    }
    if (npcDialogue && npcDialogue._btnBuy && inRect(mouseX, mouseY, npcDialogue._btnBuy)) {
        npcDialogue._pressedBtn = 'buy';
        npcDialogue._pressedTime = millis();
        _openShop(false);
        return;
    }
    if (npcDialogue && npcDialogue._btnGift && inRect(mouseX, mouseY, npcDialogue._btnGift)) {
        npcDialogue._pressedBtn = 'gift';
        npcDialogue._pressedTime = millis();
        _showGiftChoice(npcDialogue.npcId);
        return;
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

    // Vérifier le lit (sommeil) — délégué à SleepSystem (engine)
    var curZoneId = Engine.WorldZone && Engine.WorldZone.getCurrent() ? Engine.WorldZone.getCurrent().id : '';
    if (sleepSystem && sleepSystem.isBedInZone(curZoneId) && sleepSystem.handleBedClick(curZoneId, tile.c, tile.r)) {
        return;
    }

    // Vérifier interaction PNJ
    if (npcSystem && Engine.WorldZone) {
        var curZoneId = Engine.WorldZone.getCurrent() ? Engine.WorldZone.getCurrent().id : '';
        var npcAtTile = npcSystem.getNPCAt(curZoneId, tile.c, tile.r);
        if (npcAtTile && Engine.ActionZone.contains(player.tile(), tile)) {
            // Interaction PNJ : dialogue, cadeau
            _interactNPC(npcAtTile);
            return;
        }
    }

    // Vérifier portail — priorité absolue, même dans la zone d'action
    if (Engine.Portal && Engine.WorldZone) {
        var portalCurZone = Engine.WorldZone.getCurrent();
        if (portalCurZone) {
            var portalAtTile = Engine.Portal.checkTrigger(portalCurZone.id, tile.c, tile.r);
            if (portalAtTile) {
                var pTile = player.tile();
                if (pTile && pTile.c === tile.c && pTile.r === tile.r) {
                    // Déjà sur le portail → déclencher directement
                    if (portalAtTile.type === "choice") {
                        showPortalChoice(portalAtTile);
                    } else {
                        var entry = portalAtTile.to && portalAtTile.to.entry ? portalAtTile.to.entry : null;
                        switchToZone(portalAtTile.to.zone, entry);
                    }
                } else {
                    // Se déplacer vers le portail → trigger à l'arrivée
                    player.moveTo(tile.c, tile.r);
                    var center = Engine.Grid.toWorld(tile.c, tile.r);
                    moveMarker = { x: center.x, y: center.y, t: millis() };
                }
                return;
            }
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
        // Déplacement — range=1 pour cultivable et PNJ (s'arrêter à côté)
        var moveRange = 0;
        if (npcSystem && Engine.WorldZone) {
            var cz = Engine.WorldZone.getCurrent();
            if (cz && npcSystem.getNPCAt(cz.id, tile.c, tile.r)) {
                moveRange = 1;
            }
        }
        if (moveRange === 0 && soilSystem && soilSystem.isCultivable(tile.c, tile.r)) {
            moveRange = 1;
        }
        player.moveTo(tile.c, tile.r, moveRange);
        var center = Engine.Grid.toWorld(tile.c, tile.r);
        moveMarker = { x: center.x, y: center.y, t: millis() };
    }
}

function keyPressed() {
    if (key === 'v' || key === 'V') {
        if (npcDialogue && npcDialogue.type === 'talk' && !giftChoice) {
            _openShop(true); // mode vente
            return false;
        }
    }
    if (key === 'a' || key === 'A') {
        if (npcDialogue && npcDialogue.type === 'talk' && !giftChoice) {
            _openShop(false); // mode achat
            return false;
        }
    }
    if (keyCode === ESCAPE) {
        if (giftChoice) { giftChoice = null; return false; }
        if (seedChoice) { seedChoice = null; return false; }
        if (shopMode) { shopMode = null; return false; }
        if (npcDialogue && npcDialogue.type !== 'talk') { npcDialogue = null; return false; }
    }
}

/* ─── Action ferme ─── */
function _doFarmAction(tile) {
    var state = soilSystem.getState(tile.c, tile.r);
    if (state === 'empty') {
        if (!_consumeEnergy(C.energy.tillCost, tile)) return;
        soilSystem.till(tile.c, tile.r);
        actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'till' };
        _guideAdvance(0);
    } else if (state === 'tilled') {
        // B3b: on plante une graine réellement possédée (de la saison courante)
        _plantAt(tile);
    } else if (state === 'planted') {
        if (cropGrowth && cropGrowth.isMature(tile.c, tile.r)) {
            // B3: priorité récolte — si mûre, on récolte même si non arrosée
            if (!_consumeEnergy(C.energy.harvestCost, tile)) return;
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
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'harvest' };
            if (_guideStep <= 3) _guideStep = 4; // première récolte → étape "vendre"
        } else if (!soilSystem.isWatered(tile.c, tile.r)) {
            // Pas mûre et pas arrosée → arroser
            if (!_consumeEnergy(C.energy.waterCost, tile)) return;
            soilSystem.water(tile.c, tile.r);
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'water' };
            _guideAdvance(2);
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
                if (!_consumeEnergy(C.energy.tillCost, tile)) return;
                soilSystem.till(tile.c, tile.r);
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'till' };
                _guideAdvance(0);
            } else {
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
            }
            break;

        case 'plant': // Graines — planter sur sol labouré
            if (soilSystem && soilSystem.isCultivable(tile.c, tile.r) && state === 'tilled') {
                // B3b (même règle que _doFarmAction) : graine possédée obligatoire
                _plantAt(tile);
            } else {
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
            }
            break;

        case 'water': // Arrosoir — arroser une culture plantée
            if (soilSystem && soilSystem.isCultivable(tile.c, tile.r) && state === 'planted' && !soilSystem.isWatered(tile.c, tile.r)) {
                if (!_consumeEnergy(C.energy.waterCost, tile)) return;
                soilSystem.water(tile.c, tile.r);
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'water' };
                _guideAdvance(2);
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

/* ─── Plantation liée à l'inventaire ───
   La graine plantée est celle que le joueur possède VRAIMENT (saison courante).
   0 graine → action bloquée ; 1 type → plantation directe ; plusieurs → sélecteur. */
function _getOwnedSeasonSeeds() {
    var out = [];
    if (!harvestSystem) return out;
    var season = Engine.Clock.getSeason();
    var crops = (culturesData && Array.isArray(culturesData)) ? culturesData : [];
    for (var i = 0; i < crops.length; i++) {
        if (crops[i].season !== season) continue;
        if (harvestSystem.getItemCount(crops[i].id + '_seed') > 0) out.push(crops[i]);
    }
    return out;
}

function _plantAt(tile) {
    var owned = _getOwnedSeasonSeeds();
    if (owned.length === 0) {
        actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
        return;
    }
    if (owned.length === 1) {
        _plantCrop(tile, owned[0]);
        return;
    }
    _showSeedChoice(tile, owned);
}

function _plantCrop(tile, crop) {
    // Garde : la graine doit toujours être en inventaire (sélecteur périmé, etc.)
    if (!harvestSystem || harvestSystem.getItemCount(crop.id + '_seed') <= 0) {
        actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'blocked' };
        return;
    }
    if (!_consumeEnergy(C.energy.plantCost, tile)) return;
    harvestSystem.removeFromInventory(crop.id + '_seed', 1);
    soilSystem.plant(tile.c, tile.r, crop.id);
    cropGrowth.plant(tile.c, tile.r, crop.id, Engine.Clock.day);
    actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'plant' };
    _guideAdvance(1);
    if (window.Engine && Engine.Save) Engine.Save.saveLocal();
}

function _showSeedChoice(tile, options) {
    var buttons = [];
    var btnW = u(60);
    var btnGap = u(2);
    // Hauteur adaptée pour que toutes les options tiennent à l'écran (min tactile 44px)
    var btnH = Math.max(u(9), 48);
    var maxTotal = height - u(24);
    if (options.length * (btnH + btnGap) > maxTotal) {
        btnH = Math.max(44, maxTotal / options.length - btnGap);
    }
    var startY = height / 2 - (options.length * (btnH + btnGap)) / 2;
    for (var i = 0; i < options.length; i++) {
        var cr = options[i];
        var count = harvestSystem.getItemCount(cr.id + '_seed');
        buttons.push({
            crop: cr,
            label: (cr.emoji || '🌱') + " " + cr.label + "  (x" + count + ")",
            x: width / 2 - btnW / 2,
            y: startY + i * (btnH + btnGap),
            w: btnW,
            h: btnH
        });
    }
    seedChoice = { tile: tile, buttons: buttons };
}

function drawSeedChoice() {
    if (!seedChoice) return;
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    textFont('Pixelify Sans');
    textSize(u(4));
    fill(255);
    textAlign(CENTER, CENTER);
    text("Que veux-tu planter ?", width / 2, seedChoice.buttons[0].y - u(8));

    for (var i = 0; i < seedChoice.buttons.length; i++) {
        var b = seedChoice.buttons[i];
        // Panneau crème + bordure bois, comme la boutique
        fill(245, 231, 200, 240);
        rect(b.x, b.y, b.w, b.h, u(1.5));
        noFill();
        stroke(139, 94, 60, 240);
        strokeWeight(u(0.4));
        rect(b.x, b.y, b.w, b.h, u(1.5));
        noStroke();
        fill(61, 43, 31);
        textSize(Math.min(u(3), b.h * 0.45));
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
    textFont('sans-serif');
}

/* ─── Interaction PNJ ───
   Le don passe par le bouton « Offrir » explicite (plus de cadeau automatique
   au 2e clic : un enfant donnait sa récolte sans le vouloir). */
function _interactNPC(npc) {
    if (npcDialogue && npcDialogue.npcId === npc.id && npcDialogue.type === 'talk') {
        return; // dialogue déjà ouvert
    }
    var dialogue = npcSystem.getDialogue(npc.id);
    npcDialogue = { npcId: npc.id, text: dialogue, type: 'talk', t: millis() };
}

/* ─── Sélecteur de cadeau (bouton Offrir du dialogue PNJ) ─── */
function _showGiftChoice(npcId) {
    if (!harvestSystem || !npcSystem) return;
    var inv = harvestSystem.getInventory();
    var options = [];
    for (var cropId in inv) {
        if (!inv.hasOwnProperty(cropId) || inv[cropId] <= 0) continue;
        var cd = cropGrowth.getCropData(cropId) || (culturesData && culturesData.find(function(cc) { return cc.id === cropId; }));
        options.push({ id: cropId, label: (cd && cd.label) || cropId, emoji: (cd && cd.emoji) || '🎁', count: inv[cropId] });
    }
    if (options.length === 0) return;

    var buttons = [];
    var btnW = u(60);
    var btnGap = u(2);
    var btnH = Math.max(u(9), 48);
    var maxTotal = height - u(24);
    if (options.length * (btnH + btnGap) > maxTotal) {
        btnH = Math.max(44, maxTotal / options.length - btnGap);
    }
    var startY = height / 2 - (options.length * (btnH + btnGap)) / 2;
    for (var i = 0; i < options.length; i++) {
        var o = options[i];
        buttons.push({
            giftId: o.id,
            label: o.emoji + " " + o.label + "  (x" + o.count + ")",
            x: width / 2 - btnW / 2,
            y: startY + i * (btnH + btnGap),
            w: btnW,
            h: btnH
        });
    }
    giftChoice = { npcId: npcId, buttons: buttons };
}

function drawGiftChoice() {
    if (!giftChoice) return;
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    textFont('Pixelify Sans');
    textSize(u(4));
    fill(255);
    textAlign(CENTER, CENTER);
    text("🎁 Que veux-tu offrir ?", width / 2, giftChoice.buttons[0].y - u(8));

    for (var i = 0; i < giftChoice.buttons.length; i++) {
        var b = giftChoice.buttons[i];
        fill(245, 231, 200, 240);
        rect(b.x, b.y, b.w, b.h, u(1.5));
        noFill();
        stroke(139, 94, 60, 240);
        strokeWeight(u(0.4));
        rect(b.x, b.y, b.w, b.h, u(1.5));
        noStroke();
        fill(61, 43, 31);
        textSize(Math.min(u(3), b.h * 0.45));
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
    textFont('sans-serif');
}

function _giveGiftTo(npcId, giftId) {
    var npc = npcSystem.getNPC(npcId);
    if (!npc || !harvestSystem || harvestSystem.getItemCount(giftId) <= 0) return;
    var reaction = npcSystem.giveGift(npcId, giftId);
    harvestSystem.removeFromInventory(giftId, 1);
    npcDialogue = { npcId: npcId, text: reaction, type: 'gift', t: millis() };
    actionFlash = { c: npc.c, r: npc.r, t: millis(), type: 'gift' };
    if (window.Engine && Engine.Save) Engine.Save.saveLocal();
}

/* ─── Ouverture boutique ─── */
function _openShop(sellMode) {
    if (!npcDialogue) return;
    var npc = npcSystem.getNPC(npcDialogue.npcId);
    if (!npc) return;
    npcDialogue = null;
    shopMode = { npcId: npc.id, npcData: npc, sellMode: sellMode, _quantities: {}, _scroll: 0 };
}

function _handleShopClick(mx, my) {
    if (!shopMode) return;

    // Même liste d'articles et même géométrie que drawShopInterface (source unique)
    var itemList = _buildShopItemList();
    var L = _shopLayout(itemList.length);

    // Vérifier clic hors panneau → fermer
    if (!inRect(mx, my, { x: L.dx, y: L.dy, w: L.dw, h: L.totalH })) {
        shopMode = null;
        return;
    }

    // 1. Bouton fermer
    if (shopMode._btnClose && inRect(mx, my, shopMode._btnClose)) {
        shopMode = null;
        return;
    }

    // 2. Tabs mode — switch entre VENDRE et ACHETER (compteurs et scroll remis à zéro)
    if (shopMode._btnSellTab && inRect(mx, my, shopMode._btnSellTab)) {
        shopMode.sellMode = true;
        shopMode._quantities = {};
        shopMode._scroll = 0;
        return;
    }
    if (shopMode._btnBuyTab && inRect(mx, my, shopMode._btnBuyTab)) {
        shopMode.sellMode = false;
        shopMode._quantities = {};
        shopMode._scroll = 0;
        return;
    }

    // 3. Zones items (boutons +/-, VENDRE/ACHETER, défilement)
    var areas = shopMode._itemAreas;
    if (!areas) return;
    if (!shopMode._quantities) shopMode._quantities = {};

    for (var ai = 0; ai < areas.length; ai++) {
        var area = areas[ai];
        if (!inRect(mx, my, area)) continue;

        // Boutons de défilement (pas liés à un article)
        if (area.type === 'scroll_up') {
            shopMode._scroll = Math.max(0, (shopMode._scroll || 0) - 1);
            return;
        }
        if (area.type === 'scroll_down') {
            var maxSc = Math.max(0, itemList.length - L.visibleItems);
            shopMode._scroll = Math.min(maxSc, (shopMode._scroll || 0) + 1);
            return;
        }

        var item = itemList[area.idx];
        if (!item) continue;

        if (area.type === 'qty_minus') {
            var cur = shopMode._quantities[area.idx] || 0;
            if (cur > 0) shopMode._quantities[area.idx] = cur - 1;
            return;
        }
        if (area.type === 'qty_plus') {
            // Plafond : stock en inventaire (vente) / 99 (achat)
            var maxQty = item.sell ? item.qty : 99;
            var cur2 = shopMode._quantities[area.idx] || 0;
            if (cur2 < maxQty) shopMode._quantities[area.idx] = cur2 + 1;
            return;
        }
        if (area.type === 'sell_btn') {
            // Exécuter la vente
            var sellQty = 1;
            if (shopMode._quantities && shopMode._quantities[area.idx]) {
                sellQty = shopMode._quantities[area.idx];
            }
            if (sellQty > item.qty) sellQty = item.qty;
            if (sellQty > 0) {
                var earned = harvestSystem.sell(item.id, sellQty, item.price);
                if (earned > 0) {
                    playerGoldEarned += earned;
                    shopMode._quantities = {}; // reset compteurs
                    if (_guideStep === 4) _guideStep = 99; // première vente → guide terminé
                }
            } else {
                // Vente rapide de 1
                var earned2 = harvestSystem.sell(item.id, 1, item.price);
                if (earned2 > 0) {
                    playerGoldEarned += earned2;
                    if (_guideStep === 4) _guideStep = 99;
                }
            }
            return;
        }
        if (area.type === 'buy_btn') {
            // Exécuter l'achat
            var buyQty = 1;
            if (shopMode._quantities && shopMode._quantities[area.idx]) {
                buyQty = shopMode._quantities[area.idx];
            }
            var totalCost = buyQty * item.price;
            if (harvestSystem && harvestSystem.spendGold(totalCost)) {
                harvestSystem.addToInventory(item.id + '_seed', buyQty);
                shopMode._quantities[area.idx] = 0; // reset
            } else if (harvestSystem) {
                var missing = totalCost - Math.floor(harvestSystem.getGold());
                showToast("Il te manque " + missing + " pièce" + (missing > 1 ? "s" : "") + " !");
            }
            return;
        }
    }
}

/* ─── Sommeil délégué à SleepSystem engine — cf. handleBedClick() dans mousePressed() ─── */

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

    // Défis surmontés (depuis l'historique des deux systèmes)
    var challengesOvercome = 0;
    if (disasterSystem) challengesOvercome += disasterSystem.getHistory().length;
    if (challengeSystem) challengesOvercome += challengeSystem.getHistory().length;

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

/* ─── Nettoyage des timers périodiques avant transition de zone ─── */
function _cleanupTimers() {
    if (_cloudSyncTimerId !== null) {
        clearInterval(_cloudSyncTimerId);
        _cloudSyncTimerId = null;
    }
}

/* ─── Recrée les timers périodiques après transition de zone ─── */
function _restartTimers() {
    if (_cloudSyncTimerId === null) {
        _cloudSyncTimerId = setInterval(async function () {
            if (window.Engine && Engine.Save) {
                await Engine.Save.saveCloud();
            }
        }, 5 * 60 * 1000);
    }
}

/* ─── Transition entre zones ─── */
function switchToZone(zoneId, entryOverride) {
    if (!Engine.WorldZone || zoneTransition) return;
    // Nettoyer les timers avant la transition
    _cleanupTimers();
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
                // Le lit est géré par SleepSystem — pas de nettoyage nécessaire
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
            // Recréer les timers périodiques après la transition
            _restartTimers();
        }
    }

    noStroke();
    fill(0, 0, 0, alpha);
    rect(0, 0, width, height);
}
