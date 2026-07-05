# 📘 Guide Technique & Architecture - Game Center

Ce document est la référence technique unique pour la plateforme. Il définit comment l'application est structurée, comment les données sont stockées dans PostgreSQL, et comment les jeux doivent être codés pour s'intégrer au système.

---

## 1. Architecture des Données (PostgreSQL) & Login (Odoo)

> Mise à jour 05/07/2026 : les données ont quitté Odoo pour **PostgreSQL**
> (hébergé sur Coolify, réseau interne). Odoo ne sert plus qu'au **login**.

### A. Authentification (Odoo au login, puis session signée)
1. **Login** : `signInAction` vérifie les identifiants portail via l'API JSON-RPC d'Odoo (`/web/session/authenticate`). C'est le seul appel à Odoo.
2. **Session** : l'app signe un jeton HMAC-SHA256 (`src/lib/session.ts`, secret `SESSION_SECRET`, payload `{uid, name, username, exp}`, 7 jours).
3. **Cookies** :
   * `arcade_session` : le jeton signé (`httpOnly`, `secure`, `sameSite: "none"`, `partitioned`). Seule preuve d'identité.
   * `arcade_user` : métadonnées d'affichage (jamais une preuve d'identité).

### B. Tables PostgreSQL (`src/lib/db.ts`, schéma auto-créé)

#### 1. Catalogue (`game`)
  * `id` : ID numérique du jeu — celui de `/play/[id]` et du `?gid=` injecté dans l'iframe.
  * `name`, `description` : affichage.
  * `url` : chemin de l'iframe (ex : `/games/elsass-farm/v2/index.html`).
  * `published` : masqué = invisible pour les clients, mais visible/jouable pour l'admin (`ADMIN_UID`).

#### 2. Scores (`score`)
  * Clé primaire `(game_id, user_id)` : **une ligne par jeu et par joueur** (le meilleur score, upsert `ON CONFLICT`).
  * `user_name` : nom affiché, copié du jeton de session à l'écriture.
  * `score`, `updated_at`.

#### 3. Sauvegardes cloud (`save`)
  * Clé primaire `(game_id, user_id)` : une sauvegarde par jeu et par joueur (upsert).
  * `data` : **jsonb** — l'objet de sauvegarde est stocké et renvoyé tel quel (ce que `Engine.Save` attend).
  * `updated_at`.

Le catalogue se gère via la page **`/admin`** (réservée à `ADMIN_UID`) : détection automatique des jeux de `public/games/`, ajout en 1 clic, publication/masquage.

---

## 2. Standard de Développement de Jeu (Le Modèle "Étape 10")

Pour garantir la stabilité, tous les jeux doivent suivre l'architecture modulaire validée.

### A. Stack Technique
* **Moteur** : p5.js + p5.play v3 (via CDN).
* **Architecture** : Modulaire (Fichiers séparés : `config.js`, `player.js`, `sketch.js`).
* **Gestion d'États** : Switch/Case natif (Éviter `states.add()` de p5.play qui est instable).

### B. Template `index.html` Standard
Ce template assure le chargement correct du script de liaison globale de la plateforme (`system.js`).

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Mon Jeu</title>
    <style>
        body { margin: 0; overflow: hidden; background: #1a1a1a; display: flex; justify-content: center; align-items: center; height: 100vh; }
        canvas { display: block; }
    </style>
    
    <!-- 1. LIBRAIRIES -->
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.4/lib/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.4/lib/addons/p5.sound.min.js"></script>
    <script src="https://p5play.org/v3/planck.min.js"></script>
    <script src="https://p5play.org/v3/p5play.js"></script>

    <!-- 2. CONFIGURATION SYSTEM (L'ID doit correspondre à l'ID Odoo x_game_release) -->
    <script>
        window.DyadGame = { id: '1', version: 'v2' }; // "1" est l'ID de la release dans Odoo
    </script>
    <script src="../../system/system.js"></script>

    <!-- 3. MODULES DU JEU -->
    <script src="config.js"></script>
    <script src="sketch.js"></script>
</head>
<body>
</body>
</html>
```

---

## 3. Communication GameSystem (API & Proxy Next.js)

Le jeu communique avec le Game Center via l'objet global `window.GameSystem` injecté par `/games/system/system.js`.

### A. Cycle de vie
Signaler à la plateforme que le jeu est prêt (retire le loader) :
```javascript
function setup() {
    // ... initialisation ...
    if (window.GameSystem?.Lifecycle) {
        window.GameSystem.Lifecycle.notifyReady();
    }
}
```

### B. Soumission de Score
Lors du Game Over ou de la victoire, le score est envoyé via un appel API :
```javascript
async function handleGameOver(finalScore) {
    if (window.GameSystem?.Score) {
        const success = await window.GameSystem.Score.submit(finalScore);
        if (success) console.log("Score enregistré !");
    }
}
```
*Le backend Next.js intercepte l'appel `/api/scores`, vérifie le jeton signé `arcade_session`, et fait un upsert SQL sur la table `score` (le meilleur score est conservé).*

### C. Sauvegarde & Chargement Cloud (Saves)
Pour sauvegarder l'état de progression d'un joueur :
```javascript
// Sauvegarde
const stateToSave = { level: 5, coins: 150, inventory: [...] };
await window.GameSystem.Save.write(stateToSave);

// Chargement
const savedData = await window.GameSystem.Save.read();
if (savedData) {
    this.level = savedData.level;
    this.coins = savedData.coins;
}
```
*Le backend Next.js gère la déduplication : si une sauvegarde existe déjà pour l'utilisateur sur ce jeu, il fait un `write` (mise à jour) du JSON stringifié, sinon il fait un `create`.*