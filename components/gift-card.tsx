import { Gift, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface GiftCardProps {
  title: string;
  price: number;
  shop: string;
  tags: string[];
  url: string;
  /** "sm" = compact catalogue card ("View"); "lg" = category detail card ("Buy now"). */
  size?: "sm" | "lg";
}

export function GiftCard({ title, price, shop, tags, url, size = "sm" }: GiftCardProps) {
  const lg = size === "lg";
  return (
    <div className={`rounded-2xl overflow-hidden transition-shadow duration-200 ${lg ? "hover:shadow-lg" : "hover:shadow-md"}`}
      style={{ background:"var(--cmb-surface)", border:"1px solid var(--cmb-border)", boxShadow:"var(--shadow-sm)" }}>
      <div className={`w-full ${lg ? "h-40" : "h-36"} flex items-center justify-center`} style={{ background:"var(--cmb-surface-hover)" }}>
        <Gift size={lg ? 40 : 36} strokeWidth={1} style={{ color:"var(--cmb-border)" }}/>
      </div>
      <div className="p-4">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {tags.map(tag => <Badge key={tag} variant="outline" className="text-xs rounded-full px-2" style={{ borderColor:"var(--cmb-border)", color:"var(--cmb-text-muted)" }}>{tag}</Badge>)}
        </div>
        <p className="font-semibold text-sm mb-1 leading-snug">{title}</p>
        <div className={`flex items-center justify-between ${lg ? "mt-3" : "mt-2"}`}>
          <div>
            <p className={`${lg ? "text-lg " : ""}font-bold`} style={{ color:"var(--cmb-primary)" }}>£{(price/100).toFixed(0)}</p>
            <p className="text-xs" style={{ color:"var(--cmb-text-muted)" }}>{shop}</p>
          </div>
          <a href={url} target="_blank" rel="noopener sponsored">
            {lg ? (
              <Button className="h-10 px-4 rounded-xl text-sm font-semibold" style={{ background:"var(--cmb-accent)", color:"#fff" }}>
                Buy now <ExternalLink size={13} strokeWidth={1.5} className="ml-1.5"/>
              </Button>
            ) : (
              <Button size="sm" className="h-9 px-3 rounded-xl text-xs font-semibold" style={{ background:"var(--cmb-accent)", color:"#fff" }}>
                View <ExternalLink size={12} strokeWidth={1.5} className="ml-1"/>
              </Button>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
