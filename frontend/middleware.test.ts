/**
 * @jest-environment node
 */
import { middleware } from "./middleware";
import { NextRequest, NextResponse } from "next/server";

function createRequest(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const url = new URL(pathname, "http://localhost:3000");
  const request = new NextRequest(url);
  for (const [key, value] of Object.entries(cookies)) {
    request.cookies.set(key, value);
  }
  return request;
}

describe("middleware", () => {
  describe("static assets and API routes", () => {
    it("should pass through _next routes", async () => {
      const request = createRequest("/_next/static/chunk.js");
      const response = await middleware(request);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    });

    it("should pass through /api routes", async () => {
      const request = createRequest("/api/shipments");
      const response = await middleware(request);
      expect(response).toBeInstanceOf(NextResponse);
    });

    it("should pass through file requests", async () => {
      const request = createRequest("/favicon.ico");
      const response = await middleware(request);
      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe("protected routes", () => {
    it("should redirect to /login when not authenticated for /dashboard", async () => {
      const request = createRequest("/dashboard");
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
      expect(response.headers.get("location")).toContain(
        "callbackUrl=%2Fdashboard",
      );
    });

    it("should redirect to /login when not authenticated for /profile", async () => {
      const request = createRequest("/profile");
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });

    it("should redirect to /login when not authenticated for /settings", async () => {
      const request = createRequest("/settings");
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });

    it("should redirect sub-routes of protected paths", async () => {
      const request = createRequest("/dashboard/overview");
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });

    it("should allow access to protected routes when authenticated", async () => {
      const request = createRequest("/dashboard", {
        auth_token: "valid-token",
      });
      const response = await middleware(request);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307);
    });
  });

  describe("guest-only routes", () => {
    it("should redirect to /dashboard when authenticated on /login", async () => {
      const request = createRequest("/login", { auth_token: "valid-token" });
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });

    it("should redirect to /dashboard when authenticated on /register", async () => {
      const request = createRequest("/register", { auth_token: "valid-token" });
      const response = await middleware(request);
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });

    it("should allow access to guest routes when not authenticated", async () => {
      const request = createRequest("/login");
      const response = await middleware(request);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307);
    });
  });

  describe("public routes", () => {
    it("should pass through for unauthenticated users on public routes", async () => {
      const request = createRequest("/");
      const response = await middleware(request);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307);
    });
  });
});
