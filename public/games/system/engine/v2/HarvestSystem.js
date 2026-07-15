/*
 * Engine.HarvestSystem (socle partagé v2)
 * Gère l'inventaire du joueur et son or (gold).
 *
 * Utilisation :
 *   const harvest = new Engine.HarvestSystem();
 *   harvest.addToInventory('ble', 3);       // ajouter 3 blé
 *   harvest.removeFromInventory('ble', 1);  // retirer 1 blé
 *   harvest.getInventory();                 // { ble: 2, ... }
 *   harvest.sell('ble', 2, 30);             // vend 2 blé à 30g → +60 gold
 *   harvest.getGold();                      // 60
 *
 *   // Sauvegarde :
 *   Engine.Save.configure({
 *     gather: () => ({ harvest: harvest.gather() }),
 *     apply: (data) => { if (data.harvest) harvest.apply(data.harvest); }
 *   });
 */
(function () {
    window.Engine = window.Engine || {};

    window.Engine.HarvestSystem = class HarvestSystem {
        constructor() {
            // _inventory : { "ble": 5, "asperge": 2, ... }
            this._inventory = {};
            this._gold = 0;
        }

        // --- Inventaire ---

        /**
         * Ajoute une quantité d'un item à l'inventaire.
         * @param {string} id - identifiant de l'item (ex. 'ble')
         * @param {number} qty - quantité à ajouter (défaut 1)
         */
        addToInventory(id, qty) {
            if (!id) return;
            qty = (typeof qty === 'number' && qty > 0) ? qty : 1;
            this._inventory[id] = (this._inventory[id] || 0) + qty;
        }

        /**
         * Retire une quantité d'un item de l'inventaire.
         * @returns {boolean} true si réussi, false si quantité insuffisante
         */
        removeFromInventory(id, qty) {
            if (!id) return false;
            qty = (typeof qty === 'number' && qty > 0) ? qty : 1;
            var current = this._inventory[id] || 0;
            if (current < qty) return false;
            this._inventory[id] = current - qty;
            if (this._inventory[id] <= 0) delete this._inventory[id];
            return true;
        }

        /**
         * Retourne une copie de l'inventaire.
         * @returns {object} { ble: 5, asperge: 2, ... }
         */
        getInventory() {
            return JSON.parse(JSON.stringify(this._inventory));
        }

        /**
         * Retourne la quantité d'un item spécifique.
         */
        getItemCount(id) {
            return this._inventory[id] || 0;
        }

        // --- Or ---

        /**
         * Vend un item de l'inventaire et ajoute l'or correspondant.
         * @param {string} id - identifiant de l'item
         * @param {number} qty - quantité à vendre
         * @param {number} price - prix unitaire de vente
         * @returns {number|false} l'or gagné, ou false si vente impossible
         */
        sell(id, qty, price) {
            if (!id || !this.removeFromInventory(id, qty)) return false;
            var earned = qty * price;
            this._gold += earned;
            return earned;
        }

        /**
         * Ajoute de l'or directement (récompenses, quêtes...).
         */
        addGold(amount) {
            if (typeof amount === 'number' && amount > 0) {
                this._gold += amount;
            }
        }

        /**
         * Dépense de l'or (achats).
         * @returns {boolean} true si la dépense a réussi
         */
        spendGold(amount) {
            if (typeof amount !== 'number' || amount <= 0) return false;
            if (this._gold < amount) return false;
            this._gold -= amount;
            return true;
        }

        getGold() {
            return this._gold;
        }

        // --- Persistance (gather/apply pour SaveManager) ---

        gather() {
            return {
                inventory: JSON.parse(JSON.stringify(this._inventory)),
                gold: this._gold
            };
        }

        apply(data) {
            this._inventory = JSON.parse(JSON.stringify(data.inventory || {}));
            this._gold = (typeof data.gold === 'number') ? data.gold : 0;
        }
    };

    console.log("💰 Engine.HarvestSystem v2 chargé");
})();
