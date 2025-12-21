# 🪟 Patterns : Système UI & Z-Index (Standard v3)

Ce pattern définit l'architecture des interfaces utilisateur pour les jeux Dyad (p5.js + DOM). Il est issu des standards validés sur *Elsass Farm*.

## 1. Philosophie "Solid & Stable"

*   **HUD Sacré** : La barre de statut est **toujours** visible et **toujours** au-dessus.
*   **Overlay Opaque** : Une fenêtre ouverte (Inventaire, Map) masque **totalement** le jeu.
*   **Pas de Transparence** : Utilisation de couleurs solides (Flat UI) pour éviter les incohérences visuelles.
*   **Hiérarchie Z-Index Stricte** : Le DOM contrôle l'accès aux inputs du Canvas.

---

## 2. La Pile d'Affichage (Z-Hierarchy)

L'ordre est absolu. Tout écart crée des bugs d'interaction.

| Niveau | Élément | Z-Index | Rôle | Interaction |
|---|---|---|---|---|
| **1. TOP** | **HUD Bar** | **1000** | Barre de statut permanente | `pointer-events: auto` (Toujours cliquable) |
| **2. COVER**| **Overlays** | **500** | Map, Inventaire, Menu, Pause | `pointer-events: auto` (Bloque tout ce qui est dessous) |
| **3. UI** | **Quick Actions**| **110** | Boutons flottants (Sauf si Cover) | `pointer-events: auto` |
| **4. FOND** | **CANVAS** | **0** | Le jeu p5.js | `pointer-events: none` (Si recouvert) |

---

## 3. Implémentation CSS Standard

### A. Le HUD (Top Bar)
Doit être fixé en haut et impérativement au-dessus des overlays.

```css
.hud-bar {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 60px;
    z-index: 1000; /* Toujours au-dessus */
    background: #2c3e50; /* Opaque solide */
    pointer-events: auto;
}
```

### B. L'Overlay "Cover All"
Une modale ne flotte pas au milieu de l'écran. Elle **remplit** l'écran (hors HUD).

```css
.modal-overlay {
    position: absolute;
    top: 60px; /* Commence SOUS le HUD */
    left: 0; width: 100%; height: calc(100% - 60px);
    z-index: 500; /* Cache le jeu et les QuickActions */
    background: #2c3e50; /* Opaque solide (Pas de rgba) */
    display: none;
    pointer-events: auto; /* CRITIQUE : Bloque les clics vers le canvas */
}
```

---

## 4. Gestion des Événements (Input Blocking)

Le blocage des clics se fait à deux niveaux : **Physique (DOM)** et **Logique (JS)**.

### Niveau 1 : Le Bouclier DOM
Grâce à `pointer-events: auto` sur l'overlay (Z-500), la souris ne peut physiquement pas toucher le canvas (Z-0) ni les QuickActions (Z-110). C'est la protection la plus fiable.

### Niveau 2 : StopPropagation (HUD)
Les boutons du HUD (`z-index: 1000`) sont au-dessus de tout. Pour éviter qu'un clic sur "Menu" ne traverse, il faut impérativement :

```html
<button onclick="event.stopPropagation(); toggleMenu()">☰ MENU</button>
```

### Niveau 3 : Guard Clause (JS)
En sécurité finale dans le code p5.js :

```javascript
function mouseClicked() {
    if (UIManager.isAnyModalOpen()) return false; // Bloque l'input jeu
    // Logique jeu...
}
```

---

## 5. Palette (Flat UI v3)

Abandon des transparences complexes (`rgba`) au profit de couleurs solides.

*   **Fonds** : `#2c3e50` (Midnight Blue) - Reposant, contraste fort avec le texte blanc.
*   **Conteneurs** : `#1e272e` (Dark Slate) - Pour les zones de contenu interne.
*   **Boutons** : `#34495e` (Wet Asphalt)
*   **Actions** : `#27ae60` (Nephritis) / `#c0392b` (Pomegranate)

---

## 6. Structure des Modales Spéciales

### Inventaire Latéral
Même s'il ne prend que 50% de l'écran visuellement pour le contenu, l'overlay protecteur couvre **100%**.

*   `#inventory-modal` (Overlay) : `width: 100%`, `background: #2c3e50`.
*   `.modal-content` : `left: 2%`, `width: 46%`.
*   Résultat : Le jeu est caché, l'interaction est bloquée partout, le focus est total.
