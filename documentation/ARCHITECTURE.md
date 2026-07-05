# 🏛️ Architecture — Game Center

> **Document de référence de la vue d'ensemble.** Il décrit *comment tout s'assemble* :
> la plateforme Next.js, PostgreSQL, le login Odoo, les jeux p5.js, et le déploiement.
> Pour le détail du développement de jeu, voir `developer_guide.md` et `GAME_WORKFLOW.md`.
> Dernière mise à jour : 5 juillet 2026 (migration PostgreSQL terminée).

---

## 1. En une phrase

Une **plateforme web Next.js** héberge une arcade de **jeux p5.js**, embarquée en **iframe** dans le site `monsite.com`, avec **PostgreSQL comme backend de données** (catalogue, scores, sauvegardes) et **Odoo pour la seule authentification** (comptes portail, vérifiés au login). Le tout est packagé en **Docker** et déployé via **Coolify**.

---

## 2. Les briques

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVIGATEUR DU CLIENT (dans une iframe sur monsite.com)              │
│                                                                       │
│   ┌───────────────────────────┐      ┌────────────────────────────┐  │
│   │  PLATEFORME (React/Next)  │      │   JEU (iframe p5.js)        │  │
│   │  /games, /play, /scores…  │◄────►│   public/games/<jeu>/<v>/   │  │
│   │  AuthProvider + UI         │      │   + system.js (GameSystem)  │  │
│   └────────────┬──────────────┘      └──────────────┬─────────────┘  │
└────────────────┼────────────────────────────────────┼────────────────┘
                 │  fetch same-origin (cookie arcade_session transmis)
                 ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SERVEUR NEXT.JS  (conteneur Docker, déployé par Coolify)            │
