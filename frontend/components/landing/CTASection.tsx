"use client";

import WalletButton from "@/components/shared/WalletButton";

export default function CTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 pixel-grid opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--accent-primary)] opacity-[0.06] blur-[100px] rounded-full" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="font-pixel text-[var(--accent-secondary)] text-xs mb-6 tracking-widest">/ JOIN THE CANVAS</p>
        <h2 className="font-pixel text-2xl md:text-4xl text-white leading-relaxed mb-6">
          YOUR PIXELS.<br />
          <span style={{ color: "var(--accent-primary)" }}>YOUR WORLD.</span>
        </h2>
        <p className="text-text-secondary text-lg mb-12 max-w-xl mx-auto">
          Leave your mark on the blockchain. Every pixel you paint is permanent, verifiable, and yours.
        </p>
        <WalletButton variant="hero" />
        <div className="mt-6 flex items-center justify-center gap-2 text-text-muted text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--celo-green)] animate-pulse inline-block" />
          Live on Celo Mainnet · No sign-up required
        </div>
      </div>
    </section>
  );
}
