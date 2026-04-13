"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "./actions";

const RANDOM_COLOURS = [
  "Cerulean", "Vermillion", "Ochre", "Viridian", "Cobalt", "Chartreuse",
  "Marigold", "Indigo", "Coral", "Sage", "Crimson", "Sienna", "Lilac",
  "Teal", "Amber", "Ecru", "Scarlet", "Periwinkle", "Rust", "Jade",
];

const RANDOM_WORDS = [
  "Nostalgia", "Solitude", "Wanderlust", "Metamorphosis", "Twilight",
  "Entropy", "Serendipity", "Melancholy", "Euphoria", "Liminal",
  "Reverie", "Desolation", "Bloom", "Fracture", "Ritual", "Echo",
  "Threshold", "Cascade", "Remnant", "Dusk",
];

function randomTheme(type: "colour" | "word") {
  const list = type === "colour" ? RANDOM_COLOURS : RANDOM_WORDS;
  return list[Math.floor(Math.random() * list.length)];
}

function defaultEndsAt() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

const labelClass = "mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted";
const inputClass =
  "w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink";

export default function CreateGamePage() {
  const router = useRouter();

  const [themeType, setThemeType]   = useState<"colour" | "word">("colour");
  const [themeValue, setThemeValue] = useState("");
  const [gameType, setGameType]     = useState<"competitive" | "friendly">("friendly");
  const [endsAt, setEndsAt]         = useState(defaultEndsAt());
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { code } = await createGame({ themeType, themeValue, gameType, endsAt });
      router.push(`/game/${code}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fade-up max-w-md">
      <h1 className="mb-10 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
        CREATE GAME
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Theme type */}
        <div>
          <p className={labelClass}>Theme type</p>
          <div className="flex gap-2">
            {(["colour", "word"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setThemeType(t)}
                className={`flex-1 border py-2.5 font-display tracking-[0.1em] transition-colors ${
                  themeType === t
                    ? "border-ink bg-ink text-cream"
                    : "border-edge text-muted hover:bg-edge hover:text-ink"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Theme value */}
        <div>
          <p className={labelClass}>
            {themeType === "colour" ? "Colour" : "Word / theme"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={themeValue}
              onChange={(e) => setThemeValue(e.target.value)}
              placeholder={themeType === "colour" ? '"Ocean Blue"' : '"Nostalgia"'}
              required
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => setThemeValue(randomTheme(themeType))}
              className="border border-edge px-4 text-xs uppercase tracking-[0.08em] text-ink transition-colors hover:bg-edge"
            >
              Random
            </button>
          </div>
        </div>

        {/* Game type */}
        <div>
          <p className={labelClass}>Game type</p>
          <div className="flex gap-2">
            {(["friendly", "competitive"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setGameType(t)}
                className={`flex-1 border py-2.5 font-display tracking-[0.1em] transition-colors ${
                  gameType === t
                    ? "border-ink bg-ink text-cream"
                    : "border-edge text-muted hover:bg-edge hover:text-ink"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {gameType === "competitive"
              ? "Players vote on each other's collages after submitting."
              : "No voting — just create and share your collage."}
          </p>
        </div>

        {/* End date/time */}
        <div>
          <p className={labelClass}>Game ends</p>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-muted">
            Players can submit collages up until this date and time.
          </p>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-ink py-3.5 font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "CREATING..." : "CREATE GAME"}
        </button>
      </form>
    </div>
  );
}
