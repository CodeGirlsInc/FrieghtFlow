// In middleware.ts

import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "es", "fr"],
  defaultLocale: "en",
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/", // Match the root
    "/(en|es|fr)/:path*", // Match all locale-specific paths
    // Add a negative lookahead to exclude specific paths.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
