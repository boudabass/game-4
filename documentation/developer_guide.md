# 📘 Guide Technique & Architecture - Game Center (Odoo Edition)

Ce document est la référence technique unique pour la plateforme. Il définit comment l'application est structurée, comment les données sont synchronisées avec Odoo, et comment les jeux doivent être codés pour s'intégrer au système.

---

## 1. Architecture des Données & Écosystème Odoo

La plateforme a entièrement migré son backend et son authentification vers **Odoo**. Plus aucun fichier local (`db.json` via Lowdb) ni service tiers (`Supabase`) n'est utilisé.

### A. Authentification sécurisée (Odoo RPC)
L'authentification passe directement par l'API JSON-RPC d'Odoo via l'endpoint `/web/session/authenticate`.
1. **Connexion** : L'utilisateur soumet ses identifiants sur la page de `/login`.
2. **Session** : L'action serveur (`signInAction`) valide les identifiants auprès d'Odoo et récupère un `session_id`.
3. **Cookies de session** :
   * `arcade_session` : Stocke le `session_id` d'Odoo de manière sécurisée (`httpOnly`, `secure`, `sameSite: "none"`).
   * `arcade_user` : Contient les informations de profil de l'utilisateur (UID, nom, email, etc.).

### B. Modèles de Données Odoo (Studio / Custom Models)
La persistance est assurée par trois modèles personnalisés configurés sur l'instance Odoo :

#### 1. Catalogue de Jeux (`x_game_release`)
Ce modèle remplace le fichier local `db.json`. Il répertorie tous les jeux disponibles sur la plateforme.
* **Champs clés** :
  * `id` : Identifiant unique auto-incrémenté (utilisé dans les URLs `/play/[id]`).
  * `x_name` : Le nom d'affichage du jeu.
  * `x_studio_description` : Description textuelle du jeu.
  * `x_studio_url` : Chemin local ou URL externe de l'iframe (ex: `/games/elsass-farm/v2/index.html`).

#### 2. Scores & Classements (`x_game_score`)
Stocke les performances des joueurs.
* **Champs clés** :
  * `id` : ID unique du score.
  * `x_studio_game` : ID de la release associée (`x_game_release`).
  * `x_studio_user` : ID de l'utilisateur Odoo ayant réalisé le score.
  * `x_studio_score` : Valeur entière du score.
  * `create_date` : Date de création (gérée automatiquement par Odoo).

#### 3. Sauvegardes de Partie Cloud (`x_game_save`)
Permet aux jeux de persister leur état de jeu (ex: inventaire, position, temps) directement dans le cloud Odoo par utilisateur.
* **Champs clés** :
  * `id` : ID unique de la sauvegarde.
  * `x_studio_game` : ID du jeu associé.
  * `x_studio_user` : ID de l'utilisateur (lié automatiquement via la session Odoo).
  * `x_studio_data` : Chaîne de caractères JSON sérialisée contenant l'état complet du jeu.
  * `write_date` : Date de dernière modification (utilisée pour charger la version la plus récente).

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
        if (success) console.log("Score enregistré sur Odoo !");
    }
}
```
*Le backend Next.js intercepte l'appel `/api/scores`, extrait le cookie de session Odoo, et effectue un appel RPC `create` sur le modèle `x_game_score`.*

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