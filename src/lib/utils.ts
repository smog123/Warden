import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateHash(hash: string, start = 8, end = 6): string {
  if (!hash) return "";
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

export function formatYoctoNear(yocto: string): string {
  try {
    const val = BigInt(yocto);
    const near = Number(val) / 1e24;
    return near.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + " Ⓝ";
  } catch {
    return yocto;
  }
}
