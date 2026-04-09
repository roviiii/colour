"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGamePage() {
  const router = useRouter();
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("Game codes are 6 characters long.");
      return;
    }

    setLoading(true);
    // TODO: validate against Supabase, then redirect to lobby
    router.push(`/game/${code.toUpperCase()}`);
  }

  return (
    <div className="fade-up flex min-h-[60vh] max-w-xs flex-col justify-center">
      <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
        JOIN GAME
      </h1>
      <p className="mb-8 mt-2 text-sm text-muted">
        Enter the 6-character code your friend shared.
      </p>

      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          className="border border-edge bg-transparent px-4 py-4 text-center font-display text-[2.5rem] tracking-[0.3em] text-ink outline-none transition-colors focus:border-ink"
        />

        {error && (
          <p className="text-center text-sm text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink py-3.5 font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "JOINING..." : "JOIN GAME"}
        </button>
      </form>
    </div>
  );
}
