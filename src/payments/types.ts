import type { Currency } from "../money.js";

export type PaymentStatus = "authorized" | "captured" | "partially_refunded" | "refunded";

export interface Payment {
  id: string;
  merchantId: string;
  currency: Currency;
  authorizedMinor: number;
  capturedMinor: number;
  refundedMinor: number;
  status: PaymentStatus;
  cardLast4: string;
  customerEmail: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  merchantId: string;
  amountMinor: number;
  currency: Currency;
  reason?: string;
  createdAt: string;
}
