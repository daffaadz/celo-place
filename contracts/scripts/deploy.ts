import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");

  // Deploy CeloChat
  console.log("\nDeploying CeloChat...");
  const CeloChat = await ethers.getContractFactory("CeloChat");
  const celoChat = await CeloChat.deploy();
  await celoChat.waitForDeployment();
  const celoChatAddress = await celoChat.getAddress();
  console.log("CeloChat deployed to:", celoChatAddress);

  // Deploy RewardPool
  console.log("\nDeploying RewardPool...");
  const RewardPool = await ethers.getContractFactory("RewardPool");
  const rewardPool = await RewardPool.deploy();
  await rewardPool.waitForDeployment();
  const rewardPoolAddress = await rewardPool.getAddress();
  console.log("RewardPool deployed to:", rewardPoolAddress);

  // Deploy CeloPlace
  console.log("\nDeploying CeloPlace...");
  const CeloPlace = await ethers.getContractFactory("CeloPlace");
  const celoPlace = await CeloPlace.deploy(deployer.address);
  await celoPlace.waitForDeployment();
  const celoPlaceAddress = await celoPlace.getAddress();
  console.log("CeloPlace deployed to:", celoPlaceAddress);

  // Deploy MissionBoard
  console.log("\nDeploying MissionBoard...");
  const MissionBoard = await ethers.getContractFactory("MissionBoard");
  const missionBoard = await MissionBoard.deploy(celoPlaceAddress);
  await missionBoard.waitForDeployment();
  const missionBoardAddress = await missionBoard.getAddress();
  console.log("MissionBoard deployed to:", missionBoardAddress);

  // Wire
  console.log("\nWiring contracts...");
  await celoPlace.setContracts(rewardPoolAddress, missionBoardAddress);
  await rewardPool.setMissionBoard(missionBoardAddress);
  console.log("Wired up CeloPlace and RewardPool.");

  // Output Addresses
  const addresses = {
    celoPlace: celoPlaceAddress,
    celoChat: celoChatAddress,
    rewardPool: rewardPoolAddress,
    missionBoard: missionBoardAddress,
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
  console.log("\nContract addresses written to", exportPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
