Plantes et fusion des stocks.">
# 📦 Système d'Inventaire & Craft (Ferme Nord)

Ce document détaille l'architecture de l'inventaire unifié (Plantes = Graines = Récoltes).

## 1. 🎮 HUD Permanent & Interface
L'inventaire est un panneau latéral fixe qui déploie une **surcouche opaque totale**.
(Structure visuelle inchangée : Gauche 46%, Opaque).

---

## 2. 📦 STRUCTURE & LAYOUT (v3.0 Unifiée)

L'inventaire est simplifié en 3 onglets majeurs.

### Onglet 1 : 🌱 PLANTES (Saisonnières)
Contient tout ce qui pousse dans la terre. C'est à la fois la réserve pour planter et le stock pour vendre/cuisiner.
*   **Format :** HORIZONTAL (4 colonnes).
*   **Contenu :** 16 Slots Fixes par saison active.
*   **Logique :** C'est ici que l'item "Pomme de Terre" est stocké.
    *   Clic gauche pour sélectionner (pour planter).
    *   Compteur unifié.

| Saison | Item 1 | Item 2 | Item 3 | Item 4 |
|---|---|---|---|---|
| 🪵 PRINTEMPS | 🥔 P. de Terre | 🧅 Poireau | 🥬 Chou | 🌱 Radis |
| ☀️ ÉTÉ | 🫐 Bleuets | 🫘 Haricots | 🌶️ Piment | 🍈 Melon |
| ... | ... | ... | ... | ... |

### Onglet 2 : ⚙️ OUTILS
Contient l'équipement permanent.
*   **Format :** VERTICAL.
*   **Contenu :** Arrosoir, Pioche, Hache, Épée...

### Onglet 3 : 🧱 MATÉRIAUX (Loot Mine/Forêt)
Contient les ressources brutes qui ne se plantent pas.
*   **Format :** HORIZONTAL.
*   **Contenu :** Bois, Pierre, Minerais, Champignons sauvages (non cultivables).

---

## 3. 🔄 INTERACTIONS & ÉVÉNEMENTS

### 🖱️ Gestion des Stocks Unifiés
- **Achat** : Le joueur achète des "Pommes de Terre" au magasin pour démarrer son stock.
- **Vente** : Le joueur vend ses "Pommes de Terre" excédentaires.
- **Plantation** : Utilise 1 item du stock.
- **Récolte** : Ajoute 2 items au stock.

---

## 4. ✅ RÈGLES ABSOLUES - v3.0

*   ✅ **Unification** : Pas d'onglet "Graines" vs "Récolte". Tout est dans **PLANTES**.
*   ✅ **Layout GAUCHE Fixe**.
*   ✅ **Overlay TOTAL**.
*   ✅ **Saisons Strictes** : Seules les plantes de la saison en cours sont plantables.