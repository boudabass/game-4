/*
    InteriorSystem.js
    Système de gestion des intérieurs de bâtiments.
    Gère l'état logique de l'intérieur actif.
*/

window.InteriorSystem = {
    currentBuilding: null,
    isInside: false,

    init: function () {
        console.log("InteriorSystem initialized");
    },

    // Entrer dans un bâtiment
    enter: function (building) {
        if (!building) return;

        // Vérifier si une config d'intérieur existe pour ce type de bâtiment
        // TODO: Charger la config depuis Config.INTERIORS
        const interiorConfig = this.getInteriorConfig(building.buildingId);

        if (!interiorConfig) {
            console.warn("No interior config found for", building.buildingId);
            return;
        }

        this.currentBuilding = building;
        this.isInside = true;

        console.log(`Entering building ${building.uid} (${building.buildingId})`);

        // Notifier le Renderer
        if (window.InteriorRenderer) {
            window.InteriorRenderer.show(building, interiorConfig);
        }

        // Fermer le detail panel pour laisser place à la vue intérieur ? 
        // Ou le garder ouvert ? Le user a dit "Depuis le paneau des detail , je peut entrer"
        // On va probablement cacher le detail panel ou le mettre en arrière plan.
        if (window.UIManager) {
            window.UIManager.hideDetailPanel();
        }
    },

    exit: function () {
        this.isInside = false;
        this.currentBuilding = null;

        if (window.InteriorRenderer) {
            window.InteriorRenderer.hide();
        }

        console.log("Exited interior");
    },

    getInteriorConfig: function (buildingId) {
        if (window.Config && window.Config.INTERIORS && window.Config.INTERIORS[buildingId]) {
            return window.Config.INTERIORS[buildingId];
        }
        // Fallback temporaire pour tests si pas de config
        return {
            id: 'default_interior',
            width: 15,
            height: 15,
            layout: []
        };
    },

    startPlacement: function (item) {
        if (!item) {
            console.log("Mode placement désactivé");
            return;
        }
        console.log("Mode placement activé pour :", item.name);
        // Ici on pourrait changer le curseur ou activer un mode spécifique sur la grille
    },

    tryPlaceItem: function (index, item) {
        // Logique de validation des ressources et sauvegarde
        console.log("Placement validé logiquement pour", item.name, "at index", index);
        return true;
    }
};
