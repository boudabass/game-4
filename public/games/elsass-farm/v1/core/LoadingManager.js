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
        this.updateDisplay();
    },

    // Met à jour uniquement le message de statut
    updateStatus: function (message) {
        if (message) {
            this.statusMessage = message;
        }
        this.updateDisplay();
    },

    // Met à jour l'affichage DOM
    updateDisplay: function () {
        const statusEl = document.getElementById('loading-status-text');
        const barEl = document.getElementById('loading-progress-fill');
        const progress = (this.currentStep / this.MAX_STEPS) * 100;

        if (statusEl) {
            statusEl.innerText = `[${this.currentStep}/${this.MAX_STEPS}] ${this.statusMessage}`;
        }
        if (barEl) {
            barEl.style.width = `${progress}%`;
        }
    },

    // Masque l'écran de chargement et affiche le bouton Jouer
    finishLoading: function () {
        this.updateStatus("Chargement terminé. Prêt à jouer.");
        const loadingScreen = document.getElementById('loading-screen');
        const playButton = document.getElementById('play-button');
        
        if (loadingScreen) {
            // Masquer la barre et le texte
            document.getElementById('loading-bar-container').style.display = 'none';
            
            // Afficher le bouton Jouer
            if (playButton) {
                playButton.style.display = 'block';
                playButton.onclick = () => {
                    loadingScreen.style.display = 'none';
                    // Démarrer la boucle de jeu p5.js (si elle n'est pas déjà lancée)
                    if (typeof loop === 'function') loop();
                };
            }
        }
    }
};

// Initialisation de l'affichage au chargement du script
window.LoadingManager.updateDisplay();

console.log("✅ LoadingManager.js chargé");