/*
 * sketch.js — Prototype GRAY-BOX Elsass Farm v3 (phase 01, pré-production)
 *
 * Objectif unique : valider le pivot d'interaction de la V2.
 *   - clic HORS de la zone d'action  -> le personnage se déplace (contournement)
 *   - clic DANS la zone d'action     -> "action" (la tuile clignote en vert)
 * Plus : caméra qui suit + boutons de zoom, horloge 1 min = 1 h, sauvegarde
 * de la position et du temps, test de rendu des emoji (coin bas-gauche).
 *
 * Pas d'art final, pas de culture, pas de PNJ : c'est volontaire (roadmap 01).
 */

const C = window.FarmConfig;

let player = null;        // marcheur (Engine.Mover)
let wasMoving = false;    // pour détecter la fin d'un trajet (-> save locale)
let moveMarker = null;    // { x, y, t } dernière destination cliquée
let actionFlash = null;   // { c, r, t } tuile "actionnée"
let zoomBtns = {};        // zones cliquables des boutons + / − (coords écran)

// Systèmes de culture Phase 02
let soilSystem = null;    // Engine.SoilSystem
let cropGrowth = null;   // Engine.CropGrowth
let harvestSystem = null; // Engine.HarvestSystem
let culturesData = null;  // données cultures.json chargées
let outilsData = null;     // données outils.json chargées
let selectedTool = null;   // outil sélectionné (id), null = aucun
let toolbarSlots = [];     // zones cliquables de chaque slot [{x,y,w,h,tool}]

// Transition de zone (fondue)
let zoneTransition = null; // { phase: 'out'|'in', zoneId, entry, t, duration: 250 }

// Popup de choix de portail (ascenseur, etc.)
let portalChoice = null;   // { portal, buttons: [{label, zone, entry, x, y, w, h}] }

// u(n) = n % du plus petit côté de l'écran — pour TOUT le HUD.
function u(n) {
    return (min(width, height) * n) / 100;
}

