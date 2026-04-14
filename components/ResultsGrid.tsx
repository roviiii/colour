"use client";

import { useState } from "react";

type Player = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  photos: (string | null)[];
  votes: number;
  rank: number;
  isWinner: boolean;
};

type Props = {
  players: Player[];
  currentUserId: string;
};

function ordinal(n: number) {
  if (n === 1) return "1ST";
  if (n === 2) return "2ND";
  if (n === 3) return "3RD";
  return `${n}TH`;
}

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

export default function ResultsGrid({ players, currentUserId }: Props) {
  const [zoomed, setZoomed] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const winners = players.filter((p) => p.isWinner);
  const rest = players.filter((p) => !p.isWinner);
  const zoomedPlayer = players.find((p) => p.id === zoomed);

  return (
    <>
      {winners.map((winner) => (
        <div key={winner.id} className="fade-up mb-12 border border-ink p-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">1ST PLACE</p>
              <p className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] tracking-[0.02em]">
                {winner.username ?? "unnamed"}
              </p>
            </div>
            <div className="flex items-end gap-4">
              {winner.photos.some(Boolean) && (
                <button
                  type="button"
                  onClick={() => downloadCollage(winner.photos, winner.username ?? "collage")}
                  className="text-xs text-muted underline underline-offset-2 hover:text-ink"
                >
                  save
                </button>
              )}
              <div className="text-right">
                <p className="font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-[0.9] tracking-[0.02em]">
                  {winner.id === currentUserId ? "YOU WON" : "WINNER"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                  {winner.votes} {winner.votes === 1 ? "vote" : "votes"}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setZoomed(winner.id)}
            className="w-full transition-opacity hover:opacity-90"
          >
            <div className="grid grid-cols-3 gap-[3px]">
              {winner.photos.map((photo, i) => (
                <div key={i} className="aspect-square bg-edge">
                  {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                </div>
              ))}
            </div>
          </button>
        </div>
      ))}

      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-8">
          {rest.map((player, index) => (
            <div
              key={player.id}
              className="fade-up"
              style={{ animationDelay: `${(index + 1) * 80}ms` }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-sm tracking-[0.1em] text-muted">
                  {ordinal(player.rank)}
                </span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-edge text-xs text-muted">
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (player.username ?? "?")[0].toUpperCase()
                  )}
                </div>
                <span className="text-sm text-ink">{player.username ?? "unnamed"}</span>
                <div className="ml-auto flex items-center gap-3">
                  {player.photos.some(Boolean) && (
                    <button
                      type="button"
                      onClick={() => downloadCollage(player.photos, player.username ?? "collage")}
                      className="text-xs text-muted underline underline-offset-2 hover:text-ink"
                    >
                      save
                    </button>
                  )}
                  <span className="font-display text-xs tracking-[0.1em] text-muted">
                    {player.votes} {player.votes === 1 ? "vote" : "votes"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZoomed(player.id)}
                className="w-full border border-edge transition-colors hover:border-ink"
              >
                <div className="grid grid-cols-3 gap-[2px]">
                  {player.photos.map((photo, i) => (
                    <div key={i} className="aspect-square bg-edge">
                      {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                    </div>
                  ))}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

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
              <div className="flex items-center gap-4">
                {zoomedPlayer.photos.some(Boolean) && (
                  <button
                    type="button"
                    onClick={() => downloadCollage(zoomedPlayer.photos, zoomedPlayer.username ?? "collage")}
                    className="text-xs text-muted underline underline-offset-2 hover:text-ink"
                  >
                    save
                  </button>
                )}
                <button onClick={() => setZoomed(null)} className="text-xl text-muted hover:text-ink">
                  ×
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {zoomedPlayer.photos.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!photo}
                  onClick={() => photo && setLightbox(photo)}
                  className="aspect-square bg-edge transition-opacity hover:opacity-80 disabled:cursor-default disabled:hover:opacity-100"
                >
                  {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-screen max-w-full object-contain" />
        </div>
      )}
    </>
  );
}
