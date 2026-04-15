// Middleware runs on every request before the page loads.
// Its job here is to refresh the user's Supabase session cookie
// so it doesn't expire mid-visit.
// It also protects routes — if you're not logged in, you get redirected.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const authPaths = ["/auth", "/login", "/signup"];
  const isAuthRoute = authPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );
  if (isAuthRoute && isRateLimited(ip, 20, 60_000)) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is required for Server Components to work correctly
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ["/game", "/gallery", "/profile"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Run middleware on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
