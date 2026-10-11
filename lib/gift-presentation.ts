import { GIFT_INTERESTS, giftInterestLabel } from "@/lib/gift-selection";

const checkedDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric",
});

export function giftPriceCheckDate(value?: string) {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? { dateTime: new Date(timestamp).toISOString(), label: checkedDate.format(timestamp) } : undefined;
}

export function giftInterestLabels(interests: string[] = [], tags: string[] = []) {
  return [...new Set([...interests, ...tags].map(value => value.toLowerCase()))]
    .filter(value => GIFT_INTERESTS.includes(value)).slice(0, 3).map(giftInterestLabel);
}

export function giftDescriptionParts(description: string) {
  // Keep the editorial wording intact; only split after a complete sentence.
  const boundary = description.search(/(?<=[.!?])\s+(?=[A-Z])/);
  if (description.length <= 240 || boundary < 0) return { introduction: description, details: "" };
  return { introduction: description.slice(0, boundary), details: description.slice(boundary).trim() };
}
