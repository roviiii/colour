"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ChangePasswordForm() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

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

    setSaved(true);
    setPassword("");
    setConfirm("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      {saved && <p className="text-sm text-success">Password updated.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink py-3 font-display tracking-[0.15em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "SAVING..." : "CHANGE PASSWORD"}
      </button>
    </form>
  );
}
