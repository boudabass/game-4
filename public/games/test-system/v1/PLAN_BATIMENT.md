# Plan d'Implémentation : Système de Bâtiment Unifié

## 1. Objectif
Finaliser la migration du système de construction "Frost" vers l'architecture modulaire "System".
Le but est d'avoir un système de construction, de démolition et de gestion (staff) découplé et configuré via les nouveaux fichiers de configuration modulaires.

## 2. État des lieux
- **Configuration** : `Config.BUILDINGS` est désormais agrégé dynamiquement depuis `config/buildings/*.js`.
- **Logique Core** : `BuildingSystem` a été refactorisé en `base.js`, `management.js`, `placement.js`.
- **UI** : Le module `ui` est présent mais incomplet par rapport aux besoins du `placement.js` (méthodes manquantes).

## 3. Tâches Restantes

### A. Intégration UI (Priorité Haute)
Le fichier `placement.js` et `management.js` font appel à des méthodes UI qui n'existent pas encore dans le nouveau module `core/ui`.
- [ ] Créer `actionModal.js` dans `core/ui/` pour implémenter :
    - `UIManager.showActionModal(type, data, content/confirm, cancel)`
    - `UIManager.hideActionModal()`
- [ ] Créer `detailPanel.js` dans `core/ui/` pour implémenter :
    - `UIManager.showDetailPanel(building)`
    - `UIManager.updateDetailPanel(building)`
    - `UIManager.hideDetailPanel()`

### B. Validation du GridSystem
- [ ] Vérifier que `core/grid/GridSystem.js` expose bien :
    - `worldToGrid`
    - `gridToWorld`
    - `isOccupied`
    - `place`
    - `checkZoneType` (Requis pour les serres)

### C. Finalisation de la Configuration
- [ ] S'assurer que `Config.initBuildings()` est appelé au démarrage (`main.js` ou `system.js`).
- [ ] Vérifier que toutes les catégories (Tech, Food, People) ont leur fichier de config.

## 4. Workflow d'exécution suggéré
1.  **Création des modules UI manquants** : Implémenter les modales d'action et panneaux de détails.
2.  **Audit GridSystem** : S'assurer que les méthodes appelées par le placement existent.
3.  **Test d'intégration** : Lancer le jeu et tenter de construire un bâtiment de chaque catégorie.
