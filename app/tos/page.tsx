import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="fade-up mx-auto max-w-2xl py-16">
      <h1 className="mb-2 font-display text-[clamp(2.5rem,6vw,4rem)] tracking-[0.04em]">
        TERMS OF SERVICE
      </h1>
      <p className="mb-12 text-xs text-muted">Last updated: April 2025</p>

      <div className="flex flex-col gap-10 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            YOUR CONTENT
          </h2>
          <p>
            You must own or have the rights to any photos you upload. By uploading
            a photo you confirm you have permission to share it within the game.
            You retain ownership of your content.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            ACCEPTABLE USE
          </h2>
          <p>
            Don&apos;t upload content that is illegal, harmful, or violates the
            rights of others. This includes but is not limited to: content that
            is violent, sexually explicit, defamatory, or that infringes
            copyright.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            ACCOUNT SUSPENSION
          </h2>
          <p>
            We reserve the right to suspend or delete accounts that violate these
            terms, without prior notice.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            DISCLAIMER
          </h2>
          <p>
            This is a portfolio project. The service is provided as-is with no
            guarantees of uptime or data retention. Use it at your own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            CHANGES
          </h2>
          <p>
            We may update these terms at any time. Continued use of the service
            after changes are posted constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>

      <div className="mt-16 border-t border-edge pt-8 text-xs text-muted">
        <Link href="/" className="text-ink underline underline-offset-2">
          Back to home
        </Link>
        <span className="mx-3">·</span>
        <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
