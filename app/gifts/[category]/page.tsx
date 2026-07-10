import type { Metadata } from "next";
import Link from "next/link";
import { Gift, ChevronLeft, ExternalLink, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

const CATEGORIES: Record<string,{ label:string; desc:string; budget:number }> = {
  "under-5":   { label:"Gifts under £5",        desc:"Small but mighty stocking fillers from UK shops.",    budget: 500 },
  "under-10":  { label:"Gifts under £10",       desc:"Thoughtful picks that don't break the bank.",         budget:1000 },
  "under-15":  { label:"Gifts under £15",       desc:"The sweet spot for most Secret Santa budgets.",       budget:1500 },
  "under-20":  { label:"Gifts under £20",       desc:"A bit more to play with — quality guaranteed.",      budget:2000 },
  "under-25":  { label:"Gifts under £25",       desc:"Generous and genuinely thoughtful gift ideas.",       budget:2500 },
  "colleague": { label:"Gifts for colleagues",  desc:"Safe, tasteful, and universally appreciated.",        budget:1500 },
  "funny":     { label:"Funny Secret Santa gifts", desc:"Actually funny. Not just another novelty mug.",   budget:1500 },
  "cosy":      { label:"Cosy gifts",            desc:"Warm, snuggly, and universally adored.",              budget:2000 },
};

const PRODUCTS: Record<string,Array<{ title:string; price:number; shop:string; tags:string[]; url:string }>> = {
  "under-15": [
    { title:"Luxury Caramel Hot Chocolate Kit",  price: 999, shop:"Hotel Chocolat",        tags:["Cosy","Edible"],        url:"#" },
    { title:"Mini Enamel Notebook Set",          price:1099, shop:"Paperchase",            tags:["Stationery","Pretty"],  url:"#" },
    { title:"Grow Your Own Herbs Kit",           price:1299, shop:"Waitrose",              tags:["Eco","Fun"],            url:"#" },
    { title:"Personalised Bookmark",             price: 799, shop:"Not on the High Street",tags:["Thoughtful"],           url:"#" },
    { title:"Bath Salts Collection",             price:1199, shop:"Lush",                  tags:["Cosy","Relaxing"],      url:"#" },
    { title:"Mini Crossword Puzzle Book",        price: 599, shop:"Waterstones",           tags:["Books","Funny"],        url:"#" },
  ],
  "colleague": [
    { title:"Artisan Coffee Blend",              price:1299, shop:"Fortnum & Mason",       tags:["Coffee","Premium"],     url:"#" },
    { title:"Leather Cable Organiser",           price:1299, shop:"Amazon",                tags:["Practical","Desk"],     url:"#" },
    { title:"Mini Desk Plant (Succulent)",       price: 999, shop:"Waitrose",              tags:["Eco","Desk"],           url:"#" },
    { title:"Fancy Biscuit Selection Tin",       price:1499, shop:"M&S",                   tags:["Edible","Classic"],     url:"#" },
    { title:"Wireless Charging Pad",             price:1999, shop:"John Lewis",            tags:["Tech","Practical"],     url:"#" },
    { title:"Branded Keep Cup",                  price:1599, shop:"Ecoffee",               tags:["Eco","Practical"],      url:"#" },
  ],
  "funny": [
    { title:"Disappearing Coffee Mug — Meetings",price: 999, shop:"Amazon",               tags:["Office","Funny"],       url:"#" },
    { title:"Terrible Jokes Book Vol. 3",        price: 699, shop:"Waterstones",           tags:["Books","Groan-worthy"], url:"#" },
    { title:"Avocado Socks (3 pairs)",           price: 799, shop:"M&S",                   tags:["Clothing","Silly"],     url:"#" },
    { title:"Office Bingo Card Set",             price: 599, shop:"Not on the High Street",tags:["Games","Office"],      url:"#" },
    { title:"World's Okayest Mug",               price: 899, shop:"Redbubble",             tags:["Mug","Relatable"],      url:"#" },
    { title:"Desk Stress Ball Set",              price:1099, shop:"Amazon",                tags:["Office","Stress"],      url:"#" },
  ],
  "cosy": [
    { title:"Merino Wool Bed Socks",             price:1499, shop:"John Lewis",            tags:["Clothing","Warm"],      url:"#" },
    { title:"Hot Chocolate & Marshmallow Set",   price:1299, shop:"Hotel Chocolat",        tags:["Edible","Warming"],     url:"#" },
    { title:"Lavender Eye Pillow",               price: 999, shop:"Neal's Yard",           tags:["Relaxing","Self-care"], url:"#" },
    { title:"Cashmere-Blend Hand Cream Duo",     price:1999, shop:"The White Company",     tags:["Luxury","Self-care"],   url:"#" },
    { title:"Mini Aromatherapy Candle Set",      price:1799, shop:"Diptyque",              tags:["Home","Relaxing"],      url:"#" },
    { title:"Fluffy Sherpa Blanket",             price:2499, shop:"Dunelm",               tags:["Home","Cosy"],          url:"#" },
  ],
};

function getProducts(slug: string) {
  return PRODUCTS[slug] ?? PRODUCTS["under-15"].map(p => ({ ...p, price: Math.min(p.price, CATEGORIES[slug]?.budget??1500) }));
}

export async function generateMetadata({ params }: { params: Promise<{ category:string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category];
  if (!cat) return {};
  return { title:`${cat.label} UK`, description:`${cat.desc} Hand-picked from UK shops. No ads — curated by CheckMyBasket.` };
}

export default async function CategoryPage({ params }: { params: Promise<{ category:string }> }) {
  const { category } = await params;
  const cat = CATEGORIES[category];
  if (!cat) notFound();
  const products = getProducts(category);

  return (
    <div className="min-h-dvh" style={{ background:"var(--cmb-bg)" }}>
      <header className="sticky top-0 z-30 border-b" style={{ borderColor:"var(--cmb-border)", background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/gifts"><Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg"><ChevronLeft size={20} strokeWidth={1.5}/></Button></Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Gift size={18} strokeWidth={1.5} style={{ color:"var(--cmb-primary)", flexShrink:0 }}/>
            <span className="font-semibold truncate" style={{ fontFamily:"var(--font-fraunces)", color:"var(--cmb-primary)" }}>{cat.label}</span>
          </div>
          <Link href="/create"><Button size="sm" className="h-9 px-3 rounded-lg text-xs font-semibold flex-shrink-0" style={{ background:"var(--cmb-primary)", color:"var(--cmb-text-inverse)" }}>Create draw</Button></Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily:"var(--font-fraunces)" }}>{cat.label}</h1>
          <p style={{ color:"var(--cmb-text-secondary)" }}>{cat.desc}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {Object.entries(CATEGORIES).filter(([s])=>s!==category).map(([slug,c]) => (
            <Link key={slug} href={`/gifts/${slug}`}
              className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-150"
              style={{ background:"var(--cmb-surface)", borderColor:"var(--cmb-border)", color:"var(--cmb-text-secondary)" }}>{c.label}</Link>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {products.map(item => <GiftCard key={item.title} {...item}/>)}
        </div>
        <div className="rounded-2xl p-8 text-center mb-8" style={{ background:"var(--cmb-primary)", boxShadow:"var(--shadow-lg)" }}>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily:"var(--font-fraunces)", color:"var(--cmb-text-inverse)" }}>Found the perfect gift?</h2>
          <p className="mb-6" style={{ color:"rgba(255,248,240,0.75)" }}>Set up Secret Santa for your group in 30 seconds — free, no account needed.</p>
          <Link href="/create"><Button size="lg" className="h-12 px-8 rounded-xl font-semibold" style={{ background:"var(--cmb-accent)", color:"#fff" }}>Create a free draw</Button></Link>
        </div>
        <div className="rounded-xl p-4 flex gap-2" style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)" }}>
          <ShieldOff size={16} strokeWidth={1.5} style={{ color:"var(--cmb-text-muted)", flexShrink:0, marginTop:2 }}/>
          <p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>Some gift links may earn us a small commission at no extra cost to you. This is how we keep CheckMyBasket free and ad-free.</p>
        </div>
      </main>
    </div>
  );
}

function GiftCard({ title, price, shop, tags, url }: { title:string; price:number; shop:string; tags:string[]; url:string }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-lg"
      style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
      <div className="w-full h-40 flex items-center justify-center" style={{ background:"var(--cmb-surface-hover)" }}>
        <Gift size={40} strokeWidth={1} style={{ color:"var(--cmb-border)" }}/>
      </div>
      <div className="p-4">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {tags.map(tag => <Badge key={tag} variant="outline" className="text-xs rounded-full px-2" style={{ borderColor:"var(--cmb-border)", color:"var(--cmb-text-muted)" }}>{tag}</Badge>)}
        </div>
        <p className="font-semibold text-sm mb-1 leading-snug">{title}</p>
        <div className="flex items-center justify-between mt-3">
          <div><p className="text-lg font-bold" style={{ color:"var(--cmb-primary)" }}>£{(price/100).toFixed(0)}</p><p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>{shop}</p></div>
          <a href={url} target="_blank" rel="noopener sponsored">
            <Button className="h-10 px-4 rounded-xl text-sm font-semibold" style={{ background:"var(--cmb-accent)", color:"#fff" }}>
              Buy now <ExternalLink size={13} strokeWidth={1.5} className="ml-1.5"/>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
