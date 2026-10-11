import Image from "next/image";

export function GuideIntro({ answer, contents }: {
  answer: string;
  contents: { id: string; label: string }[];
}) {
  return <>
    <aside aria-label="Quick answer" className="rounded-xl border border-[var(--cmb-border)] bg-[var(--cmb-surface)] p-5">
      <p className="font-semibold mb-2">Quick answer</p>
      <p className="text-sm leading-relaxed">{answer}</p>
    </aside>
    <nav aria-label="On this page" className="rounded-xl border border-[var(--cmb-border)] p-5">
      <p className="font-semibold mb-2">On this page</p>
      <ul className="grid gap-x-4 sm:grid-cols-2">
        {contents.map(item => <li key={item.id}><a href={`#${item.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{item.label}</a></li>)}
      </ul>
    </nav>
  </>;
}

export function GuideScreenshot({ src, alt, caption, width, height }: {
  src: string; alt: string; caption: string; width: number; height: number;
}) {
  return <figure className="space-y-3">
    <a href={src} target="_blank" rel="noopener" className="block rounded-xl border border-[var(--cmb-border)] overflow-hidden" aria-label={`${alt}. Open full-size screenshot in a new tab`}>
      <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 672px) 100vw, 640px" className="h-auto w-full" />
    </a>
    <figcaption className="text-sm leading-relaxed text-[var(--cmb-text-secondary)]">{caption} Select the image to view it full size.</figcaption>
  </figure>;
}
