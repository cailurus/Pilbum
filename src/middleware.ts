import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "../i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if this is a setup page
  const isSetupPage = pathname.includes("/setup");

  // Check database configuration
  const databaseProvider = process.env.DATABASE_PROVIDER;
  const databaseUrl = process.env.DATABASE_URL;
  const isDatabaseConfigured = databaseProvider === "local" || !!databaseUrl;

  // If database is not configured, redirect to setup (unless already on setup page)
  if (!isDatabaseConfigured && !isSetupPage) {
    const locale = pathname.split("/")[1];
    const validLocale = locales.includes(locale as typeof locales[number]) ? locale : defaultLocale;
    const setupUrl = new URL(`/${validLocale}/setup`, request.url);
    return NextResponse.redirect(setupUrl);
  }

  // If database is configured but user is on setup page (not storage), redirect to admin
  if (isDatabaseConfigured && pathname.endsWith("/setup")) {
    const locale = pathname.split("/")[1];
    const validLocale = locales.includes(locale as typeof locales[number]) ? locale : defaultLocale;
    const adminUrl = new URL(`/${validLocale}/admin/dashboard`, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Apply intl middleware for all other requests
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
