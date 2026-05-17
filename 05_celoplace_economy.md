# CeloPlace — Prompt 5: Economy System

---

## Role

You are a senior Solidity and fullstack Web3 engineer continuing work on CeloPlace. You have full context of the existing codebase. You understand the current contracts (`CeloPlace.sol`, `CeloChat.sol`), the frontend architecture, and the dark/light/satellite map mode system already implemented.

---

## Context

CeloPlace currently allows users to paint pixels for free (3/day) with no economy. This prompt introduces a complete token economy system across three layers:

1. **Dynamic overwrite pricing** — painting over someone else's pixel costs CELO, split between the previous owner and the reward pool
2. **Tiered daily charges** — users earn more daily pixels the longer their streak
3. **Territory Dominance Reward** — weekly prize pool distributed to top pixel holders via Merkle claim
4. **Daily Mission Board** — three on-chain verifiable missions per day with CELO rewards

This is a single cohesive system. All four parts must be implemented together as they share the same pool contracts and economic flows.

---

## Task

Implement three new smart contracts, modify the existing `CeloPlace.sol`, and build all corresponding frontend components. Every new UI element must integrate with the existing dark/light mode theme system already in place.

---

## Economic Model Overview

### Fee Flow

When a user overwrites another user's pixel, they pay a dynamic fee. That fee is split:

```
50% → previous pixel owner (instant compensation)
50% → RewardPool contract (funds weekly territory reward + daily missions)
```

When a user paints a coordinate that has never been painted before (virgin pixel), they pay a smaller protocol fee:

```
100% → Treasury (developer wallet, defined as a constant in the contract)
```

Painting a previously-owned pixel for free is no longer allowed. Every paint on an existing pixel requires the overwrite fee. First-time paints on empty coordinates require the protocol fee.

### Why This Split

The 50/50 split between owner compensation and community pool ensures that active players who accumulate territory are rewarded through both direct compensation (when attacked) and the weekly pool (for holding territory). Developers are only compensated from virgin pixel fees, which are low-value and high-volume — aligned incentives without extracting from competitive gameplay.

---

## Part 1 — Modify `CeloPlace.sol`

### Dynamic Overwrite Pricing

Add a public `getOverwritePrice(int256 lat, int256 lng)` view function that returns the current price in wei to overwrite the pixel at that coordinate. The price must never be zero for an occupied pixel.

**Pricing formula based on pixel age:**

| Pixel age | Price |
|---|---|
| Never painted (virgin) | 0.001 CELO (protocol fee) |
| Less than 1 day | 0.005 CELO |
| 1 to 3 days | 0.008 CELO |
| 3 to 7 days | 0.015 CELO |
| 7 to 30 days | 0.03 CELO |
| Over 30 days | 0.05 CELO |

**Hotspot multiplier** — applied on top of age-based price:

| Times contested (paintCount) | Multiplier |
|---|---|
| 0 to 2 | 1x |
| 3 to 5 | 1.5x |
| 6 or more | 2x |

The final price is `agePriceWei * hotspotMultiplier`. Store multipliers as integer fractions (multiply by 10, divide at end) to avoid floats in Solidity.

### Payment Handling in `paintPixel`

Modify `paintPixel` to accept `msg.value`:

- If the coordinate has never been painted: require `msg.value >= virginFee` (0.001 CELO). Send 100% to `treasury` address.
- If the coordinate is occupied: require `msg.value >= getOverwritePrice(lat, lng)`. Send 50% to the previous owner via low-level call. Send 50% to the `RewardPool` contract address. Revert with a descriptive custom error if either transfer fails.
- If the coordinate is occupied and the caller is the same as the current owner (re-painting your own pixel): require only `msg.value >= virginFee`. Send 100% to treasury. Do not trigger the overwrite split. This prevents self-overwrite farming.

### Exploit Protections

Add these three guards inside `paintPixel`:

**Cooldown guard:** A wallet cannot overwrite the same coordinate more than once per 24 hours. Store `mapping(bytes32 => mapping(address => uint256)) private lastOverwriteTime` where the key is the pixel key. Revert with `CooldownActive()` if violated.

**Minimum age guard:** A pixel that was painted less than 1 hour ago cannot be overwritten by a different wallet. Revert with `PixelTooNew()`. This prevents snipe compensation farming.

