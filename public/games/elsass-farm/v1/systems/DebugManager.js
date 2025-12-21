// systems/DebugManager.js
// Gestion avancée du Debug (Onglets + Actions)

window.DebugManager = {
    activeTab: 'general',

    // Change l'onglet actif
    switchTab: function (tabId) {
        this.activeTab = tabId;

        // Mettre à jour les boutons
        document.querySelectorAll('.debug-tabs .hud-btn').forEach(btn => {
            btn.classList.remove('active');
            // Style basique pour actif/inactif
            btn.style.background = btn.id === `tab-${tabId}` ? '#e74c3c' : '#34495e';
        });

        // Masquer tous les panneaux
        document.querySelectorAll('.debug-panel').forEach(p => p.style.display = 'none');

        // Afficher le bon
        const panel = document.getElementById(`panel-${tabId}`);
        if (panel) panel.style.display = 'block';

        // Rafraichir les infos si besoin
        this.refreshPanel(tabId);
    },

    // Rafraîchit les données de l'onglet actif
    refreshPanel: function (tabId) {
        if (tabId === 'time') {
            const display = document.getElementById('dbg-time-display');
            if (display && window.TimeManager && window.GameState) {
                const h = String(GameState.hour).padStart(2, '0');
                const m = String(GameState.minute).padStart(2, '0');
                display.innerText = `Jour ${GameState.day} - ${h}:${m} - ${GameState.season}`;
            }
        }
    },

    // Exécute une action de debug
    action: function (actionName) {
        console.log(`🔧 Debug Action: ${actionName}`);

        switch (actionName) {
            // --- TIME ---
            case 'addHour':
                if (window.TimeManager) TimeManager.advanceMinutes(60);
                break;
            case 'nextDay':
                if (window.TimeManager) TimeManager.sleep(); // Simule le sommeil donc passage nuit
                break;
            case 'nextSeason':
                if (window.TimeManager) TimeManager.advanceSeason();
                break;

            // --- FARMING ---
            case 'waterAll':
                if (window.GridSystem) {
                    const grid = GridSystem.getActiveGrid();
                    grid.forEach(tile => {
                        if (tile.state !== GridSystem.STATES.EMPTY) tile.watered = true;
                    });
                    console.log("💧 Tout a été arrosé !");
                }
                break;
            case 'growAll':
                // Force +1 growthStage partout
                if (window.GridSystem) {
                    const grid = GridSystem.getActiveGrid();
                    grid.forEach(tile => {
                        if (tile.state === GridSystem.STATES.PLANTED || tile.state === GridSystem.STATES.GROWING) {
                            tile.growthStage = (tile.growthStage || 0) + 1;
                            if (tile.growthStage >= GridSystem.GROWTH_DURATION) tile.state = GridSystem.STATES.READY;
                            else if (tile.growthStage > 0) tile.state = GridSystem.STATES.GROWING;
                        }
                    });
                    console.log("🌱 Croissance forcée (+1)");
                }
                break;
            case 'instantReady':
                if (window.GridSystem) {
                    const grid = GridSystem.getActiveGrid();
                    grid.forEach(tile => {
                        if (tile.state === GridSystem.STATES.PLANTED || tile.state === GridSystem.STATES.GROWING) {
                            tile.state = GridSystem.STATES.READY;
                            tile.growthStage = GridSystem.GROWTH_DURATION;
                        }
                    });
                    console.log("🚜 Tout est prêt !");
                }
                break;
            case 'clearField':
                if (window.GridSystem) {
                    const grid = GridSystem.getActiveGrid();
                    grid.forEach(tile => {
                        tile.state = GridSystem.STATES.EMPTY;
                        tile.watered = false;
                        tile.growthStage = 0;
                        tile.seedType = null;
                    });
                    console.log("🔥 Champ rasé !");
                }
                break;

            // --- INVENTAIRE ---
            case 'addSeeds':
                if (window.cheatSeeds) window.cheatSeeds(); // Utilise la fonction existante
                break;
            case 'addGold':
                if (window.cheatGold) window.cheatGold();
                break;
            case 'maxEnergy':
                if (window.cheatFullEnergy) window.cheatFullEnergy();
                break;
            case 'clearInv':
                if (window.Inventory) {
                    // Reset seeds to 0 needed? Maybe drastic.
                    console.log("⚠️ Clear Inv non implémenté pour sécurité");
                }
                break;
        }

        // Rafraichir le HUD après action
        if (window.refreshHUD) window.refreshHUD();
        this.refreshPanel(this.activeTab); // Rafraichir le panneau debug aussi
    },

    // Met à jour la console (Appelé par sketch.js draw loop) - Garder la fonction existante
    updateInfo: function (info) {
        // Rafraichir aussi les infos temps réel de l'onglet actif si nécessaire
        if (this.activeTab === 'time') this.refreshPanel('time');

        const debugContent = document.getElementById('debug-content');
        if (debugContent && this.activeTab === 'general') {
            debugContent.innerHTML = `
                <strong>--- GAME STATE ---</strong><br>
                Zone ID: ${info.zoneId}<br>
                Zone Name: ${info.zoneName}<br>
                <br>
                <strong>--- CAMERA ---</strong><br>
                Zoom: ${info.zoom.toFixed(2)}<br>
                Cam X: ${Math.round(info.camX)}<br>
                Cam Y: ${Math.round(info.camY)}<br>
                <br>
                <strong>--- MOUSE (WORLD) ---</strong><br>
                World X: ${Math.round(info.worldX)}<br>
                World Y: ${Math.round(info.worldY)}<br>
                <br>
                <strong>--- INPUT ---</strong><br>
                Mouse Pressed: ${info.mousePressed ? 'TRUE' : 'FALSE'}<br>
                Mouse Y: ${info.mouseY}<br>
            `;
        }
    },

    // Met à jour le texte du bouton Toggle Grid
    updateGridButton: function () {
        const btn = document.getElementById('toggle-grid-btn');
        if (btn) {
            btn.innerText = `Toggle Grid (${Config.showGrid ? 'ON' : 'OFF'})`;
        }
    }
};