"use client";

import { useEffect, useRef, useCallback } from "react";
import { type MapMode } from "@/app/play/page";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons issue in Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { usePixelCanvas } from "@/hooks/usePixelCanvas";
import { useAccount } from "wagmi";
import { encodeCoord } from "@/lib/utils";

interface MapCanvasProps {
  selectedColor: string;
  mapMode?: MapMode;
}

const STEP = 0.0001; // 10000 multiplier precision

// Input Snapping
function snapCoordinate(coord: number) {
  return Math.round(coord / STEP) * STEP;
}

function MapEventsAndCanvas({ selectedColor, mapMode = "dark" }: MapCanvasProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { placePixel, isWriting, pixels, isLoadingPixels, fetchAllPixels } = usePixelCanvas();
  const { address } = useAccount();

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    ctx.clearRect(0, 0, size.x, size.y);

    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const isLight = mapMode === "light";

    // Draw GRID if zoom >= 16 (Rev 2)
    if (zoom >= 16) {
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const startLat = Math.floor(bounds.getSouth() / STEP) * STEP;
      const endLat = Math.ceil(bounds.getNorth() / STEP) * STEP;
      const startLng = Math.floor(bounds.getWest() / STEP) * STEP;
      const endLng = Math.ceil(bounds.getEast() / STEP) * STEP;

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
        // Bounding box of the snapped pixel
        const nw = map.latLngToContainerPoint([p.lat + STEP/2, p.lng - STEP/2]);
        const se = map.latLngToContainerPoint([p.lat - STEP/2, p.lng + STEP/2]);
        
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(nw.x), Math.floor(nw.y), Math.ceil(se.x - nw.x), Math.ceil(se.y - nw.y));
      }
    });
  }, [map, pixels, mapMode]);

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
    </>
  );
}

export default function MapCanvas({ selectedColor, mapMode = "dark" }: MapCanvasProps) {
  // Tile URLs (Rev 3)
  const tiles = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  };

  return (
    <div className={`w-full h-screen relative ${mapMode === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#0a0a0a]'}`}>
      <MapContainer 
        center={[0, 0]} 
        zoom={3} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0 font-sans"
        zoomControl={false}
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap & CARTO / Esri'
          url={tiles[mapMode]}
          subdomains="abcd"
          maxZoom={19}
        />
        <MapEventsAndCanvas selectedColor={selectedColor} mapMode={mapMode} />
      </MapContainer>
    </div>
  );
}
