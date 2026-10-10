// Copyright (c) 2026 QRslice. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  formatPaiseToRupees,
  rupeesToPaise,
  generateMenuSlug,
  isValidDeliveryUrl,
  validateMenuItem,
} from "./menu-service";

describe("menu-service", () => {
  describe("formatPaiseToRupees", () => {
    it("formats integer paise into neat rupee amounts", () => {
      expect(formatPaiseToRupees(25000)).toBe("₹250");
      expect(formatPaiseToRupees(0)).toBe("₹0");
      expect(formatPaiseToRupees(19950)).toBe("₹199.50");
      expect(formatPaiseToRupees(9900)).toBe("₹99");
    });

    it("handles invalid or negative paise safely", () => {
      expect(formatPaiseToRupees(-500)).toBe("₹0");
      expect(formatPaiseToRupees(NaN)).toBe("₹0");
    });
  });

  describe("rupeesToPaise", () => {
    it("converts rupees into integer paise", () => {
      expect(rupeesToPaise(250)).toBe(25000);
      expect(rupeesToPaise("199.50")).toBe(19950);
      expect(rupeesToPaise("49")).toBe(4900);
      expect(rupeesToPaise(0)).toBe(0);
    });

    it("handles invalid or negative inputs safely", () => {
      expect(rupeesToPaise(-10)).toBe(0);
      expect(rupeesToPaise("invalid")).toBe(0);
    });
  });

  describe("generateMenuSlug", () => {
    it("generates clean, URL-safe slugs", () => {
      expect(generateMenuSlug("The Chai Spot & Bakery")).toBe("the-chai-spot-bakery");
      expect(generateMenuSlug("Blue Tokai (Saket)")).toBe("blue-tokai-saket");
      expect(generateMenuSlug("   Pizza Corner   ")).toBe("pizza-corner");
    });

    it("falls back to 'menu' on empty or invalid names", () => {
      expect(generateMenuSlug("")).toBe("menu");
      expect(generateMenuSlug("???")).toBe("menu");
    });
  });

  describe("isValidDeliveryUrl", () => {
    it("validates Zomato delivery links", () => {
      expect(isValidDeliveryUrl("https://www.zomato.com/ncr/the-cafe-saket/order", "zomato")).toBe(true);
      expect(isValidDeliveryUrl("https://zomato.com/order", "zomato")).toBe(true);
      expect(isValidDeliveryUrl("https://swiggy.com/restaurants/123", "zomato")).toBe(false);
      expect(isValidDeliveryUrl("http://zomato.com/insecure", "zomato")).toBe(false);
    });

    it("validates Swiggy delivery links", () => {
      expect(isValidDeliveryUrl("https://www.swiggy.com/city/delhi/the-cafe-rest123", "swiggy")).toBe(true);
      expect(isValidDeliveryUrl("https://swiggy.com/restaurants", "swiggy")).toBe(true);
      expect(isValidDeliveryUrl("https://zomato.com/order", "swiggy")).toBe(false);
    });
  });

  describe("validateMenuItem", () => {
    it("accepts valid menu items", () => {
      const res = validateMenuItem({
        name: "Cold Brew",
        price_paise: 22000,
        is_veg: true,
      });
      expect(res.valid).toBe(true);
    });

    it("rejects missing names or negative/fractional paise", () => {
      expect(validateMenuItem({ name: "", price_paise: 10000, is_veg: true }).valid).toBe(false);
      expect(validateMenuItem({ name: "Chai", price_paise: -100, is_veg: true }).valid).toBe(false);
      expect(validateMenuItem({ name: "Chai", price_paise: 100.5, is_veg: true }).valid).toBe(false);
    });
  });
});
