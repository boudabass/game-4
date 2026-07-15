/*
 * Engine.HarvestSystem (socle partagé v2)
 * Gestion de l'inventaire et de l'or.
 * Utilisé pour la récolte, la vente, et le suivi des ressources.
 *
 * Utilisation :
 *   var hs = new HarvestSystem();
 *   hs.addToInventory('ble', 5);
 *   hs.sell('ble', 3, 30);    // vend 3 blé à 30 gold/unité
 *   hs.getGold();              // → 90
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class HarvestSystem {
    constructor() {
        this._inventory = {};  // itemId → qty
        this._gold = 0;
    }

    // --- Inventaire ---
    addToInventory(id, qty) {
        qty = qty || 1;
        if (!this._inventory[id]) {
            this._inventory[id] = 0;
        }
        this._inventory[id] += qty;
        if (this._inventory[id] <= 0) {
            delete this._inventory[id];
        }
    }

    removeFromInventory(id, qty) {
        qty = qty || 1;
        var current = this._inventory[id] || 0;
        if (current < qty) return false;
        this._inventory[id] -= qty;
        if (this._inventory[id] <= 0) {
            delete this._inventory[id];
        }
        return true;
    }

    getInventory() {
        return JSON.parse(JSON.stringify(this._inventory));
    }

    getItemCount(id) {
        return this._inventory[id] || 0;
    }

    // --- Gold ---
    getGold() {
        return this._gold;
    }

    addGold(amount) {
        if (typeof amount === 'number' && amount > 0) {
            this._gold += amount;
        }
    }

    spendGold(amount) {
        if (typeof amount !== 'number' || amount <= 0) return false;
        if (this._gold < amount) return false;
        this._gold -= amount;
        return true;
    }

    // --- Vente ---
    // Retourne le montant gagné, ou 0 si pas assez d'items.
    sell(id, qty, pricePerUnit) {
        qty = qty || 1;
        pricePerUnit = pricePerUnit || 0;
        if (!this.removeFromInventory(id, qty)) return 0;
        var earned = qty * pricePerUnit;
        this._gold += earned;
        return earned;
    }

    // --- Persistance ---
    gather() {
        return {
            inventory: JSON.parse(JSON.stringify(this._inventory)),
            gold: this._gold
        };
    }

    apply(data) {
        if (!data) return;
        this._inventory = {};
        if (data.inventory) {
            var keys = Object.keys(data.inventory);
            for (var i = 0; i < keys.length; i++) {
                this._inventory[keys[i]] = data.inventory[keys[i]];
            }
        }
        this._gold = (typeof data.gold === 'number') ? data.gold : 0;
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.HarvestSystem = HarvestSystem;
}
