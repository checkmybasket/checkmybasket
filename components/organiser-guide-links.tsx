import Link from "next/link";
import { ORGANISER_GUIDES } from "@/lib/organiser-guides";

export function OrganiserGuideLinks({ current }: { current?: string }) {
  return <nav aria-label="Secret Santa planning guides" className="flex flex-wrap gap-x-5 gap-y-2">
    {ORGANISER_GUIDES.filter(guide => guide.slug !== current).map(guide => <Link key={guide.slug} href={`/${guide.slug}`} className="inline-flex min-h-11 items-center underline">{guide.title}</Link>)}
  </nav>;
}
