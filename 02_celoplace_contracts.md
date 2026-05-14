# CeloPlace — Prompt 2 of 3: Smart Contracts

---

## Role

You are a senior Solidity developer with expertise in gas optimization, on-chain storage patterns, and Hardhat deployment workflows. You write secure, minimal, and well-documented contracts.

---

## Context

You are continuing to build **CeloPlace**. Prompt 1 (project setup and design system) is already complete. The folder structure, dependencies, and configuration files are in place.

You are now writing and deploying two smart contracts to **Celo Sepolia Testnet** (chainId: 44787). These contracts are the backbone of the entire application — all frontend interactions in Prompt 3 will read from and write to these contracts.

**Contract 1 — CeloPlace.sol:** Stores pixel data keyed by geographic coordinates. Enforces a daily paint limit of 3 pixels per wallet. Emits events that the frontend uses to reconstruct the full canvas.

**Contract 2 — CeloChat.sol:** Stores all global chat messages permanently on-chain. Allows users to tip message senders with CELO directly through the contract.

---

## Task

Write both contracts, a Hardhat config, a deploy script, basic tests, and the ABI export file for the frontend. Deploy both contracts to Celo Sepolia.

---

## Contract 1: `CeloPlace.sol`

### Requirements

**Data model:** Each pixel is identified by a coordinate pair (latitude and longitude scaled by 1e4 to avoid floats). Store for each pixel: the address of the last painter, the color as a packed RGB uint24, the timestamp of the last paint, and a running count of how many times that coordinate has been painted.

**Daily charge system:** Every wallet gets exactly 3 paint charges per day. Charges reset automatically at UTC midnight without requiring any separate claim transaction. The reset logic must work by comparing the current UTC day (derived from `block.timestamp / 1 days`) to the last day the user painted. If a new day has started, reset charges to 3 before processing the paint. This means a user who paints for the first time ever also gets their charges initialized correctly without a prior setup call.

**Coordinate encoding:** Latitude and longitude are passed as `int256` values scaled by `1e4`. For example, Jakarta at latitude -6.2088 is passed as -62088, and longitude 106.8456 is passed as 1068456. Validate that latitude is within -900000 to 900000 and longitude within -1800000 to 1800000. Use `keccak256(abi.encodePacked(lat, lng))` as the mapping key.

**Events:** Emit `PixelPainted(address indexed painter, int256 lat, int256 lng, uint24 color, uint256 timestamp)` after every successful paint. The frontend relies on this event to reconstruct the full canvas from blockchain history.

**Custom errors:** Use custom errors (not require strings) for: no charges remaining, and invalid coordinates.

**Read functions:** Provide `getPixel(int256 lat, int256 lng)` returning the full pixel struct, and `getCharges(address user)` returning the correct remaining charges for today — accounting for the new-day reset even if the user hasn't transacted yet today.

**Gas considerations:** The paint function should handle the charge refresh internally so the user only needs one transaction to paint. Avoid redundant storage reads.

---

## Contract 2: `CeloChat.sol`

### Requirements

**Data model:** Store messages in a dynamic array. Each message contains: sender address, content as string, timestamp as uint256, and cumulative tip amount received in wei as uint256.

**Message limits:** Reject empty messages and messages longer than 280 bytes. Use custom errors for both.

**Tip mechanism:** The `tipMessage(uint256 messageId)` function is payable. It transfers the sent CELO directly to the original message sender using a low-level call, updates the stored `tipAmount`, and emits an event. Validate that the message ID exists and that a non-zero value was sent. Revert with a descriptive custom error if the transfer fails.

**Pagination:** Provide `getMessages(uint256 offset, uint256 limit)` with a maximum limit of 100 per call. Provide `getRecentMessages(uint256 count)` which returns the last N messages — used for the initial chat load. Both should handle edge cases gracefully (offset out of bounds, count larger than total).

**Events:** Emit `MessageSent(uint256 indexed messageId, address indexed sender, string content, uint256 timestamp)` on send. Emit `MessageTipped(uint256 indexed messageId, address indexed tipper, address indexed recipient, uint256 amount)` on tip.

