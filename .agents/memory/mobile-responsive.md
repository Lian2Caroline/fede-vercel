---
name: Mobile responsive fixes
description: Règles responsive à respecter dans ce projet après audit mobile complet
---

## Règles

- `body` a `overflow-x: hidden` dans `index.css` — ne pas retirer
- Sections de contenu : toujours `px-4 sm:px-8` (jamais `px-8` seul sur les conteneurs max-w)
- Sections verticales : `py-14 md:py-28` (jamais `py-28` seul), `py-12 md:py-24`
- Grids à plusieurs colonnes : toujours avec breakpoint mobile (`grid-cols-1 sm:grid-cols-2`, `grid-cols-2 md:grid-cols-4`)
- Gaps larges : `gap-8 md:gap-16` ou `gap-8 md:gap-20` (jamais `gap-20` seul dans une grille de contenu)
- Cartes en carousel : largeur responsive (`w-[280px] sm:w-[360px]`)

**Why:** Le site sert 27 pays EU sur tous les devices. Audit a trouvé horizontal overflow, scroll excessif, et grids à colonnes fixes sans breakpoint mobile dans 5 fichiers.

**How to apply:** À chaque nouveau composant/section, vérifier que toutes les valeurs d'espacement ont une variante mobile (`sm:` ou `md:`) si elles sont larges (> 4 = 16px).
