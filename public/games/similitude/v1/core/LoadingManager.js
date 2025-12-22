// core/LoadingManager.js
// Gère la barre de progression et les messages de statut pendant le chargement initial.

window.LoadingManager = {
    MAX_STEPS: 50,
    currentStep: 0,
    statusMessage: "Initialisation...",
    
    // Met à jour le statut et avance la barre de progression
    advanceStep: function (message) {
        this.currentStep = Math.min(this.currentStep + 1, this.MAX_STEPS);
        if (message) {
            this.statusMessage = message;
        }
        this.updateDisplay(true); // true pour ajouter à l'historique
    },

    // Met à jour uniquement le message de statut
    updateStatus: function (message) {
        if (message) {
            this.statusMessage = message;
        }
        this.updateDisplay(false); // false pour ne pas ajouter à l'historique (seulement pour les messages temporaires)
    },

    // Met à jour l'affichage DOM
    updateDisplay: function (addToHistory) {
        const historyEl = document.getElementById('loading-history');
        const barEl = document.getElementById('loading-progress-fill');
        const progress = (this.currentStep / this.MAX_STEPS) * 100;
        
        const message = `[${this.currentStep}/${this.MAX_STEPS}] ${this.statusMessage}`;

        if (historyEl && addToHistory) {
            const p = document.createElement('p');
            p.innerText = message;
            
            // Ajouter une classe de succès si l'étape est terminée
            if (this.statusMessage.startsWith('✅')) {
                p.classList.add('step-success');
            }
            
            historyEl.appendChild(p);
            // Scroll automatique vers le bas
            historyEl.scrollTop = historyEl.scrollHeight;
        }
        
        if (barEl) {
            barEl.style.width = `${progress}%`;
        }
    },

    // Masque l'écran de chargement et démarre le jeu
    finishLoading: function () {
        this.advanceStep("Chargement terminé. Démarrage automatique...");
        const loadingScreen = document.getElementById('loading-screen');
        const playButton = document.getElementById('play-button');
        
        if (playButton) {
            playButton.style.display = 'none'; // Masquer le bouton
        }
        
        if (loadingScreen) {
            // Transition douce pour masquer l'écran de chargement
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // Lancement direct de la boucle p5.js
                if (typeof loop === 'function') loop();
                
                // Notifier le GameSystem que le jeu est prêt
                if(window.GameSystem && window.GameSystem.Lifecycle) {
                    window.GameSystem.Lifecycle.notifyReady();
                }
            }, 500);
        }
    }
};

// Initialisation de l'affichage au chargement du script
window.LoadingManager.updateDisplay(true);

console.log("✅ LoadingManager.js chargé");