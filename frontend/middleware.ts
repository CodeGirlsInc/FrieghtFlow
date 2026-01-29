// In middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

// ✅ Internationalization middleware setup
export default createMiddleware({
  locales: ["en", "es", "fr"],
  defaultLocale: "en",
});

// ✅ Middleware configuration
export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/", // Match the root
    "/(en|es|fr)/:path*", // Match all locale-specific paths
    // Add a negative lookahead to exclude specific paths.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

// ✅ Protected and guest routes
const protectedRoutes = ["/dashboard", "/profile", "/settings"];
const guestRoutes = ["/auth/*", "/login", "/register"];

// ✅ Helper function to verify JWT token
async function verifyToken(token: string): Promise<boolean> {
  try {
    if (!token || token.trim() === "") return false;
    // Add real JWT verification here (e.g. jsonwebtoken)
    return true;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

// ✅ Helper function to check if a path matches any pattern in an array
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern === pathname) return true;
    if (pattern.endsWith("/*")) {
      const basePath = pattern.slice(0, -2);
      return pathname.startsWith(basePath);
    }
    return false;
  });
}

// ✅ Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get token from cookies or headers
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // Verify if user is authenticated
  const isAuthenticated = token ? await verifyToken(token) : false;

  // Handle protected routes
  if (matchesPath(pathname, protectedRoutes)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle guest routes (login, register, /auth/*)
  if (matchesPath(pathname, guestRoutes)) {
    if (isAuthenticated) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Allow access to public routes and unmatched routes
  return NextResponse.next();
}
