/*
 * GameSystem Hub
 * Ce script est chargé par tous les jeux.
 * Il centralise la communication avec le backend et les utilitaires communs.
 */

(function () {
    console.log("🔌 GameSystem Hub Loaded");

    // 1. Validation de la configuration
    const config = window.DyadGame || window.__GAME_CONFIG__;

    if (!config) {
        console.error("❌ GameSystem Error: Configuration not found.");
        return;
    }

    console.log(`🎮 Game Detected: ${config.id} (${config.version})`);

    // 2. Définition du Namespace Standard
    window.GameSystem = {
        config: config,

        // Module Score (Legacy & Leaderboard)
        Score: {
            submit: async (score, playerName = 'Joueur') => {
                console.log(`[GameSystem] 📤 Sending Score: ${score}`);
                try {
                    const res = await fetch('/api/scores', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            gameId: config.id,
                            playerName,
                            score
                        })
                    });
                    return res.ok;
                } catch (e) {
                    console.error("[GameSystem] ❌ Error saving score:", e);
                    return false;
                }
            },
            getLeaderboard: async () => {
                try {
                    const res = await fetch('/api/scores?gameId=' + config.id);
                    return await res.json();
                } catch (e) { return []; }
            }
        },

        // --- NOUVEAU MODULE : SAUVEGARDE (JSON) ---
        Save: {
            // Écrire une sauvegarde complète
            write: async (gameData) => {
                console.log(`[GameSystem] 💾 Saving Data...`);
                try {
                    const res = await fetch('/api/storage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            gameId: config.id,
                            data: gameData
                        })
                    });
                    
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    console.log("[GameSystem] ✅ Save successful.");
                    
                    // Petit feedback visuel si l'UI système est là
                    const btn = document.getElementById('dyad-menu-btn');
                    if(btn) {
                        const original = btn.innerText;
                        btn.innerText = "💾";
                        setTimeout(() => btn.innerText = original, 1000);
                    }
                    
                    return true;
                } catch (e) {
                    console.error("[GameSystem] ❌ Save failed:", e);
                    return false;
                }
            },

            // Lire la sauvegarde
            read: async () => {
                console.log(`[GameSystem] 📂 Loading Data...`);
                try {
                    const res = await fetch('/api/storage?gameId=' + config.id);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    
                    const json = await res.json();
                    if (!json.data) {
                        console.log("[GameSystem] ℹ️ No save found (New Game).");
                        return null;
                    }
                    
                    console.log(`[GameSystem] ✅ Data loaded (from ${new Date(json.updatedAt).toLocaleTimeString()})`);
                    return json.data;
                } catch (e) {
                    console.error("[GameSystem] ❌ Load failed:", e);
                    return null;
                }
            }
        },

        // Module Affichage
        Display: {
            toggleFullscreen: () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(e => console.error(e));
                } else {
                    if (document.exitFullscreen) document.exitFullscreen();
                }
            }
        },

        // Module Cycle de Vie
        Lifecycle: {
            notifyReady: () => {
                console.log("[GameSystem] Game Ready Signal Sent.");
                // Cache un éventuel loader HTML si présent
                const loader = document.getElementById('dyad-loader');
                if(loader) loader.style.display = 'none';
            }
        }
    };

    // UI Système (Overlay Menu)
    function injectSystemUI() {
        if (document.getElementById('dyad-system-ui')) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #dyad-system-ui { position: absolute; top: 0; left: 0; width: 100%; height: 0; z-index: 9999; pointer-events: none; font-family: sans-serif; }
            .dyad-btn { pointer-events: auto; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 8px 12px; cursor: pointer; font-size: 20px; }
            .dyad-btn:hover { background: rgba(0,0,0,0.8); }
            #dyad-menu-btn { position: absolute; top: 10px; left: 10px; }
            #dyad-menu-overlay { pointer-events: auto; display: none; position: absolute; top: 50px; left: 10px; background: rgba(20,20,20,0.95); border: 1px solid #444; border-radius: 8px; padding: 10px; min-width: 150px; flex-direction: column; gap: 5px; }
            .dyad-menu-item { background: transparent; border: none; color: #ddd; text-align: left; padding: 8px; cursor: pointer; font-size: 14px; }
            .dyad-menu-item:hover { background: rgba(255,255,255,0.1); color: white; }
        `;
        document.head.appendChild(style);

        const container = document.createElement('div');
        container.id = 'dyad-system-ui';
        container.innerHTML = `
            <button id="dyad-menu-btn" class="dyad-btn">☰</button>
            <div id="dyad-menu-overlay">
                <button class="dyad-menu-item" id="dyad-fs-btn">⛶ Plein Écran</button>
                <button class="dyad-menu-item" id="dyad-close-menu">Fermer Menu</button>
            </div>
        `;
        document.body.appendChild(container);

        const menuBtn = document.getElementById('dyad-menu-btn');
        const overlay = document.getElementById('dyad-menu-overlay');
        const fsBtn = document.getElementById('dyad-fs-btn');
        const closeBtn = document.getElementById('dyad-close-menu');

        const toggleMenu = () => {
            overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
        };

        menuBtn.onclick = toggleMenu;
        closeBtn.onclick = toggleMenu;
        fsBtn.onclick = () => {
            window.GameSystem.Display.toggleFullscreen();
            toggleMenu();
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectSystemUI);
    } else {
        injectSystemUI();
    }
})();