"use client";

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

export default function FloatingLogos() {
  const [logos, setLogos] = useState<LogoConfig[]>([]);

  useEffect(() => {
    const targetCount = Math.floor(Math.random() * 6) + 15; // 15 to 20
    const newLogos: LogoConfig[] = [];
    const maxAttempts = 200;
    
    // Distance threshold in percentage. ~12% is usually enough to avoid overlaps
    // for logos that are 80-250px large.
    const minDistance = 12;

    for (let i = 0; i < maxAttempts; i++) {
      if (newLogos.length >= targetCount) break;

      const roll = Math.random();
      let y;
      if (roll < 0.4) {
        y = Math.random() * 30; // Top
      } else if (roll < 0.8) {
        y = Math.random() * 25 + 70; // Bottom
      } else {
        y = Math.random() * 40 + 30; // Middle
      }
      
      const x = Math.random() * 90;

      // Check for overlap
      let hasOverlap = false;
      for (const existing of newLogos) {
        const dx = existing.x - x;
        // Adjust Y distance slightly because screens are usually wider than tall
        const dy = (existing.y - y) * 1.5; 
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) {
        const size = Math.floor(Math.random() * 150) + 70; // 70px to 220px
        const opacity = (size / 220) * 0.35; // slightly lower opacity overall
        
        newLogos.push({
          id: newLogos.length,
          x,
          y,
          size,
          rotation: Math.random() * 45,
          opacity,
          delay: Math.random() * 5,
          duration: Math.random() * 4 + 6,
        });
      }
    }
    
    setLogos(newLogos);
  }, []);

  return (
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
  );
}
