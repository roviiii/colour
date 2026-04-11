import { createClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import CollageBuilder from "@/components/CollageBuilder";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: game } = await supabase
    .from("games")
    .select("id, theme_type, theme_value, status")
    .eq("code", code.toUpperCase())
    .single();

  if (!game) notFound();
  if (game.status === "ended") redirect(`/game/${code.toUpperCase()}`);

  await supabase.from("collages").upsert(
    { game_id: game.id, user_id: user.id, photos: [] },
    { onConflict: "game_id,user_id", ignoreDuplicates: true }
  );

  const { data: collage } = await supabase
    .from("collages")
    .select("photos")
    .eq("game_id", game.id)
    .eq("user_id", user.id)
    .single();

  const photos: (string | null)[] = Array.from({ length: 9 }, (_, i) =>
    (collage?.photos as (string | null)[])?.[i] ?? null
  );

  return (
    <div className="fade-up max-w-sm">
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
        {game.theme_type}
      </div>
      <h1 className="mb-8 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] tracking-[0.02em]">
        {game.theme_value}
      </h1>
      <CollageBuilder
        gameId={game.id}
        userId={user.id}
        code={code.toUpperCase()}
        initialPhotos={photos}
      />
    </div>
  );
}
