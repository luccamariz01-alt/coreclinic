import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/env";

export async function createClient() {
  if (!hasSupabaseEnv) {
    throw new Error("Supabase environment variables are missing or invalid.");
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Ignore cookie writes in Server Components when immutable.
          }
        }
      }
    }
  );
}

export async function getCurrentUserSafe(): Promise<User | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
