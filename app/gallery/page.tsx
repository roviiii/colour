import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import DeleteCollageButton from "@/components/DeleteCollageButton";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: collages } = await supabase
    .from("collages")
    .select("id, photos, updated_at, games(id, code, theme_value, theme_type, game_type, status, location_name)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  type Game = { id: string; code: string; theme_value: string; theme_type: string; game_type: string; status: string; location_name: string | null };

  const filled = (collages ?? []).filter((c) => {
    const photos = c.photos as (string | null)[];
    return photos.some((p) => p !== null);
  });

  return (
    <div>
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
            className="bg-ink font-display px-5 py-2 tracking-[0.1em] text-cream transition-opacity hover:opacity-75"
          >
            NEW GAME
          </Link>
        </div>
      </div>

      {filled.length === 0 ? (
        <div className="delay-100 fade-up flex flex-col items-center py-20 text-center">
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
      ) : (
        <div className="fade-up grid grid-cols-2 gap-8">
          {filled.map((collage) => {
            const game = collage.games as unknown as Game | null;
            const rawPhotos = (collage.photos as (string | null)[]) ?? [];
            const photos: (string | null)[] = Array.from(
              { length: 9 },
              (_, i) => rawPhotos[i] ?? null
            );
            const href = game
              ? game.status === "waiting"
                ? `/game/${game.code}`
                : game.status === "ended" && game.game_type === "competitive"
                ? `/game/${game.code}/results`
                : `/game/${game.code}/play`
              : "#";

            const date = new Date(collage.updated_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <div key={collage.id}>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {game?.theme_type ?? ""}
                    </p>
                    <p className="font-display text-[1.4rem] tracking-[0.04em]">
                      {game?.theme_value ?? "untitled"}
                    </p>
                    {game?.location_name && (
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {game.location_name.split(",")[0]}
                      </p>
                    )}
                    <p className="text-xs text-muted">{date}</p>
                  </div>
                  <DeleteCollageButton collageId={collage.id} gameId={game?.id ?? ""} />
                </div>
                <Link href={href} className="block border border-edge transition-colors hover:border-ink">
                  <div className="grid grid-cols-3 gap-[2px]">
                    {photos.map((photo, i) => (
                      <div key={i} className="aspect-square bg-edge">
                        {photo && (
                          <img
                            src={photo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
