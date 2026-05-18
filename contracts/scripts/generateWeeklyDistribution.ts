import { ethers } from "hardhat";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import path from "path";

async function main() {
    const CeloPlace = await ethers.getContractFactory("CeloPlace");
    const RewardPool = await ethers.getContractFactory("RewardPool");

    const addressesPath = path.join(__dirname, "../../frontend/lib/contractAddresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));

    const celoPlace = CeloPlace.attach(addresses.celoPlace);
    const rewardPool = RewardPool.attach(addresses.rewardPool);

    console.log("Fetching past pixel paints...");
    // Ideally filter by timestamp, but we just grab all for hackathon simplicity
    const filter = celoPlace.filters.PixelPainted();
    const events = await celoPlace.queryFilter(filter, 0, "latest");

    const currentTime = Math.floor(Date.now() / 1000);
    const oneWeekAgo = currentTime - 7 * 24 * 60 * 60;

    const userPaints: Record<string, number> = {};
    let totalPaints = 0;

    for (const event of events) {
        // any cast to handle typed event args
        const e = event as any; 
        const painter = e.args[0];
        const timestamp = Number(e.args[4]);
        
        // Count pixels from the last 7 days
        if (timestamp >= oneWeekAgo) {
            userPaints[painter] = (userPaints[painter] || 0) + 1;
            totalPaints++;
        }
    }

    if (totalPaints === 0) {
        console.log("No pixels painted in the last week. Skipping distribution.");
        return;
    }

    console.log(`Total paints this week: ${totalPaints}`);

    // Get weekly pool balance from contract state
    const weeklyPoolBalance = await rewardPool.weeklyPoolBalance();
    console.log(`Weekly Pool Balance: ${ethers.formatEther(weeklyPoolBalance)} CELO`);

    // Prepare Merkle Tree values
    // [address, amount]
    const values: [string, string][] = [];
    let totalDistribution = 0n;

    for (const [user, count] of Object.entries(userPaints)) {
        // Distribute proportionally
        const share = (weeklyPoolBalance * BigInt(count)) / BigInt(totalPaints);
        if (share > 0n) {
            values.push([user, share.toString()]);
            totalDistribution += share;
        }
    }

    if (values.length === 0) {
        console.log("No non-zero shares to distribute.");
        return;
    }

    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
    console.log("Merkle Root:", tree.root);

    // Write to contract
    const tx = await (rewardPool as any).setWeeklyRoot(tree.root, totalDistribution);
    await tx.wait();
    console.log("Weekly root set on contract!");

    // Generate JSON for frontend
    const claims: Record<string, { amount: string, proof: string[] }> = {};
    for (const [i, v] of tree.entries()) {
        claims[v[0]] = {
            amount: v[1],
            proof: tree.getProof(i)
        };
    }

    const distData = {
        root: tree.root,
        totalDistribution: totalDistribution.toString(),
        claims
    };

    const outputPath = path.join(__dirname, "../../frontend/public/weeklyDistribution.json");
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(distData, null, 2));
    console.log("Wrote distribution data to", outputPath);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
