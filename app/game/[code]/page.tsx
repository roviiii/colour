import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CopyCodeButton from "@/components/CopyCodeButton";
import LeaveGameButton from "@/components/LeaveGameButton";

export default async function GameLobbyPage({
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
    .select("id, theme_type, theme_value, game_type, status, ends_at, host_id, location_name, location_lat, location_lng")
    .eq("code", code.toUpperCase())
    .single();

  if (!game) notFound();

  const { data: players } = await supabase
    .from("game_players")
    .select("user_id")
    .eq("game_id", game.id);

  const playerIds = players?.map((p) => p.user_id) ?? [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", playerIds);

  const { data: collage } = await supabase
    .from("collages")
    .select("photos")
    .eq("game_id", game.id)
    .eq("user_id", user.id)
    .single();

  const hasStarted = (collage?.photos as (string | null)[])?.some((p) => p !== null) ?? false;

  const endsAt = new Date(game.ends_at);

  return (
    <div className="fade-up max-w-md">
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
        {game.game_type} · {game.theme_type}
      </div>
      <h1 className="mb-2 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
        {game.theme_value}
      </h1>
      {game.location_name && (
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">
          {game.location_name.split(",")[0]}
        </p>
      )}
      {game.location_lat && game.location_lng && (
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${game.location_lng - 0.15},${game.location_lat - 0.1},${game.location_lng + 0.15},${game.location_lat + 0.1}&layer=mapnik&marker=${game.location_lat},${game.location_lng}`}
          className="mb-6 w-full border border-edge"
          style={{ height: "140px" }}
          loading="lazy"
        />
      )}
      <p className="mb-10 text-sm text-muted">
        Ends{" "}
        {endsAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        at{" "}
        {endsAt.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <div className="border border-edge p-8">
        <div className="mb-8 flex flex-col items-center gap-3 border-b border-edge pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Game code
          </p>
          <p className="font-display text-[3.5rem] tracking-[0.3em] text-ink">
            {code.toUpperCase()}
          </p>
          <CopyCodeButton code={code.toUpperCase()} />
        </div>

        <div className="mb-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">
            Players ({playerIds.length})
          </p>
          <ul className="flex flex-col gap-3">
            {profiles?.map((profile) => (
              <li key={profile.id} className="flex items-center gap-3 text-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-edge text-xs text-muted">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (profile.username ?? "?")[0].toUpperCase()
                  )}
                </div>
                <span className="text-ink">{profile.username ?? "unnamed"}</span>
                {profile.id === game.host_id && (
                  <span className="text-xs text-muted">host</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`/game/${code.toUpperCase()}/play`}
          className="block w-full bg-ink py-3.5 text-center font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75"
        >
          {hasStarted ? "CONTINUE PLAYING" : "START PLAYING"}
        </Link>

        {user.id !== game.host_id && (
          <div className="mt-4 flex justify-center">
            <LeaveGameButton gameId={game.id} />
          </div>
        )}
      </div>
    </div>
  );
}
