/*
 * Engine.DialogueSystem (socle partagé v2)
 * Gestion des arbres de dialogue PNJ avec choix interactifs.
 *
 * Chaque PNJ peut avoir un arbre de dialogue défini dans dialogues.json.
 * Les nœuds contiennent du texte et une liste de choix.
 * Chaque choix peut :
 *   - naviguer vers un autre nœud (next)
 *   - déclencher une action (gift, shop, end)
 *   - avoir une condition (relation level, inventaire non vide, etc.)
 *
 * Utilisation :
 *   var ds = new DialogueSystem();
 *   ds.configure({ dialogues: dialoguesData, npcSystem: npcSystem, harvestSystem: harvestSystem });
 *   ds.start(npcId);                    // → { text, choices, npc }
 *   ds.choose(choiceIndex);             // → { text, choices, npc, effects }
 *   ds.getState();                      // → état courant ou null si terminé
 *   ds.end();                           // fermer le dialogue
 *
 * Persistance via gather() / apply() — compatible Engine.Save.
 */
class DialogueSystem {
    constructor() {
        this._dialogues = {};      // npcId → dialogue tree
        this._npcSystem = null;    // référence au NPCSystem
        this._harvestSystem = null;// référence au HarvestSystem
        this._state = null;        // { npcId, nodeId, npc }
        this._visitedNodes = {};   // npcId → { nodeId: count } pour tracking
    }

    // --- Configuration ---
    configure(opts) {
        opts = opts || {};
        if (opts.dialogues) {
            this._dialogues = {};
            for (var i = 0; i < opts.dialogues.length; i++) {
                var d = opts.dialogues[i];
                if (d.npcId) {
                    this._dialogues[d.npcId] = d.tree;
                }
            }
        }
        if (opts.npcSystem) this._npcSystem = opts.npcSystem;
        if (opts.harvestSystem) this._harvestSystem = opts.harvestSystem;
        return this;
    }

    /* Attacher les systèmes après construction */
    setNPCSystem(npcSystem) { this._npcSystem = npcSystem; }
    setHarvestSystem(harvestSystem) { this._harvestSystem = harvestSystem; }

    // --- Démarrage ---
    start(npcId) {
        var npc = this._npcSystem ? this._npcSystem.getNPC(npcId) : null;
        if (!npc) return null;

        // Déterminer le nœud racine selon la relation
        var tree = this._dialogues[npcId];
        var rootId = 'root';
        if (tree && this._npcSystem) {
            var lvl = this._npcSystem.getRelationLevel(npcId);
            if (lvl >= 15 && tree.friend_root) rootId = 'friend_root';
            else if (lvl >= 5 && tree.warm_root) rootId = 'warm_root';
        }

        this._state = { npcId: npcId, nodeId: rootId, npc: npc };
        if (!this._visitedNodes[npcId]) this._visitedNodes[npcId] = {};
        if (!this._visitedNodes[npcId][rootId]) this._visitedNodes[npcId][rootId] = 0;
        this._visitedNodes[npcId][rootId]++;

        return this._buildResponse(npc, tree, rootId);
    }

    /* Choisir une option (0-based index dans choices) */
    choose(choiceIndex) {
        if (!this._state) return null;
        var npcId = this._state.npcId;
        var npc = this._state.npc;
        var tree = this._dialogues[npcId];

        // Récupérer les choix du nœud courant
        var node = tree ? tree[this._state.nodeId] : null;
        if (!node || !node.choices) return this.end();

        var choices = this._filterChoices(node.choices, npcId);
        if (choiceIndex < 0 || choiceIndex >= choices.length) return this.end();

        var chosen = choices[choiceIndex];

        // Exécuter l'action si présente
        var effects = null;
        if (chosen.action) {
            effects = this._executeAction(chosen.action, npcId, npc);
        }

        // Navigation
        if (chosen.next) {
            // Support pour next dynamique (fonction)
            var nextId = typeof chosen.next === 'function'
                ? chosen.next(this._npcSystem ? this._npcSystem.getRelationLevel(npcId) : 0)
                : chosen.next;

            if (tree && tree[nextId]) {
                this._state.nodeId = nextId;
                if (!this._visitedNodes[npcId]) this._visitedNodes[npcId] = {};
                if (!this._visitedNodes[npcId][nextId]) this._visitedNodes[npcId][nextId] = 0;
                this._visitedNodes[npcId][nextId]++;
                return this._buildResponse(npc, tree, nextId, effects);
            }
        }

        // Pas de next → fin du dialogue
        var result = effects || {};
        result.ended = true;
        this._state = null;
        return result;
    }

    /* État courant (sans avancer) */
    getState() {
        if (!this._state) return null;
        var npc = this._state.npc;
        var tree = this._dialogues[this._state.npcId];
        var node = tree ? tree[this._state.nodeId] : null;
        if (!node) return null;

        var choices = node.choices ? this._filterChoices(node.choices, this._state.npcId) : [];
        return {
            npcId: this._state.npcId,
            npc: npc,
            text: this._resolveText(node.text, npc),
            choices: choices.map(function(c) { return { label: c.label, action: c.action }; }),
            nodeId: this._state.nodeId
        };
    }

