"use client";

import WalletButton from "@/components/shared/WalletButton";
import { useEffect, useState } from "react";

interface LogoConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  delay: number;
  duration: number;
}

export default function Hero() {
  const [logos, setLogos] = useState<LogoConfig[]>([]);

  useEffect(() => {
    // Generate between 10 and 20 logos
    const count = Math.floor(Math.random() * 11) + 10;
    const newLogos: LogoConfig[] = [];

    for (let i = 0; i < count; i++) {
      const size = Math.floor(Math.random() * 170) + 80; // 80px to 250px
      // Opacity based on size: smaller = more transparent
      const opacity = (size / 250) * 0.4; 
      
      newLogos.push({
        id: i,
        x: Math.random() * 90, // Keep mostly within view width
        y: Math.random() * 90, // Keep mostly within view height
        size,
        rotation: Math.random() * 45, // 0 to 45 degrees
        opacity,
        delay: Math.random() * 5, // 0s to 5s delay
        duration: Math.random() * 4 + 6, // 6s to 10s float cycle
      });
    }
    setLogos(newLogos);
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      {/* Floating Logos Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="absolute animate-float"
            style={{
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              animationDelay: `${logo.delay}s`,
              animationDuration: `${logo.duration}s`,
            }}
          >
            <img
              src="/logo.png"
              alt=""
              style={{
                width: `${logo.size}px`,
                transform: `rotate(${logo.rotation}deg)`,
                opacity: logo.opacity,
                filter: 'blur(3px)',
              }}
            />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-celo-green/10 border border-celo-green/20 text-celo-green text-sm font-medium mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-celo-green animate-pulse" />
          Live on Celo Sepolia
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-lg">
          Welcome to <span className="text-celo-yellow drop-shadow-md">CeloPlace</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 drop-shadow-md">
          A decentralized, collaborative digital canvas on the Celo blockchain. 
          Connect your wallet, leave your mark, and be part of web3 history.
        </p>
        <WalletButton variant="hero" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-celo-yellow/10 blur-[150px] rounded-full pointer-events-none -z-10" />
    </section>
  );
}
