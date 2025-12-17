# Tâches - Standardisation GameSystem (Pivot Q5/P5Play)

## 1. Documentation & Standards
- [x] Rédiger `documentation/developer_guide.md` : La bible pour créer/adapter un jeu (Standard Q5/P5Play).
- [x] Mettre à jour `documentation/analysis_forest.md` (Marquer p5.js comme Legacy).
- [x] Mettre à jour `documentation/analysis_asteroids.md` (Marquer p5.js comme Legacy).
- [x] Mettre à jour `documentation/implementation_plan.md` (Inclure les dépendances Q5/P5Play).
- [x] Mettre à jour `documentation/patterns/*.md` (Remplacer p5.js par Q5/P5Play).

## 2. Nettoyage Backend (En Cours)
- [ ] Simplifier `src/app/actions/game-manager.ts` :
    - [ ] Supprimer `generateIndexHtml` (ancienne version "smart").
    - [ ] Créer `createHelperFiles` qui génère juste `index.html` MINIMAL (avec Q5/P5Play).
    - [ ] Supprimer injection lors de l'upload.

## 3. Implémentation du Coeur (GameSystem)
- [ ] Implémenter `public/games/system/system.js` (Namespace `window.GameSystem` compatible Q5).

## 4. Adaptation des Jeux
- [ ] Refactorer `Test-Hub` (Verification).
- [ ] Remplacer le jeu `Snake` par la version Q5/P5Play pour validation du workflow complet.