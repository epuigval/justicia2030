import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createServerSupabaseClient(environment: NodeJS.ProcessEnv = process.env): SupabaseClient {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = environment.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) throw new Error("supabase_server_configuration_missing");

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