│                                                                       │
│   Server Actions        Route Handlers (/api/*)                       │
│   - actions/auth.ts     - /api/auth/me    - /api/scores               │
│   - admin/actions.ts    - /api/games      - /api/storage              │
│         │                        │                                     │
│         │ (login uniquement)     │ (toutes les données)                │
│         ▼                        ▼                                     │
│   src/lib/odoo.ts          src/lib/db.ts (pool pg)                     │
│   src/lib/session.ts (signature/vérification HMAC du cookie)           │
└───────────┬──────────────────────────┬──────────────────────────────┘
            │ JSON-RPC (au login SEULEMENT)│ SQL (réseau interne Coolify)
            ▼                              ▼
┌──────────────────────────┐   ┌─────────────────────────────────────┐
│  ODOO (SaaS)             │   │  POSTGRESQL (Coolify, non exposé)    │
│  /web/session/authenticate│   │  Tables : game / score / save        │
│  (comptes portail)        │   │  Schéma auto-créé par src/lib/db.ts  │
└──────────────────────────┘   └─────────────────────────────────────┘
```

### A. La plateforme (Next.js 15, App Router)
Le code applicatif vit dans `src/`. Elle sert les pages, l'UI, et expose une petite API interne branchée sur PostgreSQL.

### B. Les jeux (p5.js, statiques)
Chaque jeu est un ensemble de fichiers statiques dans `public/games/<jeu>/<version>/`. Ils sont servis **par le même serveur Next.js** (même origine) : le cookie de session est transmis automatiquement quand un jeu appelle l'API.

### C. PostgreSQL (données) + Odoo (login)
- **PostgreSQL** tourne sur Coolify, en **réseau interne** (aucun port public). Il stocke le catalogue, les scores et les sauvegardes. Le schéma est créé automatiquement au premier appel (`CREATE TABLE IF NOT EXISTS` dans `src/lib/db.ts`).
- **Odoo** (SaaS) ne sert plus qu'à **vérifier les identifiants portail au moment du login**. Aucun modèle custom, aucune donnée de jeu côté Odoo (les 3 modèles Studio `x_game_*` ont été supprimés le 05/07/2026).

---

## 3. Flux d'authentification (session signée)

1. L'utilisateur saisit **l'identifiant + mot de passe de son compte portail Odoo** sur `/login`.
2. La **Server Action** `signInAction` (`src/app/actions/auth.ts`) appelle `odooClient.authenticate()` (`src/lib/odoo.ts`) : un POST JSON-RPC vers `/web/session/authenticate`. C'est le **seul** moment où Odoo est appelé.
3. Si les identifiants sont bons, **l'app signe elle-même un jeton de session** (`src/lib/session.ts`) : HMAC-SHA256 avec le secret `SESSION_SECRET`, payload `{ uid, name, username, exp }`, durée **7 jours**.
4. Deux cookies sont posés (`sameSite: "none"; secure; partitioned` — obligatoire dans l'iframe) :
   * **`arcade_session`** — le jeton signé, en **`httpOnly`**. C'est la **seule preuve d'identité** : signature et expiration vérifiées à chaque requête (`getSessionUser()`).
   * **`arcade_user`** — métadonnées (uid, nom), lisible côté client **pour l'affichage uniquement**.
5. Côté client, `AuthProvider` appelle `/api/auth/me` (qui vérifie le jeton signé).

> ⚠️ **Règles de sécurité** : le front ne parle jamais directement à la base ; l'uid utilisé par les routes vient **toujours** du jeton signé (jamais du client ni du cookie `arcade_user`) ; on ne stocke jamais la session dans `localStorage`.

---

## 4. Flux de données (scores & sauvegardes)

Le pont entre un jeu (dans l'iframe) et la base passe par `public/games/system/system.js` (objet global **`window.GameSystem`**), l'ID du jeu étant injecté par la plateforme via `?gid=` dans l'URL de l'iframe.

| Action jeu | Appel `GameSystem` | Route Next.js | Opération SQL |
|---|---|---|---|
| Envoyer un score | `GameSystem.Score.submit(score)` | `POST /api/scores` | upsert `ON CONFLICT` sur `score` (garde le meilleur) |
| Lire le classement | `GameSystem.Score.getLeaderboard()` | `GET /api/scores?gameId=` | `SELECT … ORDER BY score DESC` |
| Sauvegarder | `GameSystem.Save.write(data)` | `POST /api/storage` | upsert `ON CONFLICT` sur `save` (jsonb) |
| Charger | `GameSystem.Save.read()` | `GET /api/storage?gameId=` | `SELECT data FROM save` |

Chaque route lit et vérifie le jeton `arcade_session` → si invalide, 401 → sinon exécute la requête avec l'uid du jeton. L'upsert est **atomique** (fini le search+write en deux temps de l'époque Odoo).

---

## 5. Le schéma PostgreSQL

Défini dans `src/lib/db.ts`, créé automatiquement au premier appel :

**`game`** — le catalogue
- `id` (identity, modifiable à la création via /admin) — utilisé dans `/play/[id]` et injecté en `?gid=`
- `name`, `description`, `url` (chemin de l'iframe, ex. `/games/elsass-farm/v2/index.html`)
- `published` (booléen) — un jeu masqué est invisible pour les clients, mais reste visible et jouable pour l'admin
- `created_at`

**`score`** — classements
- PK `(game_id, user_id)` → une seule ligne par jeu et par joueur (le meilleur score)
- `user_name` (copié du jeton à l'écriture), `score`, `updated_at`

**`save`** — sauvegardes cloud
- PK `(game_id, user_id)`, `data` (**jsonb**), `updated_at`
- FK vers `game` en `ON DELETE CASCADE` (supprimer un jeu purge ses scores/saves)

---

## 6. Gestion du catalogue : /admin

Page réservée à l'uid `ADMIN_UID` (404 pour tout le monde d'autre ; chaque action serveur re-vérifie).

- **Jeux détectés dans le dossier** : scan de `public/games/` (`src/lib/games-fs.ts`) → les jeux présents sur le disque mais absents du catalogue s'ajoutent en 1 clic.
- Ajout manuel, modification, **Publier/Masquer**, suppression.
- L'admin voit les jeux masqués (badge « Masqué ») dans le catalogue et le dashboard, et peut y jouer.

---

## 7. Cartographie du code

```
src/
├── app/
│   ├── page.tsx                 # Accueil
│   ├── login/page.tsx           # Connexion (compte portail Odoo)
│   ├── games/page.tsx           # Catalogue (admin : voit aussi les masqués)
│   ├── play/[gameId]/page.tsx   # Lance un jeu (admin : peut tester les masqués)
│   ├── dashboard/page.tsx       # Tableau de bord utilisateur
│   ├── profile/page.tsx         # Profil (ses scores)
│   ├── scores/page.tsx          # Classements
│   ├── admin/                   # Gestion du catalogue (ADMIN_UID uniquement)
│   │   ├── page.tsx             #   liste + détection dossier
│   │   └── actions.ts           #   ajout/modif/publication/suppression
│   ├── actions/auth.ts          # Server Actions : login/logout + cookies signés
│   └── api/
│       ├── auth/me/route.ts     # Utilisateur courant (jeton vérifié)
│       ├── games/route.ts       # Catalogue publié
│       ├── scores/route.ts      # GET/POST scores → table score
│       └── storage/route.ts     # GET/POST sauvegardes → table save
├── components/                  # auth-provider, game-shell, ui/ (shadcn)
├── lib/
│   ├── db.ts                    # Pool pg + création auto du schéma
│   ├── session.ts               # Signature/vérification HMAC du cookie
│   ├── games-fs.ts              # Détection des jeux dans public/games/
│   └── odoo.ts                  # Client Odoo réduit à authenticate()
└── middleware.ts                # Redirige vers /login si cookie absent

public/games/
├── system/                      # Socle mutualisé (system.js + engine/v1)
├── _template/v1/                # Template de jeu minimal
├── elsass-farm/  elsass-frost/  cerebro/  similitude/  …
```

---

## 8. Intégration iframe (site parent)

- `next.config.ts` pose **`Content-Security-Policy: frame-ancestors *;`** pour autoriser l'embarquement.
- Cookies `sameSite: "none"; secure; partitioned` + app servie sur un **sous-domaine du site** → cookies first-party dans l'iframe (Safari OK). Détail : `DOMAINE_COOKIES_SSO.md` (non versionné).

---

## 9. Déploiement (EN DEUX TEMPS — important)

- **Docker** : `Dockerfile` multi-étapes, build **`output: "standalone"`**, `pnpm install --frozen-lockfile`.
- **CI/CD** : un push sur `main` déclenche l'Action GitHub (`.github/workflows/main.yaml`) qui **construit et pousse l'image** sur ghcr.io (quelques minutes). **Puis** Coolify doit **redéployer** pour tirer la nouvelle image. Si on redéploie avant la fin de l'Action, on relance l'ancienne version.
- **Variables d'environnement** (Coolify / `.env.local`, jamais commité) : `ODOO_URL`, `ODOO_DB`, `DATABASE_URL` (URL interne, avec `?sslmode=disable`), `SESSION_SECRET`, `ADMIN_UID`, `COOKIE_DOMAIN`.

> ⚠️ Toute modification de `package.json` **impose** de régénérer `pnpm-lock.yaml`, sinon le build échoue sur `--frozen-lockfile`.

---

## 10. Historique des mutations (pour mémoire)

1. **Auth Supabase + stockage lowdb/SQLite** → abandonnés.
2. Migration **complète vers Odoo** (auth + données via 3 modèles Studio).
3. **02/07/2026** : sous-domaine + cookies first-party dans l'iframe.
4. **05/07/2026** : **migration PostgreSQL** — les données quittent Odoo (fin des 16 €/mois de maintenance Studio et des limites de requêtes SaaS) ; Odoo réduit au login ; session signée HMAC ; page /admin ; modèles Studio supprimés d'Odoo. Détail : `MIGRATION_POSTGRES.md`.
