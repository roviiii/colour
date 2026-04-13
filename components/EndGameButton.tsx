"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  gameId: string;
  code: string;
  gameType: "competitive" | "friendly";
};

export default function EndGameButton({ gameId, code, gameType }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleEndGame() {
    setLoading(true);
    const nextStatus = gameType === "competitive" ? "voting" : "ended";
    await supabase.from("games").update({ status: nextStatus }).eq("id", gameId);
    if (gameType === "competitive") {
      router.push(`/game/${code}/vote`);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleEndGame}
      disabled={loading}
      className="border border-danger px-5 py-2 font-display tracking-[0.18em] text-danger transition-opacity hover:opacity-75 disabled:opacity-50"
    >
      {loading ? "ENDING..." : "END GAME"}
    </button>
  );
}
