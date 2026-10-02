export type GiftCategory = {
  slug: string;
  label: string;
  heading: string;
  desc: string;
  budget?: number;
};

export const GIFT_CATEGORIES: GiftCategory[] = [
  { slug: "under-10", label: "Under £10", heading: "Gifts under £10", desc: "Great value crowd-pleasers", budget: 1000 },
  { slug: "under-20", label: "Under £20", heading: "Gifts under £20", desc: "Thoughtful gifts for a little more", budget: 2000 },
  { slug: "under-30", label: "Under £30", heading: "Gifts under £30", desc: "Something a little extra special", budget: 3000 },
  { slug: "under-50", label: "Under £50", heading: "Gifts under £50", desc: "Generous gifts for special people", budget: 5000 },
  { slug: "colleague", label: "For colleagues", heading: "Gifts for colleagues", desc: "Thoughtful picks for your workmates" },
  { slug: "funny", label: "Funny gifts", heading: "Funny Secret Santa gifts", desc: "Playful picks to make them smile" },
  { slug: "cosy", label: "Cosy gifts", heading: "Cosy gifts", desc: "Warm treats for nights in" },
  { slug: "personalised", label: "Personalised gifts", heading: "Personalised gifts", desc: "Add their name or a special touch" },
];
