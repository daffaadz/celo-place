import { useReadContract, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES, CELOPLACE_ABI } from "@/lib/contracts";

export function usePixelCanvas() {
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const getPixel = (lat: bigint, lng: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "getPixel",
      args: [lat, lng],
    });
  };

  const getRemainingPixels = (userAddress: `0x${string}` | undefined) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "getCharges",
      args: [userAddress || "0x0000000000000000000000000000000000000000"],
      query: {
        enabled: !!userAddress,
      }
    });
  };

  const placePixel = async (latEnc: bigint, lngEnc: bigint, colorHex: string) => {
    const cleanHex = colorHex.replace("#", "");
    const colorInt = parseInt(cleanHex, 16);

    const txHash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "paintPixel",
      args: [latEnc, lngEnc, colorInt],
    });

    return txHash;
  };

  return {
    getPixel,
    getRemainingPixels,
    placePixel,
    isWriting,
  };
}
