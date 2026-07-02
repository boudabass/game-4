# 🏛️ Architecture — Game Center

> **Document de référence de la vue d'ensemble.** Il décrit *comment tout s'assemble* :
> la plateforme Next.js, le backend Odoo, les jeux p5.js, et le déploiement.
> Pour le détail du développement de jeu, voir `developer_guide.md` et `GAME_WORKFLOW.md`.
> Dernière mise à jour : 2 juillet 2026 (après finalisation de la migration vers Odoo).

---

## 1. En une phrase

Une **plateforme web Next.js** héberge une arcade de **jeux p5.js**, embarquée en **iframe** dans le site `monsite.com`, avec **Odoo comme unique backend** (authentification, catalogue de jeux, scores, sauvegardes). Le tout est packagé en **Docker** et déployé via **Coolify**.

---

## 2. Les trois briques

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVIGATEUR DU CLIENT (dans une iframe sur monsite.com)         │
│                                                                       │
│   ┌───────────────────────────┐      ┌────────────────────────────┐  │
│   │  PLATEFORME (React/Next)  │      │   JEU (iframe p5.js)        │  │
│   │  /games, /play, /scores…  │◄────►│   public/games/<jeu>/<v>/   │  │
│   │  AuthProvider + UI         │      │   + system.js (GameSystem)  │  │
│   └────────────┬──────────────┘      └──────────────┬─────────────┘  │
└────────────────┼────────────────────────────────────┼────────────────┘
                 │  fetch same-origin (cookie de session transmis)
                 ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SERVEUR NEXT.JS  (conteneur Docker, déployé par Coolify)            │
