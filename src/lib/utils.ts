import { Timestamp } from "firebase/firestore";

const INDIA_TIME_ZONE = "Asia/Kolkata";

export function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: INDIA_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: INDIA_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: INDIA_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`;
}

export function formatMoney(amount: number, currency = "INR"): string {
  if (!amount || amount <= 0) return "Fee shared by clinic";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function indiaDateTimeToDate(date: string, time: string): Date {
  const d = new Date(`${date}T${time}:00+05:30`);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date/time.");
  return d;
}
