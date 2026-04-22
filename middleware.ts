import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/login"];

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasSupabaseEnv) {
    return NextResponse.next();
  }

  const publicRoute = isPublicPath(pathname);
  const hasAuthCookie = hasSupabaseAuthCookie(request);

  if (publicRoute && !hasAuthCookie) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (!user && !publicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && publicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)"
  ]
};
