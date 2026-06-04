import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBudget(pence: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pence / 100);
}

export function generateInviteCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** Derangement — nobody draws themselves, exclusions respected */
export function drawNames(
  memberIds: string[],
  exclusions: Array<{ user_a_id: string; user_b_id: string; bidirectional: boolean }>
): Map<string, string> | null {
  const MAX_ATTEMPTS = 1000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const shuffled = [...memberIds].sort(() => Math.random() - 0.5);
    const result = new Map<string, string>();
    let valid = true;
    for (let i = 0; i < memberIds.length; i++) {
      const giver = memberIds[i];
      const recipient = shuffled[i];
      if (giver === recipient) { valid = false; break; }
      const excluded = exclusions.some(
        (e) =>
          (e.user_a_id === giver && e.user_b_id === recipient) ||
          (e.bidirectional && e.user_a_id === recipient && e.user_b_id === giver)
      );
      if (excluded) { valid = false; break; }
      result.set(giver, recipient);
    }
    if (valid) return result;
  }
  return null;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