│                                                                       │
│   Server Actions        Route Handlers (/api/*)                       │
│   - actions/auth.ts     - /api/auth/me    - /api/scores               │
│                         - /api/games      - /api/storage              │
│                          │                                            │
│                          ▼                                            │
│                  src/lib/odoo.ts  (client JSON-RPC)                    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  JSON-RPC (session_id dans un cookie)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ODOO (SaaS, votre-instance.odoo.com)  —  BACKEND UNIQUE               │
│   Auth : /web/session/authenticate                                    │
│   Modèles custom (Studio) :                                           │
│     - x_game_release  (catalogue de jeux)                             │
│     - x_game_score    (scores / classements)                          │
│     - x_game_save     (sauvegardes cloud)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### A. La plateforme (Next.js 15, App Router)
Le code applicatif vit dans `src/`. Elle sert les pages, l'UI, et expose une petite API interne qui fait le pont vers Odoo.

### B. Les jeux (p5.js, statiques)
Chaque jeu est un ensemble de fichiers statiques dans `public/games/<jeu>/<version>/`. Ils sont servis **par le même serveur Next.js** (même origine), ce qui est essentiel : le cookie de session est donc transmis automatiquement quand un jeu appelle l'API.

### C. Odoo (backend unique)
Instance Odoo SaaS. On n'a **pas la main sur le code Odoo** : la personnalisation se fait via **Odoo Studio** (modèles `x_...` et champs `x_studio_...`). Odoo gère l'authentification et stocke toutes les données.

---

## 3. Flux d'authentification

1. L'utilisateur saisit **l'identifiant + mot de passe d'un compte client Odoo** sur `/login`.
2. La **Server Action** `signInAction` (`src/app/actions/auth.ts`) appelle `odooClient.authenticate()`.
3. `src/lib/odoo.ts` fait un POST JSON-RPC vers `/web/session/authenticate` et récupère un **`session_id`**.
4. Deux cookies sont posés (`sameSite: "none"; secure` — obligatoire pour fonctionner dans l'iframe) :
   * **`arcade_session`** — le `session_id` Odoo, en **`httpOnly`** (jamais accessible au JS du navigateur). Sert à tous les appels RPC serveur.
   * **`arcade_user`** — métadonnées du profil (uid, nom, email), lisible côté client pour l'UI.
5. Côté client, `AuthProvider` (`src/components/auth-provider.tsx`) appelle `/api/auth/me` pour connaître l'utilisateur courant.

> ⚠️ **Règle de sécurité** : le front ne parle **jamais** directement à Odoo. Tout passe par les Server Actions / Route Handlers, qui seuls lisent le cookie `arcade_session`. On ne stocke jamais la session dans `localStorage`.

---

## 4. Flux de données (scores & sauvegardes)

Le pont entre un jeu (dans l'iframe) et Odoo passe par `public/games/system/system.js`, qui expose l'objet global **`window.GameSystem`**.

| Action jeu | Appel `GameSystem` | Route Next.js | Opération Odoo |
|---|---|---|---|
| Envoyer un score | `GameSystem.Score.submit(score)` | `POST /api/scores` | `create` sur `x_game_score` |
| Lire le classement | `GameSystem.Score.getLeaderboard()` | `GET /api/scores?gameId=` | `search_read` sur `x_game_score` |
| Sauvegarder | `GameSystem.Save.write(data)` | `POST /api/storage` | `create` ou `write` sur `x_game_save` |
| Charger | `GameSystem.Save.read()` | `GET /api/storage?gameId=` | `search_read` sur `x_game_save` |

Chaque route (`src/app/api/*`) : lit le cookie `arcade_session` → si absent, renvoie 401 → sinon appelle `odooClient.callKw(...)` avec la session. La déduplication des sauvegardes est gérée côté route `/api/storage` (une sauvegarde par jeu et par utilisateur : `write` si elle existe, sinon `create`).

---

## 5. Les modèles Odoo (le schéma)

Trois modèles custom, configurés dans Odoo Studio :

**`x_game_release`** — le catalogue de jeux
- `id` — utilisé dans les URLs `/play/[id]`
- `x_name` — nom affiché
- `x_studio_description` — description
- `x_studio_url` — chemin de l'iframe (ex. `/games/elsass-farm/v2/index.html`)

**`x_game_score`** — scores / classements
- `x_studio_game` (relation vers release), `x_studio_user` (relation user), `x_studio_score` (entier), `create_date`

**`x_game_save`** — sauvegardes cloud
- `x_studio_game`, `x_studio_user`, `x_studio_data` (JSON sérialisé en texte), `write_date` (sert à charger la version la plus récente)

---

## 6. Cartographie du code

```
src/
├── app/
│   ├── page.tsx                 # Accueil
│   ├── login/page.tsx           # Connexion (compte Odoo)
│   ├── games/page.tsx           # Catalogue
│   ├── play/[gameId]/page.tsx   # Lance un jeu dans l'iframe (GamePlayer)
│   ├── dashboard/page.tsx       # Tableau de bord utilisateur
│   ├── profile/page.tsx         # Profil
│   ├── scores/page.tsx          # Classements
│   ├── actions/auth.ts          # Server Actions : login/logout + cookies
│   └── api/
│       ├── auth/me/route.ts     # Renvoie l'utilisateur courant (via cookie)
│       ├── games/route.ts       # Liste les jeux depuis Odoo
│       ├── scores/route.ts      # GET/POST scores → x_game_score
│       └── storage/route.ts     # GET/POST sauvegardes → x_game_save
├── components/
│   ├── auth-provider.tsx        # Contexte d'auth côté client
│   ├── game-player.tsx          # Iframe + mise à l'échelle du jeu
│   ├── iframe-resizer.tsx       # postMessage ARCADE_RESIZE vers le parent
│   └── ui/                      # Composants shadcn/ui
├── lib/
│   └── odoo.ts                  # Client JSON-RPC Odoo (authenticate, callKw)
└── middleware.ts               # (voir §8 — actuellement passe-tout)

public/games/
├── system/                      # Cœur mutualisé (GameSystem, UI, moteur)
│   └── system.js                # Pont GameSystem (Score, Save, Lifecycle…)
├── elsass-farm/{v1,v2}/         # Jeux (chaque version = un dossier)
├── elsass-frost/v1/  cerebro/v1/  similitude/v1/  …
```

---

## 7. Intégration iframe (site parent)

- `next.config.ts` pose l'en-tête **`Content-Security-Policy: frame-ancestors *;`** pour autoriser l'embarquement.
- Les cookies en `sameSite: "none"; secure` permettent à la session de survivre dans le contexte iframe cross-site.
- `IframeResizer` mesure la hauteur du contenu et envoie un `postMessage({ type: "ARCADE_RESIZE", height })` au site parent pour qu'il ajuste la hauteur de l'iframe (évite le double scroll).

---

## 8. Déploiement

- **Docker** : `Dockerfile` multi-étapes, build en mode **`output: "standalone"`** (image légère). Installation des dépendances avec **`pnpm install --frozen-lockfile`**.
- **CI/CD** : `.github/workflows/main.yaml` → un push sur `main` déclenche le redéploiement **Coolify**.
- **Variables d'environnement** (dans `.env.local`, jamais commité) : `ODOO_URL`, `ODOO_DB`.

> ⚠️ **Conséquence pratique** : toute modification de `package.json` **impose** de régénérer `pnpm-lock.yaml`, sinon le build Docker échoue sur `--frozen-lockfile`.

---

## 9. Points d'attention connus (dette technique)

- **Middleware non protecteur** : `src/middleware.ts` laisse actuellement passer toutes les requêtes. La sécurité repose uniquement sur la vérification du cookie dans chaque route API. Les pages (`/games`, `/play/…`) ne sont pas protégées au niveau middleware.
- **Gestion de l'expiration de session** : la règle visée est « si Odoo renvoie une session expirée → purger les cookies → rediriger vers `/login` ». À vérifier que c'est bien appliqué partout.
- **Petit bug cosmétique** : dans `system.js`, `Save.read()` logue `json.updatedAt` alors que l'API renvoie `write_date` → la date affichée en console est « Invalid Date ». Sans impact fonctionnel.

---

## 10. Historique des mutations (pour mémoire)

Le projet a connu plusieurs bascules successives avant d'arriver à l'architecture actuelle :
1. **Auth Supabase + stockage lowdb/SQLite (`db.json`)** → abandonnés.
2. Migration **complète vers Odoo** (auth + données).
3. **Juillet 2026** : nettoyage des résidus (dépendances `@supabase/*` retirées, `sql-wasm.wasm` et `data/` supprimés, `.env`/`.env.example` remis à jour). Le projet est désormais 100 % Odoo.
