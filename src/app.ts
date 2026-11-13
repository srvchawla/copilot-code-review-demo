import express, { type NextFunction, type Request, type Response } from "express";
import { HttpError } from "./errors.js";
import { logger } from "./logger.js";
import { paymentsRouter } from "./payments/routes.js";
import { Store } from "./store.js";

export function createApp(store = new Store()) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/v1", paymentsRouter(store));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message } });
      return;
    }
    logger.warn("unhandled_error", { message: err instanceof Error ? err.message : String(err) });
    res.status(500).json({ error: { code: "internal_error", message: "unexpected error" } });
  });

  return app;
}
