import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function verifyToken(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function createAuthMiddleware(requiredAuth = true) {
  return function authMiddleware(request) {
    const user = verifyToken(request);

    if (requiredAuth && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!requiredAuth && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  };
}

// Helper function to get current user from request
export function getCurrentUser(request) {
  return verifyToken(request);
}
