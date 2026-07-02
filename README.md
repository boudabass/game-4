# 🎮 Game Center — The Elsassisch

Plateforme de jeux web gratuite pour les clients de **The Elsassisch**. Une arcade de petits jeux (p5.js), embarquée en iframe sur `theelsassisch.com`, avec **Odoo** comme unique backend.

> 📖 Pour la vue d'ensemble technique complète, voir **[`documentation/ARCHITECTURE.md`](documentation/ARCHITECTURE.md)**.

---

## Partie 1 : Présentation

Un espace de divertissement clair et accessible. L'utilisateur se connecte avec son **compte client Odoo**, parcourt le catalogue de jeux, joue en un clic, et ses scores et sauvegardes sont conservés dans le cloud (Odoo).

**Fonctionnalités**
- Catalogue de jeux visuel (`/games`)
- Lancement instantané dans une iframe (`/play/[id]`)
- Scores & classements par jeu (`/scores`), synchronisés avec Odoo
- Sauvegardes de partie dans le cloud (reprise sur n'importe quel appareil)
- Connexion via compte Odoo (`/login`), profil (`/profile`), tableau de bord (`/dashboard`)

---

## Partie 2 : Guide technique

### Stack
- **Frontend** : Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Jeux** : p5.js + p5.play v3 (chargés via CDN), en JavaScript ES6, dans `public/games/`
- **Backend** : **Odoo** (SaaS) via JSON-RPC — authentification, catalogue, scores, sauvegardes.
  **Aucune base locale** (pas de lowdb/`db.json`), **aucun Supabase**.
- **Déploiement** : Docker (`output: standalone`) → **Coolify**, déclenché par un push GitHub sur `main`.

### Prérequis
- **Node.js** (pour le développement) et **pnpm**
- **Docker & Docker Compose** (pour lancer comme en production)
- Accès à l'instance **Odoo** (les modèles custom `x_game_release`, `x_game_score`, `x_game_save` doivent exister)

### Configuration
Copier `.env.example` vers `.env.local` et renseigner :

```bash
ODOO_URL="https://www.theelsassisch.com"   # URL de l'instance Odoo (sans slash final)
ODOO_DB="theelsassisch"                     # nom de la base Odoo
```

> `.env*` est gitignoré : aucune de ces valeurs n'est commitée.

### Lancement en développement

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

### Lancement via Docker (comme en production)

```bash
docker compose up -d --build
# http://localhost:3000
docker compose down   # pour arrêter
```

### Gérer les jeux

Les jeux se gèrent **directement dans Odoo** (il n'y a plus de panneau `/admin` dans l'app) :
1. Déposer les fichiers du jeu dans `public/games/<jeu>/<version>/` (voir le template dans [`documentation/GAME_WORKFLOW.md`](documentation/GAME_WORKFLOW.md)).
2. Créer un enregistrement dans le modèle Odoo **`x_game_release`** : renseigner `x_name` et `x_studio_url` (ex. `/games/elsass-farm/v2/index.html`).
3. Reporter l'**ID numérique** généré par Odoo dans le `index.html` du jeu :
   ```html
   <script>window.DyadGame = { id: 'ID_ODOO', version: 'v2' };</script>
   ```

### Structure du code

```
src/app/            Pages + API (voir ARCHITECTURE.md §6)
src/app/api/        Route Handlers : auth/me, games, scores, storage → Odoo
src/app/actions/    Server Actions (auth : login/logout + cookies)
src/lib/odoo.ts     Client JSON-RPC Odoo
src/components/      Composants React (auth-provider, game-player, ui/…)
public/games/       Jeux p5.js + système mutualisé (public/games/system/)
documentation/      Docs (architecture, workflow, patterns, design des jeux)
```

### ⚠️ À savoir
Toute modification de `package.json` **impose** de régénérer `pnpm-lock.yaml` (`pnpm install --lockfile-only`), sinon le build Docker échoue sur `--frozen-lockfile`.

---

## Documentation

| Fichier | Contenu |
|---|---|
| [`documentation/ARCHITECTURE.md`](documentation/ARCHITECTURE.md) | Vue d'ensemble : plateforme, Odoo, jeux, flux, déploiement |
| [`AI_RULES.md`](AI_RULES.md) | Règles strictes d'architecture (source de vérité pour l'IA et les devs) |
| [`documentation/developer_guide.md`](documentation/developer_guide.md) | Guide technique détaillé (données Odoo, intégration jeu) |
| [`documentation/GAME_WORKFLOW.md`](documentation/GAME_WORKFLOW.md) | Processus pas à pas de création d'un jeu |
| [`documentation/TROUBLESHOOTING.md`](documentation/TROUBLESHOOTING.md) | Erreurs connues p5.play et solutions |
| [`documentation/DOC_AUDIT.md`](documentation/DOC_AUDIT.md) | État de la documentation (à jour / obsolète) |
