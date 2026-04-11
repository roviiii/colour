"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createGame(payload: {
  themeType: "colour" | "word";
  themeValue: string;
  gameType: "competitive" | "friendly";
  endsAt: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const code = generateCode();

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      code,
      host_id: user.id,
      theme_type: payload.themeType,
      theme_value: payload.themeValue.trim(),
      game_type: payload.gameType,
      status: "waiting",
      ends_at: new Date(payload.endsAt).toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error("Failed to create game. Please try again.");

  await supabase.from("game_players").insert({
    game_id: game.id,
    user_id: user.id,
  });

  return { code };
}
