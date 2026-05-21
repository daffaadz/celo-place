"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    num: "01",
    title: "Connect Wallet",
    desc: "Connect MetaMask, Valora, or any WalletConnect-compatible wallet to access the canvas.",
    color: "var(--accent-primary)",
  },
  {
    num: "02",
    title: "Pick a Color",
    desc: "Choose your color from dozens of presets or pick any custom hex color you want.",
    color: "var(--accent-secondary)",
  },
  {
    num: "03",
    title: "Click to Paint",
    desc: "Zoom into the world map and click any tile. Your pixel is recorded on the Celo blockchain.",
    color: "var(--accent-warm)",
  },
  {
    num: "04",
    title: "Earn Rewards",
    desc: "Complete missions, build streaks, and claim your share from the community Reward Pool.",
    color: "var(--accent-primary)",
  },
];

export default function WhatIsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal-item").forEach((el, i) => {
              setTimeout(() => {
                (el as HTMLElement).style.opacity = "1";
                (el as HTMLElement).style.transform = "translateY(0)";
              }, i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-secondary)] opacity-[0.04] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="reveal-item mb-20 opacity-0 transition-all duration-700" style={{ transform: "translateY(30px)" }}>
          <p className="font-pixel text-[var(--accent-secondary)] text-xs mb-4 tracking-widest">/ ABOUT</p>
          <h2 className="font-pixel text-2xl md:text-3xl text-white leading-relaxed">
            WHAT IS<br />
            <span style={{ color: "var(--accent-primary)" }}>CELOPLACE?</span>
          </h2>
        </div>

        {/* Two col layout */}
        <div className="grid md:grid-cols-2 gap-16 items-start mb-24">
          <div
            className="reveal-item opacity-0 transition-all duration-700 delay-100"
            style={{ transform: "translateY(30px)" }}
          >
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              CeloPlace is a fully decentralized, collaborative pixel art canvas where anyone
              in the world can draw, claim, and overwrite pixels — all permanently recorded
              on the <span className="text-white font-medium">Celo blockchain</span>.
            </p>
            <p className="text-text-secondary leading-relaxed mb-8">
              Every pixel is an on-chain transaction. Every overwrite creates an economy.
              There are no server databases, no admins, no central authority —
              just code, math, and community.
            </p>

            {/* Key points */}
            <div className="space-y-3">
              {[
                "Anyone can draw on the global map, no permission needed",
                "Every pixel is permanently stored on Celo Mainnet",
                "Overwrite others' pixels — but at an increasing CELO cost",
                "20% of every fee funds the community Reward Pool",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 mt-1 flex-shrink-0"
                    style={{ background: "var(--accent-primary)", boxShadow: "0 0 8px var(--accent-primary)" }}
                  />
                  <span className="text-text-secondary text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — pixel art decorative box */}
          <div
            className="reveal-item opacity-0 transition-all duration-700 delay-200"
            style={{ transform: "translateY(30px)" }}
          >
            <div className="relative p-px rounded-2xl" style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))" }}>
              <div className="bg-[var(--bg-surface)] rounded-2xl p-8 font-mono text-sm">
                <div className="text-[var(--accent-secondary)] mb-1">{"// CeloPlace.sol"}</div>
                <div className="text-text-muted">function <span className="text-[var(--accent-primary)]">paintPixel</span>(</div>
                <div className="text-text-muted pl-4">uint256 x,</div>
                <div className="text-text-muted pl-4">uint256 y,</div>
                <div className="text-text-muted pl-4">bytes3 color</div>
                <div className="text-text-muted">) external <span className="text-[var(--accent-warm)]">payable</span> {"{"}</div>
                <div className="text-text-secondary pl-4">uint256 price = getOverwritePrice(x, y);</div>
                <div className="text-text-secondary pl-4">require(msg.value {">"} price);</div>
                <div className="text-[var(--accent-secondary)] pl-4">pixels[x][y] = Pixel({"{"}</div>
                <div className="text-text-secondary pl-8">painter: msg.sender,</div>
                <div className="text-text-secondary pl-8">color: color,</div>
                <div className="text-text-secondary pl-8">timestamp: block.timestamp</div>
                <div className="text-[var(--accent-secondary)] pl-4">{"}"});</div>
                <div className="text-text-muted">{"}"}</div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--celo-green)] animate-pulse" />
                  <span className="text-[var(--celo-green)] text-xs">Deployed on Celo Mainnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works steps */}
        <div className="reveal-item opacity-0 transition-all duration-700 delay-300" style={{ transform: "translateY(30px)" }}>
          <p className="font-pixel text-[var(--accent-primary)] text-xs mb-8 tracking-widest">/ HOW IT WORKS</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="reveal-item opacity-0 transition-all duration-700 group"
              style={{ transform: "translateY(30px)", transitionDelay: `${400 + i * 100}ms` }}
            >
              <div className="relative p-px rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${step.color}40, transparent)` }}>
                <div className="bg-[var(--bg-surface)] rounded-2xl p-6 h-full border border-[var(--border-subtle)]">
                  <div className="font-pixel text-3xl mb-4" style={{ color: step.color }}>{step.num}</div>
                  <h3 className="font-bold text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-text-secondary text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
