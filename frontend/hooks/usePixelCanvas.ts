import { useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESSES, CELOPLACE_ABI } from "@/lib/contracts";
import { parseAbiItem } from "viem";
import { useState, useCallback } from "react";
import { decodeCoord, uint24ToHex } from "@/lib/utils";

export type PixelData = {
  lat: number;
  lng: number;
  color: string;
  painter: string;
};

export function usePixelCanvas() {
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const publicClient = usePublicClient();
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [isLoadingPixels, setIsLoadingPixels] = useState(false);

  const fetchAllPixels = useCallback(async () => {
    if (!publicClient) return;
    setIsLoadingPixels(true);
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESSES.celoPlace,
        event: parseAbiItem("event PixelPainted(address indexed painter, int256 lat, int256 lng, uint24 color, uint256 timestamp)"),
        fromBlock: 0n,
        toBlock: "latest",
      });

      const reconstructed: PixelData[] = logs.map(log => {
        const args = log.args as any;
        return {
          lat: decodeCoord(args.lat),
          lng: decodeCoord(args.lng),
          color: uint24ToHex(args.color),
          painter: args.painter,
        };
      });
      setPixels(reconstructed);
    } catch (err) {
      console.error("Failed to fetch pixel logs:", err);
    } finally {
      setIsLoadingPixels(false);
    }
  }, [publicClient]);

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
    pixels,
    isLoadingPixels,
    fetchAllPixels,
    getPixel,
    getRemainingPixels,
    placePixel,
    isWriting,
  };
}
