export function PageLoading({ layout = "document" }: { layout?: "document" | "gifts" | "group" }) {
  return <div role="status" aria-label="Loading page" className="min-h-dvh bg-[var(--cmb-bg)]">
    <span className="sr-only">Loading page. Please wait.</span>
    <div aria-hidden="true">
      <div className="h-14 border-b border-[var(--cmb-border)] flex items-center px-4"><div className="h-5 w-40 skeleton" /></div>
      <div className={`${layout === "gifts" ? "max-w-5xl" : "max-w-2xl"} mx-auto px-4 py-10 space-y-6`}>
        <div className="h-10 w-3/4 skeleton" />
        <div className="h-5 w-full skeleton" />
        {layout === "gifts" ? <>
          <div className="h-64 sm:h-48 skeleton" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[0, 1, 2, 3, 4, 5].map(key => <div key={key} className="border border-[var(--cmb-border)] p-4 space-y-4"><div className="h-48 skeleton" /><div className="h-5 skeleton" /><div className="h-11 skeleton" /></div>)}</div>
        </> : <><div className={`${layout === "group" ? "h-36" : "h-24"} skeleton`} /><div className="h-64 skeleton" /></>}
      </div>
    </div>
  </div>;
}
