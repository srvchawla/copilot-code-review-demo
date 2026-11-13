import { randomUUID } from "node:crypto";
import { badRequest, conflict, notFound } from "../errors.js";
import { logger } from "../logger.js";
import { isCurrency } from "../money.js";
import type { Store } from "../store.js";
import type { Payment } from "./types.js";

export interface CreatePaymentInput {
  amountMinor: unknown;
  currency: unknown;
  cardNumber: unknown;
  customerEmail: unknown;
}

function parsePositiveMinor(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
    throw badRequest(`${field} must be a positive integer in minor units`);
  }
  return value;
}

export function createPayment(store: Store, merchantId: string, input: CreatePaymentInput): Payment {
  const amountMinor = parsePositiveMinor(input.amountMinor, "amountMinor");
  if (!isCurrency(input.currency)) throw badRequest("unsupported currency");
  if (typeof input.cardNumber !== "string" || !/^\d{12,19}$/.test(input.cardNumber)) {
    throw badRequest("cardNumber must be 12-19 digits");
  }
  if (typeof input.customerEmail !== "string" || !input.customerEmail.includes("@")) {
    throw badRequest("customerEmail is invalid");
  }

  const payment: Payment = {
    id: `pay_${randomUUID()}`,
    merchantId,
    currency: input.currency,
    authorizedMinor: amountMinor,
    capturedMinor: 0,
    refundedMinor: 0,
    status: "authorized",
    cardLast4: input.cardNumber.slice(-4),
    customerEmail: input.customerEmail,
    createdAt: new Date().toISOString(),
  };
  store.payments.set(payment.id, payment);
  logger.info("payment.authorized", { paymentId: payment.id, merchantId, amountMinor });
  return payment;
}

/** Returns the payment only if it belongs to the calling merchant. */
export function getPaymentForMerchant(store: Store, merchantId: string, paymentId: string): Payment {
  const payment = store.payments.get(paymentId);
  // Respond 404 (not 403) so merchants cannot probe for other merchants' payment IDs.
  if (!payment || payment.merchantId !== merchantId) throw notFound("payment not found");
  return payment;
}

export function capturePayment(
  store: Store,
  merchantId: string,
  paymentId: string,
  amountMinor?: unknown,
): Payment {
  const payment = getPaymentForMerchant(store, merchantId, paymentId);
  if (payment.status !== "authorized") throw conflict(`cannot capture a ${payment.status} payment`);

  const toCapture =
    amountMinor === undefined ? payment.authorizedMinor : parsePositiveMinor(amountMinor, "amountMinor");
  if (toCapture > payment.authorizedMinor) throw badRequest("capture exceeds authorized amount");

  payment.capturedMinor = toCapture;
  payment.status = "captured";
  const key = `${merchantId}:${payment.currency}`;
  store.balances.set(key, (store.balances.get(key) ?? 0) + toCapture);
  logger.info("payment.captured", { paymentId, merchantId, amountMinor: toCapture });
  return payment;
}

/** Public representation. Never expose full card data or customer PII. */
export function toPaymentResponse(payment: Payment) {
  return {
    id: payment.id,
    currency: payment.currency,
    authorizedMinor: payment.authorizedMinor,
    capturedMinor: payment.capturedMinor,
    refundedMinor: payment.refundedMinor,
    status: payment.status,
    cardLast4: payment.cardLast4,
    createdAt: payment.createdAt,
  };
}
