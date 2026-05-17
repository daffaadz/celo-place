# CeloPlace — Revision Prompt: Bug Fixes & Feature Updates

---

## Role

You are a senior fullstack Web3 engineer continuing work on CeloPlace. You have full context of the existing codebase from the previous three prompts.

---

## Context

CeloPlace is a collaborative world map pixel painting game on Celo Sepolia. The base application is complete and functional. This prompt contains a focused set of bug fixes and feature enhancements that need to be applied to the existing codebase.

**Do not rewrite the entire application.** Apply only the changes described below to the relevant components, hooks, and files.

---

## Revision 1 — Bug Fix: Pixels Disappear on Page Refresh

### Problem
Pixels are successfully written to the blockchain (transaction confirmed), but disappear when the user refreshes the page. The canvas is not reconstructing state from on-chain history correctly on mount.

### Root Cause to Investigate
The `getLogs` call in `MapCanvas.tsx` on mount is likely using too narrow a block range, an incorrect event signature, or is failing silently. The pixel state is only held in memory and never persisted between sessions.

### Fix Requirements

In `hooks/usePixelCanvas.ts` (or wherever the pixel loading logic lives):

- Use `fromBlock: 0n` and `toBlock: 'latest'` explicitly in the `getLogs` call to ensure all historical events are captured regardless of when the contract was deployed
- Add a loading state `isLoadingPixels: boolean` that is `true` while fetching logs and `false` after — display a subtle loading indicator on the map while this is true
- Log any errors from `getLogs` to the console with a clear message so future debugging is easier
- After successfully loading all logs, store the reconstructed pixel map in component state and immediately call `renderPixels()`
- Verify the event ABI used in `getLogs` exactly matches the emitted event signature in `CeloPlace.sol`: `PixelPainted(address indexed painter, int256 lat, int256 lng, uint24 color, uint256 timestamp)`

### Acceptance Criteria
- Paint a pixel, confirm the transaction, refresh the page — the pixel must still be visible at the correct location
- All previously painted pixels from any wallet must appear on the canvas after every page load

---

## Revision 2 — Feature: Pixel Grid on High Zoom

### Overview
When the user zooms in past a certain threshold, a coordinate-aligned pixel grid should appear overlaid on the map. Each grid cell represents one paintable pixel unit. The grid makes it easy to see exactly which coordinate will be painted before clicking.

### Grid Behavior

**Visibility threshold:** The grid only renders when `map.getZoom() >= 16`. Below zoom 16, no grid is shown.

**Grid calculation:** At any given map zoom and pan position, calculate which grid cells are currently visible in the viewport. Each cell corresponds to a coordinate rounded to 4 decimal places (the same precision used for contract storage). Use `map.containerPointToLatLng()` to determine the lat/lng at every grid intersection and `map.latLngToContainerPoint()` to project them back to screen coordinates for drawing.

**Rendering:** Draw the grid on the existing HTML5 Canvas overlay (the same canvas used for pixels). Grid lines use a white stroke with very low opacity (around 15%) and 1px width. Cells are transparent by default. Already-painted cells show their color as before. Re-render the grid on every `moveend`, `zoomend`, and `resize` event alongside pixel rendering.

**Cell hover state:** When the user moves their mouse over the canvas at zoom ≥ 16, detect which grid cell is under the cursor. Highlight that cell with a white fill at 10% opacity and a white border at 40% opacity. This hover highlight must update smoothly on `mousemove`.

**Cell hover popup:** When hovering a grid cell, show a small floating tooltip anchored near the cursor (offset 12px right and 12px down from cursor position). The tooltip uses the `panel` style pattern (blur, dark transparent background, thin border). It displays:
- Latitude value to 4 decimal places
- Longitude value to 4 decimal places
- If the cell is already painted: the painter's truncated address and relative timestamp
- If not yet painted: the text "Unpainted — click to mark"

The tooltip must follow the cursor in real time and disappear when the mouse leaves the canvas.

