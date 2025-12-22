// core/SaveManager.js
// Gestion de la persistance (Local + Serveur/DB)

window.SaveManager = {
    // Clé de sauvegarde locale
    SAVE_KEY: 'elsass-farm-save',

    // --- 1. SAUVEGARDE LOCALE (Fréquente) ---
    save: function () {
        if (window.LoadingManager) LoadingManager.updateStatus("Sauvegarde locale...");
        
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
    saveToCloud: async function () {
        if (window.LoadingManager) LoadingManager.updateStatus("Synchronisation Cloud...");
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
        if (window.LoadingManager) LoadingManager.advanceStep("Démarrage du processus de chargement...");
        
        const gameId = window.DyadGame ? window.DyadGame.id : null;
        if (!gameId) {
            console.error("ID de jeu manquant. Arrêt du chargement.");
            return;
        }

        // Étape 1 : Récupération des deux sources
        if (window.LoadingManager) LoadingManager.advanceStep("Vérification du cache local...");
        let localSave = this._getLocalStorageData();
        
        if (window.LoadingManager) LoadingManager.advanceStep("Interrogation de la sauvegarde Cloud...");
        let cloudSave = await this._fetchFromCloud();
        
        if (window.LoadingManager) LoadingManager.advanceStep("Analyse des données de persistance...");

        let finalSaveData = null;
        let source = 'NEW';

        // Étape 2 : Détermination de la Source de Vérité
        const localTime = localSave ? new Date(localSave.savedAt).getTime() : 0;
        const cloudTime = cloudSave ? new Date(cloudSave.savedAt).getTime() : 0;

        if (localTime > cloudTime) {
            // Local est plus récent ou égal (priorité au local si égal pour éviter l'écriture)
            finalSaveData = localSave;
            source = 'LOCAL';
            if (window.LoadingManager) LoadingManager.advanceStep(`Cache local (${new Date(localTime).toLocaleTimeString()}) est le plus récent.`);
        } else if (cloudTime > 0) {
            // Cloud est plus récent
            finalSaveData = cloudSave;
            source = 'CLOUD';
            if (window.LoadingManager) LoadingManager.advanceStep(`Sauvegarde Cloud (${new Date(cloudTime).toLocaleTimeString()}) est plus récente.`);
            
            // Écraser le local avec le cloud pour synchronisation
            if (window.LoadingManager) LoadingManager.advanceStep("Synchronisation du cache local avec le Cloud.");
            this._setLocalStorageData(cloudSave);
        } else if (localTime > 0) {
            // Cloud n'existe pas, mais local existe (joueur hors ligne ou première partie)
            finalSaveData = localSave;
            source = 'LOCAL_FALLBACK';
            if (window.LoadingManager) LoadingManager.advanceStep("Utilisation du cache local (Cloud non trouvé).");
        } else {
            // Rien n'existe
            if (window.LoadingManager) LoadingManager.advanceStep("Nouvelle partie détectée. Initialisation des valeurs par défaut.");
            GameState.reset(); // Assurer que GameState est aux valeurs par défaut
            source = 'NEW';
        }
        
        // Étape 3 : Application des données
        if (finalSaveData) {
            if (window.LoadingManager) LoadingManager.advanceStep(`Application des données de la source ${source}...`);
            this.applyData(finalSaveData);
        }

        // Étape 4 : Finalisation
        if (source === 'NEW') {
            // Si c'est une nouvelle partie, on force une première sauvegarde Cloud
            if (window.LoadingManager) LoadingManager.advanceStep("Création de la première entrée Cloud...");
            this.saveToCloud();
        }
        
        if (window.LoadingManager) LoadingManager.advanceStep("Chargement des données terminé.");
        
        // Le LoadingManager.finishLoading() sera appelé dans main.js après l'initialisation des autres modules.
        return true;
    },

    // --- Utilitaires Internes ---

    _getLocalStorageData: function() {
        const localJson = localStorage.getItem(this.SAVE_KEY);
        if (localJson) {
            try {
                return JSON.parse(localJson);
            } catch (e) {
                console.error("Erreur lecture JSON local:", e);
                return null;
            }
        }
        return null;
    },

    _setLocalStorageData: function(data) {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Erreur écriture JSON local:", e);
        }
    },

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
            version: '1.3' // Mise à jour de la version de sauvegarde
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
                // La DB renvoie { data: {...}, updatedAt: "..." }
                if (json.data) {
                    // On ajoute l'horodatage du serveur pour la comparaison
                    json.data.savedAt = json.updatedAt; 
                    return json.data;
                }
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