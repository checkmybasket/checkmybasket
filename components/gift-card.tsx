import Image from "next/image";
import { ExternalLink, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface GiftCardProps {
  title: string;
  price: number;
  shop: string;
  tags: string[];
  url: string;
  image: string;
  description: string;
  deliveryNote: string;
  size?: "sm" | "lg";
}

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function GiftCard({ title, price, shop, tags, url, image, description, deliveryNote, size = "sm" }: GiftCardProps) {
  const lg = size === "lg";
  return (
    <article className={`rounded-2xl overflow-hidden flex flex-col transition-shadow duration-200 bg-[var(--cmb-surface)] border border-[var(--cmb-border)] shadow-[var(--shadow-sm)] ${lg ? "hover:shadow-lg" : "hover:shadow-md"}`}>
      <div className={`relative w-full ${lg ? "h-56" : "h-48"} bg-white`}>
        {image ? <Image src={image} alt={title} fill sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 320px" className="object-contain p-4" /> : <div className="h-full flex items-center justify-center text-[var(--cmb-primary)]"><Gift size={56} strokeWidth={1} aria-label="Gift idea"/></div>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {tags.map(tag => <Badge key={tag} variant="outline" className="text-xs rounded-full px-2 border-[var(--cmb-border)] text-[var(--cmb-text-muted)]">{tag}</Badge>)}
        </div>
        <h3 className="font-semibold text-sm mb-2 leading-snug">{title}</h3>
        <p className="text-sm text-[var(--cmb-text-secondary)] leading-relaxed mb-4">{description}</p>
        <div className="mt-auto">
          <p className="text-lg font-bold text-[var(--cmb-primary)]">{currency.format(price / 100)}</p>
          <p className="text-xs text-[var(--cmb-text-muted)] mb-1">{deliveryNote}</p>
          <p className="text-xs text-[var(--cmb-text-muted)] mb-3">{shop}</p>
          <a href={url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`Shop ${title} at ${shop} (opens in a new tab)`} className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold bg-[var(--cmb-accent)] text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cmb-primary)]">
            Shop at {shop} <ExternalLink size={13} strokeWidth={1.5} aria-hidden="true"/>
          </a>
        </div>
      </div>
    </article>
  );
}