**Self-overwrite guard:** Detected by comparing `msg.sender == pixels[key].painter`. When true, treat as a re-paint (virgin fee, no split).

### Tiered Daily Charges System

Replace the flat 3 charges/day with a streak-based tiered system. Add `mapping(address => uint256) public currentStreak` and `mapping(address => uint256) public lastActiveDay`.

**Charge calculation by streak:**

| Streak | Base charges per day |
|---|---|
| 0 to 2 days | 3 |
| 3 to 6 days | 4 |
| 7 to 13 days | 5 |
| 14 to 29 days | 6 |
| 30 days or more | 8 |

Add a `bonusCharges` mapping that stores temporary extra charges granted by mission completions. These are consumed first before base charges.

**Streak logic inside `paintPixel`:** On every paint call, check if `lastActiveDay[msg.sender]` is exactly `today - 1`. If yes, increment streak. If it equals `today`, streak stays (already painted today). If it is older than `today - 1`, reset streak to 1. Update `lastActiveDay` to today.

**Mission bonus charges:** Add `function grantBonusCharges(address user, uint256 amount) external` restricted to the `MissionBoard` contract address only. This is called by MissionBoard after a user completes all three daily missions.

Add `function getTierInfo(address user) external view returns (uint256 streak, uint256 charges, uint256 bonusCharges)` for the frontend to display all charge info in one call.

---

## Part 2 — New Contract: `RewardPool.sol`

This contract holds all pooled CELO and handles two distribution mechanisms: weekly territory rewards (via Merkle claim) and daily mission rewards (direct transfer to MissionBoard).

### State Variables

- `uint256 public weeklyPoolBalance` — portion reserved for weekly territory reward
- `uint256 public missionPoolBalance` — portion reserved for daily missions
- `address public owner` — can set merkle root and withdraw to MissionBoard
- `bytes32 public currentMerkleRoot` — root of current week's distribution tree
- `uint256 public currentWeekId` — increments each time a new merkle root is set
- `mapping(uint256 => mapping(address => bool)) public hasClaimed` — tracks claims per weekId per address

### Incoming Funds

Add `receive() external payable`. When CELO is received, split it: 70% to `weeklyPoolBalance`, 30% to `missionPoolBalance`. Emit a `PoolFunded` event with both amounts.

### Merkle Distribution

`function setWeeklyRoot(bytes32 merkleRoot, uint256 totalDistribution) external onlyOwner` — sets a new merkle root for the current week and increments `weeklyPoolId`. Requires `weeklyPoolBalance >= totalDistribution`. Emits `WeeklyRootSet(weekId, merkleRoot, totalDistribution)`.

`function claimWeeklyReward(uint256 weekId, uint256 amount, bytes32[] calldata proof) external` — verifies the Merkle proof that `msg.sender` is entitled to `amount` in `weekId`. Marks as claimed. Transfers `amount` from `weeklyPoolBalance`. Emits `RewardClaimed(weekId, msg.sender, amount)`.

The Merkle leaf is `keccak256(abi.encodePacked(weekId, userAddress, amount))`.

### Mission Funding

`function transferToMissions(uint256 amount) external onlyOwner` — transfers `amount` from `missionPoolBalance` to the `MissionBoard` contract. Only callable by owner. Used to refill mission rewards weekly.

### View Functions

`function getClaimStatus(uint256 weekId, address user) external view returns (bool)` — returns whether user has claimed for a given week.

`function getPoolBalances() external view returns (uint256 weekly, uint256 missions)` — returns both balances.

---

## Part 3 — New Contract: `MissionBoard.sol`

This contract generates daily missions deterministically from on-chain randomness, tracks completion, and distributes rewards.

### Mission Generation

Each day has exactly 3 missions. The mission type for each slot is determined by:

```
dailySeed = keccak256(abi.encodePacked(block.timestamp / 1 days, blockhash(block.number - 1)))
mission1Type = uint8(dailySeed[0]) % totalMissionTypes
mission2Type = uint8(dailySeed[1]) % totalMissionTypes
mission3Type = uint8(dailySeed[2]) % totalMissionTypes
```

