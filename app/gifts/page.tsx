import Link from "next/link";
import { Gift, ChevronRight, ExternalLink, Star, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Secret Santa Gift Ideas UK", description: "Curated Secret Santa gift ideas from UK shops. Under £5, £10, £15, £20, £25. No ads." };

const CATEGORIES = [
  { slug:"under-5",   label:"Under £5",       desc:"Stocking fillers and tiny treats" },
  { slug:"under-10",  label:"Under £10",      desc:"Great value crowd-pleasers" },
  { slug:"under-15",  label:"Under £15",      desc:"The sweet spot for Secret Santa" },
  { slug:"under-20",  label:"Under £20",      desc:"A bit more to play with" },
  { slug:"under-25",  label:"Under £25",      desc:"Generous and thoughtful picks" },
  { slug:"colleague", label:"For colleagues", desc:"Safe, tasteful, universally liked" },
  { slug:"funny",     label:"Funny gifts",    desc:"Actually funny, not just novelty" },
  { slug:"cosy",      label:"Cosy gifts",     desc:"Warm, snuggly, universally loved" },
];

const FEATURED = [
  { title:"Personalised Star Map Print",       price:1499, shop:"Etsy",                  tags:["Thoughtful","Unique"],    url:"#" },
  { title:"Luxury Caramel Hot Chocolate Kit",  price: 999, shop:"Hotel Chocolat",        tags:["Cosy","Edible"],          url:"#" },
  { title:"Leather Cable Organiser",           price:1299, shop:"Amazon",                tags:["Practical","Desk"],       url:"#" },
  { title:"Herb Growing Kit",                  price:1499, shop:"Waitrose",              tags:["Eco","Fun"],              url:"#" },
  { title:"Mini Crossword Puzzle Book",        price: 599, shop:"Waterstones",           tags:["Funny","Books"],          url:"#" },
  { title:"Personalised Enamel Mug",           price:1199, shop:"Not on the High Street",tags:["Thoughtful"],            url:"#" },
];

export default function GiftsPage() {
  return (
    <div className="min-h-dvh" style={{ background:"var(--gc-bg)" }}>
      <header className="sticky top-0 z-30 border-b" style={{ borderColor:"var(--gc-border)", background:"rgba(255,248,240,0.92)", backdropFilter:"blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" style={{ color:"var(--gc-primary)" }}>
            <Gift strokeWidth={1.5} size={20}/><span className="font-semibold" style={{ fontFamily:"var(--font-fraunces)" }}>CheckMyBasket</span>
          </Link>
          <Link href="/create"><Button size="sm" className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background:"var(--gc-primary)", color:"var(--gc-text-inverse)" }}>Create a draw</Button></Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily:"var(--font-fraunces)" }}>Gift ideas for every budget</h1>
          <p style={{ color:"var(--gc-text-secondary)" }}>Curated picks from UK shops. No ads — some links earn us a small commission.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/gifts/${cat.slug}`} className="rounded-2xl p-4 border transition-all duration-150 hover:scale-105 group"
              style={{ background:"var(--gc-surface)", borderColor:"var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:"rgba(27,67,50,0.08)" }}>
                <Gift size={20} strokeWidth={1.5} style={{ color:"var(--gc-primary)" }}/>
              </div>
              <p className="font-semibold text-sm mb-0.5">{cat.label}</p>
              <p className="text-xs leading-relaxed" style={{ color:"var(--gc-text-muted)" }}>{cat.desc}</p>
              <ChevronRight size={14} strokeWidth={2} className="mt-2 transition-transform duration-150 group-hover:translate-x-0.5" style={{ color:"var(--gc-primary)" }}/>
            </Link>
          ))}
        </div>
        <div className="mb-4 flex items-center gap-2">
          <Star size={18} strokeWidth={1.5} style={{ color:"var(--gc-warm)" }}/>
          <h2 className="text-xl font-bold" style={{ fontFamily:"var(--font-fraunces)" }}>Editor picks</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {FEATURED.map(item => <GiftCard key={item.title} {...item}/>)}
        </div>
        <div className="rounded-xl p-4 flex gap-2" style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)" }}>
          <ShieldOff size={16} strokeWidth={1.5} style={{ color:"var(--gc-text-muted)", flexShrink:0, marginTop:2 }}/>
          <p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>
            Some gift links may earn us a small commission at no extra cost to you. This is how we keep CheckMyBasket free and ad-free.
          </p>
        </div>
      </main>
    </div>
  );
}

function GiftCard({ title, price, shop, tags, url }: { title:string; price:number; shop:string; tags:string[]; url:string }) {
  return (
    <div className="rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{ background:"var(--gc-surface)", border:"1px solid var(--gc-border)", boxShadow:"var(--shadow-sm)" }}>
      <div className="w-full h-36 flex items-center justify-center" style={{ background:"var(--gc-surface-hover)" }}>
        <Gift size={36} strokeWidth={1} style={{ color:"var(--gc-border)" }}/>
      </div>
      <div className="p-4">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {tags.map(tag => <Badge key={tag} variant="outline" className="text-xs rounded-full px-2" style={{ borderColor:"var(--gc-border)", color:"var(--gc-text-muted)" }}>{tag}</Badge>)}
        </div>
        <p className="font-semibold text-sm mb-1 leading-snug">{title}</p>
        <div className="flex items-center justify-between mt-2">
          <div><p className="font-bold" style={{ color:"var(--gc-primary)" }}>£{(price/100).toFixed(0)}</p><p className="text-xs" style={{ color:"var(--gc-text-muted)" }}>{shop}</p></div>
          <a href={url} target="_blank" rel="noopener sponsored">
            <Button size="sm" className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background:"var(--gc-accent)", color:"#fff" }}>
              View <ExternalLink size={12} strokeWidth={1.5} className="ml-1"/>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
