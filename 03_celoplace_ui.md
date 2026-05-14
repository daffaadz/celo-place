# CeloPlace — Prompt 3 of 3: UI & Frontend

---

## Role

You are a senior frontend engineer specializing in Web3 interfaces, interactive map applications, and real-time data from blockchain events. You build accessible, responsive, and visually cohesive UIs.

---

## Context

You are completing **CeloPlace**. Prompts 1 and 2 are done:
- Project structure, Tailwind config, wagmi config, and root layout are in place
- Both smart contracts (`CeloPlace.sol` and `CeloChat.sol`) are deployed to Celo Sepolia
- Contract addresses are in `frontend/lib/contractAddresses.json`
- ABIs and address exports are in `frontend/lib/contracts.ts`
- The full design system (colors, typography, component patterns) is defined in `tailwind.config.ts` and `globals.css`

You are now building the complete frontend: a landing page and a full-screen interactive game page.

**Apply the design system from Prompt 1 exactly.** Every component must use the defined color tokens, typography scale, and style patterns. Never use hardcoded color values.

---

## Task

Build all pages, components, hooks, and utilities for the CeloPlace frontend.

---

## Pages Overview

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Landing page — introduction and wallet connect |
| `/play` | `app/play/page.tsx` | Full-screen game — map, painting, and chat |

---

## Page 1: Landing Page (`app/page.tsx`)

### Overall Layout
Full-page dark layout. Sections stack vertically with smooth scroll. Background is `bg-base`.

---

### Section 1: Hero

**Layout:** Full viewport height, content centered both horizontally and vertically. Max content width of 3xl. Background uses a dark radial gradient from `bg-surface` at center fading to `bg-base` at edges.

**Content, top to bottom:**

1. A small badge at the top labeled "Built on Celo" — use the `badge` style pattern with `celo-green` text and `celo-green-dim` background
2. The main headline using Display typography (text-6xl, weight 800, white) — use a short, strong phrase like "Paint the World." or "Claim Your Territory."
3. A one-line subheadline using text-secondary — briefly explain that pixels and chat are permanent and on-chain
4. Two buttons side by side: a primary button labeled "Enter CeloPlace" and a ghost button labeled "How it works ↓" that scrolls to Section 2
5. Three live stat pills below the buttons showing: total pixels painted (read from `CeloPlace.totalPixelsPainted`), total messages on-chain (read from `CeloChat.getTotalMessages()`), and a hardcoded but believable growing number for countries represented. Each pill uses the `badge` style pattern with a relevant emoji

**"Enter CeloPlace" button behavior — three states:**
- Wallet not connected → trigger MetaMask connect flow
- Wallet connected, wrong network → show inline message "Please switch to Celo Sepolia" and trigger `useSwitchChain`
- Wallet connected, correct network (chainId 44787) → `router.push('/play')`

---

### Section 2: Features

**Layout:** Three-column grid on desktop, single column on mobile. Generous vertical padding. Max width 5xl, centered.

**Three cards** using the `panel` style pattern. On hover, apply `border-celo-yellow/20` and `bg-celo-yellow-dim` transition over 300ms:

1. **World Canvas** — explain that users can paint any location on Earth and the mark is permanent on-chain
2. **On-Chain Chat** — explain that every message lives on Celo forever and users can tip creators directly with CELO
3. **Daily Mechanics** — explain that 3 free pixels per day drive daily retention and community building

---

### Section 3: How It Works

**Layout:** Centered, max width 2xl, generous vertical padding.

**Three numbered steps** in a vertical timeline:
- Step number in a circle with `border-celo-yellow` and `text-celo-yellow`
- Step title in white bold
- Step description in text-secondary

Steps:
1. Connect your MetaMask wallet to the Celo network
2. Pick a color and click anywhere on the world map to paint your pixel
3. Open the global chat — every message is permanent and can be tipped

---

### Section 4: Footer

