import { test, beforeAll, afterAll, it } from "vitest";
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

  it("Should be able to create a new transaction", async () => {
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
});
