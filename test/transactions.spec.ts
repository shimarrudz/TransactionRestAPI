import { expect, test, beforeAll, beforeEach, afterAll, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";

import { app } from "../src/app";

it("Transactions routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
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
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    console.log(cookies);

    const listTransactionReponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(201);

    expect(listTransactionReponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New Transaction",
        amount: 5000,
      }),
    ]);

    it("should be able to get a specific transaction", async () => {
      const createTransactionResponse = await request(app.server)
        .post("/transactions")
        .send({
          title: "New Transaction",
          amount: 5000,
          type: "credit",
        });

      const cookies = createTransactionResponse.get("Set-Cookie");

      console.log(cookies);

      const listTransactionReponse = await request(app.server)
        .get("/transactions")
        .set("Cookie", cookies)
        .expect(200);

      const transactionId =
        listTransactionReponse.body.transactions[0].transactionId;

      const getTransactionResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set("Cookie", cookies)
        .expect(200);

      expect(listTransactionReponse.body.transaction).toEqual(
        expect.objectContaining({
          title: "New Transaction",
          amount: 5000,
        })
      );
    });

    it("should be able to get the summary", async () => {
      const createTransactionResponse = await request(app.server)
        .post("/transactions")
        .send({
          title: "New Transaction",
          amount: 5000,
          type: "credit",
        });

      const cookies = createTransactionResponse.get("Set-Cookie");
      await request(app.server)
      .post("/transactions")
      .set('Cookie', cookies)
      .send({
        title: "Debit Transaction",
        amount: 5000,
        type: "credit",
      });

      console.log(cookies);

      const summaryReponse = await request(app.server)
        .get("/transactions/summary")
        .set("Cookie", cookies)
        .expect(201);

      expect(summaryReponse.body.summary).toEqual({
        amount: 3000,
    });
    });
  });
});
