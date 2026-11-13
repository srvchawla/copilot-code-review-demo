import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { Store } from "../src/store.js";

const MERCHANT = { "x-merchant-id": "m_acme" };
const OTHER_MERCHANT = { "x-merchant-id": "m_globex" };

const validPayment = {
  amountMinor: 10_000,
  currency: "USD",
  cardNumber: "4111111111111111",
  customerEmail: "buyer@example.com",
};

describe("payments API", () => {
  let store: Store;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    store = new Store();
    app = createApp(store);
  });

  it("rejects requests without merchant credentials", async () => {
    const res = await request(app).post("/v1/payments").send(validPayment);
    expect(res.status).toBe(401);
  });

  it("authorizes a payment and never returns full card data or email", async () => {
    const res = await request(app).post("/v1/payments").set(MERCHANT).send(validPayment);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ authorizedMinor: 10_000, status: "authorized", cardLast4: "1111" });
    expect(JSON.stringify(res.body)).not.toContain("4111111111111111");
    expect(JSON.stringify(res.body)).not.toContain("buyer@example.com");
  });

  it.each<[Record<string, unknown>, string]>([
    [{ amountMinor: 10.5 }, "fractional minor units"],
    [{ amountMinor: -100 }, "negative amount"],
    [{ amountMinor: "100" }, "string amount"],
    [{ currency: "XYZ" }, "unsupported currency"],
    [{ cardNumber: "4111" }, "short card number"],
  ])("rejects invalid input: %o (%s)", async (override, _label) => {
    const res = await request(app)
      .post("/v1/payments")
      .set(MERCHANT)
      .send({ ...validPayment, ...override });
    expect(res.status).toBe(400);
  });

  it("captures the full authorized amount and credits the merchant balance", async () => {
    const created = await request(app).post("/v1/payments").set(MERCHANT).send(validPayment);
    const res = await request(app).post(`/v1/payments/${created.body.id}/capture`).set(MERCHANT).send({});
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ capturedMinor: 10_000, status: "captured" });
    expect(store.balances.get("m_acme:USD")).toBe(10_000);
  });

  it("rejects capturing more than was authorized", async () => {
    const created = await request(app).post("/v1/payments").set(MERCHANT).send(validPayment);
    const res = await request(app)
      .post(`/v1/payments/${created.body.id}/capture`)
      .set(MERCHANT)
      .send({ amountMinor: 10_001 });
    expect(res.status).toBe(400);
  });

  it("hides other merchants' payments behind a 404", async () => {
    const created = await request(app).post("/v1/payments").set(MERCHANT).send(validPayment);
    const res = await request(app).get(`/v1/payments/${created.body.id}`).set(OTHER_MERCHANT);
    expect(res.status).toBe(404);
  });
});