function preload() {
    // Charger tous les assets Tiny Farm listés dans FarmConfig.assets
    var base = C.assets.base;

    // Charger une image et la stocker dans un cache nommé par catégorie
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

    // Charger la définition des zones (WorldZone)
    C._zonesData = loadJSON("data/zones/zones.json");

    // Charger les données de cultures (Phase 02)
    culturesData = loadJSON("data/cultures.json", function(data) { culturesData = Object.values(data); });

    // Charger les données d'outils (Phase 02 — HUD)
    outilsData = loadJSON("data/outils.json");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);

    // --- Configuration des zones (WorldZone) ---
    if (Engine.WorldZone && C._zonesData) {
        Engine.WorldZone.configure({ zones: C._zonesData });
    }

    // --- Configuration des portails ---
    if (Engine.Portal && C._zonesData) {
        var allPortals = [];
        for (var zid in C._zonesData) {
            if (!C._zonesData.hasOwnProperty(zid)) continue;
            var z = C._zonesData[zid];
            if (z.portals && z.portals.length) {
                // Injecter from.zone automatiquement
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

    // --- Grille + obstacles (legacy, ou zone par défaut si WorldZone non configuré) ---
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

    // --- Horloge : 1 min réelle = 1 h en jeu, journée démarre à 7 h ---
    Engine.Clock.configure({
        startHour: 7,
        onNewDay: function () {
            // Faire pousser les cultures chaque nouveau jour
            if (cropGrowth) cropGrowth.onNewDay(Engine.Clock.day);
            if (window.Engine && Engine.Save) Engine.Save.save();
        }
    });

    // --- Système de sol (SoilSystem) — Phase 02 ---
    soilSystem = new Engine.SoilSystem();
    // Marquer les tuiles cultivables depuis zones.json
    var farmZone = C._zonesData && C._zonesData.ferme;
    var ct = farmZone && farmZone.cultivableTiles;
    if (ct) {
        for (var sc = ct.c1; sc <= ct.c2; sc++) {
            for (var sr = ct.r1; sr <= ct.r2; sr++) {
                soilSystem.setCultivable(sc, sr, true);
            }
        }
    }

    // --- Système de pousse des cultures (CropGrowth) — Phase 02 ---
    cropGrowth = new Engine.CropGrowth();
    if (culturesData) {
        cropGrowth.configure({ cultures: culturesData });
    }

    // --- Système de récolte (HarvestSystem) — Phase 02 ---
    harvestSystem = new Engine.HarvestSystem();

    boot();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Démarrage : chargement de la sauvegarde (position + temps), fin du loader.
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
                    c: t.c, r: t.r
                };
                // Sauvegarder la zone courante (WorldZone)
                if (Engine.WorldZone && Engine.WorldZone.getCurrent()) {
                    data.zoneId = Engine.WorldZone.getCurrent().id;
                }
                // Sauvegarder l'état du sol et des cultures (Phase 02)
                if (soilSystem) data.soil = soilSystem.gather();
                if (cropGrowth) data.crops = cropGrowth.gather();
                if (harvestSystem) data.harvest = harvestSystem.gather();
                return data;
            },
            apply: function (data) {
                if (!data) return;
                // Restaurer la zone sauvegardée AVANT de replacer le joueur
                if (data.zoneId && Engine.WorldZone) {
                    Engine.WorldZone.setCurrent(data.zoneId);
                }
                if (typeof data.day === "number")
                    Engine.Clock.setTime(data.day, data.hour, data.minute);
                if (typeof data.c === "number" && Engine.Grid.isWalkable(data.c, data.r)) {
                    player.placeAt(data.c, data.r);
                    Engine.Camera.snapTo(player.x, player.y);
                }
                // Restaurer l'état du sol et des cultures (Phase 02)
                if (soilSystem && data.soil) soilSystem.apply(data.soil);
                if (cropGrowth && data.crops) cropGrowth.apply(data.crops);
                if (harvestSystem && data.harvest) harvestSystem.apply(data.harvest);
            }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
        await Engine.Save.load();
    }
    
    // Fallback : si pas de sauvegarde, démarrer sur la ferme
    if (Engine.WorldZone && !Engine.WorldZone.getCurrent()) {
        Engine.WorldZone.setCurrent('ferme');
    }

    if (window.Engine && Engine.Loader) Engine.Loader.finish();
}

function draw() {
    background(C.colors.bg);

    // --- Simulation ---
    if (!zoneTransition) {
        Engine.Clock.update(deltaTime);
        player.update(deltaTime);
    }
    Engine.Camera.follow(player.x, player.y);

    // Fin de trajet -> petite sauvegarde locale (gratuite).
    if (wasMoving && !player.isMoving()) {
        // Détection portail (prioritaire)
        if (Engine.Portal && Engine.WorldZone) {
            var curZone = Engine.WorldZone.getCurrent();
            if (curZone) {
                var t = player.tile();
                if (t) {
                    var portal = Engine.Portal.checkTrigger(curZone.id, t.c, t.r);
                    if (portal) {
                        if (portal.type === "simple") {
                            // Transition directe vers la zone cible avec le point d'entrée du portail
                            var entry = portal.to && portal.to.entry ? portal.to.entry : null;
                            switchToZone(portal.to.zone, entry);
                        } else if (portal.type === "choice") {
                            // Popup de choix (affichée dans drawHud)
                            showPortalChoice(portal);
                        }
                        // Ne pas sauvegarder pendant une transition
                        wasMoving = false;
                        return; // skip le reste du draw
                    }
                }
            }
        }
        if (window.Engine && Engine.Save) {
            Engine.Save.saveLocal();
        }
    }
    wasMoving = player.isMoving();

    // --- Monde (sous caméra) ---
    push();
    Engine.Camera.apply();
    drawWorld();
    pop();

    // --- HUD (coordonnées écran) ---
    drawHud();

    // --- Fondu de transition entre zones ---
    drawZoneFade();
}

// ─── Helpers de rendu Tiny Farm ─────────────────────────────────────────────