**Read functions:** Provide `getTotalMessages()` returning the array length.

---

## Hardhat Configuration (`hardhat.config.ts`)

Configure:
- Solidity 0.8.20 with optimizer enabled, 200 runs
- Network `celoSepolia`: RPC `https://alfajores-forno.celo-testnet.org`, chainId 44787, accounts from `process.env.PRIVATE_KEY`
- Network `celo`: RPC `https://forno.celo.org`, chainId 42220, accounts from `process.env.PRIVATE_KEY`
- Load `.env` using dotenv at the top of the file
- Guard against missing PRIVATE_KEY with a fallback empty array

---

## Deploy Script (`scripts/deploy.ts`)

The script must do the following in order:

1. Log the deployer wallet address and its CELO balance
2. Deploy `CeloChat` first, wait for deployment confirmation, log the address
3. Deploy `CeloPlace`, wait for deployment confirmation, log the address
4. Write a JSON file to `frontend/lib/contractAddresses.json` containing both addresses, the network name, chainId, and a deployedAt ISO timestamp
5. Print the final summary with both addresses and the Celo Sepolia explorer URL for each
6. Print the exact environment variable lines the developer needs to paste into `.env.local`

---

## Tests (`test/CeloPlace.test.ts`)

Write tests covering:

**CeloPlace:**
- `paintPixel` stores correct data and emits `PixelPainted` with correct arguments
- Third paint succeeds, fourth paint reverts with the NoChargesLeft custom error
- `getCharges` returns 3 for a fresh wallet and decrements correctly after each paint
- `getPixel` returns zeroed struct for a coordinate that has never been painted

**CeloChat:**
- `sendMessage` stores the message and emits `MessageSent` with correct arguments
- Empty message reverts with EmptyMessage error
- Message over 280 chars reverts with MessageTooLong error
- `tipMessage` transfers CELO to the sender and updates `tipAmount`
- `getRecentMessages` returns the correct last N messages
- `getMessages` pagination returns correct slices

---

## ABI Export (`frontend/lib/contracts.ts`)

After compilation, create this file that the frontend will import:

- Export `CONTRACT_ADDRESSES` object reading from `contractAddresses.json`, typed as `{ celoPlace: \`0x\${string}\`, celoChat: \`0x\${string}\` }`
- Export `CELOPLACE_ABI` as a `const` array containing the full ABI for: `paintPixel`, `getPixel`, `getCharges`, and the `PixelPainted` event
- Export `CELOCHAT_ABI` as a `const` array containing the full ABI for: `sendMessage`, `tipMessage`, `getRecentMessages`, `getMessages`, `getTotalMessages`, the `MessageSent` event, and the `MessageTipped` event

Use `as const` on all ABI arrays so wagmi can infer types correctly.

---

## Constraints

- Solidity version must be exactly `0.8.20`
- Use custom errors, not revert strings
- Do not use OpenZeppelin or any external contract library — keep contracts self-contained
- Do not add any ownership, pausing, or upgradeability — keep contracts minimal
- The deploy script must write `contractAddresses.json` automatically — do not require manual copy-paste of addresses

---

## Coordinate Convention Reference

This convention is used consistently across contracts and frontend:

| Real value | Stored in contract |
|---|---|
| Latitude -6.2088 (Jakarta) | -62088 |
| Longitude 106.8456 | 1068456 |
| Latitude 51.5074 (London) | 515074 |
| Longitude -0.1278 | -1278 |

Formula: `Math.round(decimalValue * 10000)` before sending to contract.

---

## Definition of Done

- [ ] `CeloPlace.sol` compiles without errors or warnings
- [ ] `CeloChat.sol` compiles without errors or warnings
- [ ] All tests pass (`npx hardhat test`)
- [ ] Both contracts deployed to Celo Sepolia
- [ ] `frontend/lib/contractAddresses.json` contains correct deployed addresses
- [ ] `.env.local` updated with both contract addresses
- [ ] `frontend/lib/contracts.ts` created with full ABIs and address exports

---

> When all items above are checked, proceed to **Prompt 3: UI & Frontend**.
