"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  gameId: string;
  userId: string;
  code: string;
  initialPhotos: (string | null)[];
};

export default function CollageBuilder({ gameId, userId, code, initialPhotos }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [photos, setPhotos]       = useState<(string | null)[]>(initialPhotos);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError]         = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleFileChange(index: number, file: File) {
    setError("");
    setUploading(index);

    const { error: uploadError } = await supabase.storage
      .from("collages")
      .upload(`${gameId}/${userId}/${index}`, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Please try again.");
      setUploading(null);
      return;
    }

    const { data } = supabase.storage
      .from("collages")
      .getPublicUrl(`${gameId}/${userId}/${index}`);

    const newPhotos = [...photos];
    newPhotos[index] = data.publicUrl;
    setPhotos(newPhotos);

    await supabase.from("collages").upsert(
      { game_id: gameId, user_id: userId, photos: newPhotos, updated_at: new Date().toISOString() },
      { onConflict: "game_id,user_id" }
    );

    setUploading(null);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <div key={i} className="relative aspect-square">
            <button
              type="button"
              disabled={uploading !== null}
              onClick={() => inputRefs.current[i]?.click()}
              className={`h-full w-full border border-edge bg-transparent transition-opacity ${
                uploading === i
                  ? "opacity-40"
                  : "hover:border-ink hover:opacity-90"
              } ${uploading !== null && uploading !== i ? "cursor-not-allowed" : ""}`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={`slot ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl text-muted">
                  {uploading === i ? "..." : "+"}
                </span>
              )}
            </button>
            <input
              ref={(el) => { inputRefs.current[i] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(i, file);
                e.target.value = "";
              }}
            />
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <button
        type="button"
        onClick={() => router.push(`/game/${code}`)}
        className="mt-6 w-full border border-ink py-3 font-display tracking-[0.18em] text-ink transition-opacity hover:opacity-75"
      >
        DONE
      </button>
    </div>
  );
}
