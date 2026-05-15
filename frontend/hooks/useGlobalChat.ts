import { useReadContract, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES, CELOCHAT_ABI } from "@/lib/contracts";
import { parseEther } from "viem";

export function useGlobalChat() {
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const getRecentMessages = (count: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoChat,
      abi: CELOCHAT_ABI,
      functionName: "getRecentMessages",
      args: [BigInt(count)],
      query: {
        refetchInterval: 5000, // Poll every 5s
      }
    });
  };

  const getTotalMessages = () => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.celoChat,
      abi: CELOCHAT_ABI,
      functionName: "getTotalMessages",
      query: {
        refetchInterval: 5000,
      }
    });
  };

  const sendMessage = async (message: string) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.celoChat,
      abi: CELOCHAT_ABI,
      functionName: "sendMessage",
      args: [message],
    });
  };

  const tipMessage = async (messageId: number, amountCelo: string) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.celoChat,
      abi: CELOCHAT_ABI,
      functionName: "tipMessage",
      args: [BigInt(messageId)],
      value: parseEther(amountCelo),
    });
  };

  return {
    getRecentMessages,
    getTotalMessages,
    sendMessage,
    tipMessage,
    isWriting,
  };
}
