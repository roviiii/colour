"use client";

// Client component — handles saving an updated username to the profiles table.
// Runs in the browser, uses the browser Supabase client.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function EditUsernameForm({ currentUsername }: { currentUsername: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState(currentUsername);
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() })
      .eq("id", user.id);

    if (error) {
      setError(error.code === "23505" ? "That username is already taken." : "Failed to save. Please try again.");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    router.refresh(); // re-runs the server component so the displayed name updates
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={30}
          className="w-full border border-edge bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Saved.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink py-3 font-display tracking-[0.15em] text-cream transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "SAVING..." : "SAVE USERNAME"}
      </button>
    </form>
  );
}
