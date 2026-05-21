"use client";

import { useEffect, useRef } from "react";
import WalletButton from "@/components/shared/WalletButton";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated pixel grid canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CELL = 28;
    let animId: number;
    let frame = 0;

    const colors = [
      "rgba(228,76,255,0.12)",
      "rgba(0,240,255,0.10)",
      "rgba(255,217,61,0.08)",
      "rgba(228,76,255,0.06)",
      "rgba(0,240,255,0.05)",
    ];

    // Pre-generate random grid cells
    const cells: { x: number; y: number; colorIdx: number; phase: number }[] = [];

    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cells.length = 0;
      const cols = Math.ceil(canvas.width / CELL) + 1;
      const rows = Math.ceil(canvas.height / CELL) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.85) {
            cells.push({
              x: c * CELL,
              y: r * CELL,
              colorIdx: Math.floor(Math.random() * colors.length),
              phase: Math.random() * Math.PI * 2,
            });
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Grid lines
      ctx.strokeStyle = "rgba(228,76,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += CELL) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += CELL) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      // Animated lit cells
      cells.forEach(cell => {
        const alpha = (Math.sin(frame * 0.03 + cell.phase) + 1) / 2;
        const base = colors[cell.colorIdx];
        ctx.fillStyle = base.replace(/[\d.]+\)$/, `${alpha * 0.3})`);
        ctx.fillRect(cell.x + 1, cell.y + 1, CELL - 2, CELL - 2);
      });
      frame++;
      animId = requestAnimationFrame(draw);
    };

    init();
    draw();
    const resizeObs = new ResizeObserver(init);
    resizeObs.observe(canvas);
    return () => { cancelAnimationFrame(animId); resizeObs.disconnect(); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden scan-lines">
      {/* Animated pixel canvas bg */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Radial glow center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[var(--accent-primary)] opacity-[0.07] blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[var(--accent-secondary)] opacity-[0.05] blur-[80px] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        {/* Network badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--celo-green)]/30 bg-[var(--celo-green)]/5 text-[var(--celo-green)] text-xs font-mono mb-10 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--celo-green)] animate-pulse" />
          LIVE ON CELO MAINNET
        </div>

        {/* Logo */}
        <img
          src="/logo.png"
          alt="CeloPlace Logo"
          className="w-20 h-20 mb-8 drop-shadow-[0_0_30px_rgba(228,76,255,0.6)] animate-float"
        />

        {/* Big pixelated title */}
        <h1
          className="font-pixel text-3xl md:text-5xl lg:text-6xl leading-tight mb-6"
          style={{
            background: "linear-gradient(135deg, #E44CFF 0%, #00F0FF 50%, #FFD93D 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
          }}
        >
          CELOPLACE
        </h1>

        <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mb-4 leading-relaxed font-light">
          Paint the world.{" "}
          <span className="text-[var(--accent-secondary)] font-medium">Own every pixel.</span>
          <br />
          <span className="text-base text-text-muted">A collaborative canvas permanently on-chain.</span>
        </p>

        <div className="mt-10">
          <WalletButton variant="hero" />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted text-xs animate-bounce">
          <span className="font-mono text-[10px] tracking-widest">SCROLL</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="6" y="2" width="4" height="4" fill="currentColor" opacity="0.4"/>
            <rect x="4" y="6" width="8" height="4" fill="currentColor" opacity="0.6"/>
            <rect x="2" y="10" width="12" height="4" fill="currentColor" opacity="0.8"/>
            <rect x="4" y="14" width="8" height="4" fill="currentColor" opacity="0.6"/>
            <rect x="6" y="18" width="4" height="4" fill="currentColor" opacity="0.4"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
