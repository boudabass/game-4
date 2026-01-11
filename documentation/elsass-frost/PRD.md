# PRD - Elsass Frost

## Vision du Produit
**Elsass Frost** est une adaptation "light" et centrée sur l'éthique de Frostpunk. Le jeu propose une expérience de survie urbaine dans un climat polaire extrême, où la gestion des ressources matérielles est indissociable des compromis moraux.

## Piliers du Jeu
1. **Survie Collective**: Le joueur gère une cité, pas un personnage.
2. **Chaleur = Vie**: Le générateur est le cœur battant de la ville.
3. **Poids des Lois**: Chaque décision légale modifie le visage social de la ville.
4. **Zéro Combat Direct**: La menace est environnementale et sociale, pas militaire.

## Mécaniques de Gameplay (Adaptation Frostpunk 1)

### 1. Gestion de la Chaleur
- **Le Générateur**: Doit être alimenté en charbon. Possède des niveaux de puissance (I, II, III, IV) et de portée.
- **Zones de Chaleur**: Les bâtiments hors zone consomment plus de ressources ou rendent les citoyens malades.
- **Température Dynamique**: Chutes de température programmées (ex: -20°C -> -40°C) imposant des urgences technologiques.

### 2. Ressources
- **Charbon**: Énergie primaire.
- **Bois/Acier**: Construction et recherche.
- **Vivres Crus / Rations**: Collecte et transformation via les cuisines.
- **Noyaux de Vapeur**: Ressources rares pour les bâtiments avancés.

### 3. Population & Travail
- **Groupes**: Ouvriers, Ingénieurs, Enfants.
- **Besoins**: Logement chauffé, nourriture, soins.
- **Conséquences**: Maladie, amputations (si froid extrême), décès.

### 4. Livre des Lois
- **Adaptation**: Travail des enfants, soupes vs repas complets, traitement des cadavres.
- **Vocation**: Espoir vs Discipline (Order) ou Foi (Faith).
- **Indicateurs**:
    - **Espoir**: Barre de motivation. Si vide = Exil/Game Over.
    - **Mécontentement**: Barre de tension. Si pleine = Révolte/Game Over.

## UI/UX & Accessibilité
- **Mobile First**: Interactions simples (tap, drag), menus contextuels larges.
- **Clarté Thermique**: Mode vue de chaleur pour identifier les zones critiques.
- **Feedback Haptique**: Vibrations lors des baisses de température ou événements critiques.

## Intégration Écosystème (Game Center)
- **Hub Centralisé**: Utilisation du système de navigation `system.js` pour retourner au hub.
- **Scores**: Basés sur la longévité de la cité, la population finale et le niveau d'éthique.
- **Sauvegarde Unifiée**: Persistance `LocalStorage` synchronisée avec la base de données centrale `db.json`.
