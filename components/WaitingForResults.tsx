"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = { gameId: string; code: string };

export default function WaitingForResults({ gameId, code }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`vote-wait-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          if ((payload.new as { status: string }).status === "ended") {
            router.push(`/game/${code}/results`);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [gameId, code, router]);

  return (
    <div>
      <p className="font-display text-[2rem] tracking-[0.05em]">VOTE SUBMITTED</p>
      <p className="mt-2 text-sm text-muted">Waiting for others...</p>
    </div>
  );
}
