# 🪟 UI Modals — Système d’Interfaces Unifiées

Le UI Modal System définit les règles visuelles et tactiles de toutes les fenêtres contextuelles du jeu. Il repose sur un mélange de **HTML/CSS Overlay** et de logique de blocage pour le moteur **p5.js**.

## 1. 🧭 Philosophie (v2.0)

- **Isolation Radicale** : Toute interface fermée est en `display: none`. Elle n'intercepte aucun clic et n'existe pas pour le flux de rendu interactif.
- **Réactivité Immédiate** : Pas d'animations de transition de type "fade" sur l'inventaire principal. L'affichage doit être instantané.
- **Positionnement Stratégique** : Les interfaces ne sont plus obligatoirement centrées. L'inventaire est asymétrique (gauche) pour laisser le jeu visible et cliquable à droite.

---

## 2. ⚙️ Gestion de l'Affichage (CSS Standard)

Pour éviter les "clics fantômes" interceptés par des conteneurs invisibles :

| État | Propriété CSS | Résultat |
|---|---|---|
| **Fermé** | `display: none` | Invisible + Inerte (clics traversants) |
| **Ouvert** | `display: flex` | Visible + Interactif |

> [!CAUTION]
> **NE JAMAIS** utiliser `opacity: 0` pour masquer une modale, car elle continuerait de bloquer les actions du jeu p5.js en dessous.

---

## 3. 🖼️ Structure & Dimensions

### Panneaux Latéraux (ex: Inventaire)
*   **Largeur** : 46% de l'écran.
*   **Marges** : 2% (Haut, Bas, Gauche, Droite).
*   **Overlay** : Limité à 50% de la largeur de l'écran pour libérer le champ à droite.

### Modales Centrales (ex: Menu, Map, Shop)
*   **Largeur** : 80% (mobile) / max 600px.
*   **Position** : Centrée avec `justify-content: center`.
*   **Overlay** : 100% de l'écran avec fond sombre `rgba(0,0,0,0.7)`.

---

## 4. ⚙️ Types de Modals Standardisés
Type	Contexte	Boutons	Spécificité
InventoryModal	Inventaire / Coffre	Fermer	Double panneau (Perso ↔ Coffre)
ShopModal	Ville / Commerce	Payer · Annuler · Reset	Comptabilise pièces + troc
MachineModal	Ferme Sud (Craft)	Fabriquer · Fermer	4 slots + Résultat
QuestModal	Taverne & Mairie	Accepter · Refuser	Description + récompense
DialogueModal	PNJ / Cinematique	Continuer · Fermer	Texte subtilement scrollé
PuzzleModal	Mine (énigmes)	Confirmer · Quitter	Interface full écran 90 %
PauseModal	HUD ≡ Menu	Reprendre · Sauvegarde · Quitter	Statistiques rapides

## 5. 🎨 Couleurs et Signaux
Élément	Couleur (CSS)	Rôle
Bordure principale	#6b7280 (gris clair)	Cadre neutre
Action positive	#34d399 (vert)	“Fabriquer”, “Payer”, “Accepter”
Action négative	#ef4444 (rouge)	“Annuler”, “Refuser”
Info / neutre	#93c5fd (bleu)	“Fermer”, “OK”
Danger / alerte	#fbbf24 (jaune/ambre)	“Attention”, “Énergie faible”
Des animations d’intensité (glow léger) assurent un retour visuel quand le bouton est tapé.

## 6. 🎨 Hiérarchie & Superposition (Z-Index)

| Niveau | Élément | Z-Index | Rôle |
|---|---|---|---|
| **P5.js** | Canvas | - | Monde de jeu |
| **HUD** | HUD Bar | Autre | Boutons fixes haut |
| **MODAL** | Overlay | **100** | Fond de blocage |
| **MODAL** | Content | **100** | Fenêtre active |
| **UI EXTRAS** | Shortcuts | **110** | Raccourcis QuickAction (prioritaires) |

---

## 7. 🔄 Protection des Clics (Anti-Traversée)

Pour empêcher un clic sur un bouton UI de labourer le champ en dessous :
1.  **DOM** : `onclick="event.stopPropagation()"` sur tous les boutons et conteneurs `.modal-content`.
2.  **Logic p5.js** : La fonction `mouseClicked()` doit systématiquement vérifier `UIManager.isAnyModalOpen()`.
3.  **Temps Mort** : Une sécurité de 150ms (`UIManager.lastCloseTime`) empêche un clic de fermeture de se transformer accidentellement en clic monde.

---

## 8. 📱 Adaptation Mobile
Taille dynamique selon densité d’écran (vw/vh).

Gestes exclus : tap uniquement.

Orientation : vertical > horizontal.

Touch events désactivés hors zone modale (`pointer-events: none` sur le jeu en dessous).

## 9. 🧭 Liens inter‑systèmes
Module	Usage du modal
InventorySystem	Onglets (Graine / Outil / Loot) affichés dans InventoryModal
CitySystem	Boutique double panneau (ShopModal)
Ferme Sud	MachineModal unifié (4 slots + Résultat)
QuestSystem	Description mission + acceptation (QuestModal)
TimeSystem	PauseModal + Menu sauvegarde
Mine	PuzzleModal pleine surface
EventSystem	Overlays d’annonce / notification : modaux temporaires non bloquants
Toutes les fenêtres suivent la même charte visuelle et comportementale.

## 10. 🔔 Overlays légers
L’EventSystem et le TimeSystem peuvent afficher de légers overlays temporaires,
distingués des vrais modals :

Élément	Durée	Transparence	Effet
Notification succès	1.5 s	0.6	Message “Récolte terminée !”
Alerte fatigue	1 s	0.8	“Trop fatigué…” + vibration
Message temps	2 s	0.5	“Jour + 1 → Été” transition douce
Ces éléments ne perturbent jamais la logique HUD.

## 11. ✅ Règles Absolues (v2.0)

*   ✅ Standard `display: none` obligatoire.
*   ✅ Marges relatives : 2% du viewport.
*   ✅ Pas d'overlay global pour l'inventaire (background transparent).
*   ✅ Bouton `Fermer` large et rouge en bas de chaque fenêtre.
*   ✅ QuickActions toujours au-dessus (Z-index 110).
*   ❌ Pas d'animations d'opacité lentes.
*   ❌ Pas de scroll horizontal.