**Click behavior:** Clicking a grid cell at zoom ≥ 16 uses the cell's snapped coordinate (rounded to 4 decimal places) rather than the raw click coordinate. This ensures every click maps to a deterministic, consistent coordinate key in the contract. The existing paint flow (optimistic update → `writeContract` → rollback on failure) applies unchanged.

### Acceptance Criteria
- Grid appears at zoom 16 and above, disappears below zoom 16
- Hovering a cell highlights it and shows the coordinate popup
- Clicking a cell paints the correct snapped coordinate
- Grid does not appear at lower zoom levels where it would be visually cluttered

---

## Revision 3 — Feature: Map Mode Switcher

### Overview
Add three map tile modes that the user can switch between. The UI control and any floating components must adapt their appearance based on the active mode.

### Three Modes

**Dark mode (default):** CartoDB Dark Matter tiles
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

**Light mode:** CartoDB Positron tiles
```
https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
```

**Realistic mode:** Esri World Imagery satellite tiles
```
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
```

### Theme Adaptation

When **Light mode** is active:
- The HUD panel backgrounds switch to `bg-white/80` with `backdrop-blur-xl` and `border-black/10`
- All text that was `text-primary` switches to `text-gray-900`
- All text that was `text-secondary` switches to `text-gray-500`
- All text that was `text-muted` switches to `text-gray-400`
- Border colors use `border-black/10` instead of `border-white/[0.06]`
- The ColorPicker, HUD pills, and GlobalChat button adapt to these light styles

When **Dark mode** or **Realistic mode** is active: use the original dark design system tokens unchanged.

### Map Mode Switcher UI

Position: `fixed`, `bottom: 24px`, `left: 16px`, `z-index: 10`.

Render as a compact segmented control with three labeled options: "Dark", "Light", and "Satellite". Use the `panel` style pattern as the container. Each option is a button — active option has `bg-celo-yellow text-black font-semibold`, inactive options use ghost styling.

### Implementation

Store the active mode in a state variable at the game page level. Pass it as a prop to `MapCanvas` and to `HUD`. In `MapCanvas`, when the mode changes, remove the current tile layer and add the new one using Leaflet's `tileLayer` API without reinitializing the entire map.

### Acceptance Criteria
- Switching modes changes tiles without reloading or losing canvas pixel state
- Light mode causes all HUD and floating UI components to adopt light-themed styles
- Dark and Satellite modes use the original dark styles
- The switcher control itself adapts to the active theme

---

## Revision 4 — Feature: Advanced Color Picker

### Overview
Replace the existing 16-color grid palette with a full-featured color picker that supports a color wheel, hex input, and RGBA input.

### Component Structure

The new `ColorPicker.tsx` has two sections separated by a divider:

**Section 1 — Color Wheel**
Render an HSL color wheel using an HTML5 Canvas element sized at 160×160px. The wheel shows the full hue spectrum around the circumference and saturation from center to edge. A lightness slider sits below the wheel as a horizontal gradient bar (white to black). A circular selector handle tracks the current hue and saturation on the wheel, and a rectangular handle tracks the lightness on the slider. Both handles are draggable.

**Section 2 — Text Inputs**
Two input rows below the wheel:

Row 1 — Hex input: A single text field prefixed with `#` showing the 6-character hex value of the current color. Edits are applied live as the user types valid hex. Invalid input shows `border-red-500/50` but does not crash.

Row 2 — RGBA inputs: Four compact numeric fields labeled R, G, B, and A (alpha). R, G, B accept 0–255. A accepts 0–100 and is displayed as a percentage. All fields update in sync with the wheel and with each other.

