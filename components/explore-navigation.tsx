import Link from "next/link";

const destinations = [
  { href: "/gifts", label: "Gift ideas" },
  { href: "/guides", label: "Guides" },
  { href: "/wishlists", label: "Create a wishlist" },
];

export function ExploreNavigation({ current }: { current?: string }) {
  return (
    <nav aria-label="Explore CheckMyBasket" className="flex flex-wrap gap-x-5 text-sm">
      {destinations.map(({ href, label }) => (
        <Link key={href} href={href} prefetch={href === "/wishlists" ? false : undefined} aria-current={current === href ? "page" : undefined}
          className="inline-flex min-h-11 items-center underline underline-offset-4 text-[var(--cmb-primary)]">
          {label}
        </Link>
      ))}
    </nav>
  );
}
