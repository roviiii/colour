import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CopyCodeButton from "@/components/CopyCodeButton";

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
    .select("id, theme_type, theme_value, game_type, status, ends_at, host_id")
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
    .select("id, username")
    .in("id", playerIds);

  const endsAt = new Date(game.ends_at);

  return (
    <div className="fade-up max-w-md">
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
        {game.game_type} · {game.theme_type}
      </div>
      <h1 className="mb-2 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
        {game.theme_value}
      </h1>
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
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-edge text-xs text-muted">
                  {(profile.username ?? "?")[0].toUpperCase()}
                </span>
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
          START PLAYING
        </Link>
      </div>
    </div>
  );
}
