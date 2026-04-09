import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[90vh] flex-col">

      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="fade-up flex flex-1 flex-col items-center justify-center pb-8 text-center">

        <h1 className="colour-gradient font-display text-[clamp(5.5rem,23vw,19rem)] leading-[0.88] tracking-[0.01em]">
          COLOUR
        </h1>

        <p className="delay-100 fade-up mt-6 text-[0.7rem] uppercase tracking-[0.3em] text-muted">
          Pick a theme &nbsp;·&nbsp; Build a collage &nbsp;·&nbsp; Compete or share
        </p>

        <div className="delay-200 fade-up mt-10 flex gap-3">
          <Link
            href="/signup"
            className="bg-ink text-cream font-display px-10 py-3 tracking-[0.15em] transition-opacity hover:opacity-75"
          >
            GET STARTED
          </Link>
          <Link
            href="/login"
            className="border border-edge text-ink font-display px-10 py-3 tracking-[0.15em] transition-colors hover:bg-edge"
          >
            LOG IN
          </Link>
        </div>
      </div>

      {/* ── Feature strip ──────────────────────────────────── */}
      <div className="delay-300 fade-up grid grid-cols-3 border-t border-edge pb-4 pt-8">
        {[
          { label: "PICK A THEME",     sub: "colour or word" },
          { label: "BUILD A COLLAGE",  sub: "9 photos, your way" },
          { label: "COMPETE OR SHARE", sub: "vote or just save" },
        ].map((item, i) => (
          <div
            key={i}
            className={`px-6 text-center ${i < 2 ? "border-r border-edge" : ""}`}
          >
            <p className="font-display tracking-[0.08em]">{item.label}</p>
            <p className="mt-1 text-sm text-muted">{item.sub}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
