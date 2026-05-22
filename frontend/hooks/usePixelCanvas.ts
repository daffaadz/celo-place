import { useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CONTRACT_ADDRESSES, CELOPLACE_ABI } from "@/lib/contracts";
import { parseAbiItem } from "viem";
import { decodeCoord, uint24ToHex, encodeCoord } from "@/lib/utils";

export type PixelData = {
  lat: number;
  lng: number;
  color: string;
  painter: string;
  timestamp: number;
};

// Approximate block number at contract deployment (Celo Mainnet, ~2026-05-22)
// Celo produces ~1 block/5s. Current block is ~67.5M.
const DEPLOY_FROM_BLOCK = 67_550_000n;

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
          fromBlock: DEPLOY_FROM_BLOCK,
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
    refetchInterval: 15000,
    staleTime: 5000,
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

  /**
   * Place a pixel on the canvas.
   * Waits for transaction receipt before invalidating queries so that
   * the newly painted pixel's event is actually available on-chain.
   */
  const placePixel = async (
    latEnc: bigint,
    lngEnc: bigint,
    colorHex: string,
    value: bigint
  ): Promise<{ txHash: `0x${string}`; optimisticPixel: PixelData }> => {
    const cleanHex = colorHex.replace("#", "");
    const colorInt = parseInt(cleanHex, 16);

    const txHash = await writeContractAsync({
      address: CONTRACT_ADDRESSES.celoPlace,
      abi: CELOPLACE_ABI,
      functionName: "paintPixel",
      args: [latEnc, lngEnc, colorInt],
      value,
    });

    // Build optimistic pixel so canvas can show it immediately
    const optimisticPixel: PixelData = {
      lat: decodeCoord(latEnc),
      lng: decodeCoord(lngEnc),
      color: colorHex,
      painter: "", // filled in by caller if address available
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Wait for confirmation before refreshing pixel list
    if (publicClient) {
      await publicClient.waitForTransactionReceipt({ hash: txHash });
    }

    // Invalidate queries after confirmation — events are now on-chain
    queryClient.invalidateQueries({ queryKey: ["pixel-logs"] });
    
    // Invalidate Wagmi useReadContract queries (e.g. getTierInfo, getTierCharges)
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.includes('readContract');
      }
    });

    return { txHash, optimisticPixel };
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