Define these mission types as an enum. Implement exactly these 6 types — all are on-chain verifiable without oracles:

| ID | Name | Requirement | Difficulty |
|---|---|---|---|
| 0 | `EARLY_BIRD` | Paint your first pixel before 08:00 UTC today | Easy |
| 1 | `FULL_CHARGES` | Use all your daily charges today | Easy |
| 2 | `NEIGHBOR` | Paint a pixel directly adjacent (±1 lat/lng unit at 1e4 scale) to a pixel owned by a different wallet | Medium |
| 3 | `CONTESTED` | Paint on a coordinate with paintCount ≥ 3 | Medium |
| 4 | `PIONEER` | Be the first wallet to paint a specific coordinate (virgin pixel) | Hard |
| 5 | `STREAK_KEEPER` | Paint today while having a streak ≥ 7 | Hard |

### Reward Tiers

Each mission slot has a fixed CELO reward pool per day:

- Slot 1 (easy): 0.5 CELO — distributed equally among all users who complete it
- Slot 2 (medium): 1.0 CELO — distributed equally among all users who complete it  
- Slot 3 (hard): 2.0 CELO — distributed only to the first 3 users who complete it (race mechanic)

The hard mission race mechanic must store the first 3 completers in an array and prevent further claims once full.

### Completion Tracking

`mapping(uint256 => mapping(address => bool[3])) public missionCompleted` — indexed by `day => user => slot`.

`mapping(uint256 => address[]) public slot1Completers` and equivalent for slot 2 and 3 — tracks all completers per day per slot.

`mapping(uint256 => address[3]) public slot3TopCompleters` — only 3 entries max.

### Core Functions

`function getMissionsToday() external view returns (uint8[3] memory types, uint256[3] memory rewards, uint256 slot3SpotsLeft)` — returns today's mission types, reward amounts, and remaining spots for slot 3.

`function completeMission(uint8 slot, bytes calldata proof) external` — verifies completion on-chain based on the mission type for that slot today. Marks as completed. If slot 3 and fewer than 3 completers: adds to `slot3TopCompleters`. Transfers reward share to `msg.sender`. If user completes all 3 missions in one day: calls `CeloPlace.grantBonusCharges(msg.sender, 2)`.

### On-Chain Verification Logic

Each mission type must be verifiable using only data already stored in `CeloPlace.sol`. Pass the `CeloPlace` contract address to `MissionBoard` constructor. Use the following verification logic per type:

- `EARLY_BIRD`: `CeloPlace.lastPaintTimestamp[user][today] < todayStart + 8 hours`
- `FULL_CHARGES`: `CeloPlace.chargesUsedToday[user][today] >= CeloPlace.getTierCharges(user)`
- `NEIGHBOR`: Caller provides the coordinates of their pixel and a neighbor coordinate. Contract checks that neighbor pixel exists and is owned by a different wallet.
- `CONTESTED`: Caller provides coordinates. Contract reads `paintCount >= 3` from the pixel struct.
- `PIONEER`: Caller provides coordinates of a pixel they just painted that has `paintCount == 1` and `painter == msg.sender`.
- `STREAK_KEEPER`: `CeloPlace.currentStreak[user] >= 7` and user painted today.

Add any additional storage to `CeloPlace.sol` that is required to support these verification checks (e.g. `lastPaintTimestamp`, `chargesUsedToday`).

---

## Part 4 — Off-Chain Script: `scripts/generateWeeklyDistribution.ts`

This script runs once per week (manually or via cron) to calculate territory rewards and push the Merkle root on-chain.

The script must:

1. Connect to Celo Sepolia using viem
2. Read all `PixelPainted` events from the `CeloPlace` contract from the beginning of the epoch
3. For each coordinate, determine the current owner (last painter)
4. Build a map of `walletAddress → pixelCount` counting only pixels painted within the last 7 days
5. Filter out wallets with fewer than 10 pixels (minimum to qualify)
6. Calculate each wallet's share as `walletPixelCount / totalQualifyingPixels`
7. Read `weeklyPoolBalance` from `RewardPool` contract
8. Calculate `rewardAmount = share * weeklyPoolBalance * 0.9` (keep 10% as buffer for rounding)
9. Build a Merkle tree from leaves `keccak256(abi.encodePacked(weekId, address, amount))`
10. Call `RewardPool.setWeeklyRoot(merkleRoot, totalDistribution)` with the deployer wallet
11. Write the full distribution data (address, amount, proof) to `frontend/lib/weeklyDistribution.json` for the frontend to use

