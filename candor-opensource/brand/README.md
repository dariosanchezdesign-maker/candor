# Candor — brand assets

## The mark
Three flat planes cut from a hexagonal C. One ink, one ground, no gradients.
The seam between planes is a **stroke in the background color**, not a gap — so the
mark can sit on any solid ground without a knockout shape.

| File | Use |
| --- | --- |
| candor-mark-black.svg | mark on light grounds, 32px and up |
| candor-mark-white.svg | mark on dark grounds, 32px and up |
| candor-mark-small-black/white.svg | below 32px — seam widened one step (stroke 9) |
| candor-icon-black-bg.svg | 512px app icon / social avatar, dark |
| candor-icon-white-bg.svg | 512px app icon / social avatar, light |
| favicon.svg | 64px browser tab |

Below 20px, use the small variants or drop to the solid tile icons.

## Wordmark
**Sora 600**, letter-spacing `-0.03em`. Not outlined — set live from the webfont.

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600&display=swap">
```

## Lockups
Horizontal is primary. Gap between mark and wordmark = **0.55 × mark height**.
Wordmark cap-height aligns to mark height (set font-size ≈ 0.52 × mark height).

```html
<a class="candor-lockup" href="/">
  <img src="/brand/candor-mark-white.svg" alt="" width="40" height="40">
  <span>Candor</span>
</a>
```

```css
.candor-lockup {
  display: inline-flex;
  align-items: center;
  gap: 22px;                 /* 0.55 x mark size */
  text-decoration: none;
  color: #fff;
}
.candor-lockup span {
  font-family: Sora, sans-serif;
  font-weight: 600;
  font-size: 21px;           /* 0.52 x mark size */
  letter-spacing: -0.03em;
  line-height: 1;
}
```

Stacked lockup: mark above, wordmark below, both flush left, 20px gap.
Descriptor "AI PRODUCT AUDITING" — Sora 400, 11px, letter-spacing 0.22em, uppercase,
10px below the wordmark.

## Clear space
Clear space on all sides = **0.5 × mark height**. Nothing enters it — no type, no rules,
no edge of the viewport.

## Minimum sizes
- Mark alone: 20px
- Horizontal lockup: 24px mark height
- Stacked lockup: 44px mark height

## Color
Black `#000000` and white `#ffffff` only. The mark is never tinted, never on a
photograph or gradient, never given a shadow, outline, or container it doesn't have.

## Head tags
```html
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/candor-icon-black-bg.svg">
<meta name="theme-color" content="#000000">
```

## Don't
- Don't rotate, skew, or reflect the mark.
- Don't recolor the seam or remove the stroke (the planes will fuse into one blob).
- Don't set the wordmark in any face but Sora, or any weight but 600.
- Don't place the lockup over imagery.
- Don't lock the descriptor to the horizontal lockup — stacked only.
