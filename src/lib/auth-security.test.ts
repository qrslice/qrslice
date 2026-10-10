// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifySuperAdminAuth, getSuperAdminEmails } from "./auth";

describe("Phase 01: Security & Super Admin Authorization", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ENABLE_DEV_SUPERADMIN_MOCK;
    delete process.env.DEV_ADMIN_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("includes suraj@qrslice.com in default super admin whitelist", () => {
    const emails = getSuperAdminEmails();
    expect(emails).toContain("suraj@qrslice.com");
  });

  it("parses additional super admin emails from environment variable", () => {
    process.env.SUPER_ADMIN_EMAILS = "admin1@example.com, admin2@example.com ";
    const emails = getSuperAdminEmails();
    expect(emails).toContain("suraj@qrslice.com");
    expect(emails).toContain("admin1@example.com");
    expect(emails).toContain("admin2@example.com");
  });

  it("rejects unauthenticated requests with 401 when no session exists", async () => {
    (process.env as any).NODE_ENV = "production";
    const req = new Request("https://qrslice.com/api/super/orders");
    const result = await verifySuperAdminAuth(req);

    expect(result.authorized).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toContain("Authentication session required");
  });

  it("accepts dev admin header strictly in development mode when key matches", async () => {
    (process.env as any).NODE_ENV = "development";
    process.env.DEV_ADMIN_KEY = "test-secret-dev-key";

    const req = new Request("http://localhost:3000/api/super/orders", {
      headers: {
        "x-dev-admin-key": "test-secret-dev-key",
      },
    });

    const result = await verifySuperAdminAuth(req);
    expect(result.authorized).toBe(true);
    expect(result.status).toBe(200);
    expect(result.user?.role).toBe("super_admin");
  });

  it("rejects dev admin header in production environment even if key matches", async () => {
    (process.env as any).NODE_ENV = "production";
    process.env.DEV_ADMIN_KEY = "test-secret-dev-key";

    const req = new Request("https://qrslice.com/api/super/orders", {
      headers: {
        "x-dev-admin-key": "test-secret-dev-key",
      },
    });

    const result = await verifySuperAdminAuth(req);
    expect(result.authorized).toBe(false);
    expect(result.status).toBe(401);
  });
});
