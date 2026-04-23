import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export type SessionUpdateResult = {
  response: NextResponse;
  user: { id: string } | null;
};

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function withRememberSessionCookieOptions(
  options: Parameters<NextResponse["cookies"]["set"]>[2] | undefined,
  rememberSession: boolean
) {
  if (rememberSession) {
    return {
      ...options,
      maxAge: options?.maxAge ?? THIRTY_DAYS_IN_SECONDS
    };
  }

  if (!options) {
    return undefined;
  }

  const { maxAge: _maxAge, expires: _expires, ...sessionOnlyOptions } = options;
  return sessionOnlyOptions;
}

export async function updateSession(request: NextRequest): Promise<SessionUpdateResult> {
  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const rememberSession = request.cookies.get("cc_remember_me")?.value === "1";

  if (!supabaseUrl || !supabaseAnonKey) {
    return { response, user: null };
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(
              name,
              value,
              withRememberSessionCookieOptions(options, rememberSession)
            );
          }
        }
      }
    });

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return { response, user: null };
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    return { response, user: user ? { id: user.id } : { id: session.user.id } };
  } catch {
    return { response, user: null };
  }
}
