"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import LeaveGameButton from "@/components/LeaveGameButton";

type Profile = { id: string; username: string | null; avatarUrl: string | null };

type Props = {
  gameId: string;
  code: string;
  isHost: boolean;
  hostId: string;
  hasStarted: boolean;
  players: Profile[];
};

export default function LobbyLive({ gameId, code, isHost, hostId, hasStarted, players }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const playersChannel = supabase
      .channel(`lobby-players-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_players", filter: `game_id=eq.${gameId}` },
        () => router.refresh()
      )
      .subscribe();

    const gameChannel = supabase
      .channel(`lobby-game-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const status = (payload.new as { status: string }).status;
          if (status === "playing") router.push(`/game/${code}/play`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(gameChannel);
    };
  }, [gameId, code, router]);

  async function handleStart() {
    const supabase = createClient();
    await supabase.from("games").update({ status: "playing" }).eq("id", gameId);
    router.push(`/game/${code}/play`);
  }

  return (
    <>
      <div className="mb-8">
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">
          Players ({players.length})
        </p>
        <ul className="flex flex-col gap-3">
          {players.map((profile) => (
            <li key={profile.id} className="flex items-center gap-3 text-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-edge text-xs text-muted">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (profile.username ?? "?")[0].toUpperCase()
                )}
              </div>
              <span className="text-ink">{profile.username ?? "unnamed"}</span>
              {profile.id === hostId && (
                <span className="text-xs text-muted">host</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <button
          type="button"
          onClick={handleStart}
          className="block w-full bg-ink py-3.5 text-center font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75"
        >
          {hasStarted ? "CONTINUE PLAYING" : "START PLAYING"}
        </button>
      ) : (
        <div className="w-full border border-edge py-3.5 text-center font-display tracking-[0.18em] text-muted">
          WAITING FOR HOST
        </div>
      )}

      {!isHost && (
        <div className="mt-4 flex justify-center">
          <LeaveGameButton gameId={gameId} />
        </div>
      )}
    </>
  );
}
