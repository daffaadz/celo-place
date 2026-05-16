import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import * as fs from "fs";
import { parseEther } from "viem";

async function main() {
  // Typical data shape: [address, amountToClaim]
  const rewards = [
    ["0x1234567890123456789012345678901234567890", parseEther("10").toString()],
    ["0x0987654321098765432109876543210987654321", parseEther("5").toString()]
  ];

  const tree = StandardMerkleTree.of(rewards, ["address", "uint256"]);
  
  console.log("Merkle Root:", tree.root);
  
  const outputData = {
    root: tree.root,
    values: tree.dump()
  };

  fs.writeFileSync("weekly-distribution.json", JSON.stringify(outputData, null, 2));
  console.log("Distribution tree written to weekly-distribution.json");
}

main().catch(console.error);
