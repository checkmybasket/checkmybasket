"use client";
import Image from "next/image";
import { useState } from "react";
import { Gift } from "lucide-react";
import { money, priorities, type PersonalWish } from "@/lib/wishlists/types";
import { webUrl } from "@/lib/wishlists/urls";
import { panel } from "./shell";
export function ItemCard({
  item,
  children,
  shareToken,
}: {
  item: PersonalWish;
  children?: React.ReactNode;
  shareToken?: string;
}) {
  const [failed, setFailed] = useState(false);
  let url = "";
  try {
    url = webUrl(item.url);
  } catch {}
  return (
    <article className={`${panel} flex flex-col h-full`}>
      <div className="h-40 relative rounded-xl bg-[var(--cmb-bg)] mb-4 flex items-center justify-center overflow-hidden">
        {item.image_url && !failed ? (
          <Image
            alt=""
            fill
            unoptimized
            referrerPolicy="no-referrer"
            className="object-contain"
            src={`/api/wishlists/image?item=${item.id}${shareToken ? `&token=${shareToken}` : ""}`}
            onError={() => setFailed(true)}
          />
        ) : (
          <Gift
            size={40}
            className="text-[var(--cmb-primary)] opacity-40"
            aria-hidden
          />
        )}
      </div>
      <div className="flex gap-2 flex-wrap text-xs mb-2">
        <span className="rounded-full bg-[var(--cmb-bg)] px-3 py-1">
          {priorities[item.priority]}
        </span>
        {item.reserved && (
          <span className="rounded-full bg-[var(--cmb-bg)] px-3 py-1">
            {item.bought
              ? "Bought"
              : item.mine
                ? "Reserved by you"
                : "Reserved"}
          </span>
        )}
      </div>
      <h2 className="text-lg font-semibold break-words">{item.title}</h2>
      <p className="mt-1 text-sm">{money(item.price, item.currency)}</p>
      {item.shop_name && (
        <p className="text-sm text-[var(--cmb-text-secondary)] break-words mt-1">
          {item.shop_name}
        </p>
      )}
      {item.notes && (
        <p className="text-sm text-[var(--cmb-text-secondary)] whitespace-pre-wrap break-words mt-3">
          {item.notes}
        </p>
      )}
      {url && (
        <a
          className="inline-flex items-center justify-center min-h-11 mt-4 rounded-xl bg-[var(--cmb-primary)] text-white px-4 py-2 text-sm"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
        >
          Visit shop
          <span className="sr-only"> for {item.title} (opens a new tab)</span>
        </a>
      )}
      <div className="mt-auto pt-4">{children}</div>
    </article>
  );
}
