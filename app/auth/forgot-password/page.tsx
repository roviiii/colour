"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="grid min-h-[70vh] grid-cols-2 items-center gap-16">
      <div className="fade-up border-r border-edge pr-8">
        <h2 className="colour-gradient font-display text-[clamp(4rem,10vw,9rem)] leading-[0.88] tracking-[0.01em]">
          COLOUR
        </h2>
        <p className="mt-5 text-sm tracking-[0.05em] text-muted">
          Pick a theme. Build a collage.<br />Compete or just share.
        </p>
      </div>

      <div className="delay-100 fade-up">
        <h1 className="mb-8 font-display text-[2.8rem] tracking-[0.04em]">RESET PASSWORD</h1>

        {sent ? (
          <div>
            <p className="text-sm text-muted">
              Check your inbox — we've sent a reset link to <span className="text-ink">{email}</span>.
            </p>
            <p className="mt-6 text-sm text-muted">
              <Link href="/login" className="text-ink underline underline-offset-4">
                Back to log in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-ink py-3 font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "SENDING..." : "SEND RESET LINK"}
            </button>

            <p className="text-sm text-muted">
              <Link href="/login" className="text-ink underline underline-offset-4">
                Back to log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