/* Retourne l'image chargée depuis le cache d'une catégorie, ou null. */
function img(cat, key) {
    var cache = C.assets[cat + "_loaded"];
    return cache ? cache[key] : null;
}

/* Dessine une image centrée sur une tuile (coords monde). */
function drawTileImg(img, c, r, ts) {
    if (!img) return;
    ts = ts || Engine.Grid.tileSize;
    image(img, c * ts, r * ts, ts, ts);
}

/* Dessine le sol en tuiles de labour (sillons horizontaux, clairs). */
function drawGround() {
    var ts = Engine.Grid.tileSize;
    var cols = C.grid.cols;
    var rows = C.grid.rows;
    var centre1 = img("sol", "farm_sol_sillon_horizontal_clair_centre1");
    var centre2 = img("sol", "farm_sol_sillon_horizontal_clair_centre2");
    var def = centre1; // fallback

    for (var c = 0; c < cols; c++) {
        for (var r = 0; r < rows; r++) {
            var tile = (c + r) % 2 === 0 ? centre1 : centre2;
            drawTileImg(tile || def, c, r, ts);
        }
    }
}

/* Remplace les obstacles gray-box par des sprites Tiny Farm. */
function drawDecor() {
    var ts = Engine.Grid.tileSize;

    // Lire les obstacles depuis la zone courante (WorldZone), fallback config
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    var rects = zone && zone.obstacles ? zone.obstacles.rects || [] : C.obstacles.rects;
    var singles = zone && zone.obstacles ? zone.obstacles.singles || [] : C.obstacles.singles;

    // Obstacles rectangulaires → choix du sprite selon dimensions
    for (var ri = 0; ri < rects.length; ri++) {
        var o = rects[ri];
        var area = o.w * o.h;
        // Grand rectangle (>6 cellules) → bâtiment/grange
        if (area >= 6) {
            _drawGrange(o.c, o.r, o.w, o.h, ts);
        }
        // Rectangle moyen (3-5 cellules) → mare/bac eau
        else if (area >= 3) {
            var eau_g = img("decor", "farm_bac_eau_gauche");
            var eau_d = img("decor", "farm_bac_eau_droit");
            for (var dc = 0; dc < o.w; dc++) {
                for (var dr = 0; dr < o.h; dr++) {
                    var tile = dc < o.w / 2 ? eau_g : eau_d;
                    drawTileImg(tile, o.c + dc, o.r + dr, ts);
                }
            }
        }
        // Petit rectangle (1-2 cellules) → rocher/pierres
        else {
            var pierres = img("decor", "farm_tas_pierres");
            for (var dc = 0; dc < o.w; dc++) {
                for (var dr = 0; dr < o.h; dr++) {
                    drawTileImg(pierres, o.c + dc, o.r + dr, ts);
                }
            }
        }
    }

    // Obstacles simples → décor varié
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

/* Assemble un bâtiment grange 5×2 avec portes et fenêtres. */
function _drawGrange(cc, rr, w, h, ts) {
    if (w < 3 || h < 2) return; // trop petit pour une grange modulaire

    // Ligne du haut : toit_bas
    var tg = img("batiment", "farm_grange_toit_bas_gauche");
    var tc = img("batiment", "farm_grange_toit_bas_centre");
    var td = img("batiment", "farm_grange_toit_bas_droit");
    drawTileImg(tg || tc, cc,       rr, ts);
    for (var i = 1; i < w-1; i++) drawTileImg(tc || tg, cc + i, rr, ts);
    drawTileImg(td || tc, cc + w-1, rr, ts);

    // Ligne du bas : mur avec porte au centre + fenêtres
    var mg = img("batiment", "farm_grange_mur_brique1_gauche");
    var mc = img("batiment", "farm_grange_mur_brique1_centre");
    var md = img("batiment", "farm_grange_mur_brique1_droit");
    var pg = img("batiment", "farm_grange_porte_gauche");
    var pd = img("batiment", "farm_grange_porte_droit");
    var fen = img("batiment", "farm_grange_fenetre");

    var r = rr + 1;
    drawTileImg(fen || mc, cc,       r, ts);                 // fenêtre gauche
    drawTileImg(mc  || fen, cc + 1,   r, ts);                 // mur
    drawTileImg(pg  || mc, cc + 2,   r, ts);                 // porte gauche
    drawTileImg(pd  || mc, cc + 3,   r, ts);                 // porte droite
    drawTileImg(fen || mc, cc + w-1, r, ts);                 // fenêtre droite
}

/* Rendu visuel des cultures : sol labouré, pousses, arrosage, culture mature. */
function drawCrops() {
    if (!soilSystem) return;
    var ts = Engine.Grid.tileSize;
    var zone = Engine.WorldZone && Engine.WorldZone.getCurrent();
    if (!zone || zone.id !== 'ferme') return; // cultivable uniquement sur la ferme

    var keys = Object.keys(soilSystem._cultivable);
    for (var i = 0; i < keys.length; i++) {
        var parts = keys[i].split(',');
        var c = parseInt(parts[0]), r = parseInt(parts[1]);
        var state = soilSystem.getState(c, r);
        var x = c * ts, y = r * ts;
        var cx = x + ts/2, cy = y + ts/2;

        // Fond de la parcelle cultivable (terre foncée)
        noStroke();
        fill(80, 55, 30, 180);
        rect(x + 2, y + 2, ts - 4, ts - 4, 4);

        if (state === 'tilled') {
            // Sol labouré : sillons horizontaux
            stroke(110, 85, 45, 200);
            strokeWeight(1);
            for (var s = 0; s < 3; s++) {
                var ly = y + ts * (0.25 + s * 0.2);
                line(x + 4, ly, x + ts - 4, ly);
            }
            noStroke();
        } else if (state === 'planted') {
            // Pousse en fonction du stade de croissance
            var cropId = cropGrowth ? cropGrowth.getCropId(c, r) : null;
            var stage = cropGrowth ? cropGrowth.getGrowthStage(c, r) : 0;
            var isMature = cropGrowth ? cropGrowth.isMature(c, r) : false;
            var cropData = cropId ? cropGrowth.getCropData(cropId) : null;

            if (cropData) {
                var emojiSize = ts * (0.35 + 0.35 * stage);
                textAlign(CENTER, CENTER);
                textSize(emojiSize);
                if (isMature) {
                    // Culture mature : emoji + fond brillant
                    fill(255, 255, 100, 60);
                    rect(x + 2, y + 2, ts - 4, ts - 4, 4);
                    fill(255);
                    text(cropData.emoji, cx, cy);
                } else {
                    // En croissance : pousse avec opacité croissante
                    fill(255, 255, 255, 140 + 80 * stage);
                    text('🌱', cx, cy);
                    // Petite étiquette du nom
                    textSize(ts * 0.15);
                    fill(255, 255, 255, 180);
                    text(cropData.label.substring(0, 3), cx, y + ts * 0.85);
                }

                // Indicateur "arrosé" (goutte bleue)
                if (soilSystem.isWatered(c, r)) {
                    textSize(ts * 0.4);
                    fill(100, 180, 255, 220);
                    text('💧', x + ts * 0.75, y + ts * 0.25);
                }

                // Compteur de jours restants si pas mature
                if (!isMature) {
                    var remaining = cropGrowth.getDaysUntilMature(c, r);
                    textSize(ts * 0.2);
                    fill(255, 255, 255, 200);
                    text(remaining + 'j', cx, y + ts * 0.15);
                }
                textAlign(CENTER, CENTER);
            } else {
                // Pas de données culture → fallback pousse générique
                textSize(ts * 0.45);
                fill(100, 200, 80, 200);
                text('🌱', cx, cy);
            }
        } else {
            // empty: juste un petit indicateur de disponibilité
            textSize(ts * 0.22);
            fill(180, 160, 120, 140);
            textAlign(CENTER, CENTER);
            text('clic', cx, cy);
        }
        textAlign(CENTER, CENTER);
    }
}

/* Rendu visuel des portails dans la zone courante.
   Chaque cellule de portail affiche un cercle pulsant coloré + icône 🚪. */
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

        // Couleur selon le type de portail
        var color = portal.type === 'choice' || portal.choices
            ? [255, 193, 7]    // doré (portail à choix = ascenseur)
            : [79, 195, 247];   // bleu ciel (portail simple)

        for (var ci = 0; ci < cells.length; ci++) {
            var cell = cells[ci];
            var cc = cell[0], rr = cell[1];
            var cx = cc * ts + ts / 2;
            var cy = rr * ts + ts / 2;

            // Halo pulsant (animation toutes les 1.5s)
            var pulse = 0.55 + 0.25 * sin(t * 0.004);
            noStroke();
            fill(color[0], color[1], color[2], 60 + 40 * pulse);
            ellipse(cx, cy, ts * 0.9, ts * 0.9);

            // Cercle fin
            noFill();
            stroke(color[0], color[1], color[2], 180);
            strokeWeight(2);
            ellipse(cx, cy, ts * 0.6, ts * 0.6);

            // Icône 🚪
            noStroke();
            fill(255, 255, 255, 220);
            textSize(ts * 0.45);
            text('\uD83D\uDEAA', cx, cy - ts * 0.05);  // 🚪 (portal icon)
        }
    }
    textAlign(CENTER, CENTER);
}

