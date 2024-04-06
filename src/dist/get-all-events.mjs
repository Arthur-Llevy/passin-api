import {
  prisma
} from "./chunk-VWXOSHTU.mjs";

// routes/get-all-events.ts
import { z } from "zod";
async function getAllEvents(app) {
  app.withTypeProvider().get("/events", {
    schema: {
      tags: ["Events"],
      summary: "Pegar todos os eventos j\xE1 criados",
      response: {
        200: z.object({
          events: z.array(
            z.object({
              id: z.string().uuid(),
              title: z.string(),
              details: z.string().nullable(),
              slug: z.string(),
              maximumAtteends: z.number().nullable()
            })
          )
        })
      }
    }
  }, async (request, reply) => {
    try {
      const events = await prisma.event.findMany();
      reply.send({ events });
    } catch (err) {
      return reply.status(500).send({ err });
    }
  });
}
export {
  getAllEvents
};
