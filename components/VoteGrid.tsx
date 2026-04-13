"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitVote } from "@/app/game/[code]/vote/actions";

type Player = {
  id: string;
  username: string | null;
  photos: (string | null)[];
};

type Props = {
  players: Player[];
  gameId: string;
  code: string;
};

export default function VoteGrid({ players, gameId, code }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!selectedId) return;
    setSubmitting(true);
    setError("");

    try {
      const { ended } = await submitVote(gameId, selectedId, code);
      if (ended) {
        router.push(`/game/${code}/results`);
      } else {
        router.push(`/game/${code}/vote`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-8">
        {players.map((player) => {
          const selected = selectedId === player.id;
          return (
            <div key={player.id}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-edge text-xs text-muted">
                  {(player.username ?? "?")[0].toUpperCase()}
                </span>
                <span className="text-sm text-ink">{player.username ?? "unnamed"}</span>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => setSelectedId(player.id)}
                className={`w-full border-2 transition-colors ${
                  selected ? "border-ink" : "border-edge hover:border-muted"
                } ${submitting ? "cursor-not-allowed opacity-50" : ""}`}
              >
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
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedId || submitting}
        className="mt-8 w-full border border-ink py-3 font-display tracking-[0.18em] text-ink transition-opacity hover:opacity-75 disabled:opacity-30"
      >
        {submitting ? "SUBMITTING..." : "SUBMIT VOTE"}
      </button>
    </div>
  );
}
