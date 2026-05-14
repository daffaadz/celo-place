import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account: ");

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:  CELO");

  // 1. Deploy CeloChat
  console.log("\nDeploying CeloChat...");
  const CeloChat = await ethers.getContractFactory("CeloChat");
  const celoChat = await CeloChat.deploy();
  await celoChat.waitForDeployment();
  const celoChatAddress = await celoChat.getAddress();
  console.log("CeloChat deployed to: ");

  // 2. Deploy CeloPlace
  console.log("\nDeploying CeloPlace...");
  const CeloPlace = await ethers.getContractFactory("CeloPlace");
  const celoPlace = await CeloPlace.deploy();
  await celoPlace.waitForDeployment();
  const celoPlaceAddress = await celoPlace.getAddress();
  console.log("CeloPlace deployed to: ");

  // 3. Write to contractAddresses.json
  const addresses = {
    celoPlace: celoPlaceAddress,
    celoChat: celoChatAddress,
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString()
  };

  const frontendLibPath = path.join(__dirname, "../../frontend/lib");
  if (!fs.existsSync(frontendLibPath)) {
    fs.mkdirSync(frontendLibPath, { recursive: true });
  }

  const exportPath = path.join(frontendLibPath, "contractAddresses.json");
  fs.writeFileSync(exportPath, JSON.stringify(addresses, null, 2));
  console.log("\nContract addresses written to ");

  // 4. Print summary
  const explorerUrl = network.name === 'celo' ? 'https://celoscan.io' : 'https://alfajores.celoscan.io';
  console.log("\n--- Deployment Summary ---");
  console.log("CeloChat Explorer: /address/");
  console.log("CeloPlace Explorer: /address/");
  
  console.log("\nPaste the following into your .env.local:");
  console.log("NEXT_PUBLIC_CELOPLACE_ADDRESS=");
  console.log("NEXT_PUBLIC_CELOCHAT_ADDRESS=");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
