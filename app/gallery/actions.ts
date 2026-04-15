"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

const deleteCollageSchema = z.object({
  collageId: z.string().uuid(),
  gameId: z.string().uuid(),
});

export async function deleteCollage(collageId: unknown, gameId: unknown) {
  const parsed = deleteCollageSchema.safeParse({ collageId, gameId });
  if (!parsed.success) throw new Error("Invalid input.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("collages")
    .delete()
    .eq("id", parsed.data.collageId)
    .eq("user_id", user.id);

  const paths = Array.from({ length: 9 }, (_, i) => `${parsed.data.gameId}/${user.id}/${i}`);
  await supabase.storage.from("collages").remove(paths);
}
