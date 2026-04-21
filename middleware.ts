import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/login"];

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasSupabaseEnv) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const publicRoute = isPublicPath(pathname);

  if (!user && !publicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && publicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
