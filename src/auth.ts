import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "./errors.js";

declare module "express-serve-static-core" {
  interface Request {
    merchantId?: string;
  }
}

/**
 * Demo-only authentication: trusts the `x-merchant-id` header.
 * In production this would validate an OAuth access token.
 */
export function requireMerchant(req: Request, _res: Response, next: NextFunction): void {
  const merchantId = req.header("x-merchant-id");
  if (!merchantId || !/^m_[a-z0-9]{3,32}$/.test(merchantId)) return next(unauthorized());
  req.merchantId = merchantId;
  next();
}

export function merchantOf(req: Request): string {
  if (!req.merchantId) throw unauthorized();
  return req.merchantId;
}
