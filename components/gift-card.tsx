import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { giftDescriptionParts, giftInterestLabels, giftPriceCheckDate } from "@/lib/gift-presentation";

export interface GiftCardProps {
  id?: string;
  title: string;
  price: number;
  shop: string;
  tags: string[];
  url: string;
  image: string;
  description: string;
  deliveryNote: string;
  interests?: string[];
  priceCheckedAt?: string;
  size?: "sm" | "lg";
}

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export function GiftCard({ id, title, price, shop, tags, url, image, description, deliveryNote, interests, priceCheckedAt, size = "sm" }: GiftCardProps) {
  const lg = size === "lg";
  const labels = giftInterestLabels(interests, tags);
  const checked = giftPriceCheckDate(priceCheckedAt);
  const copy = giftDescriptionParts(description);
  return (
    <article className={`rounded-[var(--cmb-radius)] overflow-hidden flex flex-col transition-shadow duration-200 bg-[var(--cmb-surface)] border border-[var(--cmb-border)] shadow-[var(--shadow-sm)] ${lg ? "hover:shadow-lg" : "hover:shadow-md"}`}>
      <div className={`relative w-full ${lg ? "h-56" : "h-48"} bg-white`}>
        {image ? <Image src={image} alt={title} fill sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 320px" className="object-contain p-4" /> : <div className="h-full flex items-center justify-center text-[var(--cmb-primary)]"><Gift size={56} strokeWidth={1} aria-label="Gift idea"/></div>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        {labels.length ? <div aria-label="Gift interests" className="flex gap-1.5 mb-2 flex-wrap">
          {labels.map(label => <Badge key={label} variant="outline" className="text-xs rounded-full px-2 border-[var(--cmb-border)] text-[var(--cmb-text-muted)]">{label}</Badge>)}
        </div> : null}
        <h3 className="font-semibold text-sm mb-2 leading-snug">{title}</h3>
        <p className="text-sm text-[var(--cmb-text-secondary)] leading-relaxed mb-2">{copy.introduction}</p>
        {copy.details ? <details className="mb-3 text-sm text-[var(--cmb-text-secondary)]">
          <summary className="min-h-11 cursor-pointer py-3 font-medium underline underline-offset-4">More gift details<span className="sr-only"> about {title}</span></summary>
          <p className="leading-relaxed pb-2">{copy.details}</p>
        </details> : null}
        <div className="mt-auto">
          <p className="text-lg font-bold text-[var(--cmb-primary)]">{currency.format(price / 100)}</p>
          <p className="text-xs text-[var(--cmb-text-muted)] mb-1">{checked ? <>Price checked <time dateTime={checked.dateTime}>{checked.label}</time>. Confirm current price at the retailer.</> : "Confirm current price at the retailer."}</p>
          <p className="text-xs text-[var(--cmb-text-muted)] mb-1">{deliveryNote}</p>
          <p className="text-xs text-[var(--cmb-text-muted)] mb-3">{shop}</p>
          <a data-gift-retailer={shop} href={url} target="_blank" rel="noopener noreferrer sponsored" aria-label={`Shop at ${shop}: ${title} (opens in a new tab)`} className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2 rounded-[var(--cmb-radius)] text-sm font-semibold bg-[var(--cmb-accent)] text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cmb-primary)]">
            Shop at {shop} <ExternalLink size={13} strokeWidth={1.5} aria-hidden="true"/>
          </a>
          {id ? <Link prefetch={false} data-gift-save href={`/wishlists?gift=${encodeURIComponent(id)}`} aria-label={`Save to wishlist: ${title}`} className="flex min-h-11 items-center justify-center rounded-[var(--cmb-radius)] border border-[var(--cmb-border)] px-4 py-2 mt-2 text-sm font-semibold text-[var(--cmb-primary)] focus-visible:outline-2 focus-visible:outline-offset-2">Save to wishlist</Link> : null}
        </div>
      </div>
    </article>
  );
}