**Layout:** `border-t border-subtle`, horizontal flex, space between, vertical padding 12.

- Left: "CeloPlace" wordmark + "Built on Celo" with a `celo-green` pulsing dot
- Center: Badge labeled "Celo Sepolia Testnet" using `celo-green` colors
- Right: Two text links — "GitHub ↗" and "Explorer ↗" — using `text-secondary`, opening in new tab

---

## Page 2: Game Page (`app/play/page.tsx`)

### Layout
`position: fixed`, `width: 100vw`, `height: 100vh`, `overflow: hidden`, `background: bg-base`.

**Three layers stacked:**
- z-0: `<MapCanvas />` — fills entire viewport
- z-10: `<HUD />` — floats above map
- z-20: `<GlobalChat />` — conditionally visible sidebar

**Critical:** The HUD wrapper div must use `pointer-events-none`. Only individual interactive elements inside HUD get `pointer-events-auto`. This ensures map clicks are never blocked.

**Import `MapCanvas` using `next/dynamic` with `ssr: false`.** Leaflet cannot run on the server. Show a plain `bg-base` div as the loading fallback.

**State managed at this level:**
- `selectedColor: string` — currently active paint color, default `#FF4500`
- `chatOpen: boolean` — whether the chat sidebar is visible

Pass these as props to child components as needed.

---

## Component: `MapCanvas.tsx`

This is the most technically complex component. Build it carefully.

