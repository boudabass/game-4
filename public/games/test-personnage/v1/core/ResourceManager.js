window.ResourceManager = {
    add: function (type, amount) {
        return GameState.addResource(type, amount);
    },

    consume: function (type, amount) {
        return GameState.consumeResource(type, amount);
    },

    check: function (type, amount) {
        if (GameState[type] !== undefined) {
            return GameState[type] >= amount;
        }
        return false;
    }
};
