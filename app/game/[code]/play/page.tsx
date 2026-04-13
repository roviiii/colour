import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import CollageGallery from "@/components/CollageGallery";
import EndGameButton from "@/components/EndGameButton";

export default async function PlayPage({
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
    .select("id, theme_type, theme_value, game_type, status, host_id")
    .eq("code", code.toUpperCase())
    .single();

  if (!game) notFound();
  if (game.status === "voting") redirect(`/game/${code.toUpperCase()}/vote`);
  if (game.status === "ended" && game.game_type === "competitive") redirect(`/game/${code.toUpperCase()}/results`);

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

  await supabase.from("collages").upsert(
    { game_id: game.id, user_id: user.id, photos: [] },
    { onConflict: "game_id,user_id", ignoreDuplicates: true }
  );

  const players = [...playerIds].sort((a, b) => (a === user.id ? -1 : b === user.id ? 1 : 0)).map((id) => {
    const profile = profiles?.find((p) => p.id === id);
    const collage = collages?.find((c) => c.user_id === id);
    const rawPhotos = (collage?.photos as (string | null)[]) ?? [];
    const photos: (string | null)[] = Array.from(
      { length: 9 },
      (_, i) => rawPhotos[i] ?? null
    );
    return { id, username: profile?.username ?? null, avatarUrl: profile?.avatar_url ?? null, photos };
  });

  return (
    <div className="w-full">
      <div className="fade-up mb-10 flex items-end justify-between">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
            {game.game_type} · {game.theme_type}
          </div>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
            {game.theme_value}
          </h1>
        </div>
        {user.id === game.host_id && (game.status === "waiting" || game.status === "playing") && (
          <EndGameButton
            gameId={game.id}
            code={code.toUpperCase()}
            gameType={game.game_type}
          />
        )}
        {game.status === "ended" && (
          <p className="font-display text-sm tracking-[0.2em] text-muted">GAME OVER</p>
        )}
      </div>
      <CollageGallery
        userId={user.id}
        code={code.toUpperCase()}
        gameType={game.game_type}
        gameEnded={game.status === "ended"}
        players={players}
      />
    </div>
  );

}
