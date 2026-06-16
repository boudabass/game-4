// public/games/system/core/people/PersonSystem.js

(function () {
    window.PersonSystem = window.PersonSystem || {};

    const NAMES = [
        "Marcus", "Julia", "Victor", "Gaia", "Leo",
        "Sarah", "Tom", "Lara", "Ben", "Eva"
    ];

    const COLORS = [
        "#ff5252", "#ff4081", "#e040fb", "#7c4dff", "#536dfe",
        "#448aff", "#40c4ff", "#18ffff", "#64ffda", "#b2ff59"
    ];

    window.PersonSystem.people = [];
    window.PersonSystem.instances = []; // Stocke les objets Person
    window.PersonSystem.group = null;

    window.PersonSystem.init = function () {
        console.log("👥 Initializing PersonSystem...");

        // Création du groupe pour les citoyens
        this.group = new Group();
        this.group.layer = 200; // Au dessus des bâtiments (100)

        if (this.people.length === 0) {
            this.people = NAMES.map((name, index) => ({
                id: `p_${index}`,
                name: name,
                color: COLORS[index % COLORS.length],
                stats: {
                    energy: 100,
                    health: 100,
                    morale: 100,
                    discontent: 0
                },
                assignedTo: null, // buildingId
                slotIndex: -1,
                tool: null // Current equipped tool
            }));
        }

        // Création des instances physiques (Person)
        // On les place par défaut autour du générateur (20,20) sur des routes
        this.instances = this.people.map(pData => {
            const startCol = 20 + (Math.random() > 0.5 ? 3 : -1); // Un peu décalé du centre du générateur
            const startRow = 19; // Une des routes autour
            const person = new Person(pData.id, startCol, startRow, pData.color, this.group);
            return person;
        });

        console.log("👥 People created:", this.people.length);
    };

    window.PersonSystem.update = function () {
        this.instances.forEach(p => p.update());
    };

    window.PersonSystem.getPerson = function (id) {
        return this.people.find(p => p.id === id);
    };

    window.PersonSystem.getInstance = function (id) {
        return this.instances.find(p => p.id === id);
    };

    window.PersonSystem.getFreePeople = function () {
        return this.people.filter(p => !p.assignedTo);
    };

    window.PersonSystem.assign = function (personId, building, slotIndex) {
        const personData = this.getPerson(personId);
        const personInstance = this.getInstance(personId);
        if (!personData || !personInstance) return false;

        // VÉRIFICATION DES SLOTS
        const bInfo = window.Config.BUILDINGS[building.buildingId];
        const numSlots = bInfo ? (bInfo.slots || 0) : 0;

        if (slotIndex >= numSlots) {
            console.error(`❌ Assignation impossible : Slot ${slotIndex} hors limites pour ${building.buildingId} (${numSlots} slots)`);
            return false;
        }

        // DÉSASSIGNER L'ANCIEN OCCUPANT DU SLOT
        if (building.assignedPeople && building.assignedPeople[slotIndex]) {
            const prevId = building.assignedPeople[slotIndex];
            if (prevId !== personId) {
                console.log(`♻️ Remplacement de ${prevId} par ${personId} au slot ${slotIndex}`);
                this.unassign(prevId);
            }
        }

        // Unassign person from THEIR previous job if they had one
        if (personData.assignedTo) {
            this.unassign(personId);
        }

        personData.assignedTo = building.id || building.buildingId;
        personData.slotIndex = slotIndex;

        if (!building.assignedPeople) building.assignedPeople = [];
        building.assignedPeople[slotIndex] = personId;

        if (window.BuildingSystem && BuildingSystem.getEntrance) {
            const entrance = BuildingSystem.getEntrance(building);

            // Passer en état de déplacement vers le travail
            personInstance.state = PersonStates.GOING_TO_WORK;
            personInstance.isVisible = true;
            personInstance.targetBuilding = building; // Pour l'entrée visuelle finale

            const path = PathfindingSystem.findPath(
                personInstance.gridCol, personInstance.gridRow,
                entrance.col, entrance.row,
                null, true // onlyRoads = true
            );
            if (path && path.length > 0) {
                personInstance.setPath(path);
                // Le passage à WORKING se fera dans Person.moveAlongPath lors de l'arrivée
            } else {
                // Si déjà sur place ou pas de chemin trouvé
                personInstance.teleport(entrance.col, entrance.row);
                personInstance.state = PersonStates.WORKING;
            }
        } else {
            personInstance.state = PersonStates.WORKING;
        }

        const bName = bInfo ? bInfo.name : "Bâtiment inconnu";
        console.log(`👤 ${personData.name} assigned to ${bName} (Slot ${slotIndex})`);
        return true;
    };

    window.PersonSystem.unassign = function (personId) {
        const personData = this.getPerson(personId);
        const personInstance = this.getInstance(personId);
        if (!personData || !personInstance) return;

        console.log(`👤 ${personData.name} unassigned`);

        // Si il était dans un bâtiment, on le fait ressortir à l'entrée
        if (personData.assignedTo) {
            let building = null;
            if (window.BuildingSystem && BuildingSystem.group) {
                for (let b of BuildingSystem.group) {
                    if ((b.id || b.buildingId) === personData.assignedTo) {
                        building = b;
                        break;
                    }
                }
            }

            // Nettoyage bâtiment
            if (building && building.assignedPeople) {
                building.assignedPeople[personData.slotIndex] = null;
            }

            if (building && BuildingSystem.getEntrance) {
                const entrance = BuildingSystem.getEntrance(building);

                // Téléportation au centre (invisible car WORKING)
                personInstance.teleport(building.gridPos.col, building.gridPos.row);
                personInstance.state = PersonStates.WORKING;

                // Calcul du chemin de sortie (direct vers l'entrée)
                personInstance.state = PersonStates.IDLE; // Devient visible pour sortir
                personInstance.isVisible = true;

                const exitPath = [{ col: entrance.col, row: entrance.row }];
                personInstance.setPath(exitPath);
            } else {
                personInstance.state = PersonStates.IDLE;
                personInstance.isVisible = true;
            }
        }

        personData.assignedTo = null;
        personData.slotIndex = -1;
    };

    // Helper to sync with building object
    window.PersonSystem.getPeopleInBuilding = function (building) {
        return this.people.filter(p => p.assignedTo === (building.id || building.buildingId));
    };

    window.PersonSystem.getOccupationName = function (personId) {
        const person = this.getPerson(personId);
        if (!person || !person.assignedTo) return 'Libre';

        let bInstance = null;
        if (window.BuildingSystem && window.BuildingSystem.group) {
            for (let b of window.BuildingSystem.group) {
                if ((b.id || b.buildingId) === person.assignedTo) {
                    bInstance = b;
                    break;
                }
            }
        }

        if (bInstance) {
            const bConfig = window.Config.BUILDINGS[bInstance.buildingId];
            return bConfig ? bConfig.name : bInstance.buildingId;
        }

        return person.assignedTo; // Fallback
    };

})();
