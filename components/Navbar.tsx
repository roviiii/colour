"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  avatarUrl: string | null;
  username: string | null;
};

export default function Navbar({ avatarUrl, username }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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

          {/* Avatar — links to profile */}
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
