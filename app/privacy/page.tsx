import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="fade-up mx-auto max-w-2xl py-16">
      <h1 className="mb-2 font-display text-[clamp(2.5rem,6vw,4rem)] tracking-[0.04em]">
        PRIVACY POLICY
      </h1>
      <p className="mb-12 text-xs text-muted">Last updated: April 2025</p>

      <div className="flex flex-col gap-10 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            WHAT WE COLLECT
          </h2>
          <p>
            When you create an account we store your email address, a username you
            choose, and any profile photo you upload. When you play a game we store
            the photo collages you submit and the votes you cast.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            HOW IT&apos;S USED
          </h2>
          <p>
            Your data is used solely to run the game — showing your collages to
            other players, displaying your username in results, and keeping you
            logged in between sessions. We don&apos;t sell or share your data with
            third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            WHERE IT&apos;S STORED
          </h2>
          <p>
            All data is stored with{" "}
            <span className="text-ink">Supabase</span>, a managed database and
            storage provider. Data may be hosted in the US or EU depending on the
            region configuration.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            COOKIES
          </h2>
          <p>
            We use a single session cookie to keep you logged in. It is strictly
            necessary for the app to function and does not track you across other
            websites.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            YOUR RIGHTS
          </h2>
          <p>
            You can request deletion of your account and all associated data at
            any time by emailing us. We will process requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base tracking-[0.1em] text-ink">
            CONTACT
          </h2>
          <p>
            For any privacy-related questions or deletion requests, contact us at{" "}
            <span className="text-ink">privacy@colourgame.app</span>.
          </p>
        </section>
      </div>

      <div className="mt-16 border-t border-edge pt-8 text-xs text-muted">
        <Link href="/" className="text-ink underline underline-offset-2">
          Back to home
        </Link>
        <span className="mx-3">·</span>
        <Link href="/tos" className="underline underline-offset-2 hover:text-ink">
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