    /* Terminer le dialogue */
    end() {
        this._state = null;
        return { ended: true };
    }

    /* Le dialogue est-il actif ? */
    isActive() {
        return this._state !== null;
    }

    getNPCId() {
        return this._state ? this._state.npcId : null;
    }

    // --- Interne ---

    _buildResponse(npc, tree, nodeId, effects) {
        var node = tree ? tree[nodeId] : null;
        if (!node) {
            this._state = null;
            return { ended: true };
        }

        var choices = node.choices
            ? this._filterChoices(node.choices, npc.id)
            : [];

        return {
            npcId: npc.id,
            npc: npc,
            text: this._resolveText(node.text, npc),
            choices: choices.map(function(c) { return { label: c.label, action: c.action }; }),
            nodeId: nodeId,
            ended: false,
            effects: effects || null
        };
    }

    _filterChoices(choices, npcId) {
        var self = this;
        return choices.filter(function(c) {
            if (!c.condition) return true;
            return self._checkCondition(c.condition, npcId);
        });
    }

    _checkCondition(cond, npcId) {
        var lvl = this._npcSystem ? this._npcSystem.getRelationLevel(npcId) : 0;

        switch (cond) {
            case 'has_inventory':
                return this._harvestSystem
                    && Object.keys(this._harvestSystem.getInventory()).length > 0;
            case 'can_trade':
                var npc = this._npcSystem ? this._npcSystem.getNPC(npcId) : null;
                return npc && (npc.sellCrops || npc.buySeeds || npc.buyGifts);
            case 'has_gold':
                return this._harvestSystem && this._harvestSystem.getGold() > 0;
            case 'relation_5':
                return lvl >= 5;
            case 'relation_10':
                return lvl >= 10;
            case 'relation_15':
                return lvl >= 15;
            case 'relation_20':
                return lvl >= 20;
            default:
                // Condition avec pattern: "relation_ge_N"
                if (typeof cond === 'string' && cond.indexOf('relation_ge_') === 0) {
                    var threshold = parseInt(cond.replace('relation_ge_', ''), 10);
                    return lvl >= threshold;
                }
                return true;
        }
    }

    _resolveText(text, npc) {
        if (typeof text === 'function') {
            var lvl = this._npcSystem ? this._npcSystem.getRelationLevel(npc.id) : 0;
            return text(npc, lvl);
        }
        return text || '';
    }

    _executeAction(action, npcId, npc) {
        var effects = {};

        switch (action) {
            case 'end':
                effects.ended = true;
                break;

            case 'open_shop_sell':
            case 'open_shop':
                effects.openShop = true;
                effects.sellMode = true;
                break;

            case 'open_shop_buy':
                effects.openShop = true;
                effects.sellMode = false;
                break;

            case 'open_gift':
                effects.openGift = true;
                break;

            case 'show_relation':
                effects.showRelation = true;
                break;

            default:
                // Actions inconnues — ignorées
                break;
        }

        // Si ended est dans effects, nettoyer l'état
        if (effects.ended) {
            this._state = null;
        }

        return effects;
    }

    /* Offrir un cadeau depuis le dialogue */
    giveGift(npcId, itemId) {
        if (!this._npcSystem) return null;
        var npc = this._npcSystem.getNPC(npcId);
        if (!npc) return null;

        var reaction = this._npcSystem.giveGift(npcId, itemId);
        var liked = npc.likedGifts && npc.likedGifts.indexOf(itemId) !== -1;
        var lvl = this._npcSystem.getRelationLevel(npcId);

        return {
            text: reaction,
            liked: liked,
            newLevel: lvl,
            giftIcon: itemId
        };
    }

    /* Vérifier les effets de palier de relation activés */
    checkTierEffects(npcId) {
        if (!this._npcSystem) return [];
        var npc = this._npcSystem.getNPC(npcId);
        if (!npc || !npc.relationTiers) return [];

        var lvl = this._npcSystem.getRelationLevel(npcId);
        var unlocked = [];
        for (var i = 0; i < npc.relationTiers.length; i++) {
            var tier = npc.relationTiers[i];
            if (lvl >= tier.level && (!this._visitedNodes[npcId] || !this._visitedNodes[npcId]['tier_' + tier.level])) {
                unlocked.push(tier);
                if (!this._visitedNodes[npcId]) this._visitedNodes[npcId] = {};
                this._visitedNodes[npcId]['tier_' + tier.level] = 1;
            }
        }
        return unlocked;
    }

    // --- Persistance ---
    gather() {
        return {
            visitedNodes: JSON.parse(JSON.stringify(this._visitedNodes))
        };
    }

    apply(data) {
        if (!data || !data.visitedNodes) return;
        this._visitedNodes = JSON.parse(JSON.stringify(data.visitedNodes));
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.DialogueSystem = DialogueSystem;
}
