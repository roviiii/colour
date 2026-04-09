import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="fade-up mb-10 flex items-end justify-between border-b border-edge pb-5">
        <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] tracking-[0.02em]">
          MY GALLERY
        </h1>
        <div className="flex gap-2 pb-1">
          <Link
            href="/game/join"
            className="border border-edge px-5 py-2 text-xs uppercase tracking-[0.1em] transition-colors hover:bg-edge"
          >
            Join game
          </Link>
          <Link
            href="/game/create"
            className="bg-ink text-cream font-display px-5 py-2 tracking-[0.1em] transition-opacity hover:opacity-75"
          >
            NEW GAME
          </Link>
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────── */}
      <div className="delay-100 fade-up flex flex-col items-center py-20 text-center">
        {/* Ghost 3×3 grid — shows the shape of a collage */}
        <div className="mb-8 grid grid-cols-3 gap-[3px] opacity-[0.08]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-14 w-14 bg-ink" />
          ))}
        </div>
        <p className="font-display tracking-[0.1em] text-muted">NO COLLAGES YET</p>
        <p className="mt-1 text-sm text-muted">
          Start a game and submit your first collage to see it here.
        </p>
      </div>
    </div>
  );
}
