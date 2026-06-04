---
name: suashu-design
description: Designs polished, responsive Vue interfaces with clean hierarchy, card-based layout, spacing rhythm, and mobile-first behavior. Use when user asks to make pages prettier, improve UX, or adapt screens for tablet and mobile.
disable-model-invocation: true
---

# Suashu Design

## Goal

Apply a clean, modern visual style to Vue screens with clear hierarchy and predictable responsive behavior.

## Core Rules

1. Keep existing business logic untouched; change UI structure/styling first.
2. Follow mobile-first responsive approach:
   - mobile: 320-767px
   - tablet: 768-1023px
   - desktop: 1024px+
3. Prefer reusable tokens and shared UI patterns over one-off values.
4. Preserve readability and contrast; avoid decorative overload.

## Layout Pattern

- Use card sections for controls and data blocks.
- Keep max content width centered.
- Use consistent spacing scale (`xs/sm/md/lg/xl`).
- On small screens, stack controls and allow horizontal scroll only where needed (tables/grids).

## Visual Hierarchy

- Page title + muted subtitle.
- Primary action is visually dominant.
- Secondary actions use outlined/neutral style.
- Status badges are short and high contrast.

## Component Styling Checklist

- [ ] Has clear empty/loading/error state
- [ ] Works at 360px width without overlap
- [ ] Works at tablet width without huge whitespace
- [ ] Touch targets are at least 40px height
- [ ] Text remains readable at zoom 125%

## Range Grid UX

- Keep cell size stable; avoid distortion from container width.
- Use container horizontal scroll on narrow viewports.
- Keep error indicators inside cell bounds.
- Ensure gaps between cells stay visible at all breakpoints.
