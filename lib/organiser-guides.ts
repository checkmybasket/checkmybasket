import { TOPIC_GUIDES } from "@/lib/topic-guides";
import { EDITORIAL_GUIDES } from "@/lib/editorial-guides";
export const ORGANISER_GUIDES = [
  { slug: "secret-santa-rules", title: "Secret Santa rules", description: "Organise a fair Secret Santa with clear rules for budgets, deadlines, wishlists and private draws. Includes a printable PDF organiser checklist." },
  { slug: "secret-santa-invitation-messages", title: "Secret Santa invitation messages", description: "Copy 10 Secret Santa messages for WhatsApp and email: invitations, joining and exchange reminders, wishlist requests and thank-you notes." },
  { slug: "secret-santa-wishlist-ideas", title: "Secret Santa wishlist ideas: what to ask for", description: "Not sure what to ask for? Find Secret Santa wishlist ideas under £10, £20 and £30, examples by interest, and tips to create and share your own list." },
  ...TOPIC_GUIDES.filter(guide => guide.kind === "organiser").map(guide => ({ slug: guide.slug, title: guide.title, description: guide.description })),
  ...EDITORIAL_GUIDES,
] as const;
