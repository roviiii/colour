import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "colour",
  description: "A colour and word collage challenge",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { data: gameMemberships } = user
    ? await supabase
        .from("game_players")
        .select("games(code, theme_value, status)")
        .eq("user_id", user.id)
    : { data: null };

  type ActiveGame = { code: string; theme_value: string; status: string };
  const activeGames = (gameMemberships ?? [])
    .map((m) => m.games as unknown as ActiveGame | null)
    .filter((g): g is ActiveGame => g !== null && (g.status === "playing" || g.status === "voting"));

  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body>
        <Script strategy="beforeInteractive" id="theme-init">{`(function(){var h=new Date().getHours();if(h<9||h>=18)document.documentElement.setAttribute('data-theme','night');})();`}</Script>
        {user && (
          <Navbar
            avatarUrl={profile?.avatar_url ?? null}
            username={profile?.username ?? null}
            activeGames={activeGames}
          />
        )}
        <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
