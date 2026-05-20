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
    // Generate between 10 and 20 logos
    const count = Math.floor(Math.random() * 11) + 10;
    const newLogos: LogoConfig[] = [];

    for (let i = 0; i < count; i++) {
      const size = Math.floor(Math.random() * 170) + 80; // 80px to 250px
      // Opacity based on size: smaller = more transparent
      const opacity = (size / 250) * 0.4; 
      
      newLogos.push({
        id: i,
        // Using up to 90% to avoid extreme edge clipping while allowing wide coverage
        x: Math.random() * 95, 
        y: Math.random() * 95, 
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
