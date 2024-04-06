import {
  prisma
} from "./chunk-VWXOSHTU.mjs";

// routes/create-event.ts
import { z } from "zod";
async function createEvent(app) {
  app.withTypeProvider().post("/events", {
    schema: {
      summary: "Criar um novo evento",
      tags: ["Events"],
      body: z.object({
        title: z.string().min(5),
        details: z.string().nullable(),
        maximumAtteendees: z.number().int().positive().nullable()
      })
    }
  }, async (request, reply) => {
    const { title, details, maximumAtteendees } = request.body;
    const event = await prisma.event.create({
      data: {
        title,
        details,
        maximumAtteends: maximumAtteendees,
        slug: Math.floor(Math.random() * 1e3).toString()
      }
    });
    return reply.status(201).send({ eventId: event.id });
  });
}
export {
  createEvent
};
