import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** URL production Vercel — dipakai fallback QR jika admin buka dari link preview */
export const PRODUCTION_APP_URL = "https://si-tamu-rri-kdi.vercel.app";

/** Zona waktu LPP RRI Kendari (WITA / UTC+8) */
export const APP_TIMEZONE = "Asia/Makassar";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getZonedParts(date: Date, timeZone = APP_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Awal hari dalam zona WITA sebagai Date UTC */
export function startOfDayInAppTimezone(date: Date): Date {
  const { year, month, day } = getZonedParts(date);
  return new Date(Date.UTC(year, month - 1, day, -8, 0, 0, 0));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: APP_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

export function isVercelPreviewUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname.includes("-projects.vercel.app") ||
      /-[a-z0-9]{8,}-/.test(hostname)
    );
  } catch {
    return false;
  }
}

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (!isVercelPreviewUrl(origin)) {
      return origin;
    }
    return PRODUCTION_APP_URL;
  }

  return PRODUCTION_APP_URL;
}
