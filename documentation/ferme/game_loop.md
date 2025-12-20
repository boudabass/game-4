# Game Loop — Elsass Farm (Sim)
Cycle de jeu basé sur l'interaction directe et la gestion d'énergie.

🔄 BOUCLE D'ACTION (Micro)
1.  **Select Tool :** Le joueur choisit un outil dans le HUD (ex: Arrosoir).
2.  **Tap Tile :** Le joueur clique sur une case de la grille.
3.  **Check :** 
    *   Case valide ? (ex: Terre labourée pour planter)
    *   Énergie suffisante ? (ex: -2⚡)
    *   Item disponible ? (ex: -1 Graine)
4.  **Update :** 
    *   Modification visuelle immédiate (Sprite change).
    *   Débit ressources.
    *   Feedback (Particules/Son).

🌅 CYCLE TEMPOREL (Macro)
Contrairement à un RPG, le temps ne défile pas forcément en continu.
Le joueur peut déclencher la "Fin de Journée" quand il n'a plus d'énergie.

1.  **Phase Active :** Joueur dépense son énergie (Plantation, Récolte, Construction).
2.  **Bouton "Dormir/Jour Suivant" :**
    *   L'écran s'assombrit.
    *   Calcul de la pousse des plantes (+1 stade).
    *   Recharge Énergie (100%).
    *   Sauvegarde Auto.
3.  **Nouvelle Journée :** Le soleil se lève, les cultures ont changé.

✅ Règles v1.0
*   Pas de temps réel stressant. Le joueur joue à son rythme.
*   La contrainte est stratégique (Énergie/Or), pas temporelle (Vitesse).