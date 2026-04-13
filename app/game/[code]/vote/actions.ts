"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function submitVote(gameId: string, votedForId: string, code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("votes").insert({
    game_id: gameId,
    voter_id: user.id,
    voted_for_id: votedForId,
  });

  const { count: voteCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId);

  const { count: playerCount } = await supabase
    .from("game_players")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId);

  const ended = (voteCount ?? 0) >= (playerCount ?? 0);
  if (ended) {
    await supabase.from("games").update({ status: "ended" }).eq("id", gameId);
  }

  return { ended };
}
