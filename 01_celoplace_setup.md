# CeloPlace — Prompt 1 of 3: Project Setup & Design System

---

## Role

You are a senior fullstack Web3 engineer with deep expertise in Next.js, Tailwind CSS, wagmi, and Celo blockchain development. You write clean, production-ready code with consistent design systems.

---

## Context

You are building **CeloPlace** — a collaborative world map pixel painting game with permanent on-chain global chat, deployed on the Celo blockchain. This is a hackathon project for Celo Proof of Ship.

**Core user experience:** A user opens the website, connects their MetaMask wallet, picks a color, and clicks anywhere on an interactive world map to paint a pixel permanently on-chain. They can also open a global chat where every message is stored forever on Celo. Think Reddit r/place but on a real world map, where every pixel and chat message is an immutable blockchain transaction.

**Why people will use this:** Humans have a strong territorial instinct. When someone from Indonesia sees their country being "claimed" by another community, they will rally others to defend it. This creates organic community formation around countries and cities. The on-chain chat makes every interaction feel meaningful and irreversible.

---

## Task

Set up the complete project foundation. Do not write any smart contract logic or UI components yet. Focus only on:

1. Scaffolding the exact folder structure
2. Installing all dependencies
3. Configuring Tailwind with the design system
4. Configuring wagmi for Celo Sepolia and Celo Mainnet
5. Creating the root layout with providers
6. Setting up environment variables

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS |
| Map | Leaflet.js + OpenStreetMap |
| Pixel Layer | HTML5 Canvas overlaid on Leaflet |
| Wallet | MetaMask via wagmi v2 + viem |
| Smart Contracts | Solidity + Hardhat |
| Testnet | Celo Sepolia — chainId 11142220, RPC https://forno.celo-sepolia.celo-testnet.org |
| Mainnet | Celo — chainId 42220, RPC https://forno.celo.org |

---

## Folder Structure

Scaffold this exact structure. Do not deviate:

```
celoplace/
├── contracts/
│   ├── CeloPlace.sol
│   ├── CeloChat.sol
│   ├── hardhat.config.ts
│   ├── scripts/
│   │   └── deploy.ts
│   └── test/
│       └── CeloPlace.test.ts
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── play/
    │       └── page.tsx
    ├── components/
    │   ├── landing/
    │   │   ├── Hero.tsx
    │   │   ├── Features.tsx
    │   │   ├── HowItWorks.tsx
    │   │   └── Footer.tsx
    │   ├── game/
    │   │   ├── MapCanvas.tsx
    │   │   ├── GlobalChat.tsx
    │   │   ├── ColorPicker.tsx
    │   │   └── HUD.tsx
    │   └── shared/
    │       ├── WalletButton.tsx
    │       └── NetworkGuard.tsx
    ├── hooks/
    │   ├── usePixelCanvas.ts
    │   └── useGlobalChat.ts
    ├── lib/
    │   ├── wagmiConfig.ts
    │   ├── contracts.ts
    │   ├── utils.ts
    │   └── contractAddresses.json
    └── styles/
        └── globals.css
```

---

## Design System

Apply this design system exactly. Every component built in Prompt 2 and 3 must reference these tokens — never use hardcoded color values.

### Color Tokens

Define these as both CSS custom properties in `globals.css` and as Tailwind custom colors in `tailwind.config.ts`:

**Backgrounds**
- `bg-base`: `#08090a` — deepest layer, used on body
- `bg-surface`: `#111214` — cards, panels, sidebar
- `bg-elevated`: `#1a1b1e` — dropdowns, tooltips

**Borders**
- `border-subtle`: `#1f2023` — hairline borders
- `border-default`: `#2a2b2f` — standard component borders

**Brand**
- `celo-yellow`: `#FCFF52` — primary CTA, highlights, active states
- `celo-yellow-dim`: `#fcff5218` — hover backgrounds, glow effects
- `celo-green`: `#35D07F` — success, online indicators
- `celo-green-dim`: `#35d07f18` — success backgrounds

**Text**
- `text-primary`: `#f0f0f0`
- `text-secondary`: `#8a8f98`
- `text-muted`: `#4a4f5a`

### Typography

Use **Inter** from `next/font/google`. Apply these sizes consistently:

| Role | Tailwind Class | Weight | Usage |
|---|---|---|---|
| Display | `text-6xl` | 800 | Hero headline |
| H1 | `text-4xl` | 700 | Section titles |
| H2 | `text-2xl` | 600 | Card and sidebar headers |
| Body | `text-base` | 400 | Paragraphs, chat messages |
| Small | `text-sm` | 400 | Metadata, timestamps, wallet addresses |
| Label | `text-xs` | 400 | Badges, pills |

### Reusable Style Patterns

These patterns must be used consistently. Do not create variations:

- **Panel** (sidebar, modal, floating card): `backdrop-blur-xl bg-black/[0.65] border border-white/[0.06] rounded-2xl`
- **Button Primary**: `bg-celo-yellow text-black font-bold rounded-xl hover:brightness-110 transition-all duration-200`
- **Button Ghost**: `border border-white/10 text-text-primary rounded-xl hover:bg-white/[0.04] transition-all duration-200`
- **Input**: `bg-white/[0.04] border border-white/[0.08] rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-celo-yellow/50`
- **Badge**: `bg-white/[0.06] border border-white/[0.08] text-text-secondary text-xs rounded-full px-3 py-1`

**Hard rules — never break these:**
- No `box-shadow` or `drop-shadow` anywhere
- No solid opaque backgrounds on floating elements
- Floating elements always use blur + transparency + thin border only

---

## Wagmi Configuration

In `lib/wagmiConfig.ts`, define both chains using `defineChain` from viem and configure wagmi with:
- MetaMask as the only connector
- Celo Sepolia as the active development chain
- Celo Mainnet defined but inactive (ready for production deploy)
- HTTP transport for both chains using their respective RPC URLs

---

## Root Layout

In `app/layout.tsx`:
- Configure Inter font and apply it to the body
- Set page metadata: title "CeloPlace — Paint the World", description about collaborative on-chain pixel painting
- Wrap all children with WagmiProvider and QueryClientProvider
- Apply `bg-base` and `text-primary` as body base styles

---

## Environment Variables

Create `.env.example` with these variables:

```
# Contracts only — never expose to frontend
PRIVATE_KEY=

# Frontend — safe to expose
NEXT_PUBLIC_CELO_RPC=https://alfajores-forno.celo-testnet.org
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_CELOPLACE_ADDRESS=
NEXT_PUBLIC_CELOCHAT_ADDRESS=
NEXT_PUBLIC_EXPLORER_URL=https://alfajores.celoscan.io
```

Copy to `.env.local`. Leave contract addresses empty for now — they will be filled after Prompt 2 deployment.

---

## Constraints

- Do not write any smart contract logic in this step
- Do not write any UI components in this step
- Do not use any color values outside the defined design tokens
- Do not install any dependencies not listed in the tech stack

---

## Definition of Done

- [ ] Full folder structure scaffolded
- [ ] `tailwind.config.ts` contains all color tokens
- [ ] `globals.css` contains all CSS custom properties
- [ ] `lib/wagmiConfig.ts` configured with both chains and MetaMask connector
- [ ] `app/layout.tsx` has Inter font, metadata, and both providers
- [ ] All dependencies installed in both `contracts/` and `frontend/`
- [ ] `.env.example` created with all required variables

---

> When all items above are checked, proceed to **Prompt 2: Smart Contracts**.
