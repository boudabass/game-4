Serveur.">
// core/SaveManager.js
// Gestion de la persistance (Local + Serveur/DB)

window.SaveManager = {
    // Clé de sauvegarde locale
    SAVE_KEY: 'elsass-farm-save',

    // Sauvegarde l'état actuel
    // Note : Retrait du 'async' pour garantir l'exécution immédiate du localStorage
    save: function () {
        console.log("💾 Début procédure sauvegarde...");
        
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

        // 1. Sauvegarde Locale (PRIORITÉ ABSOLUE - SYNCHRONE)
        try {
            const json = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, json);
            console.log("✅ Sauvegarde locale effectuée (LocalStorage).");
        } catch (e) {
            console.error("❌ Erreur critique sauvegarde locale:", e);
        }

        // 2. Sauvegarde Serveur (Asynchrone - "Fire and Forget")
        const gameId = window.DyadGame ? window.DyadGame.id : null;
        if (gameId) {
            fetch('/api/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: gameId,
                    data: saveData
                })
            })
            .then(res => {
                if (res.ok) console.log("☁️ Sauvegarde serveur (db.json) synchronisée.");
                else console.warn("⚠️ Échec sauvegarde serveur.");
            })
            .catch(e => console.error("Erreur connexion serveur:", e));
        }

        return true;
    },

    // Charge une sauvegarde existante
    // Logique : 1. Local ? -> Charger. 2. Sinon Serveur ? -> Charger + Créer Local.
    load: async function () {
        console.log("📂 Tentative de chargement...");
        const gameId = window.DyadGame ? window.DyadGame.id : null;

        // ÉTAPE 1 : Vérification LocalStorage (Priorité Vitesse & Hors-ligne)
        try {
            const localStr = localStorage.getItem(this.SAVE_KEY);
            if (localStr) {
                const saveData = JSON.parse(localStr);
                console.log("💾 Sauvegarde locale trouvée et chargée.");
                this.applyData(saveData);
                return true; // On s'arrête là, le local fait foi
            }
        } catch (e) {
            console.warn("⚠️ Erreur lecture LocalStorage:", e);
        }

        // ÉTAPE 2 : Si rien en local, tentative Serveur (Récupération / Synchro)
        if (gameId) {
            console.log("☁️ Aucune save locale, recherche sur serveur...");
            try {
                const res = await fetch(`/api/storage?gameId=${gameId}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.data) {
                        console.log("☁️ Sauvegarde serveur trouvée !");
                        
                        // APPLICATION
                        this.applyData(json.data);

                        // SYNCHRONISATION : On recrée le cache local immédiatement
                        localStorage.setItem(this.SAVE_KEY, JSON.stringify(json.data));
                        console.log("🔄 Synchronisation : Sauvegarde restaurée en local.");
                        return true;
                    }
                }
            } catch (e) {
                console.warn("⚠️ Impossible de joindre le serveur pour la récupération.");
            }
        }

        console.log("📂 Aucune sauvegarde trouvée nulle part (Nouveau jeu).");
        return false;
    },

    // Applique les données au jeu
    applyData: function (saveData) {
        if (!saveData) return;

        // Restaurer l'état
        if (saveData.energy !== undefined) GameState.energy = saveData.energy;
        if (saveData.gold !== undefined) GameState.gold = saveData.gold;
        if (saveData.day !== undefined) GameState.day = saveData.day;
        if (saveData.hour !== undefined) GameState.hour = saveData.hour;
        if (saveData.minute !== undefined) GameState.minute = saveData.minute;
        if (saveData.season !== undefined) GameState.season = saveData.season;
        if (saveData.currentZoneId !== undefined) GameState.currentZoneId = saveData.currentZoneId;

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

    // Supprime la sauvegarde locale
    clear: function () {
        localStorage.removeItem(this.SAVE_KEY);
        console.log("🗑️ Sauvegarde locale effacée");
    },

    // Vérifie si une sauvegarde existe (localement)
    hasSave: function () {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
};

console.log("✅ SaveManager.js chargé");