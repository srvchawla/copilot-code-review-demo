export const CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Number of decimal places in each currency's minor unit (cents, pence, etc.). */
export const MINOR_UNIT_DIGITS: Record<Currency, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
};

/** A monetary amount stored as an integer count of minor units. */
export interface Money {
  readonly amountMinor: number;
  readonly currency: Currency;
}

export class MoneyError extends Error {}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

export function money(amountMinor: number, currency: Currency): Money {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new MoneyError(`amountMinor must be a safe integer, got ${amountMinor}`);
  }
  return { amountMinor, currency };
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new MoneyError(`currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amountMinor + b.amountMinor, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amountMinor - b.amountMinor, a.currency);
}

/**
 * Applies a rate expressed in basis points (1 bp = 0.01%) using integer math,
 * rounding half away from zero.
 */
export function applyBasisPoints(m: Money, basisPoints: number): Money {
  if (!Number.isSafeInteger(basisPoints)) {
    throw new MoneyError("basisPoints must be an integer");
  }
  const product = m.amountMinor * basisPoints;
  const rounded = Math.sign(product) * Math.floor((Math.abs(product) + 5_000) / 10_000);
  return money(rounded, m.currency);
}

/** Display-only decimal string, e.g. "12.34 USD". Never parse this back into a Money. */
export function formatMoney(m: Money): string {
  const digits = MINOR_UNIT_DIGITS[m.currency];
  const sign = m.amountMinor < 0 ? "-" : "";
  const abs = Math.abs(m.amountMinor).toString().padStart(digits + 1, "0");
  const whole = digits === 0 ? abs : abs.slice(0, -digits);
  const fraction = digits === 0 ? "" : `.${abs.slice(-digits)}`;
  return `${sign}${whole}${fraction} ${m.currency}`;
}
