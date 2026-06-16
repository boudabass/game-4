# Système Responsive Mobile

## Vue d'ensemble

Le système UI est conçu pour s'adapter automatiquement aux différentes tailles d'écran grâce à un système de **media queries CSS** et de **variables de scaling**.

## Configuration Viewport

Le fichier `index.html` inclut un meta viewport pour contrôler l'affichage mobile :

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

Cela empêche le zoom automatique et force le navigateur à utiliser la largeur réelle de l'écran.

## Variables CSS de Scaling

Dans `styles.css`, le système utilise des variables CSS pour adapter dynamiquement les dimensions :

```css
:root {
    --scale-factor: 1;
    --base-font-sm: calc(12px * var(--scale-factor));
    --base-font-md: calc(16px * var(--scale-factor));
    --base-font-lg: calc(24px * var(--scale-factor));
    --btn-circle-size: calc(70px * var(--scale-factor));
    --btn-square-w: calc(160px * var(--scale-factor));
}
```

## Breakpoints

| Largeur | Cible | Scale Factor | Comportement |
|---------|-------|--------------|--------------|
| > 1024px | Desktop | 1.0 | Affichage complet |
| ≤ 1024px | Tablette | 0.85 | Réduction légère |
| ≤ 768px | Grand mobile | 0.70 | UI compacte |
| ≤ 480px | Mobile standard | 0.55 | UI minimale |
| ≤ 360px | Petit mobile | 0.45 | Éléments masqués |

## Adaptations par Breakpoint

### 768px (Tablettes/Grands Mobiles)
- HUD central réduit à 80px
- Boutons d'action à 55px
- Build shelf compact
- Panneaux réduits

### 480px (Mobiles Standard)
- HUD central à 60px
- Polices réduites (9-14px)
- Boutons d'action à 45px
- Tab buttons compacts
- Panneaux modaux en 90vw

### 360px (Petits Mobiles)
- Labels de ressources masqués
- Mission panel masqué
- UI minimale fonctionnelle

## Fichiers Concernés

| Fichier | Contenu |
|---------|---------|
| `core/ui/styles.css` | Variables + media queries principales |
| `core/ui/interior.css` | Media queries pour vue intérieur |
| `test-system/v1/index.html` | Meta viewport |

## Test Mobile

### Dans le Navigateur
1. Ouvrir DevTools (`F12`)
2. Activer le mode responsive (icône mobile)
3. Tester : iPhone SE (375px), iPhone 12 (390px), iPad (768px)

### Sur Appareil Réel
1. PC et mobile sur le même réseau
2. Trouver l'IP locale : `ipconfig` (Windows)
3. Accéder à `http://[IP]:3000/games/test-system/v1/`

## Bonnes Pratiques

1. **Toujours utiliser les variables CSS** pour les nouvelles dimensions
2. **Tester tous les breakpoints** après chaque modification UI
3. **Mobile First** : concevoir pour le plus petit écran, puis étendre
4. **Touch Targets** : minimum 44px pour les boutons interactifs
