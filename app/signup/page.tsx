"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        setError("An account with this email already exists. Try logging in instead.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", data.user.id);
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="fade-up flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-[0.02em]">
          CHECK YOUR EMAIL
        </h1>
        <p className="mt-5 max-w-sm text-sm text-muted">
          We sent a confirmation link to{" "}
          <strong className="text-ink">{email}</strong>. Click it to activate
          your account.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-h-[70vh] grid-cols-1 items-center gap-16 md:grid-cols-2">

      {/* ── Left — wordmark ─────────────────────────────────── */}
      <div className="fade-up hidden border-r border-edge pr-8 md:block">
        <h2 className="colour-gradient font-display text-[clamp(4rem,10vw,9rem)] leading-[0.88] tracking-[0.01em]">
          COLOUR
        </h2>
        <p className="mt-5 text-sm tracking-[0.05em] text-muted">
          Pick a theme. Build a collage.<br />Compete or just share.
        </p>
      </div>

      {/* ── Right — form ────────────────────────────────────── */}
      <div className="delay-100 fade-up">
        <h1 className="mb-8 font-display text-[2.8rem] tracking-[0.04em]">
          CREATE ACCOUNT
        </h1>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          {[
            { label: "Username", type: "text",     value: username, set: setUsername, min: 3,  max: 30, placeholder: "e.g. photochamp" },
            { label: "Email",    type: "email",    value: email,    set: setEmail },
            { label: "Password", type: "password", value: password, set: setPassword, min: 6 },
          ].map(({ label, type, value, set, min, max, placeholder }) => (
            <div key={label}>
              <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                required
                minLength={min}
                maxLength={max}
                placeholder={placeholder}
                className="w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
              />
            </div>
          ))}

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-ink py-3 font-display tracking-[0.18em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>

          <p className="text-xs text-muted">
            By creating an account you agree to our{" "}
            <Link href="/tos" className="text-ink underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-2">
              Privacy Policy
            </Link>.
          </p>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-edge" />
          <span className="text-xs text-muted">OR</span>
          <div className="h-px flex-1 bg-edge" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full border border-edge py-3 font-display tracking-[0.18em] text-ink transition-colors hover:border-ink"
        >
          CONTINUE WITH GOOGLE
        </button>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
