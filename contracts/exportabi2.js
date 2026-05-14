const fs = require('fs');
const celoPlace = require('./artifacts/contracts/CeloPlace.sol/CeloPlace.json');
const celoChat = require('./artifacts/contracts/CeloChat.sol/CeloChat.json');
const TS = `import contractAddresses from './contractAddresses.json';

export const CONTRACT_ADDRESSES = {
  celoPlace: contractAddresses.celoPlace as \`0x\${string}\`,
  celoChat: contractAddresses.celoChat as \`0x\${string}\`,
};

export const CELOPLACE_ABI = ${JSON.stringify(celoPlace.abi)} as const;
export const CELOCHAT_ABI = ${JSON.stringify(celoChat.abi)} as const;`;

fs.writeFileSync('../frontend/lib/contracts.ts', TS);
