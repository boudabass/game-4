// public/games/system/core/ux/base.js
// Gestionnaire d'actions rapides (slots/shortucts)

(function () {
    console.log("⚡ UX System Initializing...");

    window.QuickAction = {
        slots: {}, // id -> data { icon, label, action }
        selectedSlot: null,

        register: function (id, data) {
            this.slots[id] = data;
            console.log(`⚡ Slot registered: ${id}`);
        },

        select: function (id) {
            if (this.slots[id]) {
                this.selectedSlot = id;
                if (this.slots[id].action) this.slots[id].action();
                if (this.onUpdate) this.onUpdate();
            }
        },

        deselect: function () {
            this.selectedSlot = null;
            if (this.onUpdate) this.onUpdate();
        },

        getSlot: function (id) {
            return this.slots[id];
        }
    };
})();
