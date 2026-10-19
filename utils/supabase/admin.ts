import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS, so it can write to `observations`.
// Use ONLY in server code that has no user (cron routes). Never import this
// in a client component and never prefix the key with NEXT_PUBLIC_.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}