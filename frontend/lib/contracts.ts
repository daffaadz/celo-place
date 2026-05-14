// To be populated in Prompt 2
import addresses from "./contractAddresses.json";

export const CONTRACT_ADDRESSES = {
  celoPlace: (addresses.celoPlace || "0x") as `0x${string}`,
  celoChat: (addresses.celoChat || "0x") as `0x${string}`,
};

export const CELOPLACE_ABI = [] as const;
export const CELOCHAT_ABI = [] as const;