**Color Preview:** A split circle at the top of the picker showing the new color on the left half and the previously used color on the right half (like Photoshop's foreground/background indicator). Clicking the right half reverts to the previous color.

**Recent Colors:** A row of up to 8 small swatches showing the last 8 colors used for painting. Stored in `localStorage` under key `celoplace_recent_colors`. Clicking a recent swatch sets it as the active color.

**Opacity note:** Alpha/opacity from the color picker is for visual preview only. The color written to the contract is always fully opaque RGB (alpha is stripped before encoding to uint24).

### Charges Display
Keep the `⚡ {charges}/3 charges today` indicator below the color picker, unchanged from before.

### Acceptance Criteria
- Color wheel is interactive and draggable
- Hex and RGBA inputs stay in sync with the wheel in real time
- Recent colors row updates after each paint
- The color passed to `paintPixel` is always a fully opaque uint24 RGB value regardless of alpha setting

---

## Revision 5 — Layout: Global Chat Width and Height

### Change
In `GlobalChat.tsx`, update the sidebar dimensions:

- Width: increase from `w-[360px]` to `w-[420px]` on desktop
- Height: the sidebar must always be `h-screen` (full viewport height) — it already anchors to top-0, ensure there is no top padding or margin cutting into the height
- The message list flex area must fill all remaining vertical space between the header and the input area — use `flex-1 min-h-0 overflow-y-auto` to ensure it stretches correctly without overflowing
- No other chat functionality changes

---

## Revision 6 — Feature: Pixel Counter in Top Center

### Overview
Add a persistent stat display centered at the top of the game page showing how many pixels have been painted out of the theoretical maximum canvas capacity.

### Behavior

**Position:** `fixed`, `top: 16px`, centered horizontally (`left: 50%`, `transform: translateX(-50%)`), `z-index: 10`.

**Display format:** `{painted} / {total} pixels`

Where:
- `{painted}` is the value of `totalPixelsPainted` read from the `CeloPlace` contract — refresh this value after each successful paint transaction
- `{total}` is a fixed display value representing the maximum paintable pixels. Calculate it as the number of unique coordinate slots at 4-decimal-place precision for the full world bounding box. Use `648,000,000` as the display total (this represents the grid count at 1e4 precision across ±90 lat and ±180 lng)

**Style:** Use the `panel` style pattern. Content: a small paint emoji or grid icon on the left, then the formatted numbers with `{painted}` in `text-celo-yellow font-mono font-bold` and `/ {total} pixels` in `text-secondary`. The total number is formatted with locale thousand separators (e.g. `12,847 / 648,000,000 pixels`).

**Updates:** After every successful `paintPixel` transaction, re-read `totalPixelsPainted` from the contract and update the counter without a page refresh.

### Acceptance Criteria
- Counter is visible and centered at the top of the game page at all times
- `{painted}` increments immediately after a successful paint transaction
- Counter adapts color when Light mode is active (use dark text instead of `celo-yellow`)

---

## Constraints

- Do not rewrite components that are not listed in this revision prompt
- Global Chat functionality and message display remain unchanged — only width and height are adjusted
- All new UI elements must follow the existing design system (panel pattern, typography scale, color tokens)
- Light mode theme adaptation must be handled via prop-driven conditional classes — do not use a global CSS class swap
- The color wheel must be built using native Canvas API — do not add a new npm dependency for the color picker

---

## Definition of Done

- [ ] Pixels persist correctly after page refresh — verified by painting, refreshing, and confirming pixel is still visible
- [ ] Pixel grid appears at zoom ≥ 16 with hover highlight and coordinate popup
- [ ] Clicking a grid cell at zoom ≥ 16 uses the snapped coordinate
- [ ] Map mode switcher cycles between Dark, Light, and Satellite tiles without losing canvas state
- [ ] Light mode causes all HUD and floating UI components to switch to light-themed styles
- [ ] Color picker shows interactive color wheel, hex input, RGBA inputs, and recent colors
- [ ] Color wheel, hex, and RGBA inputs stay in sync in real time
- [ ] Global chat sidebar is 420px wide and fills full viewport height
- [ ] Pixel counter is visible centered at top of game page
- [ ] Pixel counter updates after each successful paint transaction