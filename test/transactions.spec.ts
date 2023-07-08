import { expect, test, beforeAll, afterAll, it } from "vitest";
import { createServer } from "node:http";
import request from "supertest";

import { app } from "../src/app";

it("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a new transaction", async () => {
    test("User can create a new transact", async () => {
      await request(app.server)
        .post("/transactions")
        .send({
          title: "New Transaction",
          amount: 5000,
          type: "credit",
        })
        .expect(201);
    });

    it("should be able to list all transactions", async () => {
        const createTransactionResponse = await request(app.server)
        .post("/transactions")
        .send({
          title: "New Transaction",
          amount: 5000,
          type: "credit",
        })

    const cookies = createTransactionResponse.get('Set-Cookie')

    console.log(cookies)

    const listTransactionReponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

    expect(listTransactionReponse.body.transactions).toEqual([
        expect.objectContaining({
            title: "New Transaction",
            amount: 5000
        })
    ])
    });
  });
});