function drawWorld() {
    // Sol en tuiles Tiny Farm (labour)
    drawGround();

    // Grille de debug : uniquement les lignes, PAS les remplissages gris
    // (ils recouvriraient les sprites décor/cultures dessinés après)
    Engine.Grid.drawDebug({ line: C.colors.gridLine });

    // Décor Tiny Farm à la place des obstacles gray-box
    drawDecor();

    // Cultures Phase 02 : rendu du sol, pousses, arrosage
    drawCrops();

    // Portails : indicateurs visuels (cercle coloré + icône 🚪)
    drawPortals();

    // Marqueur de destination (s'estompe en 1 s)
    if (moveMarker && millis() - moveMarker.t < 1000) {
        var a = 1 - (millis() - moveMarker.t) / 1000;
        noFill();
        stroke("rgba(79,195,247," + a.toFixed(2) + ")");
        strokeWeight(3);
        circle(moveMarker.x, moveMarker.y, Engine.Grid.tileSize * 0.6);
        noStroke();
    }

    // Flash de la tuile "actionnée" (0,6 s) — couleur selon type d'action
    if (actionFlash && millis() - actionFlash.t < 600) {
        var s = Engine.Grid.tileSize;
        var flashColors = {
            till: 'rgba(139,90,43,0.8)',    // marron (labour)
            plant: 'rgba(76,175,80,0.75)',   // vert (plantation)
            water: 'rgba(33,150,243,0.75)',  // bleu (arrosage)
            harvest: 'rgba(255,193,7,0.8)',  // doré (récolte)
            action: C.colors.actionFlash     // vert par défaut
        };
        var fc = flashColors[actionFlash.type] || flashColors.action;
        fill(fc);
        rect(actionFlash.c * s + 2, actionFlash.r * s + 2, s - 4, s - 4, 6);
    }

    // Zone d'action (debug) + chemin restant
    Engine.ActionZone.drawDebug(Engine.Grid, player.tile(), C.colors.zone);
    player.drawDebugPath(C.colors.path);

    // Personnage : sprite Tiny Farm au lieu du cercle gray-box
    var farmer = img("perso", "farm_fermier_brun");
    var d = Engine.Grid.tileSize;
    if (farmer) {
        image(farmer, player.x - d/2, player.y - d/2, d, d);
    } else {
        // Fallback gray-box si l'image n'est pas chargée
        fill(C.colors.player);
        circle(player.x, player.y, d * 0.7);
        textSize(d * 0.5);
        text("🧑‍🌾", player.x, player.y - d * 0.05);
    }
}

