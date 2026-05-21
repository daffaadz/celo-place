# CeloPlace 🎨 

A fully on-chain, collaborative pixel art canvas built on the **Celo Blockchain**. 

Draw pixels, claim rewards from the community pool, and chat with other painters—all powered by Celo's fast and low-cost transactions. Optimized for mobile-first experiences via **MiniPay**!

---

## 🚀 Live Demo
- **Vercel**: [https://celo-place.vercel.app/](https://celo-place.vercel.app/)
- **Network**: Celo Mainnet

## 🛠 Features
- **Interactive Map Canvas**: A dynamic slippy map where players can pan, zoom, and draw.
- **On-Chain Pixel Ownership**: Every pixel drawn is stored permanently on the blockchain.
- **Overwrite Economy**: Overwrite someone else's pixel by paying an exponentially increasing CELO fee.
- **Reward Pool**: 20% of every overwrite fee is sent to a community Reward Pool, distributed weekly to active painters.
- **Mission Board**: Complete daily painting missions to earn bonus charges!
- **Tipping Chat**: Send messages to the global chat and tip helpful players directly.

## 🔗 Smart Contracts (Celo Mainnet)
- **CeloPlace**: [0x1Ba28d59AD81615055881436152Bbe63B6a445Ef](https://celoscan.io/address/0x1Ba28d59AD81615055881436152Bbe63B6a445Ef)
- **CeloChat**: [0x3661E8697d5b907aab651E7549207a67A618373e](https://celoscan.io/address/0x3661E8697d5b907aab651E7549207a67A618373e)
- **RewardPool**: [0xA228DF897d3811902Fa1A5fa57eE0FAdf2F009FF](https://celoscan.io/address/0xA228DF897d3811902Fa1A5fa57eE0FAdf2F009FF)
- **MissionBoard**: [0x4aD0f914d38fDA639C0aa98754c58A8121639C7f](https://celoscan.io/address/0x4aD0f914d38fDA639C0aa98754c58A8121639C7f)

## 💻 Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Leaflet, Wagmi, Viem
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
git clone https://github.com/daffaadz/celo-place.git
cd celo-place/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
