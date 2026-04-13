import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: game } = await supabase
    .from("games")
    .select("id, theme_type, theme_value, game_type, status")
    .eq("code", code.toUpperCase())
    .single();

  if (!game) notFound();
  if (game.status !== "ended" || game.game_type !== "competitive") {
    redirect(`/game/${code.toUpperCase()}/play`);
  }

  const { data: gamePlayers } = await supabase
    .from("game_players")
    .select("user_id")
    .eq("game_id", game.id);

  const playerIds = gamePlayers?.map((p) => p.user_id) ?? [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", playerIds);

  const { data: collages } = await supabase
    .from("collages")
    .select("user_id, photos")
    .eq("game_id", game.id);

  const { data: votes } = await supabase
    .from("votes")
    .select("voted_for_id")
    .eq("game_id", game.id);

  const voteCounts: Record<string, number> = {};
  for (const id of playerIds) voteCounts[id] = 0;
  for (const vote of votes ?? []) {
    voteCounts[vote.voted_for_id] = (voteCounts[vote.voted_for_id] ?? 0) + 1;
  }

  const players = playerIds
    .map((id) => {
      const profile = profiles?.find((p) => p.id === id);
      const collage = collages?.find((c) => c.user_id === id);
      const rawPhotos = (collage?.photos as (string | null)[]) ?? [];
      const photos: (string | null)[] = Array.from(
        { length: 9 },
        (_, i) => rawPhotos[i] ?? null
      );
      return { id, username: profile?.username ?? null, avatarUrl: profile?.avatar_url ?? null, photos, votes: voteCounts[id] ?? 0 };
    })
    .sort((a, b) => b.votes - a.votes);

  const topVotes = players[0]?.votes ?? 0;

  return (
    <div className="w-full">
      <div className="fade-up mb-10">
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
          {game.theme_type} · results
        </div>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
          {game.theme_value}
        </h1>
      </div>

      <div className="fade-up grid grid-cols-2 gap-8">
        {players.map((player, index) => {
          const isWinner = player.votes === topVotes && topVotes > 0;
          return (
            <div key={player.id}>
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-lg tracking-[0.05em] text-muted">
                  {index + 1}
                </span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-edge text-xs text-muted">
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (player.username ?? "?")[0].toUpperCase()
                  )}
                </div>
                <span className="text-sm text-ink">{player.username ?? "unnamed"}</span>
                <span className="ml-auto font-display text-sm tracking-[0.1em] text-muted">
                  {player.votes} {player.votes === 1 ? "vote" : "votes"}
                </span>
              </div>

              <div className={`border-2 ${isWinner ? "border-ink" : "border-edge"}`}>
                <div className="grid grid-cols-3 gap-[2px]">
                  {player.photos.map((photo, i) => (
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
              </div>

              {isWinner && (
                <p className="mt-2 font-display text-xs tracking-[0.2em] text-ink">
                  WINNER
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
