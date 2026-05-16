"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { type MapMode } from "@/app/play/page";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
// @ts-expect-error - Fix for leaflet.css typescript declaration issue
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons issue in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { usePixelCanvas, PixelData } from "@/hooks/usePixelCanvas";
import { useAccount } from "wagmi";
import { encodeCoord, truncateAddress } from "@/lib/utils";

interface MapCanvasProps {
  selectedColor: string;
  mapMode?: MapMode;
  flyToCoord?: { lat: number; lng: number } | null;
}

const STEP = 0.08; // Ukuran diperbesar (dari 0.02 ke 0.05)

// Input Snapping
function snapCoordinate(coord: number) {
  return Math.round(coord / STEP) * STEP;
}

function MapEventsAndCanvas({ selectedColor, mapMode = "dark", flyToCoord }: MapCanvasProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { placePixel, isWriting, pixels, isLoadingPixels, fetchAllPixels } = usePixelCanvas();
  const { address } = useAccount();

  const [hoveredPixel, setHoveredPixel] = useState<{ lat: number, lng: number, x: number, y: number, pixel?: PixelData } | null>(null);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    ctx.clearRect(0, 0, size.x, size.y);

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const isLight = mapMode === "light";

    // Draw grid if zoom >= 10 (higher threshold avoids lag when unzoomed)
    if (zoom >= 8) {
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const startLat = Math.floor(bounds.getSouth() / STEP) * STEP - STEP/2;
      const endLat = Math.ceil(bounds.getNorth() / STEP) * STEP + STEP/2;
      const startLng = Math.floor(bounds.getWest() / STEP) * STEP - STEP/2;
      const endLng = Math.ceil(bounds.getEast() / STEP) * STEP + STEP/2;

      for (let lat = startLat; lat <= endLat; lat += STEP) {
        const p1 = map.latLngToContainerPoint([lat, startLng]);
        const p2 = map.latLngToContainerPoint([lat, endLng]);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      for (let lng = startLng; lng <= endLng; lng += STEP) {
        const p1 = map.latLngToContainerPoint([startLat, lng]);
        const p2 = map.latLngToContainerPoint([endLat, lng]);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();
    }

    // Draw all known pixels
    pixels.forEach((p) => {
      if (bounds.contains([p.lat, p.lng])) {
        const nw = map.latLngToContainerPoint([p.lat + STEP/2, p.lng - STEP/2]);
        const se = map.latLngToContainerPoint([p.lat - STEP/2, p.lng + STEP/2]);
        
        const width = Math.max(1, Math.ceil(se.x - nw.x));
        const height = Math.max(1, Math.ceil(se.y - nw.y));

        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(nw.x), Math.floor(nw.y), width, height);
      }
    });

    // Draw hovered tile fill
    if (hoveredPixel) {
      const nw = map.latLngToContainerPoint([hoveredPixel.lat + STEP/2, hoveredPixel.lng - STEP/2]);
      const se = map.latLngToContainerPoint([hoveredPixel.lat - STEP/2, hoveredPixel.lng + STEP/2]);
      const width = Math.max(1, Math.ceil(se.x - nw.x));
      const height = Math.max(1, Math.ceil(se.y - nw.y));

      ctx.fillStyle = isLight ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(Math.floor(nw.x), Math.floor(nw.y), width, height);
    }

  }, [map, pixels, mapMode, hoveredPixel]);

  useEffect(() => {
    map.on("move", redrawCanvas);
    map.on("zoom", redrawCanvas);
    map.on("resize", redrawCanvas);
    return () => {
      map.off("move", redrawCanvas);
      map.off("zoom", redrawCanvas);
      map.off("resize", redrawCanvas);
    };
  }, [map, redrawCanvas]);

  useMapEvents({
    click(e) {
      if (!address || isWriting) return;
      const snappedLat = snapCoordinate(e.latlng.lat);
      const snappedLng = snapCoordinate(e.latlng.lng);

      handleDraw(snappedLat, snappedLng);
    },
    mousemove(e) {
      const snappedLat = snapCoordinate(e.latlng.lat);
      const snappedLng = snapCoordinate(e.latlng.lng);

      // Gunakan Math.abs untuk mengompensasi presisi floating point JS
      const epsilon = 0.00001;
      const found = pixels.find(p => 
        Math.abs(p.lat - snappedLat) < epsilon && 
        Math.abs(p.lng - snappedLng) < epsilon
      );
      
      setHoveredPixel({ 
        lat: snappedLat,
        lng: snappedLng,
        x: e.containerPoint.x, 
        y: e.containerPoint.y, 
        pixel: found 
      });
    },
    mouseout(e) {
      setHoveredPixel(null);
    }
  });

  const handleDraw = async (lat: number, lng: number) => {
    try {
      const encLat = encodeCoord(lat);
      const encLng = encodeCoord(lng);
      await placePixel(encLat, encLng, selectedColor);
      await fetchAllPixels();
      redrawCanvas();
    } catch (err) {
      console.error("Failed to place pixel:", err);
    }
  };

  useEffect(() => {
    fetchAllPixels();
  }, [fetchAllPixels]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    if (flyToCoord) {
      map.flyTo([flyToCoord.lat, flyToCoord.lng], 14, { animate: true, duration: 1.5 });
    }
  }, [flyToCoord, map]);

  const isLight = mapMode === "light";

  return (
    <>
      {isLoadingPixels && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-black/80 text-celo-yellow px-4 py-2 rounded-full font-mono text-sm shadow-[0_0_10px_rgba(255,255,0,0.2)] border border-celo-yellow/20 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-celo-yellow border-t-transparent rounded-full animate-spin"></div>
          Restoring Canvas...
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-[400]"
      />
      {hoveredPixel?.pixel && (
        <div 
          className={`absolute z-[1000] pointer-events-none px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md transform -translate-x-1/2 -translate-y-[120%] text-sm font-semibold whitespace-nowrap ${isLight ? 'bg-white border-black/10 text-black' : 'bg-black/90 border border-white/20 text-white'}`}
          style={{ left: hoveredPixel.x, top: hoveredPixel.y }}
        >
          Placed by: <span className="text-celo-yellow ml-1">{localStorage.getItem(`celoplace_name_${hoveredPixel.pixel.painter.toLowerCase()}`) || truncateAddress(hoveredPixel.pixel.painter)}</span>
          <div className={`absolute bottom-[-10px] left-1/2 -translate-x-1/2 border-[5px] border-transparent ${isLight ? 'border-t-white' : 'border-t-black/90'}`}></div>
        </div>
      )}
    </>
  );
}

export default function MapCanvas({ selectedColor, mapMode = "dark", flyToCoord }: MapCanvasProps) {
  // Tile URLs
  const tiles = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  };

  return (
    <div className={`w-full h-screen relative ${mapMode === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#0a0a0a]'}`}>
      <MapContainer 
        center={[0, 0]} 
        zoom={4} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0 font-sans"
        zoomControl={false}
        worldCopyJump={false}
        maxZoom={26}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap & CARTO / Esri'
          url={tiles[mapMode]}
          subdomains="abcd"
          maxNativeZoom={19}
          maxZoom={26}
          noWrap={true}
          bounds={[[-90, -180], [90, 180]]}
        />
        <MapEventsAndCanvas selectedColor={selectedColor} mapMode={mapMode} flyToCoord={flyToCoord} />
      </MapContainer>
    </div>
  );
}
