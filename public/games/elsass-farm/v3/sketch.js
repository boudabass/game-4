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

// Transition de zone (fondue)
let zoneTransition = null; // { phase: 'out'|'in', zoneId, entry, t, duration: 250 }

// Popup de choix de portail (ascenseur, etc.)
let portalChoice = null;   // { portal, buttons: [{label, zone, entry, x, y, w, h}] }

// Systèmes de culture (feuilles 531-534)
let soilSystem = null;     // Engine.SoilSystem
let cropGrowth = null;     // Engine.CropGrowth
let harvestSystem = null;  // Engine.HarvestSystem
let selectedTool = 'pelle'; // 'pelle' | 'graines' | 'arrosoir'
let toolCycle = ['pelle', 'graines', 'arrosoir'];

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

    // Charger les données de culture (pour les prix de vente)
    C._culturesData = loadJSON("data/cultures.json");
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

    // --- Systèmes de culture (feuilles 531-534) ---
    soilSystem = Engine.SoilSystem ? new Engine.SoilSystem() : null;
    cropGrowth = Engine.CropGrowth ? new Engine.CropGrowth() : null;
    harvestSystem = Engine.HarvestSystem ? new Engine.HarvestSystem() : null;

    // Parcelles cultivables depuis zones.json
    if (soilSystem && C._zonesData) {
        for (var zid in C._zonesData) {
            if (!C._zonesData.hasOwnProperty(zid)) continue;
            var zone = C._zonesData[zid];
            var tiles = zone.cultivableTiles;
            if (tiles && tiles.length) {
                for (var ti = 0; ti < tiles.length; ti++) {
                    soilSystem.setCultivable(tiles[ti].c, tiles[ti].r, true);
                }
            }
        }
    }

    // Brancher CropGrowth sur l'horloge

    // --- Caméra ---
    Engine.Camera.configure({ minZoom: 0.5, maxZoom: 2.2, zoom: 1 });
    Engine.Camera.setWorldBounds(Engine.Grid.worldWidth(), Engine.Grid.worldHeight());
    Engine.Camera.snapTo(player.x, player.y);

    // --- Horloge : 1 min réelle = 1 h en jeu, journée démarre à 7 h ---
    Engine.Clock.configure({
        startHour: 7,
        onNewDay: function (day) {
            if (cropGrowth) cropGrowth.onNewDay(day);
            if (window.Engine && Engine.Save) Engine.Save.save();
        }
    });

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
                // Sauvegarder l'état des systèmes de culture
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
                // Restaurer l'état des systèmes de culture
                if (data.soil && soilSystem) soilSystem.apply(data.soil);
                if (data.crops && cropGrowth) cropGrowth.apply(data.crops);
                if (data.harvest && harvestSystem) harvestSystem.apply(data.harvest);
            }
        });
        if (Engine.Loader) Engine.Loader.step("Chargement de la sauvegarde...");
        await Engine.Save.load();
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

