💾 Save System — Architecture & Synchronisation Globale
Le Save System est le cœur de la persistance du jeu.
Il assure la sauvegarde, le chargement et la synchronisation des données locales et distantes,
en cohérence avec le GameSystem Hub (framework existant).

1. 🎯 Objectif
Garantir que chaque partie du jeu (HUD, inventaire, quêtes, temps, farming, machines, mine, ville) conserve son état entre les sessions,
tout en restant légère et compatible avec le schéma :

text
Fichier local (cache JSON)
↕
Backend REST (GameSystem Hub)
2. 🧱 Structure des Données (Modèle unifié)
text
SaveData {
  player:      { name, gold, energy, position, reputation }
  world:       { day, hour, season, events }
  inventory:   { seeds[], tools[], loot[] }
  farm_nord:   { tiles[100], watered[], crops[] }
  farm_sud:    { machines[{id,type,state,timer}] }
  city:        { reputationPNJ[], shopStocks[], quests[] }
  mine:        { floor, puzzlesSolved[], loot }
  quests:      { active[], completed[], expired[] }
  time:        { lastSave, sleepUsed, cycle }
  meta:        { version, checksum }
}
Les sous‑blocs suivent directement la structuration existante de tes fichiers précédents.

Les données volatiles (sons, HUD visuel, effets) ne sont jamais enregistrées.

3. ⚙️ Cycle de Sauvegarde
Type	Déclencheur	Contenu	Fréquence
Auto‑Save complète	Sommeil (tous lits) / Fin de journée	All systems	Fin de cycle
Soft‑Save	Action joueur majeure (craft, quête, vente)	Inventaire + or + quêtes	Immédiate
Manual Save	Menu pause / icône HUD	Tout	Sur demande
Sync Cloud	Toutes les 10 min réelles	JSON compressé → API /api/save	Fond (asynchrone)
Chaque save produit un fichier local JSON (localStorage ou IndexedDB) + option backend si login actif.

4. ☁️ Communication avec GameSystem Hub
Le module utilise l’interface existante :
window.GameSystem.config et window.GameSystem.Lifecycle.

Les routes REST du Hub Backend sont normalisées :

POST /api/save → envoi JSON complet compressé.

GET /api/save?gameId=… → récupération de dernière save.

DELETE /api/save/:id → réinitialisation manuelle.

Le Hub reste agnostique : il ne connaît pas la structure interne des données du jeu,
il stocke uniquement la version sérialisée et un identifiant utilisateur.

5. 🔐 Sécurité et Vérification
Mécanisme	Détail
Checksum	Calcul SHA‑256 du JSON pour détecter corruption
Versioning	Champ meta.version pour compatibilité ascendante
Double backup	Local + Cloud (si compte connecté)
Auth	Token utilisateur (fourni par /api/auth/me)
Recover	Au démarrage → compare timestamps local/cloud, propose le plus récent
6. 🕓 Logique de Chargement
Initialisation GameSystem Hub → lecture config jeu.

Vérification de la présence d’une SaveData locale.

Si aucune, création d’une nouvelle partie (default_seed() avec valeurs 0).

Si plusieurs (local vs cloud) :

Compare meta.lastSave.

Affiche mini‑modal : “Charger Local / Charger Cloud”.

Application du snapshot dans chaque module :

HUD.load(data.player)

Inventory.load(data.inventory)

TimeSystem.load(data.world)

etc.

Tout le chargement est instantané et découplé du rendu.

7. 🔁 Synchronisation Inter‑Modules
Chaque module expose :

text
GameSystem.<Module>.exportState()
GameSystem.<Module>.importState(json)
Le Save System s’en sert pour construire le snapshot global.
Cela évite la duplication de logique interne aux autres fichiers.

8. 🧮 Données non sauvegardées
Élément	Raison
Effets visuels, sons, HUD animés	Recréés dynamiquement
Timers d’animation p5.js	Dépend du framerate client
Connexions réseau temporaires	Reprises automatiquement
États debug / développeur	Non pertinents pour le joueur
9. 🧭 Gestion des Profils
3 slots maximum par utilisateur (slot_1.json, slot_2.json, slot_3.json).

Chaque slot stocke : nom ferme, heure, or, progression (%).

Menu initial : “Nouvelle Partie / Charger / Supprimer”.

Sur sauvegarde : écrase le slot actif uniquement.

En backend : identifiés par { userId, gameId, slotId }.

10. ✅ Règles absolues — Save System v1.0
✅ Sauvegarde automatique sur tout sommeil et fin de jour.

✅ Export/import modulaire par système.

✅ Dual‑Save : LocalStorage + Cloud API.

✅ Auth Hub integrée (GameSystem.auth).

✅ Vérification SHA‑256 + timestamp.

✅ 3 slots joueur + menu.

✅ Pas de dépendance visuelle (rendu séparé).

❌ Pas d’écriture fichier manuel (sandbox mobile).

❌ Pas de compression custom binaire (v1.0 texte JSON).

❌ Pas de multi‑profil simultané (un slot à la fois).