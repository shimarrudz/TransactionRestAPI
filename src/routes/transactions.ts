import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { knex } from "../database";
import { chackSessionIdExists } from "../midlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/transactions",
    {
      preHandler: [chackSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      if (!sessionId) {
        return reply.status(401).send({
          error: "Unauthorized",
        });
      }

      const transactions = await knex("transactions")
        .where("sessionId", sessionId)
        .select();

      return { transactions };
    }
  );

  app.get(
    "/transactions/:id",
    {
      preHandler: [chackSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const transaction = await knex("transactions")
      .where({
        sessionId: sessionId,
        id,
      })
      .first();

      return { transaction };
    }
  );

  app.get(
    "/transactions/summary",
    {
      preHandler: [chackSessionIdExists],
    },
    async (request) => {
        const { sessionId } = request.cookies;

      const summary = await knex("transactions")
        .where('sessionId', sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return { summary };
    }
  );

  app.post("/transactions", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.session_id;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 600 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      sessionId: sessionId,
    });

    return reply.status(201).send();
  });
}
