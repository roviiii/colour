"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Player = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  photos: (string | null)[];
};

type Props = {
  userId: string;
  gameId: string;
  code: string;
  gameType: "competitive" | "friendly";
  gameEnded: boolean;
  players: Player[];
};

export default function CollageGallery({ userId, gameId, code, gameType, gameEnded, players }: Props) {
  const router = useRouter();
  const [zoomed, setZoomed]   = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const status = (payload.new as { status: string }).status;
          if (status === "voting") router.push(`/game/${code}/vote`);
          if (status === "ended") {
            if (gameType === "competitive") router.push(`/game/${code}/results`);
            else router.refresh();
          }
        }
      )
      .subscribe();

    const collagesChannel = supabase
      .channel(`collages-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collages", filter: `game_id=eq.${gameId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(collagesChannel);
    };
  }, [gameId, code, gameType, router]);

  const zoomedPlayer = players.find((p) => p.id === zoomed);
  const isBlurred = (playerId: string) =>
    gameType === "competitive" && !gameEnded && playerId !== userId;

  async function downloadCollage(photos: (string | null)[], filename: string) {
    const cellSize = 300;
    const gap = 2;
    const total = cellSize * 3 + gap * 2;
    const canvas = document.createElement("canvas");
    canvas.width = total;
    canvas.height = total;
    const ctx = canvas.getContext("2d")!;

    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = col * (cellSize + gap);
      const y = row * (cellSize + gap);
      const photo = photos[i];

      if (photo) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const scale = Math.max(cellSize / img.width, cellSize / img.height);
            const sw = cellSize / scale;
            const sh = cellSize / scale;
            const sx = (img.width - sw) / 2;
            const sy = (img.height - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh, x, y, cellSize, cellSize);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = photo;
        });
      } else {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.92);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {players.map((player) => (
          <div key={player.id}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-edge text-xs text-muted">
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  (player.username ?? "?")[0].toUpperCase()
                )}
              </div>
              <span className="text-sm text-ink">{player.username ?? "unnamed"}</span>
              <div className="ml-auto flex items-center gap-3">
                {!isBlurred(player.id) && player.photos.some(Boolean) && (
                  <button
                    type="button"
                    onClick={() => downloadCollage(player.photos, player.username ?? "collage")}
                    className="text-xs text-muted underline underline-offset-2 hover:text-ink"
                  >
                    save
                  </button>
                )}
                {player.id === userId && !gameEnded && (
                  <Link
                    href={`/game/${code}/play/build`}
                    className="text-xs text-muted underline underline-offset-2 hover:text-ink"
                  >
                    edit
                  </Link>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setZoomed(player.id)}
              className="relative w-full border border-edge hover:border-ink transition-colors"
            >
              <div
                className={`grid grid-cols-3 gap-[2px] ${
                  isBlurred(player.id) ? "blur-sm" : ""
                }`}
              >
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

              {isBlurred(player.id) && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="font-display text-[0.65rem] tracking-[0.2em] text-ink">
                    REVEALED WHEN GAME ENDS
                  </p>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {zoomed && zoomedPlayer && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/60"
          onClick={() => setZoomed(null)}
        >
          <div
            className="relative w-[90vw] max-w-2xl bg-cream p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-[1.4rem] tracking-[0.05em]">
                {zoomedPlayer.username ?? "unnamed"}
              </p>
              <button
                onClick={() => setZoomed(null)}
                className="text-xl text-muted hover:text-ink"
              >
                ×
              </button>
            </div>

            <div
              className={`grid grid-cols-3 gap-1 ${
                isBlurred(zoomedPlayer.id) ? "blur-sm" : ""
              }`}
            >
              {zoomedPlayer.photos.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!photo || isBlurred(zoomedPlayer.id)}
                  onClick={() => photo && setLightbox(photo)}
                  className="aspect-square bg-edge transition-opacity hover:opacity-80 disabled:cursor-default disabled:hover:opacity-100"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            {isBlurred(zoomedPlayer.id) && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="font-display text-[0.65rem] tracking-[0.2em] text-ink">
                  REVEALED WHEN GAME ENDS
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-screen max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
