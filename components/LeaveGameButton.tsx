"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  gameId: string;
};

export default function LeaveGameButton({ gameId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleLeave() {
    if (!window.confirm("Leave this game?")) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("game_players")
      .delete()
      .eq("game_id", gameId)
      .eq("user_id", user.id);
    router.push("/gallery");
  }

  return (
    <button
      type="button"
      onClick={handleLeave}
      disabled={loading}
      className="text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-danger disabled:opacity-50"
    >
      {loading ? "Leaving..." : "Leave game"}
    </button>
  );
}
