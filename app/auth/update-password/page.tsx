"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/gallery");
    router.refresh();
  }

  return (
    <div className="grid min-h-[70vh] grid-cols-1 items-center gap-16 md:grid-cols-2">
      <div className="fade-up hidden border-r border-edge pr-8 md:block">
        <h2 className="colour-gradient font-display text-[clamp(4rem,10vw,9rem)] leading-[0.88] tracking-[0.01em]">
          COLOUR
        </h2>
        <p className="mt-5 text-sm tracking-[0.05em] text-muted">
          Pick a theme. Build a collage.<br />Compete or just share.
        </p>
      </div>

      <div className="delay-100 fade-up">
        <h1 className="mb-8 font-display text-[2.8rem] tracking-[0.04em]">NEW PASSWORD</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </div>

          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-ink py-3 font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "SAVING..." : "SET PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}
