"use client";

import { useState, useRef, useEffect } from "react";
import { useGlobalChat } from "@/hooks/useGlobalChat";
import { MessageSquare, Send, Coins, Loader2 } from "lucide-react";
import { cn, truncateAddress, timeAgo } from "@/lib/utils";
import { useAccount } from "wagmi";

export default function GlobalChat() {
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 z-[1000] bg-celo-green text-black w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:scale-105 transition-transform pointer-events-auto"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-6 right-6 z-[1000] w-[350px] h-[500px] bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-2xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden">
      <div className="p-4 border-b border-white/[0.1] flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-celo-green" />
          <h3 className="font-bold text-white">Global Chat</h3>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-text-secondary hover:text-white"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-celo-green" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-text-secondary text-sm mt-10">No messages yet. Be the first!</div>
        ) : (
          messages.map((msg: { sender: string, content: string, timestamp: bigint }, i: number) => {
            const trueMessageId = offset + i;
            const isMe = msg.sender.toLowerCase() === address?.toLowerCase();
            return (
              <div key={trueMessageId} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={cn("text-xs font-mono", isMe ? "text-celo-yellow" : "text-celo-green")}>
                    {isMe ? "You" : truncateAddress(msg.sender)}
                  </span>
                  <span className="text-[10px] text-text-secondary">{timeAgo(Number(msg.timestamp))}</span>
                </div>
                <div className={cn(
                  "px-3 py-2 rounded-xl text-sm max-w-[85%] break-words",
                  isMe ? "bg-white/10 text-white rounded-tr-none" : "bg-celo-green/10 text-white border border-celo-green/20 rounded-tl-none"
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
                      className="w-16 bg-black border border-white/10 rounded text-[10px] px-1.5 py-0.5 text-white"
                      step="0.1"
                    />
                    <button
                      onClick={() => handleTip(trueMessageId)}
                      disabled={isWriting}
                      className="text-[10px] flex items-center gap-1 text-celo-yellow hover:text-white disabled:opacity-50"
                    >
                      <Coins size={10} /> Tip
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-white/[0.1] bg-white/[0.02]">
        <div className="flex gap-2">
          <input
            type="text"
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            placeholder="Gm web3..."
            className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-celo-green transition-colors"
            disabled={isWriting}
          />
          <button
            type="submit"
            disabled={isWriting || !msgInput.trim()}
            className="bg-celo-green text-black px-3 py-2 rounded-lg font-bold hover:brightness-110 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[44px]"
          >
            {isWriting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
