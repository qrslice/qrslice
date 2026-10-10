// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect, vi } from "vitest";
import { resolveCard, claimCard } from "./card-service";
import { hashClaimSecret } from "./claim-tokens";

describe("card-service", () => {
  describe("resolveCard", () => {
    it("returns not_found for malformed card IDs without querying DB", async () => {
      const mockDb = { from: vi.fn() };
      const res = await resolveCard("invalid-id", mockDb);
      expect(res.status).toBe("not_found");
      expect(mockDb.from).not.toHaveBeenCalled();
    });

    it("returns not_found when card does not exist in database", async () => {
      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      };

      const res = await resolveCard("QS-2345678", mockDb);
      expect(res.status).toBe("not_found");
    });

    it("returns unclaimed when card is manufactured but not yet bound to a tenant", async () => {
      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  card_id: "QS-2345678",
                  status: "manufactured",
                  tenant_id: null,
                  restaurants: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const res = await resolveCard("QS-2345678", mockDb);
      expect(res.status).toBe("unclaimed");
      if (res.status === "unclaimed") {
        expect(res.cardId).toBe("QS-2345678");
      }
    });

    it("returns disabled when card has disabled status", async () => {
      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  card_id: "QS-2345678",
                  status: "disabled",
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const res = await resolveCard("QS-2345678", mockDb);
      expect(res.status).toBe("disabled");
    });

    it("returns active with tenant metadata for active cards and never leaks secret hashes", async () => {
      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  card_id: "QS-2345678",
                  status: "active",
                  purpose: "reputation",
                  tenant_id: "tenant-uuid-123",
                  restaurants: {
                    id: "tenant-uuid-123",
                    name: "Cafe Mocha",
                    slug: "cafe-mocha",
                    logo_url: "https://example.com/logo.png",
                    google_review_url: "https://g.page/r/example",
                  },
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const res = await resolveCard("QS-2345678", mockDb);
      expect(res.status).toBe("active");
      if (res.status === "active") {
        expect(res.cardId).toBe("QS-2345678");
        expect(res.purpose).toBe("reputation");
        expect(res.tenant.name).toBe("Cafe Mocha");
        expect(res.tenant.slug).toBe("cafe-mocha");
        // Verify secrets are absent
        expect((res as any).claim_pin_hash).toBeUndefined();
      }
    });
  });

  describe("claimCard", () => {
    it("successfully claims an unclaimed card when PIN is correct", async () => {
      const testPin = "482910";
      const pinHash = await hashClaimSecret(testPin);

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const mockDb = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "cards") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      card_id: "QS-2345678",
                      claim_pin_hash: pinHash,
                      status: "manufactured",
                      tenant_id: null,
                    },
                    error: null,
                  }),
                }),
              }),
              update: updateMock,
            };
          }
          return {};
        }),
      };

      const result = await claimCard("QS-2345678", testPin, "tenant-uuid-999", "reputation", mockDb);
      expect(result.success).toBe(true);
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          tenant_id: "tenant-uuid-999",
          purpose: "reputation",
        }),
      );
    });

    it("rejects claim when PIN is incorrect", async () => {
      const correctPin = "482910";
      const wrongPin = "000000";
      const pinHash = await hashClaimSecret(correctPin);

      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  card_id: "QS-2345678",
                  claim_pin_hash: pinHash,
                  status: "manufactured",
                  tenant_id: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await claimCard("QS-2345678", wrongPin, "tenant-uuid-999", "reputation", mockDb);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("INVALID_PIN");
      }
    });

    it("rejects claim if card is already active", async () => {
      const pinHash = await hashClaimSecret("123456");

      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  card_id: "QS-2345678",
                  claim_pin_hash: pinHash,
                  status: "active",
                  tenant_id: "existing-tenant-111",
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const result = await claimCard("QS-2345678", "123456", "tenant-uuid-999", "reputation", mockDb);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ALREADY_CLAIMED");
      }
    });
  });
});