Use the `merkletreejs` and `keccak256` npm packages for Merkle tree construction.

---

## Part 5 — Frontend: New Components

All new components must use the existing theme system. The app already has a `mapMode` prop and a `theme` prop (`'dark' | 'light'`) passed from the game page. Every new component must accept `theme: 'dark' | 'light'` as a prop and apply conditional classes accordingly.

### Theme Class Helper

Create `lib/themeClasses.ts` that exports a helper `tc(theme, darkClass, lightClass)` returning the appropriate class string based on theme. Use this helper in every new component instead of inline ternaries. Example:

```
panel background: tc(theme, 'bg-black/65 border-white/[0.06]', 'bg-white/80 border-black/10')
text primary:     tc(theme, 'text-text-primary', 'text-gray-900')
text secondary:   tc(theme, 'text-text-secondary', 'text-gray-500')
```

---

### Component: `OverwritePriceTooltip.tsx`

When a user hovers over a painted pixel on the map (at any zoom level), show a compact floating tooltip near the cursor displaying:

- Painter's truncated wallet address
- Pixel age in human-readable format ("3 days ago")
- Current overwrite price in CELO formatted to 3 decimals ("0.015 CELO")
- A small label explaining the price: "Age: 3–7 days · Contested: 3×"

The tooltip uses the `panel` style pattern and must adapt to `theme` prop. Fetch the price using `getOverwritePrice(lat, lng)` as a read call — do not make a network request on every mouse move. Fetch only when the hover target changes and cache the result.

---

### Component: `MissionBoard.tsx`

**Position:** A floating panel anchored to the right side of the screen, vertically centered. `position: fixed`, `right: 16px`, `top: 50%`, `transform: translateY(-50%)`. Width 280px. Uses `panel` style pattern.

**Collapsed state (default):** Shows only a small vertical tab on the right edge labeled "🎯 Missions" rotated 90 degrees. Clicking expands the panel.

**Expanded state:**

Header row: "🎯 Daily Missions" title (H2) on the left, countdown timer to midnight UTC on the right in `text-xs text-secondary` format "Resets in 14h 32m".

Three mission cards stacked vertically, each showing:
- Mission name and description
- Difficulty badge: Easy (green), Medium (yellow), Hard (red) — using badge style pattern
- Reward amount in CELO
- For slot 3: remaining spots indicator "2/3 spots left" in `text-xs`
- Completion state: uncompleted shows a ghost "Complete" button, completed shows a green checkmark with "Done"
- If eligible to claim (completed but not yet claimed): primary yellow "Claim" button

Below the cards, a "Mission Bonus" callout: "Complete all 3 → +2 bonus charges tomorrow" in a subtle `celo-yellow-dim` background box.

**Data:** On mount, call `getMissionsToday()` from the `MissionBoard` contract. Poll every 60 seconds. After each `paintPixel` transaction, re-check completion eligibility by calling the verification views.

**Theme:** All text, backgrounds, and borders must respond to the `theme` prop using `tc()` helper.

---

### Component: `RewardClaimPanel.tsx`

**Position:** A floating panel anchored to the bottom-center of the screen, above the pixel counter. `position: fixed`, `bottom: 72px`, centered horizontally. Width 340px.

**Visible only when:** A claimable reward exists in `frontend/lib/weeklyDistribution.json` for the connected wallet address AND `hasClaimed[currentWeekId][address]` returns false.

**Content:**
- Header: "🏆 Weekly Reward Available"
- Body: "You held X pixels last week — you earned Y CELO"
- Primary "Claim Y CELO" button that calls `claimWeeklyReward(weekId, amount, proof)` with the proof from `weeklyDistribution.json`
- After successful claim: replace with a green success state "✓ Y CELO claimed" that auto-dismisses after 5 seconds

**Theme:** Adapts fully to `theme` prop.

---

### Component: `StreakDisplay.tsx`

