"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  endsAt: string;
  gameId: string;
  code: string;
  gameType: "competitive" | "friendly";
  isHost: boolean;
};

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00";
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function GameCountdown({ endsAt, gameId, code, gameType, isHost }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const hasEnded = useRef(false);

  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    async function triggerEnd() {
      if (hasEnded.current) return;
      hasEnded.current = true;
      if (!isHost) return;
      const nextStatus = gameType === "competitive" ? "voting" : "ended";
      await supabase.from("games").update({ status: nextStatus }).eq("id", gameId);
      if (gameType === "competitive") {
        router.push(`/game/${code}/vote`);
      } else {
        router.refresh();
      }
    }

    if (remaining <= 0) {
      triggerEnd();
      return;
    }

    const interval = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(interval);
        triggerEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (remaining <= 0) {
    return (
      <p className="font-display text-xs tracking-[0.2em] text-muted uppercase">
        TIME&apos;S UP
      </p>
    );
  }

  return (
    <p className="font-display text-xs tracking-[0.2em] text-muted uppercase">
      {formatRemaining(remaining)} LEFT
    </p>
  );
}
