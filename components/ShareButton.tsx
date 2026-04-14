"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="border border-edge px-5 py-2 font-display tracking-[0.18em] text-muted transition-colors hover:border-ink hover:text-ink"
    >
      {copied ? "COPIED" : "SHARE"}
    </button>
  );
}
