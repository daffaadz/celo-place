"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
}

// Inner component to handle map events and canvas overlay
function MapEventsAndCanvas({ selectedColor }: { selectedColor: string }) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { placePixel, isWriting, pixels, isLoadingPixels, fetchAllPixels } = usePixelCanvas();
  const { address } = useAccount();

  // Redraw canvas whenever map moves or pixels change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to map container
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    ctx.clearRect(0, 0, size.x, size.y);

    // Draw all known pixels
    pixels.forEach((p) => {
      const point = map.latLngToContainerPoint([p.lat, p.lng]);
      const bounds = map.getBounds();
      // Only draw if within bounds
      if (bounds.contains([p.lat, p.lng])) {
        // Size scales with zoom
        const pixelSize = Math.max(2, map.getZoom() - 1); 
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(point.x - pixelSize/2), Math.floor(point.y - pixelSize/2), pixelSize, pixelSize);
        // Optional border for glow effect
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.strokeRect(Math.floor(point.x - pixelSize/2), Math.floor(point.y - pixelSize/2), pixelSize, pixelSize);
      }
    });
  }, [map, pixels]);

  // Hook into map panning and zooming
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

  // Handle map click
  useMapEvents({
    click(e) {
      if (!address || isWriting) return;
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // We will place the pixel on chain
      handleDraw(lat, lng);
    },
  });

  const handleDraw = async (lat: number, lng: number) => {
    try {
      const encLat = encodeCoord(lat);
      const encLng = encodeCoord(lng);
      
      await placePixel(encLat, encLng, selectedColor);
      
      // Optimistic UI update
      // setPixels((prev) => [...prev, { lat, lng, color: selectedColor, painter: address as string }]);
      // We will refetch instead to ensure consistency
      await fetchAllPixels();
      redrawCanvas();
    } catch (err) {
      console.error("Failed to place pixel:", err);
    }
  };

  // Initial draw and fetch
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

export default function MapCanvas({ selectedColor }: MapCanvasProps) {
  return (
    <div className="w-full h-screen bg-[#0a0a0a] relative">
      <MapContainer 
        center={[0, 0]} 
        zoom={3} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0 font-sans"
        zoomControl={false}
        worldCopyJump={true}
      >
        {/* Dark map tiles matching CeloPlace vibe */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        
        <MapEventsAndCanvas selectedColor={selectedColor} />
      </MapContainer>
    </div>
  );
}
