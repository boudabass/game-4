// core/SaveManager.js
// Gestion de la persistance (Local + Serveur/DB)

window.SaveManager = {
    // Clé de sauvegarde locale
    SAVE_KEY: 'elsass-farm-save',

    // --- 1. SAUVEGARDE LOCALE (Fréquente) ---
    // Appelé par le sommeil, le changement de zone, etc.
    save: function () {
        console.log("💾 Sauvegarde Locale en cours...");
        
        const saveData = this._gatherData();

        try {
            const json = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, json);
            console.log("✅ Sauvegarde Locale OK (LocalStorage).");
            return true;
        } catch (e) {
            console.error("❌ Erreur sauvegarde locale:", e);
            return false;
        }
    },

    // --- 2. SAUVEGARDE CLOUD (Fermeture) ---
    // Appelé uniquement quand on quitte le jeu
    saveToCloud: async function () {
        console.log("☁️ Envoi vers la DB (Cloud)...");
        const gameId = window.DyadGame ? window.DyadGame.id : null;
        
        if (!gameId) {
            console.warn("⚠️ Pas d'ID de jeu, impossible de sauvegarder en cloud.");
            return;
        }

        // On s'assure d'avoir la dernière version des données
        const saveData = this._gatherData();

        try {
            await fetch('/api/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId: gameId,
                    data: saveData
                })
            });
            console.log("✅ Sauvegarde Cloud OK (DB Synchronisée).");
        } catch (e) {
            console.error("❌ Erreur sauvegarde Cloud:", e);
        }
    },

    // --- 3. CHARGEMENT (Algorithme Prioritaire) ---
    load: async function () {
        console.log("📂 Procédure de chargement...");
        
        // Étape 1 : Vérification Local Storage
        let localJson = localStorage.getItem(this.SAVE_KEY);

        // Étape 1-B : Si pas de local, Synchro avec la DB
        if (!localJson) {
            console.log("⚠️ Aucune sauvegarde locale. Recherche Cloud...");
            const cloudData = await this._fetchFromCloud();
            
            if (cloudData) {
                console.log("☁️ Sauvegarde Cloud trouvée. Restauration...");
                // Création de la save en local (Synchro)
                localJson = JSON.stringify(cloudData);
                localStorage.setItem(this.SAVE_KEY, localJson);
            }
        }

        // Étape 2 : Chargement effectif (si données trouvées)
        if (localJson) {
            try {
                const saveData = JSON.parse(localJson);
                this.applyData(saveData);
                console.log("✅ Jeu chargé avec succès (Progression existante).");
                return true;
            } catch (e) {
                console.error("❌ Erreur lecture sauvegarde locale:", e);
            }
        }

        // Étape 3 : CAS NOUVEAU JOUEUR (Rien nul part)
        // Si on arrive ici, c'est que c'est la toute première partie.
        console.log("🆕 Nouveau Joueur détecté. Initialisation de la sauvegarde...");
        
        // On force une première sauvegarde des valeurs par défaut
        // 1. En local pour que le jeu fonctionne tout de suite
        this.save();
        // 2. En cloud pour que le joueur existe en base (sécurité crash)
        this.saveToCloud();

        return true;
    },

    // --- Utilitaires Internes ---

    // Récupère toutes les données du jeu pour créer l'objet de sauvegarde
    _gatherData: function() {
        return {
            energy: GameState.energy,
            gold: GameState.gold,
            day: GameState.day,
            hour: GameState.hour,
            minute: GameState.minute,
            season: GameState.season,
            currentZoneId: GameState.currentZoneId,
            grids: window.GridSystem ? GridSystem.export() : {},
            inventory: window.Inventory ? Inventory.export() : {},
            savedAt: new Date().toISOString(),
            version: '1.2'
        };
    },

    // Récupère les données brutes depuis l'API
    _fetchFromCloud: async function() {
        const gameId = window.DyadGame ? window.DyadGame.id : null;
        if (!gameId) return null;

        try {
            const res = await fetch(`/api/storage?gameId=${gameId}`);
            if (res.ok) {
                const json = await res.json();
                return json.data;
            }
        } catch (e) {
            console.error("Erreur réseau Cloud:", e);
        }
        return null;
    },

    applyData: function (saveData) {
        if (!saveData) return;
        if (saveData.energy !== undefined) GameState.energy = saveData.energy;
        if (saveData.gold !== undefined) GameState.gold = saveData.gold;
        if (saveData.day !== undefined) GameState.day = saveData.day;
        if (saveData.hour !== undefined) GameState.hour = saveData.hour;
        if (saveData.minute !== undefined) GameState.minute = saveData.minute;
        if (saveData.season !== undefined) GameState.season = saveData.season;
        if (saveData.currentZoneId !== undefined) GameState.currentZoneId = saveData.currentZoneId;

        if (saveData.grids && window.GridSystem) GridSystem.import(saveData.grids);
        if (saveData.inventory && window.Inventory) Inventory.import(saveData.inventory);

        if (window.refreshHUD) window.refreshHUD();
    },

    clear: function () {
        localStorage.removeItem(this.SAVE_KEY);
        console.log("🗑️ Sauvegarde locale effacée");
    }
};

console.log("✅ SaveManager.js chargé");