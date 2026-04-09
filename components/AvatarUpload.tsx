"use client";

// Handles uploading a profile picture to Supabase Storage.
// Photos are stored at avatars/{userId}/avatar — upsert overwrites the old one.
// After upload, saves the public URL to the profiles table.

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Props = {
  userId: string;
  currentAvatarUrl: string | null;
};

export default function AvatarUpload({ userId, currentAvatarUrl }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview]     = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setPreview(URL.createObjectURL(file)); // show local preview immediately

    const filePath = `${userId}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);

    if (updateError) {
      setError("Uploaded but failed to save. Please try again.");
      setUploading(false);
      return;
    }

    setUploading(false);
    router.refresh(); // re-runs server component so Navbar picks up the new avatar
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="h-20 w-20 overflow-hidden rounded-full bg-edge transition-opacity hover:opacity-75"
      >
        {preview ? (
          <img src={preview} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-muted">
            +
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-muted underline underline-offset-2 hover:text-ink"
      >
        {uploading ? "Uploading..." : "Change photo"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
