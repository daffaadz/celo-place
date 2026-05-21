"use client";

import { PaintBrush, Lightning, ChatDots, Trophy, Target } from "@phosphor-icons/react";

const FEATURES = [
  {
    icon: <PaintBrush weight="fill" className="w-6 h-6" />,
    title: "Overwrite Economy",
    desc: "Claim any pixel. Overwriting costs exponentially more CELO each time — natural scarcity.",
    tag: "CORE MECHANIC",
    color: "var(--accent-primary)",
    span: "md:col-span-2",
  },
  {
    icon: <Target weight="fill" className="w-6 h-6" />,
    title: "Mission Board",
    desc: "Complete daily objectives to earn bonus pixel charges. Stack streaks for multipliers.",
    tag: "DAILY PLAY",
    color: "var(--accent-secondary)",
    span: "",
  },
  {
    icon: <ChatDots weight="fill" className="w-6 h-6" />,
    title: "Global Chat",
    desc: "Every message is on-chain. Tip CELO directly to other painters.",
    tag: "COMMUNITY",
    color: "var(--accent-warm)",
    span: "",
  },
  {
    icon: <Trophy weight="fill" className="w-6 h-6" />,
    title: "Reward Pool",
    desc: "20% of all overwrite fees flow into a community pool distributed weekly.",
    tag: "ECONOMY",
    color: "var(--accent-primary)",
    span: "",
  },
  {
    icon: <Lightning weight="fill" className="w-6 h-6" />,
    title: "Streak System",
    desc: "Paint daily to build streaks. Longer streaks unlock higher charge allowances.",
    tag: "PROGRESSION",
    color: "var(--accent-secondary)",
    span: "",
  },
];

export default function FeaturesShowcase() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--accent-primary)] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-pixel text-[var(--accent-primary)] text-xs mb-4 tracking-widest">/ FEATURES</p>
          <h2 className="font-pixel text-2xl md:text-3xl text-white leading-relaxed">
            EVERYTHING YOU<br />
            <span style={{ color: "var(--accent-secondary)" }}>NEED TO PLAY</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feat) => (
            <div key={feat.title} className={`group ${feat.span}`}>
              <div className="relative rounded-2xl p-7 h-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300 group-hover:shadow-lg">
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-15 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ background: feat.color }}
                />
                <div className="relative z-10">
                  <div
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-pixel mb-5 border"
                    style={{ color: feat.color, borderColor: `${feat.color}40`, background: `${feat.color}10` }}
                  >
                    {feat.tag}
                  </div>
                  <div className="mb-4" style={{ color: feat.color }}>{feat.icon}</div>
                  <h3 className="text-white font-bold text-base mb-2">{feat.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
