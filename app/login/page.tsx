"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/gallery");
    router.refresh();
  }

  return (
    <div className="grid min-h-[70vh] grid-cols-2 items-center gap-16">

      {/* ── Left — wordmark ─────────────────────────────────── */}
      <div className="fade-up border-r border-edge pr-8">
        <h2 className="colour-gradient font-display text-[clamp(4rem,10vw,9rem)] leading-[0.88] tracking-[0.01em]">
          COLOUR
        </h2>
        <p className="mt-5 text-sm tracking-[0.05em] text-muted">
          Pick a theme. Build a collage.<br />Compete or just share.
        </p>
      </div>

      {/* ── Right — form ────────────────────────────────────── */}
      <div className="delay-100 fade-up">
        <h1 className="mb-8 font-display text-[2.8rem] tracking-[0.04em]">LOG IN</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </div>

          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-ink py-3 font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-edge" />
          <span className="text-xs text-muted">OR</span>
          <div className="h-px flex-1 bg-edge" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full border border-edge py-3 font-display tracking-[0.18em] text-ink transition-colors hover:border-ink"
        >
          CONTINUE WITH GOOGLE
        </button>

        <p className="mt-6 text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="text-ink underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
