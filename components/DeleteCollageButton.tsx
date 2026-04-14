"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCollage } from "@/app/gallery/actions";

type Props = {
  collageId: string;
  gameId: string;
};

export default function DeleteCollageButton({ collageId, gameId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this collage?")) return;
    setLoading(true);
    await deleteCollage(collageId, gameId);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-danger disabled:opacity-50"
      aria-label="Delete collage"
    >
      ×
    </button>
  );
}
