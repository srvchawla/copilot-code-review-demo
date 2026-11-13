import { Router } from "express";
import { merchantOf, requireMerchant } from "../auth.js";
import type { Store } from "../store.js";
import {
  capturePayment,
  createPayment,
  getPaymentForMerchant,
  toPaymentResponse,
} from "./paymentsService.js";
import { createRefund, readReceipt } from "./refundsService.js";

export function paymentsRouter(store: Store): Router {
  const router = Router();
  router.use(requireMerchant);

  router.post("/payments", (req, res) => {
    const payment = createPayment(store, merchantOf(req), req.body ?? {});
    res.status(201).json(toPaymentResponse(payment));
  });

  router.get("/payments/:id", (req, res) => {
    const payment = getPaymentForMerchant(store, merchantOf(req), req.params.id);
    res.json(toPaymentResponse(payment));
  });

  router.post("/payments/:id/capture", (req, res) => {
    const payment = capturePayment(store, merchantOf(req), req.params.id, req.body?.amountMinor);
    res.json(toPaymentResponse(payment));
  });

  router.post("/payments/:id/refunds", (req, res) => {
    const refund = createRefund(store, merchantOf(req), req.params.id, req.body);
    res.status(201).json(refund);
  });

  router.get("/payments/:id/receipt", (req, res) => {
    res.type("text/plain").send(readReceipt(String(req.query.file)));
  });

  return router;
}
