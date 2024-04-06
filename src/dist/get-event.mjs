import {
  prisma
} from "./chunk-VWXOSHTU.mjs";
import {
  BadRequest
} from "./chunk-I7QCHM34.mjs";

// routes/get-event.ts
import { z } from "zod";
async function getEvent(app) {
  app.withTypeProvider().get("/events/:eventId", {
    schema: {
      summary: "Pegar informa\xE7\xF5es de um evento",
      tags: ["Events"],
      params: z.object({
        eventId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const event = await prisma.event.findUnique({
      select: {
        id: true,
        title: true,
        slug: true,
        details: true,
        maximumAtteends: true,
        _count: {
          select: {
            attendees: true
          }
        }
      },
      where: {
        id: eventId
      }
    });
    if (event === null) {
      throw new BadRequest("Evento n\xE3o encontrado");
    }
    return reply.send({
      event: {
        id: event.id,
        title: event.title,
        details: event.details,
        slug: event.slug,
        maximumAtteendees: event.maximumAtteends,
        attendeesAmount: event._count.attendees
      }
    });
  });
}
export {
  getEvent
};
