import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility helpers
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string | undefined): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function addressToColor(address: string): string {
  if (!address) return "#000000";
  return `#${address.slice(2, 8)}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  
  if (seconds < 60) return "just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export function encodeCoord(value: number): bigint {
  return BigInt(Math.round(value * 10000));
}

export function decodeCoord(value: bigint): number {
  return Number(value) / 10000;
}

export function hexToUint24(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function uint24ToHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