function drawHud() {
    // Bandeau horloge (haut centre)
    var label = "Jour " + Engine.Clock.day + " — " + Engine.Clock.timeString();
    textSize(u(3.2));
    var w = textWidth(label) + u(6);
    fill(C.colors.hudPanel);
    rect(width / 2 - w / 2, u(2), w, u(6), u(1.5));
    fill(C.colors.hudText);
    text(label, width / 2, u(2) + u(3));

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

    // Barre d'outils (bas centre) — 5 slots cliquables
    drawToolbar();

    // Popup de choix de portail
    drawPortalChoice();
}

/* Barre d'outils : 5 slots en bas de l'écran, centrés.
   Chaque slot affiche l'emoji de l'outil + fond coloré si sélectionné.
   Un seul outil sélectionné à la fois (toggle au re-clic). */
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

        // Fond du slot
        if (isSelected) {
            fill(255, 215, 0, 220);  // doré pour l'outil sélectionné
        } else {
            fill(C.colors.hudPanel);
        }
        stroke(C.colors.hudText);
        strokeWeight(u(0.3));
        rect(x, y, slotSize, slotSize, u(1.5));
        noStroke();

        // Emoji de l'outil
        textSize(slotSize * 0.55);
        fill(isSelected ? 0 : C.colors.hudText);
        textAlign(CENTER, CENTER);
        text(tool.emoji, x + slotSize / 2, y + slotSize / 2);

        // Liseré de sélection
        if (isSelected) {
            noFill();
            stroke(255, 215, 0, 255);
            strokeWeight(u(0.5));
            rect(x, y, slotSize, slotSize, u(1.5));
            noStroke();
        }

        // Stocker la zone cliquable
        toolbarSlots.push({ x: x, y: y, w: slotSize, h: slotSize, tool: tool });
    }

    textAlign(CENTER, CENTER);
}

