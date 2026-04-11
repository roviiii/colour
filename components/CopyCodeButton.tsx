"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="border border-edge px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:border-ink hover:text-ink"
    >
      {copied ? "COPIED!" : "COPY CODE"}
    </button>
  );
}
