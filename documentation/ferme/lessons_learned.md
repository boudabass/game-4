# 🧠 Retours d'Expérience & Bonnes Pratiques

Ce document consigne les erreurs majeures rencontrées lors du développement de l'interface d'Elsass Farm ainsi que les solutions standardisées pour les éviter.

## 1. 🛑 L'Erreur du "Mur Invisible" (Events DOM vs p5.js)

### Problème
L'utilisation de `opacity: 0` ou `visibility: hidden` sur des conteneurs de grande taille (`.modal-overlay`) laissait l'élément dans l'arbre de rendu interactif. Même transparent, le conteneur interceptait les clics de la souris, empêchant le joueur d'interagir avec le canvas p5.js en dessous.

### Solution Standard
**Utiliser systématiquement `display: none` pour masquer une interface.**
- `display: none` : L'élément est retiré du flux de rendu et d'interaction.
- `display: flex` (ou `block`) : L'élément est affiché et interactif.
- **NE JAMAIS** se fier uniquement à l'opacité pour "cacher" un élément interactif.

---

## 2. 📐 Gestion des Dimensions Relatives (%)

### Problème
Lorsqu'un élément est imbriqué dans un conteneur qui fait déjà 50% de la largeur de l'écran, un style `width: 50%` sur l'enfant ne fera que 25% de l'écran total. Cela a causé des erreurs de calcul sur les marges de l'inventaire.

### Règle de Calcul
Pour obtenir une marge de **2% de l'écran** dans un conteneur de **50%**, il faut appliquer une marge de **4%** (`2 / 50 * 100`).
- **Consigne** : Toujours vérifier si le `%` est relatif au viewport (`vw`) ou au parent.

---

## 3. 📑 Hiérarchie des Événements (Propagation)

### Problème
Les clics sur les boutons de l'interface DOM "traversaient" parfois l'interface pour déclencher des actions dans le jeu p5.js (mouvement du personnage, labourage).

### Solutions cumulatives
1.  **Stop Propagation** : Ajouter `onclick="event.stopPropagation()"` sur les conteneurs de modales.
2.  **UIManager Guard** : Utiliser `UIManager.isAnyModalOpen()` dans la fonction `mouseClicked()` de p5.js pour bloquer l'input monde.
3.  **Z-Index** : Les raccourcis UI (`.shortcut-zone`) doivent avoir un `z-index` supérieur (110) à l'overlay de l'inventaire (100) pour rester fonctionnels même si l'inventaire est "ouvert" à gauche.

---

## 4. 🖱️ Règle d'Or : Unification des Inputs (Mobile/Desktop)

### Problème
Les événements p5.js (`mouseClicked`, `touchEnded`) sont incompatibles pour gérer à la fois le **Drag de Caméra** et le **Tap d'Action** sans conflit.

### Solution Standard
**Contourner les événements p5.js pour le monde.** Utiliser des écouteurs d'événements DOM (`mousedown`/`touchstart`, `mouseup`/`touchend`) attachés directement à l'élément `<canvas>`.

*   **Détection :** Calculer la distance parcourue entre `start` et `end`.
*   **Action :** Si distance < 30px (seuil mobile), exécuter `handleWorldClick()`.
*   **Drag :** Si distance > 30px, déplacer la caméra.
*   **Stabilité :** Utiliser `InputManager.ignoreNextDelta` pour éviter le "saut" de la caméra au début du toucher.

---

## 5. 🎨 Design & Ergonomie Seniors

### Principes retenus
- **Slots Fixes** : Pas de réorganisation. Un objet a une place immuable pour favoriser la mémoire visuelle.
- **Layout Horizontal** : Pour les listes denses (Graines, Loot), le format horizontal (Icone | Nom | Quantité) est plus lisible et compact que le format vertical.
- **Pas de Drag & Drop** : Trop complexe pour certains utilisateurs. Le clic/tap simple est la norme.
- **Feedback immédiat** : Utiliser `display` instantané. Les animations trop longues créent de la confusion sur la réactivité du système.