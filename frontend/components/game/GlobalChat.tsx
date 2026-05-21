"use client";

import { useState, useRef, useEffect } from "react";
import { useGlobalChat } from "@/hooks/useGlobalChat";
import { Chat, PaperPlaneRight, Coins, SpinnerGap, X } from "@phosphor-icons/react";
import { cn, truncateAddress, timeAgo } from "@/lib/utils";
import { useAccount } from "wagmi";

export default function GlobalChat({ mapMode = "dark" }: { mapMode?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [tipInput, setTipInput] = useState<{ [key: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { address } = useAccount();
  const { getRecentMessages, getTotalMessages, sendMessage, tipMessage, isWriting } = useGlobalChat();
  
  const { data: messagesData, isLoading } = getRecentMessages(50);
  const { data: totalMessagesData } = getTotalMessages();

  const messages = Array.isArray(messagesData) ? messagesData : [];
  const totalMsgs = Number(totalMessagesData || 0);
  const offset = Math.max(0, totalMsgs - 50);

  const isLight = mapMode === "light";

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || isWriting) return;
    try {
      await sendMessage(msgInput);
      setMsgInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTip = async (messageId: number) => {
    const amt = tipInput[messageId];
    if (!amt || isNaN(Number(amt)) || Number(amt) <= 0 || isWriting) return;
    try {
      await tipMessage(messageId, amt);
      setTipInput(prev => ({ ...prev, [messageId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-6 right-6 z-[1000] bg-celo-green text-black w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:scale-105 transition-transform pointer-events-auto"
        >
          <Chat className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Chat */}
      <div className={cn(
        "fixed right-4 top-4 bottom-4 z-[1000] w-[380px] flex flex-col pointer-events-auto transition-transform duration-300 backdrop-blur-xl rounded-2xl overflow-hidden",
        isLight ? "bg-white/95 border border-black/10 shadow-2xl text-black" : "bg-black/95 border border-white/[0.1] shadow-2xl text-white",
        isOpen ? "translate-x-0" : "translate-x-[120%]"
      )}>
        <div className={cn(
          "p-4 border-b flex items-center justify-between",
          isLight ? "border-black/5 bg-gray-50/50" : "border-white/[0.1] bg-white/[0.02]"
        )}>
          <div className="flex items-center gap-2">
            <Chat className="w-5 h-5 text-celo-green" />
            <h3 className="font-bold">Global Chat</h3>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className={cn("p-1 rounded-md transition-colors", isLight ? "hover:bg-black/5 text-gray-500" : "hover:bg-white/10 text-text-secondary")}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <SpinnerGap className="w-6 h-6 animate-spin text-celo-green" />
            </div>
          ) : messages.length === 0 ? (
            <div className={cn("text-center text-sm mt-10", isLight ? "text-gray-400" : "text-text-secondary")}>No messages yet. Be the first!</div>
          ) : (
            messages.map((msg: { sender: string, content: string, timestamp: bigint }, i: number) => {
              const trueMessageId = offset + i;
              const isMe = msg.sender.toLowerCase() === address?.toLowerCase();
              return (
                <div key={trueMessageId} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={cn("text-xs font-mono", isMe ? (isLight ? "text-celo-green" : "text-celo-yellow") : "text-celo-green")}>
                      {isMe ? "You" : truncateAddress(msg.sender)}
                    </span>
                    <span className={cn("text-[10px]", isLight ? "text-gray-400" : "text-text-secondary")}>{timeAgo(Number(msg.timestamp))}</span>
                  </div>
                  <div className={cn(
                    "px-3 py-2 rounded-xl text-sm max-w-[85%] break-words",
                    isMe 
                      ? (isLight ? "bg-black/5 text-black rounded-tr-none" : "bg-white/10 text-white rounded-tr-none")
                      : (isLight ? "bg-celo-green/10 text-black border border-celo-green/20 rounded-tl-none" : "bg-celo-green/10 text-white border border-celo-green/20 rounded-tl-none")
                  )}>
                    {msg.content}
                  </div>
                  {!isMe && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        placeholder="CELO"
                        value={tipInput[trueMessageId] || ""}
                        onChange={(e) => setTipInput(prev => ({...prev, [trueMessageId]: e.target.value}))}
                        className={cn(
                          "w-16 border rounded text-[10px] px-1.5 py-0.5",
                          isLight ? "bg-white border-gray-200 text-black placeholder:text-gray-400" : "bg-black border-white/10 text-white"
                        )}
                        step="0.1"
                      />
                      <button
                        onClick={() => handleTip(trueMessageId)}
                        disabled={isWriting}
                        className={cn(
                          "text-[10px] flex items-center gap-1 hover:brightness-110 disabled:opacity-50",
                          isLight ? "text-celo-green font-semibold" : "text-celo-yellow"
                        )}
                      >
                        <Coins size={10} weight="fill" /> Tip
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={cn(
          "p-4 border-t",
          isLight ? "border-black/5 bg-gray-50/50" : "border-white/[0.1] bg-white/[0.02]"
        )}>
          <div className="flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Gm web3..."
              className={cn(
                "flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors",
                isLight ? "bg-white border-black/10 focus:border-celo-green text-black" : "bg-black border-white/10 focus:border-celo-green text-white"
              )}
              disabled={isWriting}
            />
            <button
              type="submit"
              disabled={isWriting || !msgInput.trim()}
              className="bg-celo-green text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[48px]"
            >
              {isWriting ? <SpinnerGap size={16} className="animate-spin" /> : <PaperPlaneRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
