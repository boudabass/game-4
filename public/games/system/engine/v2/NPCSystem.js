/*
 * Engine.NPCSystem (socle partagé v2)
 * Gestion des PNJ : position, dialogue, cadeaux, jauge de relation, effets.
 *
 * Utilisation :
 *   var npc = new NPCSystem();
 *   npc.configure({ npcs: pnjsData, cultures: culturesData });
 *   npc.getNPCsInZone('village');   // → [{id, c, r, ...}]
 *   npc.getDialogue('maraicher');   // → "Bonjour !"
 *   npc.giveGift('maraicher', 'ble'); // +1 relation, retourne le texte
 *   npc.getSellMultiplier('maraicher'); // 1.0 à 1.2 selon relation
 *
 * Persistance via gather() / apply(data) — compatible Engine.Save.
 */
class NPCSystem {
    constructor() {
        this._npcs = {};           // npcId → npcData (copie complète)
        this._relations = {};      // npcId → { level: 0, giftsGiven: 0 }
        this._cultures = {};       // cropId → cropData (pour les prix de vente)
        this._culturesById = {};   // cache rapide cropId → cropData
    }

    _key(npcId) {
        return npcId;
    }

    // --- Configuration ---
    configure(opts) {
        opts = opts || {};
        if (opts.npcs) {
            this._npcs = {};
            for (var i = 0; i < opts.npcs.length; i++) {
                var n = opts.npcs[i];
                this._npcs[n.id] = JSON.parse(JSON.stringify(n));
            }
        }
        if (opts.cultures) {
            this._cultures = {};
            this._culturesById = {};
            for (var j = 0; j < opts.cultures.length; j++) {
                var c = opts.cultures[j];
                this._cultures[c.id] = c;
                this._culturesById[c.id] = c;
            }
        }
        return this;
    }

    // --- Requêtes ---
    getNPC(npcId) {
        return this._npcs[npcId] || null;
    }

    getNPCsInZone(zoneId) {
        var result = [];
        for (var id in this._npcs) {
            if (!this._npcs.hasOwnProperty(id)) continue;
            var n = this._npcs[id];
            if (n.zone === zoneId) {
                result.push(n);
            }
        }
        return result;
    }

    /* Retourne le NPC présent sur la tuile (c,r) dans la zone donnée, ou null. */
    getNPCAt(zoneId, c, r) {
        var npcs = this.getNPCsInZone(zoneId);
        for (var i = 0; i < npcs.length; i++) {
            if (npcs[i].c === c && npcs[i].r === r) return npcs[i];
        }
        return null;
    }

    // --- Relations ---
    getRelation(npcId) {
        if (!this._relations[npcId]) {
            this._relations[npcId] = { level: 0, giftsGiven: 0 };
        }
        return this._relations[npcId];
    }

    getRelationLevel(npcId) {
        return this.getRelation(npcId).level;
    }

    /* Effet concret : multiplicateur de prix de vente (1.0 → 1.0+selon paliers).
       Paliers : 0→1.0, 5→1.1, 10→1.15, 15→1.2, 20→1.25 */
    getSellMultiplier(npcId) {
        var lvl = this.getRelationLevel(npcId);
        if (lvl >= 20) return 1.25;
        if (lvl >= 15) return 1.20;
        if (lvl >= 10) return 1.15;
        if (lvl >= 5)  return 1.10;
        return 1.0;
    }

    /* Offrir un cadeau (itemId) au PNJ. Retourne le dialogue de réaction. */
    giveGift(npcId, itemId) {
        var npc = this._npcs[npcId];
        if (!npc) return null;
        var rel = this.getRelation(npcId);

        // Vérifier si le PNJ aime ce type de cadeau (dans ses likedGifts)
        var liked = npc.likedGifts && npc.likedGifts.indexOf(itemId) !== -1;
        var points = liked ? 2 : 1;
        rel.level = Math.min(20, rel.level + points);
        rel.giftsGiven = (rel.giftsGiven || 0) + 1;

        if (liked) {
            return npc.dialogueGiftLiked || "Merci, c'est exactement ce qu'il me fallait !";
        } else {
            return npc.dialogueGiftNeutral || "Merci, c'est gentil.";
        }
    }

    /* Retourne le dialogue de base du PNJ (varie selon relation level). */
    getDialogue(npcId) {
        var npc = this._npcs[npcId];
        if (!npc) return "...";
        var lvl = this.getRelationLevel(npcId);
        if (lvl >= 15 && npc.dialogueFriend) return npc.dialogueFriend;
        if (lvl >= 5 && npc.dialogueWarm) return npc.dialogueWarm;
        return npc.dialogue || "Bonjour !";
    }

    // --- Persistance ---
    gather() {
        return {
            relations: JSON.parse(JSON.stringify(this._relations))
        };
    }

    apply(data) {
        if (!data) return;
        this._relations = {};
        if (data.relations) {
            var keys = Object.keys(data.relations);
            for (var i = 0; i < keys.length; i++) {
                this._relations[keys[i]] = JSON.parse(JSON.stringify(data.relations[keys[i]]));
            }
        }
    }
}

// Attachement au namespace Engine
if (typeof window !== 'undefined') {
    window.Engine = window.Engine || {};
    window.Engine.NPCSystem = NPCSystem;
}
