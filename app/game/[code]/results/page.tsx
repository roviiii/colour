import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import ResultsGrid from "@/components/ResultsGrid";

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
    .select("id, theme_type, theme_value, game_type, status, location_name")
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
  const rankedPlayers = players.map((p, index) => ({
    ...p,
    rank: index + 1,
    isWinner: p.votes === topVotes && topVotes > 0,
  }));

  return (
    <div className="w-full">
      <div className="fade-up mb-10 flex items-end justify-between">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
            {game.theme_type} · results
          </div>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
            {game.theme_value}
          </h1>
          {game.location_name && (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
              {game.location_name.split(",")[0]}
            </p>
          )}
        </div>
        <ShareButton />
      </div>

      {topVotes === 0 && (
        <p className="text-sm text-muted">No votes were cast.</p>
      )}

      <ResultsGrid players={rankedPlayers} currentUserId={user.id} />
    </div>
  );
}
