// public/games/system/core/building/base.js
// État global et groupe de sprites pour le système de bâtiments

(function () {
    console.log("🏗️ Building System Base Initializing...");

    window.BuildingSystem = {
        group: null, // Groupe P5play pour tous les bâtiments
        ghost: null, // Sprite de prévisualisation (Ghost)

        isPlacing: false,
        selectedBuildingId: null,
        selectedBuilding: null, // Instance sélectionnée
        isDemolishing: false,

        init: function () {
            // Création du groupe p5play
            this.group = new Group();
            this.group.collider = 'static';
            this.group.layer = 100; // Niveau des bâtiments

            console.log("🏗️ Building System Group Created");
        },

        // Nettoyage complet (pour changement de zone ou reset)
        reset: function () {
            if (this.group) this.group.removeAll();
            this.cancelPlacement();
            this.selectedBuilding = null;
        },

        update: function () {
            // Gestion clavier globale
            if (window.kb && window.kb.pressed('escape')) {
                if (this.isPlacing) this.cancelPlacement();
                else if (this.isDemolishing) this.toggleDemolishMode();
                else this.deselectBuilding();
            }
        }
    };
})();
