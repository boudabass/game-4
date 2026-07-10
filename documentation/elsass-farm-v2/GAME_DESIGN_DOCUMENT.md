# Game Design Document — Elsass Farm V2

> Statut : document de cadrage — phase réflexion, aucun code.
> Détaille le contenu concret prévu par `CAHIER_DES_CHARGES.md`. Les noms, prix et durées ci-dessous
> sont des propositions de premier jet, à ajuster en phase de contenu/équilibrage (voir `ROADMAP.md`).
> Mis à jour le 10/07/2026 : céréales ajoutées (§2), recettes corrigées (§6), défis économiques retirés (§7),
> marché à prix fixes (§9), nouveaux chapitres Météo (§10) et Score (§11), décision assets révisée (§12).

## 1. Univers & thème

Un village alsacien fictif, quelque part entre plaine viticole et piémont vosgien. Colombages, vignes en coteaux, canaux et étangs à carpes, marché couvert, et une ancienne mine argentifère dans les hauteurs — clin d'œil au passé minier réel du Val d'Argent (Sainte-Marie-aux-Mines). Le ton reste léger et chaleureux, pas de contenu violent (cohérent avec l'absence de combat).

> Structure du monde (zones multiples reliées par portails) détaillée dans
> `MONDE_ET_PORTAILS.md`.

## 2. Cultures par saison

| Saison | Cultures | Inspiration |
|---|---|---|
| Printemps | Asperges, rhubarbe, radis, épinards, choux primeurs | L'asperge d'Alsace (région de Hoerdt) |
| Été | Houblon, **blé, orge**, tomates, haricots verts, maïs, framboises | Houblonnières du Kochersberg/Haguenau, plaine céréalière d'Alsace |
| Automne | Raisin, choux à choucroute, courges, mirabelles, quetsches, noix | Route des vins, choucroute, vergers du Sundgau |
| Hiver | Poireaux, choux de Bruxelles, topinambours, sapins (culture spéciale liée au marché de Noël) | Marché de Noël alsacien |

> Ajout 10/07/2026 : blé et orge en été — indispensables pour les recettes (§6 : farine, bière) et pour que la boulangère (§5) ait réellement des céréales à acheter.

Chaque culture a un temps de pousse (2 à 10 jours selon rareté/valeur) et un prix de vente croissant avec la rareté, sur le modèle "achat élevé / vente basse" déjà validé dans l'ancien `city.md`.

## 3. Élevage

| Animal | Bâtiment | Production | Fréquence |
|---|---|---|---|
| Poules | Poulailler | Œufs | Quotidienne |
| Vaches | Étable | Lait (→ Munster, Tomme via artisanat) | Quotidienne |
| Chèvres | Étable | Lait de chèvre (→ fromage de chèvre) | Quotidienne |
| Moutons | Étable | Laine | Tous les 2-3 jours |
| Abeilles | Ruches (en extérieur, près des cultures fleuries) | Miel | Hebdomadaire |

Pas de foie gras ni d'élevage à connotation sensible — le choix des produits (œufs, lait, laine, miel) reste volontairement neutre et familial.

## 4. Pêche & Mine

### Pêche
Zones : rivière du village, canal, étang à carpes (clin d'œil à la "route de la carpe frite" du Sundgau), Ill (rivière alsacienne).
Prises typiques : carpe, truite, brochet, écrevisse, anguille. Raretés et tailles variables, influencées par la météo du jour (pluie = meilleures prises — règle formalisée dans le système météo, §10).

### Mine (paliers thématiques, sans combat — reprise du concept validé)

| Paliers | Ressources | Type d'énigme |
|---|---|---|
| 1-5 (galeries hautes) | Quartz des Vosges, cristaux | Association de symboles / séquence |
| 6-10 | Fer, cuivre | Séquence logique / rythme |
| 11-15 | Argent (clin d'œil au Val d'Argent) | Puzzle de coordination |
| 16-20 (galeries profondes) | Gemmes rares | Labyrinthe / réflexion visuelle |

Chaque énigme dure 30 à 90 secondes, récompense variable selon la performance (reprise directe du barème de l'ancien `mine.md`, toujours pertinent). Le temps de jeu est en pause pendant l'énigme et la réflexion ne coûte pas d'énergie (CDC §5 et §9) ; un point de repos en ruine existe à chaque palier et doit être reconstruit pour permettre de dormir sur place.

## 5. PNJ du village

| PNJ | Rôle | Terrain d'interaction | Effet de relation |
|---|---|---|---|
| Le vigneron | Vend/achète raisin et vin | Cave viticole | Réduction prix vin, accès recettes |
| La boulangère | Vend farine, achète céréales (blé, orge) | Boulangerie | Recettes de kougelhopf/bretzel |
| L'aubergiste | Tient la winstub, achète des produits fermiers | Winstub | Quêtes de livraison, buffs temporaires |
| Le potier | Vend des contenants (paniers, pots), inspiré de la poterie de Soufflenheim/Betschdorf | Atelier de poterie | Meubles/déco pour la ferme |
| La tisserande | Vend/achète laine et textile — clin d'œil à l'activité textile de The Elsassisch | Atelier textile | Amélioration d'inventaire (sacs) |
| L'apiculteur | Vend ruches, achète miel | Rucher du village | Recettes à base de miel (pain d'épices) |
| L'ancien mineur | Guide de la mine, vend de l'équipement d'exploration | Entrée de la mine | Débloque paliers plus profonds |
| Le maraîcher | Vend graines, achète récoltes | Marché couvert | Meilleurs prix de vente (réduction permanente) |

Jauge de relation par PNJ (paliers 0/5/10/15/20, sur le modèle repris de `quest_system.md`), avec effets cumulables mais purement fonctionnels (pas de dialogues ramifiés en V1). Rappel (CDC §10) : les réductions liées aux relations sont les **seules** modulations de prix du jeu — les prix de base ne bougent jamais.

## 6. Artisanat / recettes de transformation

| Structure | Ingrédients | Produit |
|---|---|---|
| Cave d'affinage | Lait de vache | Munster, Tomme |
| Cave d'affinage | Lait de chèvre | Fromage de chèvre |
| Cellier | Raisin | Vin d'Alsace |
| Brasserie | Houblon + orge | Bière artisanale |
| Moulin (meunerie simple) | Blé | Farine |
| Four | Farine + œufs | Kougelhopf, bretzel |
| Atelier miel | Miel + farine | Pain d'épices |
| Fermentation | Chou à choucroute | Choucroute |

> Corrections 10/07/2026 : l'orge et le blé existent désormais comme cultures (§2). La farine peut être produite au moulin (à partir du blé du joueur) ou achetée chez la boulangère. Le pain d'épices n'exige plus d'"épices" introuvables : recette simplifiée miel + farine (fidèle à la recette traditionnelle de base). La cuisine est de l'artisanat comme le reste (CDC §8), pas un système séparé.

Production asynchrone : dépôt des ingrédients, résultat prêt au réveil suivant (règle reprise de `farming_cycle_concept.md` §4).

## 7. Système de défis / catastrophes — catalogue de premier jet

| Catégorie | Exemple | Déclencheur | Effet | Mitigation possible |
|---|---|---|---|---|
| Météo | Gel tardif | Début de printemps, aléatoire | Détruit une partie des cultures de printemps non protégées | Construire un abri/serre |
| Météo | Grêle | Été, aléatoire | Dégâts sur cultures en plein champ | Diversifier / assurance récolte |
| Météo | Sécheresse | Été, plusieurs jours sans pluie | Croissance ralentie si non arrosé | Arroseurs automatiques |
| Météo | Inondation | Automne, proximité rivière/canal | Dégâts sur parcelles proches de l'eau | Ne pas cultiver en zone inondable, ou drainage |
| Sinistre | Incendie de grange | Aléatoire rare | Perte partielle de stock/animaux si non traité à temps | Réactivité du joueur (mini-jeu d'extinction) |
| Sinistre | Invasion de nuisibles | Aléatoire, plus fréquent si cultures non variées | Perte de récolte | Diversification, clôtures |
| Sinistre | Maladie du bétail | Aléatoire, plus fréquent si animaux mal nourris | Baisse temporaire de production | Bon entretien régulier |
| PNJ hostile | Rumeur négative | Relation PNJ dégradée | Baisse de réputation globale | Cadeaux, quêtes, dialogue régulier |

> Retirés le 10/07/2026 (décision John, prix fixes — CDC §10) : "concurrence commerciale" et "manipulation du marché asynchrone". Aucun défi ne touche aux prix ; les défis agissent sur les récoltes, les stocks, la production ou la réputation.

Règle d'équilibrage : jamais de perte totale ni de game over. Fréquence cible de départ : un défi significatif tous les 5 à 10 jours en jeu, ajustable après tests.

## 8. Compétences (reprise du modèle Stardew, adapté au scope sans combat)

| Compétence | Se développe en | Débloque |
|---|---|---|
| Agriculture | Récoltant des cultures | Arroseurs, nouvelles graines, qualité supérieure |
| Élevage | Récoltant des produits animaux | Bâtiments agrandis, nouveaux animaux |
| Pêche | Pêchant | Meilleures cannes, accès à de nouvelles zones |
| Extraction (mine) | Résolvant des énigmes de mine | Paliers plus profonds, meilleur loot |
| Artisanat | Fabriquant des produits transformés | Nouvelles recettes, structures avancées |

Pas de compétence "Combat" (hors scope V1). Choix de spécialisation à un palier intermédiaire (façon "professions" Stardew) : à détailler en phase de contenu.

## 9. Marché asynchrone — proposition de premier jet

Règles économiques (décision John 10/07/2026, détail CDC §10) : une seule monnaie, **tous les prix fixés d'avance par le catalogue du jeu, à jamais**. Aucune spéculation, aucune manipulation possible — ce n'est pas de la bourse. L'intérêt du marché est la **disponibilité** (acheter ce qu'on ne produit pas, ou hors saison), pas le profit sur les cours.

- "Marché régional" accessible depuis le marché couvert du village : annonces d'autres joueurs (produit, quantité — le prix est celui du catalogue), achat direct si l'annonce est toujours valide.
- "Mur du village" : messages courts, non modérables individuellement par le joueur, à cadrer côté modération/anti-abus avant développement (question technique, hors scope de ce document).
- Toute transaction est différée : le vendeur reçoit son gain à sa prochaine connexion.

## 10. Météo — catalogue de premier jet (ajout 10/07/2026)

La météo est un système central : chaque jour a un état tiré selon la saison, affiché dans le HUD, qui affecte le gameplay (CDC §9). Les défis météo (§7) sont les événements extrêmes de ce même système.

| Saison | États possibles (fréquence indicative) |
|---|---|
| Printemps | Soleil (40 %), pluie (40 %), brouillard (15 %), gel tardif (5 % — défi) |
| Été | Soleil (55 %), pluie (20 %), canicule (15 % — accélère la sécheresse), orage/grêle (10 % — défi) |
| Automne | Pluie (40 %), soleil (30 %), brouillard (20 %), tempête/inondation (10 % — défi) |
| Hiver | Neige (40 %), gel (30 %), soleil froid (25 %), tempête de neige (5 %) |

Effets transverses :
- **Pluie** : arrose automatiquement toutes les cultures (pas d'arrosage manuel ce jour-là) et améliore les prises de pêche.
- **Canicule / sécheresse** : l'arrosage manuel devient critique ; plusieurs jours consécutifs déclenchent le défi sécheresse.
- **Neige/gel** : seules les cultures d'hiver (§2) tolèrent le froid ; la pêche est réduite (eau gelée sur l'étang).
- Les pourcentages sont un premier jet, à équilibrer en Beta.

## 11. Score (ajout 10/07/2026)

La partie est sans fin : le score doit donc être **cumulatif et toujours croissant** (comme la formule validée d'Elsass Frost v2). Il est recalculé à chaque nuit de sommeil et soumis via `GameSystem.Score.submit()` — la plateforme conserve le meilleur score, donc ici le dernier.

Formule de premier jet (à équilibrer en Beta) :

```
score = jours joués × 20
      + or total gagné (cumul vie entière) ÷ 10
      + niveaux de compétences cumulés × 150
      + paliers de relation PNJ atteints × 50
      + défis surmontés × 100
```

Tous les termes sont des cumuls (jamais décrémentés) : un défi subi ne baisse pas le score, il fait juste gagner moins vite — cohérent avec la règle "jamais punitif définitivement" (§7).

## 12. Art / audio

Décisions John 10/07/2026, **révisées le 10/07/2026** (même jour, changement de cap après découverte de la qualité des packs libres Kenney) :

- **Lisibilité avant beauté** : on ne cherche pas un jeu esthétiquement impressionnant mais visuellement limpide (cohérent avec la cible plutôt senior, PRD §3).
- Style : minimaliste, esprit pixel art doux — mais pas exagérément pixelisé façon Game Boy.
- **Production (décision révisée) : texture packs CC0 Kenney.nl**, adaptés/recolorés au besoin. Abandon de la décision initiale "tout dessiné par le code" — inutile vu le volume et la qualité des packs libres disponibles. Détail des 15 packs retenus et de leur usage : `../ASSETS_TEXTURE_PACKS.md`. Pour elsass-farm v3 précisément : Tiny Farm (ferme), Fish Pack (décor de la zone pêche), Pixel Shmup (mini-jeu de pêche actif), Tiny Town (village/marché), Roguelike Characters (PNJ), Roguelike Indoors (intérieurs), Pico-8 Platformer (mine), Minimap Pack (navigation), UI Pack Pixel Adventure (HUD).
- Emoji : conservés en complément ponctuel pour les objets/produits (🥕 🐔 🐟 💎…), en fallback si un élément n'a pas de sprite adapté dans les packs retenus.
- ⚠️ Vigilance : le rendu des emoji varie selon l'OS/navigateur (Windows, Android, iOS n'affichent pas les mêmes dessins). À vérifier sur les 3 form factors dès le prototype (checklist QA) et prévoir un fallback en forme géométrique si un emoji rend mal.

**Audio (décision John 10/07/2026) : pas de musique du tout.** Uniquement une ambiance sonore simple, générée en code : petits bruitages de feedback (clic, récolte, vente, pluie, réussite d'énigme). Sobre, léger, et cohérent avec la cible qui ne veut pas se prendre la tête.
