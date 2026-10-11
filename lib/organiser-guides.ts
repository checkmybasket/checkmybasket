import { TOPIC_GUIDES } from "@/lib/topic-guides";
export const ORGANISER_GUIDES = [
  { slug: "secret-santa-rules", title: "Secret Santa rules", description: "Organise a fair Secret Santa with clear rules for budgets, deadlines, wishlists and private draws. Includes a printable PDF organiser checklist." },
  { slug: "secret-santa-invitation-messages", title: "Secret Santa invitation messages", description: "Copy 10 Secret Santa messages for WhatsApp and email: invitations, joining and exchange reminders, wishlist requests and thank-you notes." },
  { slug: "secret-santa-wishlist-ideas", title: "What to put on a Secret Santa wishlist", description: "Build a useful Secret Santa wishlist with examples under £10, £20 and £30, clear preferences, product details and considerate sharing tips." },
  ...TOPIC_GUIDES.filter(guide => guide.kind === "organiser").map(guide => ({ slug: guide.slug, title: guide.title, description: guide.description })),
] as const;
