# 🎮 Game Center — arcade p5.js avec Odoo comme backend

Une plateforme web **Next.js** qui héberge une arcade de petits jeux **p5.js**, conçue pour être embarquée en **iframe** dans un site Odoo, avec **Odoo (SaaS) comme unique backend** : authentification, catalogue de jeux, scores et sauvegardes cloud. Aucun serveur de base de données à gérer.

> 📖 Vue d'ensemble technique complète : [`documentation/ARCHITECTURE.md`](documentation/ARCHITECTURE.md)

---

## Fonctionnalités

- Catalogue de jeux visuel (`/games`), piloté depuis Odoo
- Lancement instantané dans une iframe (`/play/[id]`)
- Scores & classements par jeu (`/scores`), avec **une seule ligne par jeu et par joueur** (upsert du meilleur score — ça borne le volume de données côté Odoo SaaS)
- Sauvegardes de partie dans le cloud (reprise sur n'importe quel appareil)
- Connexion via les **comptes portail Odoo** (`/login`), profil, tableau de bord

## Stack

- **Frontend** : Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Jeux** : p5.js + p5.play v3 (via CDN), fichiers statiques dans `public/games/`
- **Backend** : Odoo (SaaS ou auto-hébergé) via JSON-RPC — aucune base locale, aucun service tiers
- **Déploiement** : Docker (`output: standalone`), CI/CD GitHub Actions → Coolify (adaptable)

---

## Installation

### 1. Prérequis

- **Node.js** ≥ 20 et **pnpm**
- **Docker & Docker Compose** (optionnel, pour tester comme en production)
- Une **instance Odoo** avec **Odoo Studio** (pour créer les modèles custom) et le **portail client** activé

### 2. Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner **vos** valeurs :

```bash
ODOO_URL="https://votre-instance.odoo.com"   # URL de votre instance Odoo (sans slash final)
ODOO_DB="votre_base"                          # nom de votre base de données Odoo
# COOKIE_DOMAIN=".votre-domaine.com"          # optionnel, voir .env.example
```

> `.env*` est gitignoré : aucune valeur réelle n'est commitée.

### 3. Configuration Odoo (obligatoire)

L'app attend **trois modèles custom** créés avec Odoo Studio. Les noms techniques doivent correspondre **exactement** (modèles `x_...`, champs `x_studio_...`).

#### a) Les modèles

**`x_game_release`** — le catalogue de jeux

| Champ | Type | Rôle |
|---|---|---|
| `x_name` | Texte (requis) | Nom affiché du jeu |
| `x_studio_description` | Texte | Description du jeu |
| `x_studio_url` | Texte | Chemin de l'iframe (ex. `/games/_template/v1/index.html`) |

**`x_game_score`** — scores / classements

| Champ | Type | Rôle |
|---|---|---|
| `x_name` | Texte (requis) | Libellé (rempli automatiquement par l'API) |
| `x_studio_game` | Relation → `x_game_release` | Jeu concerné |
| `x_studio_user` | Relation → utilisateur | Joueur |
| `x_studio_score` | Entier | Meilleur score |

**`x_game_save`** — sauvegardes cloud

| Champ | Type | Rôle |
|---|---|---|
| `x_name` | Texte (requis) | Libellé (rempli automatiquement par l'API) |
| `x_studio_game` | Relation → `x_game_release` | Jeu concerné |
| `x_studio_user` | Relation → utilisateur | Joueur |
| `x_studio_data` | Texte | État du jeu, JSON sérialisé |

> ⚠️ Le champ `x_name` est **requis** par Odoo sur les modèles Studio : toute création doit le fournir, sinon l'API renvoie une erreur 500. Le code de l'app le remplit déjà.

#### b) Les droits d'accès (le portail n'a RIEN par défaut)

Les comptes **portail** (vos clients/joueurs) ne peuvent ni lire ni écrire les modèles custom sans configuration explicite. Activer le **mode développeur**, puis dans *Réglages → Technique → Sécurité → Droits d'accès*, créer pour le groupe **Role / Portal** :

| Modèle | Lecture | Création | Écriture | Suppression |
|---|---|---|---|---|
| `x_game_release` | ✓ | ✗ | ✗ | ✗ |
| `x_game_score` | ✓ | ✓ | ✓ (upsert) | ✗ |
| `x_game_save` | ✓ | ✓ | ✓ | ✗ |

Le catalogue (`x_game_release`) doit aussi être lisible sans connexion si vous voulez une page `/games` publique.

#### c) Les règles d'enregistrement (cloisonner chaque joueur)

Dans *Réglages → Technique → Sécurité → Règles d'enregistrement*, avec le domaine `[('x_studio_user', '=', user.id)]` :

- **`x_game_score`** : restreindre **uniquement l'Écriture** (la lecture reste ouverte pour afficher le classement de tous les joueurs).
- **`x_game_save`** : restreindre **toutes les opérations** (chaque joueur ne voit que ses propres sauvegardes).

> ⚠️ Bien **ajouter le groupe Portal** dans la section « Groupes » de chaque règle : une règle sans groupe est « globale » et s'appliquerait à tout le monde, y compris les administrateurs.

Toutes les écritures passent par la **session du joueur connecté** (pas de compte de service) : ce sont ces droits + règles qui font la sécurité.

### 4. Lancement

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

Ou via Docker, comme en production :

```bash
docker compose up -d --build
docker compose down   # pour arrêter
```

---

## Ajouter un jeu

Les jeux se gèrent **directement dans Odoo** (pas de panneau d'admin dans l'app) :

1. Déposer les fichiers du jeu dans `public/games/<jeu>/<version>/` — partir du template `public/games/_template/v1/` (voir [`documentation/GAME_WORKFLOW.md`](documentation/GAME_WORKFLOW.md)).
2. Créer un enregistrement `x_game_release` dans Odoo : renseigner `x_name` et `x_studio_url` (ex. `/games/mon-jeu/v1/index.html`).
3. C'est tout : l'ID numérique de la release est injecté automatiquement dans l'iframe via `?gid=`, et le jeu accède aux scores/sauvegardes via l'objet `window.GameSystem` (voir [`documentation/developer_guide.md`](documentation/developer_guide.md)).

---

## Structure du code

```
src/app/            Pages + API (voir ARCHITECTURE.md §6)
src/app/api/        Route Handlers : auth/me, games, scores, storage → Odoo
src/app/actions/    Server Actions (auth : login/logout + cookies)
src/lib/odoo.ts     Client JSON-RPC Odoo
src/components/     Composants React (auth-provider, game-player, ui/…)
public/games/       Jeux p5.js + socle mutualisé (system/ + system/engine/)
documentation/      Docs (architecture, workflow, patterns, design des jeux)
```

## ⚠️ À savoir

- Toute modification de `package.json` **impose** de régénérer `pnpm-lock.yaml` (`pnpm install --lockfile-only`), sinon le build Docker échoue sur `--frozen-lockfile`.
- L'app doit être servie sur un **sous-domaine du site** qui l'embarque en iframe (cookies first-party, indispensable pour Safari) : voir [`documentation/DOMAINE_COOKIES_SSO.md`](documentation/DOMAINE_COOKIES_SSO.md).

---

## Documentation

| Fichier | Contenu |
|---|---|
| [`documentation/ARCHITECTURE.md`](documentation/ARCHITECTURE.md) | Vue d'ensemble : plateforme, Odoo, jeux, flux, déploiement |
| [`documentation/ARCHITECTURE_CIBLE.md`](documentation/ARCHITECTURE_CIBLE.md) | Plan de la fondation cible (socle jeu, contrat d'intégration) |
| [`AI_RULES.md`](AI_RULES.md) | Règles strictes d'architecture (source de vérité pour l'IA et les devs) |
| [`documentation/developer_guide.md`](documentation/developer_guide.md) | Guide technique détaillé (données Odoo, intégration jeu) |
| [`documentation/GAME_WORKFLOW.md`](documentation/GAME_WORKFLOW.md) | Processus pas à pas de création d'un jeu |
| [`documentation/DOMAINE_COOKIES_SSO.md`](documentation/DOMAINE_COOKIES_SSO.md) | Domaines, cookies en iframe, pistes SSO |
| [`documentation/TROUBLESHOOTING.md`](documentation/TROUBLESHOOTING.md) | Erreurs connues p5.play et solutions |
| [`documentation/JOURNAL_FONDATION.md`](documentation/JOURNAL_FONDATION.md) | Journal & leçons : ce qui marche, les pièges, les recettes |
