"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function deleteCollage(collageId: string, gameId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("collages")
    .delete()
    .eq("id", collageId)
    .eq("user_id", user.id);

  const paths = Array.from({ length: 9 }, (_, i) => `${gameId}/${user.id}/${i}`);
  await supabase.storage.from("collages").remove(paths);
}
