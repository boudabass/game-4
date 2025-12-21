// core/SaveManager.js
// Gestion de la persistance (Local + Serveur/DB)

window.SaveManager = {
    // Clé de sauvegarde locale
    SAVE_KEY: 'elsass-farm-save',

    // Sauvegarde l'état actuel
    save: async function () {
        const saveData = {
            // État du joueur
            energy: GameState.energy,
            gold: GameState.gold,

            // Temps
            day: GameState.day,
            hour: GameState.hour,
            minute: GameState.minute,
            season: GameState.season,

            // Position
            currentZoneId: GameState.currentZoneId,

            // Grilles de farming
            grids: window.GridSystem ? GridSystem.export() : {},

            // Inventaire
            inventory: window.Inventory ? Inventory.export() : {},

            // Métadonnées
            savedAt: new Date().toISOString(),
            version: '1.1'
        };

        // 1. Sauvegarde Locale (Instantanée & Secours)
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log("💾 Sauvegarde locale effectuée.");
        } catch (e) {
            console.error("Erreur sauvegarde locale:", e);
        }

        // 2. Sauvegarde Serveur (Vers db.json)
        const gameId = window.DyadGame ? window.DyadGame.id : null;
        if (gameId) {
            try {
                // On ne met pas 'await' bloquant pour ne pas figer le jeu, 
                // mais on lance la requête
                fetch('/api/storage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gameId: gameId,
                        data: saveData
                    })
                }).then(res => {
                    if (res.ok) console.log("☁️ Sauvegarde serveur (db.json) réussie.");
                    else console.warn("⚠️ Échec sauvegarde serveur.");
                });
            } catch (e) {
                console.error("Erreur connexion serveur:", e);
            }
        }

        return true;
    },

    // Charge une sauvegarde existante
    load: async function () {
        let saveData = null;
        const gameId = window.DyadGame ? window.DyadGame.id : null;

        console.log("📂 Tentative de chargement...");

        // 1. Tenter de charger depuis le Serveur (Priorité à la persistance cross-device)
        if (gameId) {
            try {
                const res = await fetch(`/api/storage?gameId=${gameId}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.data) {
                        saveData = json.data;
                        console.log("☁️ Données chargées depuis le serveur.");
                    }
                }
            } catch (e) {
                console.warn("⚠️ Impossible de joindre le serveur, repli sur local.");
            }
        }

        // 2. Si pas de save serveur, tenter le LocalStorage
        if (!saveData) {
            const stored = localStorage.getItem(this.SAVE_KEY);
            if (stored) {
                saveData = JSON.parse(stored);
                console.log("💾 Données chargées depuis le localStorage.");
            }
        }

        // 3. Application des données
        if (saveData) {
            this.applyData(saveData);
            return true;
        }

        console.log("📂 Aucune sauvegarde trouvée (Nouveau jeu).");
        return false;
    },

    // Applique les données au jeu
    applyData: function (saveData) {
        // Restaurer l'état
        GameState.energy = saveData.energy ?? 100;
        GameState.gold = saveData.gold ?? 0;
        GameState.day = saveData.day ?? 1;
        GameState.hour = saveData.hour ?? 6;
        GameState.minute = saveData.minute ?? 0;
        GameState.season = saveData.season ?? 'SPRING';
        GameState.currentZoneId = saveData.currentZoneId ?? 'C_C';

        // Restaurer les grilles de farming
        if (saveData.grids && window.GridSystem) {
            GridSystem.import(saveData.grids);
        }

        // Restaurer l'inventaire
        if (saveData.inventory && window.Inventory) {
            Inventory.import(saveData.inventory);
        }

        // Rafraîchir le HUD
        if (window.refreshHUD) window.refreshHUD();
    },

    // Supprime la sauvegarde
    clear: function () {
        localStorage.removeItem(this.SAVE_KEY);
        // Note: On ne supprime pas encore côté serveur pour sécurité
        console.log("🗑️ Sauvegarde locale effacée");
    },

    // Vérifie si une sauvegarde existe (localement pour l'instant pour la rapidité UI)
    hasSave: function () {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
};

console.log("✅ SaveManager.js chargé");