function inRect(mx, my, b) {
    return b && mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h;
}

function mousePressed() {
    // Bloquer les inputs pendant une transition
    if (zoneTransition) return;

    // Popup de choix : prioritaire sur tout
    if (portalChoice) {
        for (var i = 0; i < portalChoice.buttons.length; i++) {
            var b = portalChoice.buttons[i];
            if (inRect(mouseX, mouseY, b)) {
                portalChoice = null;
                switchToZone(b.zone, b.entry);
                return;
            }
        }
        // Clic hors des boutons = fermer la popup
        portalChoice = null;
        return;
    }

    // 1. HUD d'abord (coordonnées écran)
    if (inRect(mouseX, mouseY, zoomBtns.plus)) { Engine.Camera.zoomIn(); return; }
    if (inRect(mouseX, mouseY, zoomBtns.minus)) { Engine.Camera.zoomOut(); return; }

    // Barre d'outils : sélection d'outil
    for (var ti = 0; ti < toolbarSlots.length; ti++) {
        var slot = toolbarSlots[ti];
        if (inRect(mouseX, mouseY, slot)) {
            selectedTool = (selectedTool === slot.tool.id) ? null : slot.tool.id;
            return;
        }
    }

    // 2. Sinon, clic dans le monde
    var w = Engine.Camera.screenToWorld(mouseX, mouseY);
    var tile = Engine.Grid.toTile(w.x, w.y);
    if (!tile) return; // clic hors de la grille

    if (Engine.ActionZone.contains(player.tile(), tile)) {
        // Pivot d'interaction : DANS la zone -> action
        // Vérifier si c'est une tuile cultivable (farming Phase 02)
        if (soilSystem && soilSystem.isCultivable(tile.c, tile.r)) {
            var state = soilSystem.getState(tile.c, tile.r);
            if (state === 'empty') {
                // Labourer
                soilSystem.till(tile.c, tile.r);
                actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'till' };
            } else if (state === 'tilled') {
                // Planter (culture selon saison)
                var season = Engine.Clock.getSeason ? Engine.Clock.getSeason() : 'printemps';
                var crops = culturesData || [];
                var toPlant = null;
                for (var ci = 0; ci < crops.length; ci++) {
                    if (crops[ci].season === season) { toPlant = crops[ci]; break; }
                }
                if (toPlant) {
                    soilSystem.plant(tile.c, tile.r, toPlant.id);
                    cropGrowth.plant(tile.c, tile.r, toPlant.id, Engine.Clock.day);
                    actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'plant' };
                }
            } else if (state === 'planted') {
                if (!soilSystem.isWatered(tile.c, tile.r)) {
                    // Arroser
                    soilSystem.water(tile.c, tile.r);
                    actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'water' };
                } else if (cropGrowth && cropGrowth.isMature(tile.c, tile.r)) {
                    // Récolter
                    var cropId = cropGrowth.getCropId(tile.c, tile.r);
                    var cropData = cropId ? cropGrowth.getCropData(cropId) : null;
                    if (cropData && harvestSystem) {
                        harvestSystem.addToInventory(cropId, 1);
                        harvestSystem.addGold(cropData.sell || 0);
                    }
                    // Réinitialiser la tuile
                    soilSystem.till(tile.c, tile.r); // re-labourer (on remet à tilled pour simplifier)
                    cropGrowth.resetTile(tile.c, tile.r);
                    actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'harvest' };
                }
            }
            if (window.Engine && Engine.Save) Engine.Save.saveLocal();
        } else {
            actionFlash = { c: tile.c, r: tile.r, t: millis(), type: 'action' };
        }
    } else {
        // HORS zone -> déplacement avec contournement
        player.moveTo(tile.c, tile.r);
        var center = Engine.Grid.toWorld(tile.c, tile.r);
        moveMarker = { x: center.x, y: center.y, t: millis() };
    }
}

