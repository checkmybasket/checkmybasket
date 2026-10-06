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
  layout = "default",
}: {
  item: PersonalWish;
  children?: React.ReactNode;
  shareToken?: string;
  layout?: "default" | "compact" | "list";
}) {
  const [failed, setFailed] = useState(false);
  let url = "";
  try {
    url = webUrl(item.url);
  } catch {}
  return (
    <article
      className={
        layout === "default"
          ? `${panel} flex flex-col h-full`
          : "rounded-2xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-4 h-full"
      }
    >
      <div
        className={
          layout === "list" ? "flex items-start gap-3" : "flex flex-col h-full"
        }
      >
        <div
          className={`${layout === "list" ? "h-20 w-20 sm:h-24 sm:w-24 shrink-0" : layout === "compact" ? "h-28 mb-3" : "h-40 mb-4"} relative rounded-xl bg-[var(--cmb-bg)] flex items-center justify-center overflow-hidden`}
        >
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
        <div className="min-w-0 flex flex-col flex-1">
          <div className="flex gap-2 flex-wrap text-sm mb-2">
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
          {item.notes &&
            (layout === "default" ? (
              <p className="text-sm text-[var(--cmb-text-secondary)] whitespace-pre-wrap break-words mt-3">
                {item.notes}
              </p>
            ) : (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer min-h-11 flex items-center underline underline-offset-4">
                  Gift details
                </summary>
                <p className="text-[var(--cmb-text-secondary)] whitespace-pre-wrap break-words pb-2">
                  {item.notes}
                </p>
              </details>
            ))}
          <div
            className={
              layout === "default"
                ? "contents"
                : "flex flex-wrap items-center gap-2 mt-3"
            }
          >
            {url && (
              <a
                className={`${layout === "default" ? "mt-4" : ""} inline-flex items-center justify-center min-h-11 rounded-xl bg-[var(--cmb-primary)] text-white px-4 py-2 text-sm`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
              >
                Visit shop
                <span className="sr-only">
                  {" "}
                  for {item.title} (opens a new tab)
                </span>
              </a>
            )}
            <div className={layout === "default" ? "mt-auto pt-4" : "contents"}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
