# Emberlight — Worlds That Remember You

Independent game studio site. Cinematic single-page experience with hand-painted aesthetic, GSAP/ScrollTrigger motion, subtle Three.js scenes, save system, search, careers, and full content archive.

## Structure

```
emberlight/
├── index.html          # Entry point (semantic shell)
├── css/
│   ├── styles.css      # Core design system & components
│   └── fixes.css       # Critical UI/UX, layout, mobile & a11y overrides
├── js/
│   ├── app.js          # Router, data, views, forms, cursor, save system
│   └── gl.js           # Three.js armillary / relic scenes
└── README.md
```

## Quick Start

Serve the folder with any static server:

```bash
# From the emberlight/ directory
python3 -m http.server 8080
```

Then open: **http://localhost:8080**

Or with Node:

```bash
npx serve -p 8080
```

## Features

- Hash-based SPA routing (`#/worlds`, `#/games/...`, etc.)
- Worlds, Games, Characters, Stories, Art, Collections, Archive, Timeline
- Discover (curated + random), Search (full-text + filters), Saved (localStorage)
- Careers application forms + Contact form (client-side validation + feedback)
- Newsletter signup, Press kit downloads
- Custom cursor, film grain, scroll progress, magnetic buttons
- GSAP + ScrollTrigger page transitions & reveals
- Three.js armillary sphere & relic on Home
- Fully responsive (mobile-first hardening in `fixes.css`)
- Reduced-motion support, keyboard navigation, skip link, ARIA

## Technical Notes

- No build step required — pure HTML / CSS / JS
- External libraries loaded from CDN (GSAP, ScrollTrigger, Three.js r128)
- Fonts: Fraunces Variable, Space Grotesk Variable, IBM Plex Mono
- Images are remote (Qwen CDN); replace with local assets for production if desired
- Saved items & recent searches live in `localStorage` only (no backend)

## Major Fixes Applied

- Stronger image scrims + isolation so text is never hidden under photos
- Corrected z-index stacking for cards, save buttons, overlays, cursor, menu
- Sticky hero no longer pushes content off-screen
- Mobile grids collapse cleanly; horizontal strips remain usable
- Reveal animations (`.rv`, `.rv-mask`) and ScrollTrigger timelines hardened
- Form validation + success states for Contact, Careers & Newsletter
- Three.js scenes isolated into `gl.js` and only animate when visible
- Overflow / cut-off sections resolved
- Accessibility: focus-visible, reduced-motion, skip link, proper ARIA

## Browser Support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Graceful degradation when Three.js or GSAP is unavailable.

---

© 2026 Emberlight Studios — Made with fire
