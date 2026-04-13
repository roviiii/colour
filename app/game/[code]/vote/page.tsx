import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import VoteGrid from "@/components/VoteGrid";

export default async function VotePage({
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
  if (game.status !== "voting" || game.game_type !== "competitive") {
    redirect(`/game/${code.toUpperCase()}/play`);
  }

  const { data: gamePlayers } = await supabase
    .from("game_players")
    .select("user_id")
    .eq("game_id", game.id);

  const playerIds = gamePlayers?.map((p) => p.user_id) ?? [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", playerIds);

  const { data: collages } = await supabase
    .from("collages")
    .select("user_id, photos")
    .eq("game_id", game.id);

  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("game_id", game.id)
    .eq("voter_id", user.id)
    .single();

  const otherPlayers = playerIds
    .filter((id) => id !== user.id)
    .map((id) => {
      const profile = profiles?.find((p) => p.id === id);
      const collage = collages?.find((c) => c.user_id === id);
      const rawPhotos = (collage?.photos as (string | null)[]) ?? [];
      const photos: (string | null)[] = Array.from(
        { length: 9 },
        (_, i) => rawPhotos[i] ?? null
      );
      return { id, username: profile?.username ?? null, photos };
    });

  return (
    <div className="w-full">
      <div className="fade-up mb-10">
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
          {game.theme_type} · vote
        </div>
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
          {game.theme_value}
        </h1>
      </div>

      {existingVote ? (
        <div className="fade-up">
          <p className="font-display text-[2rem] tracking-[0.05em]">VOTE SUBMITTED</p>
          <p className="mt-2 text-sm text-muted">Waiting for others...</p>
          <Link
            href={`/game/${code.toUpperCase()}/vote`}
            className="mt-6 inline-block text-sm text-muted underline underline-offset-2 hover:text-ink"
          >
            Check for results →
          </Link>
        </div>
      ) : (
        <div className="fade-up">
          <p className="mb-8 text-sm text-muted">Pick your favourite collage.</p>
          <VoteGrid
            players={otherPlayers}
            gameId={game.id}
            code={code.toUpperCase()}
          />
        </div>
      )}
    </div>
  );
}
