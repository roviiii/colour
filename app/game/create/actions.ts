"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

const createGameSchema = z.object({
  themeType: z.enum(["colour", "word"]),
  themeValue: z.string().trim().min(1).max(100),
  gameType: z.enum(["competitive", "friendly"]),
  endsAt: z.string().transform((val) => {
    const normalized = val.length === 16 ? val + ":00" : val;
    return new Date(normalized).toISOString();
  }),
  location: z.object({
    name: z.string().min(1).max(200),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).nullable().optional(),
});

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createGame(payload: unknown) {
  const parsed = createGameSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Invalid input.");
  const data = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const code = generateCode();

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      code,
      host_id: user.id,
      theme_type: data.themeType,
      theme_value: data.themeValue,
      game_type: data.gameType,
      status: "waiting",
      ends_at: data.endsAt,
      location_name: data.location?.name ?? null,
      location_lat: data.location?.lat ?? null,
      location_lng: data.location?.lng ?? null,
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