### Map Initialization
Initialize Leaflet inside a `useEffect` on mount. Use CartoDB Dark Matter tiles:
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```
Set `center: [20, 0]`, `zoom: 3`, `minZoom: 2`, `maxZoom: 18`, `zoomControl: false`, `worldCopyJump: true`.

### Canvas Overlay
After the map is initialized, create an HTML5 Canvas element and append it to the Leaflet container div. Style it as `position: absolute`, `top: 0`, `left: 0`, `pointer-events: none`, `z-index: 400`. Resize the canvas to match the container on init and on every window resize event.

### Pixel Rendering
Write a `renderPixels()` function that:
1. Clears the canvas
2. Iterates over all pixels in state
3. For each pixel, calls `map.latLngToContainerPoint([lat, lng])` to get screen coordinates
4. Draws a filled rectangle at that point

**Pixel size must scale with zoom:**
- zoom < 6: 3px
- zoom 6–9: 5px
- zoom 10–13: 8px
- zoom ≥ 14: 14px

Call `renderPixels()` on every Leaflet `moveend`, `zoomend`, and `resize` event.

### Loading Past Pixels
On mount, after the map is ready, use viem's `createPublicClient` with the Celo Sepolia chain and HTTP transport to call `getLogs` for all `PixelPainted` events from block 0 to latest. Parse each log to extract `lat`, `lng`, `color`, and `painter`. Store all pixels in a `Map<string, PixelData>` where the key is `"${lat},${lng}"`. After loading, call `renderPixels()`.

### Click to Paint
Attach a Leaflet `click` listener. On click:
1. Return early if wallet is not connected or charges are 0
2. Convert `event.latlng.lat` and `event.latlng.lng` to scaled integers using `Math.round(value * 10000)`
3. Convert the selected color hex string to a uint24 integer
4. Apply an optimistic update to the local pixel map and call `renderPixels()` immediately
5. Call `writeContract` for `paintPixel` with the scaled coordinates and color
6. On transaction failure, roll back the optimistic update

### Pixel Tooltip
On Leaflet `mousemove`, check if the cursor is within 10px of any rendered pixel. If so, show a small floating tooltip (using the `panel` style pattern) displaying the painter's truncated wallet address and a relative timestamp. Hide on `mouseout`.

---

## Component: `GlobalChat.tsx`

### Chat Toggle Button
`position: fixed`, `top: 16px`, `left: 16px`, `z-index: 20`. Style using the `panel` pattern, `w-11 h-11`, centered content.

Use `MessageSquare` icon from lucide-react at size 18. When there are unread messages, show a `w-2 h-2` `bg-celo-green rounded-full animate-pulse` dot in the top-right corner of the button absolutely positioned.

### Sidebar
**Animation:** `transform: translateX(-100%)` when closed, `transform: translateX(0)` when open. Use `transition-transform duration-300 ease-in-out`.

**Dimensions:** `w-[360px]` on desktop, `w-full` on mobile (use Tailwind responsive prefix). Full height, `position: fixed`, `top: 0`, `left: 0`.

**Style:** `panel` pattern + `border-r border-subtle`.

**Structure (top to bottom):**

1. **Header row:** "💬 Global Chat" label (H2 typography, text-primary) on the left, `X` icon button on the right using `pointer-events-auto`. Separated from message list by `border-b border-subtle`.

2. **Message list:** `flex-1 overflow-y-auto` container. Messages are displayed oldest at top, newest at bottom. Scroll to bottom on initial load and when new messages arrive.

   Each message item:
   - Avatar: `w-7 h-7 rounded-full` whose background color is generated from the first 6 hex chars of the sender's address
   - Wallet address: truncated to `0x1234...5678`, font mono, `text-xs text-secondary`
   - Message content: `text-sm text-primary`, word-break enabled
   - Metadata row: relative timestamp in `text-xs text-muted` and a tip button

   Tip button style: `text-xs`, `border border-white/10`, `rounded-lg`, `px-2 py-0.5`. On hover: `border-celo-yellow/30 text-celo-yellow`. On click: call `writeContract` for `tipMessage` with `value: parseEther('0.01')`.

3. **Input area:** `border-t border-subtle`, padding 12. Contains:
   - A `textarea` (1 row, expandable) using the `input` style pattern
   - A row below with character counter `{remaining}/280` in `text-xs text-muted` on the left and a primary Send button on the right
   - Pressing Enter (without Shift) submits. Shift+Enter inserts newline
   - Send button disabled when: message is empty, wallet not connected, or transaction is pending

### Data Logic (in `hooks/useGlobalChat.ts`)

On mount, call `getRecentMessages(50)` from the contract and store in state, newest at bottom.

Poll every 15 seconds: call `getTotalMessages()`. If the returned count is greater than the current local count, fetch the difference using `getMessages(currentCount, newTotal - currentCount)` and append to the list.

Track unread count: increment when new messages arrive and the sidebar is closed. Reset to 0 when the sidebar opens.

---

## Component: `ColorPicker.tsx`

`position: fixed`, `bottom: 24px`, `right: 24px`, `z-index: 10`. Style using the `panel` pattern with padding 16.

**Color palette — exactly these 16 colors in this order:**
Row 1: `#FFFFFF`, `#D4D7D9`, `#898D90`, `#000000`, `#FF4500`, `#FFA800`, `#FFD635`, `#00A368`
Row 2: `#7EED56`, `#2450A4`, `#3690EA`, `#51E9F4`, `#811E9F`, `#B44AC0`, `#FF99AA`, `#9C6926`

Display as an 8×2 grid. Each swatch is `w-8 h-8 rounded-lg cursor-pointer border-2 border-transparent hover:scale-110 transition-transform duration-150`. Active swatch adds `border-white scale-110 ring-2 ring-white/30`.

Below the grid, show the selected color as a small `w-5 h-5 rounded` preview square next to the hex code in `text-xs font-mono text-muted`.

Below that, show the charges indicator: `⚡ {charges}/3 charges today` in `text-xs text-secondary`. Read charges by calling `getCharges(address)` on mount and after each successful paint transaction.

---

## Component: `HUD.tsx`

The HUD container is `position: fixed inset-0 pointer-events-none z-10`. All children use `pointer-events-auto`.

### Wallet Pill — `position: absolute`, `top: 16px`, `right: 16px`

**Not connected:** Primary button labeled "Connect MetaMask".

