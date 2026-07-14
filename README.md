# 🎮 Elsass Game — Arcade de jeux p5.js

Plateforme Next.js hébergeant une arcade de mini-jeux **p5.js**, embarquée en iframe dans un site Odoo. Développement assuré par une **équipe autonome de 14 crons IA** (méthode documentée dans Odoo).

> 📖 **Source unique de vérité : Odoo Knowledge (article 403).** La documentation vit dans Odoo, pas dans le repo.

---

## Stack

- **Frontend** : Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Jeux** : p5.js pur (pas de p5.play/planck), fichiers statiques dans `public/games/`
- **Moteur** : `engine/v2` — ActionZone, Camera, GameClock, GridSystem, Movement, SaveManager, LoadingManager
- **Backend** : Odoo (SaaS) via JSON-RPC + PostgreSQL (Coolify)
- **Déploiement** : Docker, GitHub Actions → Coolify

---

## Jeux actifs

| Jeu | Version | Moteur |
|-----|---------|--------|
| 🌾 Elsass Farm | v3 | engine/v2 |
| ❄️ Elsass Frost | v2 | engine/v2 |
| 🕊️ Cigogne | v1 | engine/v2 |
| 🧙 Waggis | v1 | engine/v2 |
| 🧪 Assets Test | v1 | engine/v2 |
| 📄 Template | v1 | engine/v2 |

---

## Branches

| Branche | URL | Usage |
|---------|-----|-------|
| `main` | https://arcade.theelsassisch.com | Production |
| `dev` | https://arcade-dev.theelsassisch.com | Test / développement |

---

## Équipe autonome (14 crons)

Le développement est piloté par une équipe de 14 crons IA. Configuration complète : **Odoo → article 468**.

| Rôle | Fréquence |
|------|-----------|
| 🎮 Game Designer | 0h, 12h |
| 📐 Product Owner | 0, 6, 12, 18h |
| 🔨 Développeur | 30 min |
| 🔗 Intégrateur | 2, 8, 14, 20h |
| 👁️ Reviewer | 3, 9, 15, 21h |
| 🧱 Architecte | 6, 18h |
| 🧪 QA | 1, 7, 13, 19h |
| 🎨 Content Designer | 4, 10, 16, 22h |
| ⚙️ DevOps | 5, 11, 17, 23h |
| 📊 Scrum Master | Lundi 10h |
| 🛡️ Gardien | 0, 12h |
| 📚 Documentaliste | 6, 18h |
| 🧹 Mainteneur | 3, 15h |
| 🚀 Release Manager | 0, 6, 12, 18h |

---

## Documentation

Toute la documentation est dans **Odoo Knowledge (hub 403)** :

| Article | Contenu |
|---------|---------|
| 406 | Index & Vue d'ensemble |
| 427 | p5.js — moteur & patterns |
| 460 | Plateforme & Technique |
| 467 | Méthode de décomposition par arbre |
| 468 | Configuration des 14 crons |
| 469 | CONSIGNES (pilotage du système) |
| 470 | JOURNAL |

---

## Quick start

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

```bash
docker compose up -d --build
```

---

## Règles

- **Odoo est la source unique de vérité** — pas de dossier `documentation/` dans le repo
- **Pas de p5.play/planck** — p5.js pur uniquement
- **Pas de push direct sur main** — le Release Manager merge `dev` → `main`
- **Pas de jeu sans engine/v2** — tous les jeux utilisent le moteur partagé