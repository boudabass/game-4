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

                    // Petit feedback visuel ignoré car le menu est supprimé
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
                if (loader) loader.style.display = 'none';
            }
        }
    };

})();