**Wrong network:** Ghost button labeled "Switch to Celo Sepolia" that calls `useSwitchChain` with chainId 44787. Also show a small inline warning strip below: `bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-3 py-1.5 text-xs` labeled "Wrong network".

**Connected + correct network:** A pill using the `panel` pattern containing:
- `w-2 h-2 rounded-full bg-celo-green animate-pulse` dot
- Truncated address in `text-sm font-mono`
- CELO balance formatted to 4 decimals with `text-sm text-secondary`
- A small disconnect icon button using `LogOut` from lucide-react at size 14

### Zoom Controls — `position: absolute`, `bottom: 96px`, `left: 16px`

Two ghost buttons stacked vertically with no gap: `+` on top using `Plus` icon, `-` below using `Minus` icon. Both `w-10 h-10`. On click, call `map.zoomIn()` or `map.zoomOut()` using a ref passed from `MapCanvas`.

---

## Shared Component: `WalletButton.tsx`

A reusable button used in both the landing page Hero section and the HUD. Accepts an optional `variant` prop: `"hero"` for the larger landing page version and `"hud"` for the compact pill version. Internally uses `useAccount`, `useConnect`, `useDisconnect`, and `useSwitchChain` from wagmi.

---

## Utilities (`lib/utils.ts`)

Write the following pure utility functions with no external dependencies:

| Function | Input | Output | Description |
|---|---|---|---|
| `truncateAddress` | `address: string` | `string` | Returns `0x1234...5678` format |
| `addressToColor` | `address: string` | `string` | Returns `#RRGGBB` from first 6 hex chars |
| `timeAgo` | `timestamp: number` | `string` | Returns "just now", "5 mins ago", "2 hrs ago", "3 days ago" |
| `encodeCoord` | `value: number` | `bigint` | Multiplies by 1e4, rounds, returns as BigInt |
| `decodeCoord` | `value: bigint` | `number` | Divides BigInt by 1e4, returns float |
| `hexToUint24` | `hex: string` | `number` | Converts `#RRGGBB` string to packed uint24 integer |
| `uint24ToHex` | `color: number` | `string` | Converts uint24 integer to `#RRGGBB` string |

---

## Constraints

- Leaflet must always be imported inside a dynamic import with `ssr: false`
- Never use hardcoded color values — always reference design tokens
- Never use `box-shadow` or `drop-shadow` on any element
- All floating elements (sidebar, tooltips, panels) must use blur + transparency + border only
- Optimistic updates must always be rolled back on transaction failure
- The HUD container must use `pointer-events-none` — map interaction must never be blocked
- Chat sidebar must not block map interaction when open (it overlays, not replaces)
- All contract reads must handle loading and error states visibly

---

## Definition of Done

- [ ] Landing page renders all 4 sections correctly
- [ ] Live stats in Hero are read from deployed contracts
- [ ] "Enter CeloPlace" button handles all 3 wallet states correctly
- [ ] `/play` page loads without SSR errors
- [ ] Map renders with CartoDB Dark Matter tiles on full viewport
- [ ] Past pixels from blockchain events are loaded and rendered on map mount
- [ ] Clicking the map with charges remaining calls `paintPixel` and renders optimistically
- [ ] ColorPicker shows 16 colors and correct charge count
- [ ] Chat button is visible at top-left on `/play` with unread indicator
- [ ] Chat sidebar slides in from left with smooth animation
- [ ] Chat loads last 50 messages and polls for new ones every 15 seconds
- [ ] Tip button in chat sends 0.01 CELO to the message sender
- [ ] Wallet pill shows correct state for disconnected / wrong network / connected
- [ ] Wrong network banner triggers network switch
- [ ] Design system applied consistently — no hardcoded colors, no shadows
- [ ] Fully responsive on mobile and desktop

---

> CeloPlace is complete. Verify at http://localhost:3000, test transactions on https://alfajores.celoscan.io, and prepare the demo.
