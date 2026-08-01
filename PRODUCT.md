# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Familles avec enfants, clientes de The Elsassisch (commerce/marque alsacienne — nature exacte de l'activité non précisée à ce jour). Elles jouent principalement sur **smartphone**, via l'arcade embarquée en iframe dans le site Odoo theelsassisch.com. Le public couvre tous les âges, enfants compris : lisibilité, simplicité et contenu irréprochable pour un jeune public sont des contraintes fortes.

## Product Purpose

Arcade de mini-jeux p5.js **100 % gratuite**, offerte aux clients de The Elsassisch. Le succès se mesure d'abord à sa valeur de **vitrine de l'identité alsacienne** de la marque : l'arcade incarne l'univers alsacien (cigogne, waggis, ferme, hiver alsacien…) et crée de l'attachement à la marque. Les scores, la progression et les sauvegardes cloud servent cet attachement, pas une monétisation.

## Positioning

Une arcade de marque artisanale et gratuite, entièrement ancrée dans le folklore alsacien — pas un portail de jeux génériques. Chaque jeu est une déclinaison de l'univers The Elsassisch (Elsass Farm, Elsass Frost, Cigogne, Waggis), construite sur un moteur maison (`engine/v2`) et développée en continu par une équipe de crons IA « Hermes ».

## Operating Context

- L'arcade vit en **iframe** dans le site Odoo (theelsassisch.com) ; l'expérience doit fonctionner dans ce cadre contraint (viewport réduit, mobile d'abord, tactile prioritaire).
- Deux environnements en ligne : `main` → arcade.theelsassisch.com (production), `dev` → arcade-dev.theelsassisch.com (bac à sable).
- Login via le compte client Odoo, puis cookie de session ; scores et sauvegardes en PostgreSQL. Page `/admin` réservée à John.
- La documentation produit vit dans **Odoo Knowledge** (hub article 403), pas dans le repo (repo GitHub public : aucune config réelle versionnée).
- Développement : John (non-développeur) + 14 crons IA « Hermes » ; Claude assiste en local.

## Capabilities and Constraints

- Jeux : fichiers statiques p5.js pur (pas de p5.play/planck) dans `public/games/`, tous sur le moteur partagé `engine/v2` (14 modules : horloge jour/nuit, caméra, grille, zones, cultures, PNJ, sommeil, défis, sauvegarde versionnée…).
- Plateforme : Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui ; catalogue, scores, profil, dashboard, admin.
- Assets mutualisés dans `public/games/system/assets/` (~5 300 fichiers, CATALOGUE.md) ; packs bruts gitignorés.
- **Langue : français uniquement** (clins d'œil alsaciens bienvenus) ; pas de besoin multilingue prévu.
- Jeu actif en développement : Elsass Farm v3 (Phase 02 « Vertical Slice », roadmap dans Odoo article 434).
- Non décidé : nature exacte de l'activité commerciale de The Elsassisch ; à confirmer avec John avant toute revendication sur le produit vendu.

## Brand Commitments

- Identité **alsacienne** omniprésente et sincère : cigogne, waggis, ferme, hiver — le folklore est le cœur de la marque, pas un habillage.
- Nom de marque : The Elsassisch (domaine `theelsassisch.com`, instance Odoo `theelsassich` — orthographes différentes, factuel).
- Gratuité totale : aucun achat, aucune pub dans les jeux.
- Ton familial : accessible aux enfants, sans difficulté punitive ni contenu inapproprié.

## Evidence on Hand

- 4 jeux jouables en ligne (Elsass Farm v3, Elsass Frost v2, Cigogne v1, Waggis v1) + template et banc d'essai d'assets.
- Bibliothèque d'assets triée : `public/games/system/assets/` (CATALOGUE.md).
- Roadmap, audits et journal dans Odoo Knowledge (articles 403, 434, 437, 660…).
- Pas de témoignages clients ni de métriques d'usage connus dans le repo — ne pas en inventer.

## Product Principles

1. **L'Alsace d'abord** : chaque choix de contenu ou d'habillage renforce l'univers alsacien de la marque.
2. **Mobile et tactile en priorité** : l'iframe Odoo est consultée surtout sur smartphone ; le clavier est un bonus, pas le socle.
3. **Jouable par un enfant** : lisibilité, simplicité des commandes, aucune frustration punitive, contenu familial.
4. **Gratuit et généreux** : le jeu est un cadeau aux clients ; jamais de friction commerciale dans l'arcade.
5. **Un moteur, plusieurs jeux** : tout nouveau contenu s'appuie sur `engine/v2` et les assets mutualisés plutôt que du code jetable.

## Accessibility & Inclusion

Public familial incluant de jeunes enfants : textes lisibles (taille, contraste), commandes tactiles simples et zones de touche généreuses, français clair sans jargon. Aucune norme formelle (WCAG) exigée à ce jour.
