import { describe, expect, it } from "vitest";
import { add, applyBasisPoints, formatMoney, money, MoneyError, subtract } from "../src/money.js";

describe("money", () => {
  it("rejects non-integer minor units", () => {
    expect(() => money(10.5, "USD")).toThrow(MoneyError);
  });

  it("refuses to mix currencies", () => {
    expect(() => add(money(100, "USD"), money(100, "EUR"))).toThrow(MoneyError);
    expect(() => subtract(money(100, "USD"), money(100, "GBP"))).toThrow(MoneyError);
  });

  it("applies basis points with half-up rounding and no float drift", () => {
    expect(applyBasisPoints(money(10_000, "USD"), 290).amountMinor).toBe(290);
    expect(applyBasisPoints(money(1_050, "USD"), 290).amountMinor).toBe(30); // 30.45 -> 30
    expect(applyBasisPoints(money(5, "USD"), 1_000).amountMinor).toBe(1); // 0.5 -> 1
    expect(applyBasisPoints(money(-5, "USD"), 1_000).amountMinor).toBe(-1);
  });

  it("keeps precision for amounts near Number.MAX_SAFE_INTEGER", () => {
    // 9007199254740948 * 290 / 10000 = 261208778387487.492 -> 261208778387487
    expect(applyBasisPoints(money(9_007_199_254_740_948, "USD"), 290).amountMinor).toBe(261_208_778_387_487);
  });

  it("formats zero-decimal and two-decimal currencies", () => {
    expect(formatMoney(money(1_234, "USD"))).toBe("12.34 USD");
    expect(formatMoney(money(5, "EUR"))).toBe("0.05 EUR");
    expect(formatMoney(money(1_234, "JPY"))).toBe("1234 JPY");
    expect(formatMoney(money(-1_234, "GBP"))).toBe("-12.34 GBP");
  });
});
