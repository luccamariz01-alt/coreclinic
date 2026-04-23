import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/env";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function normalizeAuthError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("invalid login credentials")) {
    return "Email ou senha invalidos. Confira os dados e tente novamente.";
  }

  if (lowerMessage.includes("email not confirmed")) {
    return "Email ainda nao confirmado. Verifique sua caixa de entrada.";
  }

  if (lowerMessage.includes("fetch") || lowerMessage.includes("network")) {
    return "Falha ao conectar no Supabase. Verifique a internet e tente novamente.";
  }

  return message;
}

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

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv) {
    return NextResponse.json(
      { error: "Supabase nao configurado no ambiente." },
      { status: 503 }
    );
  }

  const payload = (await request.json().catch(() => null)) as
    | { email?: string; password?: string; rememberSession?: boolean }
    | null;
  const email = String(payload?.email ?? "").trim();
  const password = String(payload?.password ?? "");
  const rememberSession = Boolean(payload?.rememberSession);

  if (!email || !password) {
    return NextResponse.json(
      { error: "Preencha e-mail e senha para continuar." },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true });
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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return NextResponse.json(
      { error: normalizeAuthError(error.message) },
      { status: 401 }
    );
  }

  response.cookies.set("cc_remember_me", rememberSession ? "1" : "0", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...(rememberSession ? { maxAge: THIRTY_DAYS_IN_SECONDS } : {})
  });

  return response;
}