// --- Transition entre zones (ZoneLoader) ---

/* Déclenche une transition avec fondu vers une nouvelle zone. */
function switchToZone(zoneId, entryOverride) {
    if (!Engine.WorldZone || zoneTransition) return;
    zoneTransition = { phase: 'out', zoneId: zoneId, entryOverride: entryOverride, t: millis(), duration: 250 };
}

/* Affiche la popup de choix de portail (ascenseur, etc.). */
function showPortalChoice(portal) {
    if (!portal || !portal.choices) return;
    // Construire les boutons
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

/* Rendu de la popup de choix. Appelé dans drawHud(). */
function drawPortalChoice() {
    if (!portalChoice) return;

    // Fond sombre
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // Titre
    textSize(u(4));
    fill(255);
    text("Où aller ?", width / 2, height / 2 - u(20));

    // Boutons
    for (var i = 0; i < portalChoice.buttons.length; i++) {
        var b = portalChoice.buttons[i];
        fill(79, 70, 229, 230); // indigo semi-transparent
        rect(b.x, b.y, b.w, b.h, u(1.5));
        fill(255);
        textSize(u(3));
        text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
}

/* Rendu du fondu de transition. Appelé dans draw(). */
function drawZoneFade() {
    if (!zoneTransition) return;

    var elapsed = millis() - zoneTransition.t;
    var progress = min(elapsed / zoneTransition.duration, 1);
    var alpha = 0;

    if (zoneTransition.phase === 'out') {
        alpha = progress * 255;
        if (progress >= 1) {
            // Fin du fade-out : exécuter la transition
            Engine.WorldZone.switchZone(zoneTransition.zoneId, function (defaultEntry) {
                // Utiliser le point d'entrée override (portail) ou le défaut de la zone
                var entry = zoneTransition.entryOverride || defaultEntry;
                if (entry) {
                    // Normaliser col/row → c/r
                    var cc = typeof entry.c !== 'undefined' ? entry.c : entry.col;
                    var rr = typeof entry.r !== 'undefined' ? entry.r : entry.row;
                    if (typeof cc === 'number' && typeof rr === 'number') {
                        player.placeAt(cc, rr);
                        Engine.Camera.snapTo(player.x, player.y);
                    }
                }
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

    // Dessiner le fondu
    noStroke();
    fill(0, 0, 0, alpha);
    rect(0, 0, width, height);
}
