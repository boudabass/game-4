# 🔧 Troubleshooting & Known Issues (p5.play v3)

Ce document recense les erreurs rencontrées lors du développement et les solutions de contournement validées.
**L'IA doit consulter ce fichier avant d'utiliser des fonctionnalités "avancées" de p5.play.**

## 1. Caméra

### 🔴 Problème : `camera.follow is not a function`
*   **Symptôme :** Crash au démarrage du jeu.
*   **Cause :** La version CDN de p5.play utilisée n'expose pas `follow` comme une fonction, ou l'API a changé.
*   **Solution Validée :** Suivi manuel dans `draw()`.
    ```javascript
    // Dans draw()
    let targetX = player.x; // + contraintes
    camera.x = lerp(camera.x, targetX, 0.1);
    camera.y = lerp(camera.y, targetY, 0.1);
    ```

### 🔴 Problème : Le monde ne bouge pas / HUD bouge avec le monde
*   **Symptôme :** Le joueur sort de l'écran, le HUD disparaît.
*   **Solution Validée :** Encapsulation explicite.
    ```javascript
    // 1. Rendu du monde
    camera.on();
    allSprites.draw();
    camera.off();

    // 2. Rendu HUD (coordonnées écran fixes)
    drawHUD();
    ```

## 2. Collisions & Détection

### 🔴 Problème : `overlap callback has to be a function` (avec coordonnées)
*   **Contexte :** Tentative de `group.overlap(x, y)` ou `allSprites.overlap(x, y)` pour tester si un point est vide.
*   **Cause :** Cette surcharge de la méthode semble buggée ou absente dans la version actuelle sans sprite témoin.
*   **Solution Validée :** Vérification AABB Manuelle.
    ```javascript
    function isPointOnPlatform(x, y) {
        for (let p of platforms) {
            if (x > p.x - p.w/2 && x < p.x + p.w/2 &&
                y > p.y - p.h/2 && y < p.y + p.h/2) {
                return true;
            }
        }
        return false;
    }
    ```

## 3. Gestion des États

### 🔴 Problème : `states is not defined`
*   **Symptôme :** Crash `ReferenceError`.
*   **Cause :** Le gestionnaire d'états global de p5.play n'est pas exposé.
*   **Solution Validée :** Machine à états "Maison".
    ```javascript
    const GameState = { MENU: 0, GAME: 1, GAMEOVER: 2 };
    let currentState = GameState.MENU;

    function draw() {
        switch(currentState) {
            case GameState.MENU: drawMenu(); break;
            // ...
        }
    }
    ```

## 4. Système & Serveur

### 🔴 Problème : Erreur 500 sur `POST /api/scores` ou `POST /api/storage`
*   **Symptôme :** Le jeu fonctionne mais la sauvegarde ou le score échoue en fin de partie.
*   **Cause :** La session Odoo a expiré ou le cookie `arcade_session` est manquant/invalide.
*   **Solution Validée :** Rediriger l'utilisateur vers la page de login ou s'assurer que la session est toujours active en interrogeant `/api/auth/me`.

## 5. Gameplay

### 🔴 Problème : Sauts "mangés" (Inputs ignorés)
*   **Symptôme :** Le joueur appuie sur Espace mais ne saute pas, surtout sur les bords ou en atterrissant.
*   **Solution Validée :** Implémenter **Coyote Time** et **Jump Buffer** (voir `documentation/base_parametre.md`).

---

# 🔧 Troubleshooting Plateforme (Next.js / PostgreSQL / Coolify)

> Ajouté le 05/07/2026, après la migration PostgreSQL.

### 🔴 `unable to verify the first certificate` (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
*   **Symptôme :** au démarrage, `Could not fetch games`, aucune donnée.
*   **Cause :** `DATABASE_URL` demande du SSL (`sslmode=require`) mais le Postgres Coolify a un certificat auto-signé.
*   **Solution :** utiliser l'**URL interne** Coolify et terminer par `?sslmode=disable` (app et base sont sur le même réseau interne, le SSL est inutile), puis redéployer.

### 🔴 Je pushe mais rien ne change en prod
*   **Cause :** le déploiement est en **deux temps** : (1) l'Action GitHub construit l'image Docker (quelques minutes), (2) Coolify doit **redéployer** pour tirer la nouvelle image. Redéployer avant la fin de l'Action relance l'ancienne version.
*   **Solution :** GitHub → onglet Actions → attendre le run **vert**, puis Coolify → **Redeploy**, puis Ctrl+F5.

### 🔴 404 sur /admin
*   **Causes possibles, dans l'ordre :**
    1. `ADMIN_UID` absent/faux dans les variables Coolify (doit être l'uid Odoo du compte admin).
    2. Cookie de session antérieur à la migration (format non signé) → **se déconnecter/reconnecter**.
    3. Version déployée trop vieille (voir point précédent).
*   **NB :** le 404 pour les non-admins est **volontaire** (la page doit être invisible).

### 🔴 Session invalide après un redéploiement avec nouveau SESSION_SECRET
*   **Cause :** changer `SESSION_SECRET` invalide toutes les sessions signées.
*   **Solution :** c'est normal — tout le monde doit se reconnecter. Ne changer le secret qu'en connaissance de cause.

### 🔴 Une page "descend" à l'infini dans l'iframe Odoo (boucle d'agrandissement)
*   **Symptôme :** la page charge puis grandit/descend sans jamais s'arrêter (déjà vu deux fois : 29/06/2026 sur l'ancienne landing page, 07/07/2026 sur la nouvelle landing page refaite).
*   **Cause :** une page hors `/play/*` utilise une classe Tailwind relative au viewport (`h-screen`, `min-h-screen`, `min-h-[80vh]`, etc.). Or `IframeResizer` (`src/components/iframe-resizer.tsx`) mesure la hauteur du `body` de cette page et l'envoie à Odoo via `postMessage({ type: "ARCADE_RESIZE" })`, qui agrandit l'iframe en conséquence. Comme `layout-wrapper.tsx` ajoute un header (`MainNav`/`UserNav`) + padding au-dessus du contenu sur ces pages, le contenu dépasse toujours la hauteur de l'iframe. Cette hauteur `vh` se recalcule alors sur la **nouvelle** hauteur d'iframe (plus grande), dépasse à nouveau → nouvelle mesure → nouvel agrandissement → boucle infinie.
*   **Solution validée :** ne jamais utiliser d'unité relative au viewport (`h-screen`, `min-h-screen`, `100vh`, `100dvh`) sur une page hors `/play/*`. Utiliser une hauteur fixe en pixels à la place, ex. `min-h-[800px]`.
    *   Seule exception : `src/app/play/[gameId]/page.tsx` peut utiliser `h-[100dvh]`, car `IframeResizer` ignore la mesure de contenu sur ces pages (`ARCADE_MODE: "game"` → c'est Odoo qui fixe la hauteur de l'iframe à la hauteur d'écran du visiteur, pas de feedback loop possible).
    *   Le seuil de sécurité de 30px dans `iframe-resizer.tsx` (`ResizeObserver`) ne suffit pas à casser cette boucle-là : chaque itération grandit de bien plus que 30px.
*   **Fix du 07/07/2026 :** `src/app/page.tsx`, `h-screen` → `min-h-[800px]` (commit `9350f30`).
