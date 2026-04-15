"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

const submitVoteSchema = z.object({
  gameId: z.string().uuid(),
  votedForId: z.string().uuid(),
  code: z.string().length(6),
});

export async function submitVote(gameId: unknown, votedForId: unknown, code: unknown) {
  const parsed = submitVoteSchema.safeParse({ gameId, votedForId, code });
  if (!parsed.success) throw new Error("Invalid input.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: memberCount } = await supabase
    .from("game_players")
    .select("*", { count: "exact", head: true })
    .eq("game_id", parsed.data.gameId)
    .eq("user_id", user.id);

  if (!memberCount) throw new Error("Not a participant in this game.");

  await supabase.from("votes").insert({
    game_id: parsed.data.gameId,
    voter_id: user.id,
    voted_for_id: parsed.data.votedForId,
  });

  const { count: voteCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("game_id", parsed.data.gameId);

  const { count: playerCount } = await supabase
    .from("game_players")
    .select("*", { count: "exact", head: true })
    .eq("game_id", parsed.data.gameId);

  const ended = (voteCount ?? 0) >= (playerCount ?? 0);
  if (ended) {
    await supabase.from("games").update({ status: "ended" }).eq("id", parsed.data.gameId);
  }

  return { ended };
}
