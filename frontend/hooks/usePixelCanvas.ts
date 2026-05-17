import { useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES, CELOPLACE_ABI } from "@/lib/contracts";
import { parseAbiItem } from "viem";
import { decodeCoord, uint24ToHex } from "@/lib/utils";

export type PixelData = {
  lat: number;
  lng: number;
  color: string;
  painter: string;
  timestamp: number;
};

export function usePixelCanvas() {
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const { data: pixels = [], isLoading: isLoadingPixels, refetch: fetchAllPixels } = useQuery({
    queryKey: ["pixel-logs"],
    queryFn: async () => {
      if (!publicClient) return [];
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
            timestamp: Number(args.timestamp),
          };
        });
        return reconstructed;
      } catch (error) {
        console.error("Error fetching pixel logs:", error);
        return [];
      }
    },
    refetchInterval: 10000,
  });

  const getPixel = (lat: bigint, lng: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "getPixel",
      args: [lat, lng],
    });
  };

  const getTierInfo = (userAddress: `0x${string}` | undefined) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "getTierInfo",
      args: [userAddress || "0x0000000000000000000000000000000000000000"],
      query: {
        enabled: !!userAddress,
      }
    });
  };

  const getBaseCharges = (userAddress: `0x${string}` | undefined) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "getTierCharges",
      args: [userAddress || "0x0000000000000000000000000000000000000000"],
      query: {
        enabled: !!userAddress,
      }
    });
  };

  const getOverwritePrice = (lat: bigint, lng: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "getOverwritePrice",
      args: [lat, lng],
    });
  };

  const fetchOverwritePrice = async (lat: bigint, lng: bigint) => {
    if (!publicClient) return 0n;
    try {
      const price = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.celoPlace,
        abi: CELOPLACE_ABI,
        functionName: "getOverwritePrice",
        args: [lat, lng],
      });
      return price as bigint;
    } catch (e) {
      console.error("Failed to fetch overwrite price", e);
      return 0n;
    }
  };

  const placePixel = async (latEnc: bigint, lngEnc: bigint, colorHex: string, value: bigint) => {
    const cleanHex = colorHex.replace("#", "");
    const colorInt = parseInt(cleanHex, 16);

    const txHash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "paintPixel",
      args: [latEnc, lngEnc, colorInt],
      value,
    });

    queryClient.invalidateQueries({ queryKey: ["pixel-logs"] });

    return txHash;
  };

  return {
    pixels,
    isLoadingPixels,
    fetchAllPixels,
    getPixel,
    getTierInfo,
    getBaseCharges,
    getOverwritePrice,
    fetchOverwritePrice,
    placePixel,
    isWriting,
  };
}
