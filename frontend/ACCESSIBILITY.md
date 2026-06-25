# Accessibility Audit — FrieghtFlow Dashboard

**Standard:** WCAG 2.1 AA  
**Tool:** axe-core / Lighthouse  
**Date:** 2026-04-26

---

## Findings & Fixes

| # | Severity | Issue | Fix Applied |
|---|----------|-------|-------------|
| 1 | Critical (A) | Icon buttons missing `aria-label` | Added `aria-label` to all icon-only buttons |
| 2 | Critical (A) | Images missing `alt` text | Added descriptive `alt` on all `<img>` tags |
| 3 | Critical (A) | Modal focus not trapped | Implemented focus trap on open; returns focus on close |
| 4 | Serious (AA) | Colour contrast < 4.5:1 on status text | Updated palette to meet contrast ratio |
| 5 | Serious (AA) | Interactive elements unreachable by keyboard | Replaced `<div onClick>` with `<button>` throughout |
| 6 | Moderate | No visible focus ring on inputs | Added `focus:ring-2 focus:ring-blue-500` via Tailwind |
| 7 | Moderate | Drawer lacks `role="dialog"` and `aria-modal` | Added ARIA attributes to drawer wrapper |

---

## Keyboard Navigation

- All interactive elements reachable via `Tab` / `Shift+Tab`.
- Dropdowns open with `Enter`/`Space`, close with `Escape`.
- Modal and drawer trap focus while open; focus returns to trigger on close.

---

## Remaining Work

- Audit third-party map widget (Leaflet) for keyboard accessibility.
- Add `prefers-reduced-motion` guard to animated transitions.
