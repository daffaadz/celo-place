# CeloPlace 🎨 

A fully on-chain, collaborative pixel art canvas built on the **Celo Blockchain**. 

Draw pixels, claim rewards from the community pool, and chat with other painters—all powered by Celo's fast and low-cost transactions. Optimized for mobile-first experiences via **MiniPay**!

---

## 🚀 Live Demo
- **Vercel**: [Will be updated after deployment]
- **Network**: Celo Sepolia (Testnet)

## 🛠 Features
- **Interactive Map Canvas**: A dynamic slippy map where players can pan, zoom, and draw.
- **On-Chain Pixel Ownership**: Every pixel drawn is stored permanently on the blockchain.
- **Overwrite Economy**: Overwrite someone else's pixel by paying an exponentially increasing CELO fee.
- **Reward Pool**: 20% of every overwrite fee is sent to a community Reward Pool, distributed weekly to active painters.
- **Mission Board**: Complete daily painting missions to earn bonus charges!
- **Tipping Chat**: Send messages to the global chat and tip helpful players directly.

## 🔗 Smart Contracts (Celo Sepolia Testnet)
- **CeloPlace**: [0x48551a794b9407fd3B6286A90540B4F4a66D8529](https://alfajores.celoscan.io/address/0x48551a794b9407fd3B6286A90540B4F4a66D8529)
- **CeloChat**: [0xcc9D0B524a2CCf855F70eA1C7D0833ba2Dc1bAa6](https://alfajores.celoscan.io/address/0xcc9D0B524a2CCf855F70eA1C7D0833ba2Dc1bAa6)
- **RewardPool**: [0x2205E00c1dE89caD0586f632219f432612af38c3](https://alfajores.celoscan.io/address/0x2205E00c1dE89caD0586f632219f432612af38c3)
- **MissionBoard**: [0xB09ff32D0f9bc2daD6Cc69743870225fC4b7b1f8](https://alfajores.celoscan.io/address/0xB09ff32D0f9bc2daD6Cc69743870225fC4b7b1f8)

## 💻 Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Leaflet, Wagmi, Viem, RainbowKit
- **Smart Contracts**: Solidity, Hardhat
- **Deployment**: Vercel

## 🎮 How to Play
1. Connect your wallet (MetaMask, MiniPay, or Valora).
2. Choose a color from the **Color Picker**.
3. Zoom in on the canvas and click any tile to paint it!
4. Check the **Mission Board** (⭐) to see your daily objectives.
5. Watch the **Economy Stats** (💰) to see the Reward Pool grow!

## 🏃‍♂️ Running Locally
```bash
# Clone the repository
git clone https://github.com/Daffaadz/celo-place.git
cd celo-place/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