Integrate into the existing `HUD.tsx`. Place it directly below the wallet pill.

Displays:
- Flame emoji + "X day streak" in `text-sm`
- A small progress bar showing progress to the next tier (e.g. "3 more days for +1 charge")
- Current charges per day in `text-xs text-secondary`: "5 charges/day"

If streak is 0: show "Start your streak today" in `text-muted`.

Fetch data using `getTierInfo(address)` on mount and after each paint. **Theme:** adapts fully.

---

### Component: `EconomyStats.tsx`

Update the existing top-center pixel counter to expand into a richer stats bar. Keep the existing pixel count display and add two more pills in the same row:

- **Pool pill:** "💰 Pool: X.XX CELO" — reads `weeklyPoolBalance` from `RewardPool` contract, updates every 30 seconds
- **Next reward pill:** "⏱ Reward in Xd Yh" — countdown to next Monday 00:00 UTC

All three pills use the existing `panel` style and adapt to `theme`.

---

### Updates to `ColorPicker.tsx`

Below the charges display, add a compact "Paint Cost" indicator that shows what the next paint will cost:

- If user has enough charges and the selected coordinate is unset or their own: show "Free (virgin)" or "Free (re-paint)" in `text-celo-green text-xs`
- If the selected coordinate is occupied by another wallet: show the overwrite price fetched from `getOverwritePrice()` in `text-celo-yellow text-xs` with a small warning: "⚠ Overwrite: 0.015 CELO"

This requires `ColorPicker` to receive `hoveredCoordinate: { lat: number, lng: number } | null` as a prop, passed from `MapCanvas` whenever the cursor is over a painted pixel.

---

### Updates to `MapCanvas.tsx`

Pass `hoveredCoordinate` to both `ColorPicker` and `OverwritePriceTooltip`. Update the `paintPixel` call to include `value: overwritePrice` in the wagmi `writeContract` call when the target coordinate is occupied by another wallet. Before calling the contract, check the user's CELO balance and show an inline insufficient funds warning if the balance is below the required fee.

---

## Constraints

- Do not modify `CeloChat.sol`
- All new smart contract functions that transfer CELO must use low-level `.call{value: amount}("")` with success checks — never use `.transfer()` or `.send()`
- The `MissionBoard` contract must not hold CELO longer than needed — transfer rewards immediately upon `completeMission` call
- The Merkle distribution script must be idempotent — running it twice in the same week should detect that a root is already set and exit gracefully
- Do not add any new npm packages except `merkletreejs` for the distribution script
- Every new UI component must accept and respond to `theme: 'dark' | 'light'` — no component should have hardcoded dark-only styles
- All CELO amounts displayed in the UI must be formatted with `formatEther` from viem, never with manual division

---

## Definition of Done

**Contracts:**
- [ ] `CeloPlace.sol` updated with dynamic pricing, exploit guards, streak-based tiered charges, and bonus charge grant function
- [ ] `RewardPool.sol` deployed with Merkle claim and pool split logic
- [ ] `MissionBoard.sol` deployed with all 6 mission types and race mechanic for slot 3
- [ ] All three contracts deployed to Celo Sepolia
- [ ] `contractAddresses.json` updated with new contract addresses
- [ ] All ABIs updated in `frontend/lib/contracts.ts`

**Off-chain:**
- [ ] `generateWeeklyDistribution.ts` script runs without error and writes valid `weeklyDistribution.json`
- [ ] Script correctly generates Merkle proofs that the contract accepts

**Frontend:**
- [ ] `OverwritePriceTooltip` shows correct price on hover over painted pixels
- [ ] `MissionBoard` panel collapses and expands, shows correct missions, handles claim flow
- [ ] `RewardClaimPanel` appears only when reward is claimable, claim transaction works
- [ ] `StreakDisplay` shows streak, tier progress bar, and charges per day
- [ ] `EconomyStats` shows pool balance and reward countdown alongside pixel count
- [ ] `ColorPicker` shows paint cost indicator based on hovered coordinate
- [ ] `MapCanvas` passes hovered coordinate to tooltip and color picker, sends correct `msg.value` for overwrite transactions
- [ ] All new components render correctly in both dark and light mode
- [ ] Satellite mode (dark theme rules) renders correctly for all new components