function drawWorld() {
    // Sol en tuiles Tiny Farm (labour)
    drawGround();

    // Rendu de l'état du sol (système de culture)
    drawSoilState();

    // Décor Tiny Farm à la place des obstacles gray-box
    drawDecor();

    // Indicateurs visuels de portails (cercle pulsé + icône 🚪)
    drawPortalIndicators();

    // Grille de debug (surcouche, toggleable)
    Engine.Grid.drawDebug({ line: C.colors.gridLine, blocked: C.colors.blocked });

    // Marqueur de destination (s'estompe en 1 s)
    if (moveMarker && millis() - moveMarker.t < 1000) {
        var a = 1 - (millis() - moveMarker.t) / 1000;
        noFill();
        stroke("rgba(79,195,247," + a.toFixed(2) + ")");
        strokeWeight(3);
        circle(moveMarker.x, moveMarker.y, Engine.Grid.tileSize * 0.6);
        noStroke();
    }

    // Flash vert de la tuile "actionnée" (0,6 s)
    if (actionFlash && millis() - actionFlash.t < 600) {
        var s = Engine.Grid.tileSize;
        fill(C.colors.actionFlash);
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

/* Rendu de l'état du sol : labouré, planté, mature. */
function drawSoilState() {
    if (!soilSystem) return;
    var ts = Engine.Grid.tileSize;

    // Charger les sprites de cultures depuis Tiny Farm
    var sprites = {
        ble: img("decor", "farm_ble_mure"),
        asperge: img("decor", "farm_carotte_mure"),  // fallback visuel
        choux: img("decor", "farm_chou_mure"),
        default: img("decor", "farm_ble_pousse1")
    };

    // Parcourir toutes les cellules (optimisable : ne rendre que la zone visible)
    for (var c = 0; c < C.grid.cols; c++) {
        for (var r = 0; r < C.grid.rows; r++) {
            if (!soilSystem.isCultivable(c, r)) continue;

            var state = soilSystem.getState(c, r);
            if (!state || state === 'empty') continue;

            var x = c * ts, y = r * ts;

            if (state === 'tilled') {
                // Sol labouré : fond marron foncé
                fill(101, 67, 33, 140);
                noStroke();
                rect(x + 2, y + 2, ts - 4, ts - 4, 4);
            } else if (state === 'planted') {
                // Plante en croissance
                var stage = cropGrowth ? cropGrowth.getStage(c, r) : null;
                var cropId = soilSystem.getCropId(c, r);
                var spr = sprites[cropId] || sprites["default"];

                // Fond labouré
                fill(101, 67, 33, 120);
                noStroke();
                rect(x + 2, y + 2, ts - 4, ts - 4, 4);

                if (spr) {
                    // Ajuster la taille selon le stade
                    var growthRatio = stage ? 1 - (stage.daysRemaining / stage.growthDays) : 0.5;
                    var sprSize = ts * (0.35 + growthRatio * 0.5);
                    var ox = x + (ts - sprSize) / 2;
                    var oy = y + (ts - sprSize) / 2;
                    image(spr, ox, oy, sprSize, sprSize);
                }

                // Flash vert si mature
                if (stage && stage.mature) {
                    var flash = sin(millis() * 0.005) * 0.3 + 0.5;
                    fill(102, 187, 106, flash * 200);
                    noStroke();
                    rect(x + 2, y + 2, ts - 4, ts - 4, 4);
                }
            }

            // Goutte d'eau si arrosé
            if (soilSystem.isWatered(c, r)) {
                fill(66, 165, 245, 130);
                noStroke();
                circle(x + ts * 0.75, y + ts * 0.25, ts * 0.2);
            }
        }
    }
}

/* Rendu des indicateurs de portail : cercle pulsé + icône 🚪 sur chaque cellule de portail. */
function drawPortalIndicators() {
    if (!Engine.Portal || !Engine.WorldZone) return;

    var curZone = Engine.WorldZone.getCurrent();
    if (!curZone) return;

    var portals = Engine.Portal.getPortalsForZone(curZone.id);
    if (!portals || portals.length === 0) return;

    var ts = Engine.Grid.tileSize;

    for (var pi = 0; pi < portals.length; pi++) {
        var p = portals[pi];
        var cells = p.from && p.from.cells;
        if (!cells) continue;

        for (var ci = 0; ci < cells.length; ci++) {
            var cell = cells[ci];
            var cc = cell[0];
            var rr = cell[1];
            var cx = cc * ts + ts / 2;
            var cy = rr * ts + ts / 2;

            // Pulse animé : phase sinusoïdale basée sur le temps
            var pulse = sin(millis() * 0.003) * 0.2 + 0.7; // 0.5 à 0.9

            // Cercle coloré extérieur (pulsé)
            var alpha = pulse * 140;
            noStroke();

            // Cercle de fond (couleur selon type de portail)
            if (p.choices) {
                // Portail à choix (ascenseur) → violet
                fill(139, 92, 246, alpha);
            } else {
                // Portail simple → vert émeraude
                fill(52, 211, 153, alpha);
            }
            circle(cx, cy, ts * 0.6 * pulse);

            // Anneau lumineux
            noFill();
            strokeWeight(2);
            if (p.choices) {
                stroke(167, 139, 250, pulse * 200);
            } else {
                stroke(110, 231, 183, pulse * 200);
            }
            circle(cx, cy, ts * 0.55 * pulse);
            noStroke();

            // Icône 🚪 centrée
            fill(255, 255, 255, 230);
            textSize(ts * 0.5);
            textAlign(CENTER, CENTER);
            text("🚪", cx, cy);
        }
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

    // Test emoji (bas gauche) — vérifier le rendu sur Windows/Android/iOS
    textSize(u(2.2));
    fill(C.colors.hudPanel);
    rect(u(2), height - u(9), u(34), u(7), u(1.5));
    fill(C.colors.hudText);
    textAlign(LEFT, CENTER);
    text("test emoji : 🧑‍🌾 🥕 🐔 🐟 💎", u(4), height - u(5.5));
    textAlign(CENTER, CENTER);

    // Outil sélectionné + or (bas centre-gauche)
    var toolLabel = "🔧 " + selectedTool;
    var goldLabel = harvestSystem ? "💰 " + harvestSystem.getGold() + "g" : "💰 0g";
    textSize(u(2.2));
    var tw = textWidth(toolLabel) + u(6);
    fill(C.colors.hudPanel);
    rect(u(38), height - u(9), tw + u(20), u(7), u(1.5));
    fill(C.colors.hudText);
    textAlign(LEFT, CENTER);
    text(toolLabel + "    " + goldLabel, u(40), height - u(5.5));
    textAlign(CENTER, CENTER);

    // Popup de choix de portail
    drawPortalChoice();
}

function inRect(mx, my, b) {
    return b && mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h;
}

/* Cycle entre les outils : pelle → graines → arrosoir → pelle */
function cycleTool() {
    var idx = toolCycle.indexOf(selectedTool);
    selectedTool = toolCycle[(idx + 1) % toolCycle.length];
}

/* Changement d'outil au clavier (touches 1,2,3) */
function keyPressed() {
    if (zoneTransition || portalChoice) return;
    if (key === '1') selectedTool = 'pelle';
    if (key === '2') selectedTool = 'graines';
    if (key === '3') selectedTool = 'arrosoir';
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

    // 2. Sinon, clic dans le monde
    var w = Engine.Camera.screenToWorld(mouseX, mouseY);
    var tile = Engine.Grid.toTile(w.x, w.y);
    if (!tile) return; // clic hors de la grille

    if (Engine.ActionZone.contains(player.tile(), tile)) {
        // Pivot d'interaction : DANS la zone -> action (outil ou récolte)
        var acted = false;

        // Priorité : récolter si mature (peu importe l'outil)
        if (cropGrowth && harvestSystem && cropGrowth.isMature(tile.c, tile.r)) {
            var harvested = cropGrowth.harvest(tile.c, tile.r);
            if (harvested) {
                harvestSystem.addToInventory(harvested.cropId, 1);
                // Vente automatique simplifiée (sera remplacée par interaction PNJ)
                if (C._culturesData && C._culturesData[harvested.cropId]) {
                    var cropDef = C._culturesData[harvested.cropId];
                    harvestSystem.sell(harvested.cropId, 1, cropDef.sell);
                }
                // Nettoyer le sol après récolte
                if (soilSystem) {
                    soilSystem.till(tile.c, tile.r); // retour à l'état labouré
                }
                actionFlash = { c: tile.c, r: tile.r, t: millis() };
                acted = true;
            }
        }

        // Actions avec outil
        if (!acted && soilSystem) {
            var state = soilSystem.getState(tile.c, tile.r);

            if (selectedTool === 'pelle' && state === 'empty') {
                soilSystem.till(tile.c, tile.r);
                actionFlash = { c: tile.c, r: tile.r, t: millis() };
                acted = true;
            } else if (selectedTool === 'graines' && state === 'tilled') {
                // Plante du blé par défaut (MVP)
                soilSystem.plant(tile.c, tile.r, 'ble');
                if (cropGrowth) {
                    // Charger les données de culture si disponibles
                    var cd = C._culturesData && C._culturesData['ble'] ? C._culturesData['ble'] : { id: 'ble', growthDays: 4 };
                    cropGrowth.register(tile.c, tile.r, cd);
                }
                actionFlash = { c: tile.c, r: tile.r, t: millis() };
                acted = true;
            } else if (selectedTool === 'arrosoir' && (state === 'tilled' || state === 'planted')) {
                soilSystem.water(tile.c, tile.r);
                actionFlash = { c: tile.c, r: tile.r, t: millis() };
                acted = true;
            }
        }

        // Cycle d'outil si clic sur une cellule déjà travaillée sans action possible
        if (!acted) {
            cycleTool();
        }

        if (acted && window.Engine && Engine.Save) {
            Engine.Save.saveLocal();
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
