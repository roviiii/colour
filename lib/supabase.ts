// Browser-side Supabase client.
// Use this in Client Components (anything with "use client").
// It reads your env vars to connect to your Supabase project.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
