// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect, vi } from "vitest";
import {
  isValidGoogleReviewUrl,
  sanitizeFeedbackComment,
  submitGuestFeedback,
  getFeedbackStats,
} from "./feedback-service";

describe("feedback-service", () => {
  describe("isValidGoogleReviewUrl", () => {
    it("accepts valid Google review links", () => {
      expect(isValidGoogleReviewUrl("https://g.page/r/example/review")).toBe(true);
      expect(isValidGoogleReviewUrl("https://maps.app.goo.gl/abcdef123")).toBe(true);
      expect(isValidGoogleReviewUrl("https://search.google.com/local/writereview?placeid=ChIJ123")).toBe(true);
      expect(isValidGoogleReviewUrl("https://www.google.com/maps/place/sample")).toBe(true);
    });

    it("rejects non-Google domains and insecure protocols", () => {
      expect(isValidGoogleReviewUrl("http://g.page/insecure")).toBe(false);
      expect(isValidGoogleReviewUrl("https://facebook.com/reviews")).toBe(false);
      expect(isValidGoogleReviewUrl("https://phishing-google.com/review")).toBe(false);
      expect(isValidGoogleReviewUrl("not-a-url")).toBe(false);
      expect(isValidGoogleReviewUrl(null)).toBe(false);
      expect(isValidGoogleReviewUrl("")).toBe(false);
    });
  });

  describe("sanitizeFeedbackComment", () => {
    it("escapes dangerous HTML characters to prevent XSS", () => {
      const dangerous = '<script>alert("xss")</script> & "quotes"';
      const sanitized = sanitizeFeedbackComment(dangerous);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;quotes&quot;');
    });

    it("truncates comments exceeding 500 characters", () => {
      const longComment = "a".repeat(600);
      const sanitized = sanitizeFeedbackComment(longComment);
      expect(sanitized?.length).toBe(500);
    });

    it("returns null for empty or whitespace-only comments", () => {
      expect(sanitizeFeedbackComment("   ")).toBeNull();
      expect(sanitizeFeedbackComment(null)).toBeNull();
    });
  });

  describe("submitGuestFeedback", () => {
    it("successfully records feedback and flags low ratings (<= 3 stars)", async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const mockDb = {
        from: vi.fn().mockReturnValue({ insert: insertMock }),
      };

      const res = await submitGuestFeedback(
        { tenantId: "tenant-1", cardId: "QS-2345678", rating: 2, comment: "Food was cold" },
        mockDb,
      );

      expect(res.success).toBe(true);
      expect(res.isLowRating).toBe(true);
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: "tenant-1",
          card_id: "QS-2345678",
          rating: 2,
          comment: "Food was cold",
          status: "new",
        }),
      );
    });

    it("identifies high ratings (> 3 stars) correctly", async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const mockDb = {
        from: vi.fn().mockReturnValue({ insert: insertMock }),
      };

      const res = await submitGuestFeedback(
        { tenantId: "tenant-1", cardId: "QS-2345678", rating: 5, comment: "Amazing coffee!" },
        mockDb,
      );

      expect(res.success).toBe(true);
      expect(res.isLowRating).toBe(false);
    });

    it("rejects invalid rating numbers (outside 1..5)", async () => {
      const mockDb = { from: vi.fn() };
      const resZero = await submitGuestFeedback({ tenantId: "tenant-1", rating: 0 }, mockDb);
      const resSix = await submitGuestFeedback({ tenantId: "tenant-1", rating: 6 }, mockDb);
      const resFraction = await submitGuestFeedback({ tenantId: "tenant-1", rating: 4.5 }, mockDb);

      expect(resZero.success).toBe(false);
      expect(resSix.success).toBe(false);
      expect(resFraction.success).toBe(false);
    });
  });

  describe("getFeedbackStats", () => {
    it("computes totals, average rating, low rating counts, and unread counts accurately", async () => {
      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { rating: 5, status: "reviewed" },
                { rating: 4, status: "new" },
                { rating: 2, status: "new" },
                { rating: 1, status: "new" },
              ],
              error: null,
            }),
          }),
        }),
      };

      const stats = await getFeedbackStats("tenant-1", mockDb);
      expect(stats.totalCount).toBe(4);
      expect(stats.averageRating).toBe(3.0); // (5+4+2+1)/4 = 3.0
      expect(stats.lowRatingCount).toBe(2); // 2 and 1
      expect(stats.newCount).toBe(3);
    });
  });
});
