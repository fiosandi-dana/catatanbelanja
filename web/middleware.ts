import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Middleware that (a) ensures every visitor has an anonymous Supabase session
 * and (b) refreshes the access token on each request. Without this, server
 * components would see a logged-out request and the catat / riwayat reads
 * would return empty.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>,
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session — refreshes the token if expired.
  const { data: { user } } = await supabase.auth.getUser();

  // No user yet → anonymously sign in. Persists across visits via cookie.
  if (!user) {
    await supabase.auth.signInAnonymously();
  }

  return res;
}

export const config = {
  matcher: [
    // Skip static assets / images / manifest / favicon
    "/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.webmanifest).*)",
  ],
};
