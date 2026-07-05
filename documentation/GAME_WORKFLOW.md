# 🤖 Game Development Workflow (Guide de Développement)

Ce document est la **Source de Vérité** pour tout développement de jeu sur cette plateforme.
Il doit être consulté avant de commencer toute tâche de création ou de modification de jeu.

---

## 1. Stack Technique Imposée

* **Rendu** : p5.js (Mode Global)
* **Moteur** : p5.play v3 (Version CDN) + planck.js
* **Système** : `/games/system/system.js` (Gestionnaire global fourni par la plateforme)
* **Langage** : JavaScript (ES6+), pas de TypeScript dans les dossiers de jeux pour simplifier l'exécution directe dans l'Iframe.

---

## 2. Processus de Développement (Pas à Pas)

### Phase 1 : Initialisation & Enregistrement
1. **Création du dossier** : Créer le dossier physique `public/games/{gameId}/{version}/`.
2. **Enregistrement au catalogue (page /admin)** :
   * Connectez-vous à l'arcade avec le compte admin et ouvrez `/admin`.
   * Le jeu apparaît dans « Jeux détectés dans le dossier » → un clic **Ajouter** (ou utilisez le formulaire manuel).
   * L'**ID numérique** attribué est celui utilisé dans `/play/<id>` et injecté en `?gid=`.
   * Laissez le jeu **masqué** tant qu'il n'est pas prêt : l'admin peut y jouer, pas les clients.
3. **HTML setup** : Créer `index.html` et configurer l'ID dans l'objet global :
   ```javascript
   window.DyadGame = { id: 'VOTRE_ID_NUMERIQUE_ODOO', version: 'v1' };
   ```
4. **Fichiers de base** : 
   * `config.js` : Définir toutes les constantes physiques et de style.
   * `sketch.js` : Établir le squelette avec `setup()` et `draw()`.

### Phase 2 : Core Gameplay (Mécaniques)
1. **Classes d'entités** : Créer des fichiers JS séparés pour les entités complexes (`player.js`, `enemy.js`) afin d'assurer la clarté du code.
2. **Physique** : Paramétrer les groupes, colliders (`static` pour les décors, `dynamic` ou `none` pour les entités mobiles) et mouvements.
3. **Validation** : S'assurer que le joueur répond correctement aux entrées clavier/tactiles.

### Phase 3 : Logique, États & Intégration Platform
1. **State Machine** : Utiliser un `switch(currentState)` dans la fonction `draw()` de p5.js pour basculer proprement entre le Menu, le Jeu, et le Game Over.
2. **Platform Hook** :
   * Appeler `window.GameSystem.Lifecycle.notifyReady()` à la fin de `setup()`.
   * Appeler `window.GameSystem.Score.submit(score)` lors de l'état Game Over.
   * Charger et sauvegarder l'état utilisateur via `window.GameSystem.Save.read()` et `write()`.

---

## 3. Règles d'Or (Do & Don't)

*   ✅ **DO** : Utiliser `allSprites.draw()` entre `camera.on()` et `camera.off()` pour un contrôle parfait du rendu.
*   ✅ **DO** : Gérer les dimensions de manière responsive en écoutant le redimensionnement du canvas de p5.js.
*   ❌ **DON'T** : Utiliser le `localStorage` du navigateur pour les données de progression (utiliser l'API Cloud `GameSystem.Save` qui synchronise avec PostgreSQL).
*   ❌ **DON'T** : Tenter de modifier un fichier `db.json` local, la base de données locale a été entièrement supprimée.