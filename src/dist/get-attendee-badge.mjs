import {
  prisma
} from "./chunk-VWXOSHTU.mjs";
import {
  BadRequest
} from "./chunk-I7QCHM34.mjs";

// routes/get-attendee-badge.ts
import { z } from "zod";
async function getAttendeeBagde(app) {
  app.withTypeProvider().get("/attendees/:attendeeId/badge", {
    schema: {
      summary: "Pegar informa\xE7\xF5es de um attendee",
      tags: ["Attendees"],
      params: z.object({
        attendeeId: z.coerce.number().int()
      }),
      response: {
        200: z.object({
          badge: z.object({
            name: z.string(),
            email: z.string().email(),
            eventTitle: z.string(),
            checkInURL: z.string().url()
          })
        })
      }
    }
  }, async (request, reply) => {
    const { attendeeId } = request.params;
    const attendee = await prisma.attendee.findUnique({
      select: {
        name: true,
        email: true,
        event: {
          select: {
            title: true
          }
        }
      },
      where: {
        id: attendeeId
      }
    });
    if (attendee === null) {
      throw new BadRequest("Cliente n\xE3o encontrado");
    }
    const baseURL = `${request.protocol}://${request.hostname}`;
    const checkInURL = new URL(`/attendees/${attendeeId}/check/in`, baseURL);
    return reply.status(200).send({
      badge: {
        name: attendee.name,
        email: attendee.email,
        eventTitle: attendee.event.title,
        checkInURL: checkInURL.toString()
      }
    });
  });
}
export {
  getAttendeeBagde
};
