"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type ActiveGame = { code: string; theme_value: string; status: string };

type Props = {
  avatarUrl: string | null;
  username: string | null;
  activeGames: ActiveGame[];
};

export default function Navbar({ avatarUrl, username, activeGames }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function gameLink(game: ActiveGame) {
    return game.status === "waiting"
      ? `/game/${game.code}`
      : `/game/${game.code}/play`;
  }

  return (
    <nav className="border-b border-edge bg-cream px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">

        <Link
          href="/gallery"
          className="colour-gradient font-display text-[1.6rem] tracking-[0.05em] no-underline"
        >
          COLOUR
        </Link>

        <div className="flex items-center gap-7">
          {activeGames.length === 1 && (
            <Link
              href={gameLink(activeGames[0])}
              className="text-xs uppercase tracking-[0.12em] text-danger transition-opacity hover:opacity-75"
            >
              Current game
            </Link>
          )}

          {activeGames.length > 1 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="cursor-pointer border-none bg-transparent p-0 text-xs uppercase tracking-[0.12em] text-danger transition-opacity hover:opacity-75"
              >
                Current games
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] border border-edge bg-cream py-2">
                  {activeGames.map((game) => (
                    <Link
                      key={game.code}
                      href={gameLink(game)}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink hover:bg-edge"
                    >
                      {game.theme_value}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <Link
            href="/gallery"
            className="text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
          >
            Gallery
          </Link>
          <Link
            href="/game/create"
            className="text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
          >
            New game
          </Link>
          <button
            onClick={handleLogout}
            className="cursor-pointer border-none bg-transparent p-0 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-danger"
          >
            Log out
          </button>

          <Link href="/profile">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="profile"
                className="h-8 w-8 rounded-full border border-edge object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-edge font-display text-sm text-ink">
                {username?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </Link>
        </div>

      </div>
    </nav>
  );
}
