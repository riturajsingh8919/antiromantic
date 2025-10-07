import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Define exact routes for auth pages
  const authPages = ["/login", "/signin", "/sign-in"];
  const isAuthPage = authPages.includes(pathname);

  // Define protected route prefixes
  const protectedPrefixes = [
    "/dashboard",
    "/admin",
    "/user-dashboard",
    "/user-profile",
  ];
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // If user has token and tries to access auth pages, redirect to home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user has no token and tries to access protected routes, redirect to login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based routing for authenticated users
  if (token && isProtectedRoute) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      const userRole = decoded.role;

      // Admin role routing
      if (userRole === "admin") {
        // Admin can access /admin routes, redirect from user routes to admin
        if (
          pathname.startsWith("/user-dashboard") ||
          pathname.startsWith("/user-profile")
        ) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }

      // User role routing
      else if (userRole === "user") {
        // Users can access /user-profile and /user-dashboard routes, redirect from admin routes to user-profile
        if (pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/user-profile", request.url));
        }
      }
    } catch (error) {
      console.error("Token verification in middleware failed:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
