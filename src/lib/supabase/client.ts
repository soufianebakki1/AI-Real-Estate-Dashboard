import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

let client: SupabaseClient<Database> | undefined;

// Singleton: this is called from many components (server and client). Creating
// a fresh instance each time spins up a redundant GoTrueClient per call, which
// Supabase warns about when several share the same browser storage key.
export function createBrowserClient() {
  if (!client) {
    client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
