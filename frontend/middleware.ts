import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/settings"];
const guestRoutes = ["/login", "/register"];

// Helper function to verify JWT token
async function verifyToken(token: string): Promise<boolean> {
  try {
    // In a real application, you would verify the JWT token here
    // For now, we'll just check if the token exists and is not empty
    if (!token || token.trim() === "") {
      return false;
    }

    // You can add actual JWT verification here
    // For example, using a library like 'jsonwebtoken' or making a request to your auth service
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // return !!decoded;

    // For now, just return true if token exists
    return true;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

// Helper function to check if a path matches any pattern in an array
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Exact match
    if (pattern === pathname) return true;

    // Wildcard match (e.g., '/dashboard/*')
    if (pattern.endsWith("/*")) {
      const basePath = pattern.slice(0, -2);
      return pathname.startsWith(basePath);
    }

    return false;
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files (images, css, js, etc.)
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
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle guest routes (login, register)
  if (matchesPath(pathname, guestRoutes)) {
    if (isAuthenticated) {
      // Redirect authenticated users to dashboard
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Allow access to public routes and unmatched routes
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
