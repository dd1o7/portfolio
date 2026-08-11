---
name: hypr-motion
description: The Hyprland-derived animation vocabulary for this site — named bezier tokens, durations, and the exact motion for pane enter/exit, workspace switching, focus changes, and hovers. Use this whenever adding, editing, or reviewing ANY animation, transition, transform, easing curve, or Motion/framer-motion code in this repo, and whenever a change makes something appear, disappear, move, or change state — even if the request only says "make it smoother" or does not mention animation at all.
paths: ["src/app/**", "src/components/**", "src/**/*.css"]
---

# Motion vocabulary

Every animation on this site comes from this list. If a motion is needed that is not here,
add it here first rather than inventing a one-off curve in a component.

## Bezier tokens

Ported from Hyprland's animation config. Declared in `src/app/globals.css`:

```css
--ease-overshot: cubic-bezier(0.05, 0.90, 0.10, 1.05);  /* windowsIn  */
--ease-smooth:   cubic-bezier(0.25, 1.00, 0.50, 1.00);  /* fade       */
--ease-wind:     cubic-bezier(0.05, 0.90, 0.10, 1.10);  /* workspaces */
--ease-exit:     cubic-bezier(0.40, 0.00, 1.00, 1.00);  /* windowsOut */
```

## The motion table

| What | Motion | Duration | Ease |
|---|---|---|---|
| Pane enters | `scale(0.94) → 1`, `opacity 0 → 1` | 220ms | `--ease-overshot` |
| Pane exits | `scale(1) → 0.97`, `opacity 1 → 0` | 160ms | `--ease-exit` |
| Workspace switch | `translateX(±100%) → 0`, direction from route order | 300ms | `--ease-wind` |
| Focus moves to a pane | `border-color` + `box-shadow` glow | 140ms | `--ease-smooth` |
| Hover on a card / pill | `border-color`, `background` | 140ms | `--ease-smooth` |
| Split divider drag | none — follows the pointer 1:1 | — | — |
| Stack reorder | Motion `layout` | 260ms | `--ease-overshot` |
| Palette opens | backdrop `opacity`, sheet `scale(0.97) → 1` | 180ms | `--ease-overshot` |

Rules that follow from the table:

- **Exits are always faster than entries.** A slow exit is the most common reason an
  interface feels sluggish.
- **Nothing animates longer than 300ms.** The workspace slide is the ceiling.
- **The divider never animates.** Dragging must feel physically attached to the finger.

## Direction-aware workspace slide

Workspaces have a fixed order: `home, work, research, read, about`. Moving to a
higher-index workspace slides the incoming pane in from the right; a lower index, from the
left. Store the order in one array and derive direction from index comparison — never
hardcode a direction per link.

On desktop the slide is driven by the View Transitions API. On mobile the same slide is
driven by the swipe gesture, so the transform follows the finger during the drag and
completes on release past a threshold (roughly 25% of viewport width, or a flick velocity
above 0.3). Both paths must use `--ease-wind` so the two feel like the same interface.

## Focus glow

The focused pane gets `border-color: var(--border-focus)` and
`box-shadow: 0 0 18px -6px rgb(79 201 171 / 0.5)`. Both transition together. Never animate
the `filter` property to achieve this, and never stack more than one glow on screen — only
one pane is focused at a time.

## Hard performance rules

- Animate `transform` and `opacity` only. If a change needs `width`, `height`, `top`,
  `left`, `margin`, or `padding` to move, restructure it to use a transform instead.
- `will-change` goes on at most two elements at once, and only for the duration of an
  interaction — set it on drag start, remove it on drag end.
- The split divider writes a CSS custom property inside `requestAnimationFrame`. It never
  sets inline widths per `pointermove`, and it never calls `setState` per move.
- Target 120fps. On a high-refresh Android panel a 60fps-tuned animation looks *worse*
  than it does on a 60Hz screen, so avoid anything that produces long frames.

## Reduced motion

Every animation collapses to a 100ms opacity fade. This is not optional and is not a
nice-to-have added at the end.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 100ms !important;
    scroll-behavior: auto !important;
  }
}
```

In Motion, read the same preference with `useReducedMotion()` and pass zero-distance
variants rather than relying on the CSS override alone.
