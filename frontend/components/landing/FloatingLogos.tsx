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
    // Generate between 15 and 25 logos
    const count = Math.floor(Math.random() * 11) + 15;
    const newLogos: LogoConfig[] = [];

    for (let i = 0; i < count; i++) {
      const size = Math.floor(Math.random() * 170) + 80; 
      const opacity = (size / 250) * 0.4; 
      
      // Determine Y position distribution
      // 40% chance for top (0-30%)
      // 40% chance for bottom (70-95%)
      // 20% chance for middle (30-70%)
      const roll = Math.random();
      let y;
      if (roll < 0.4) {
        y = Math.random() * 30; // Top
      } else if (roll < 0.8) {
        y = Math.random() * 25 + 70; // Bottom (70 to 95)
      } else {
        y = Math.random() * 40 + 30; // Middle (30 to 70)
      }

      newLogos.push({
        id: i,
        x: Math.random() * 90, 
        y, 
        size,
        rotation: Math.random() * 45,
        opacity,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 6,
      });
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
