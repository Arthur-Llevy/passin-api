import {
  prisma
} from "./chunk-VWXOSHTU.mjs";
import {
  BadRequest
} from "./chunk-I7QCHM34.mjs";

// routes/register-for-event.ts
import { z } from "zod";
async function registerForEvent(app) {
  app.withTypeProvider().post("/events/:eventId/attendees", {
    schema: {
      summary: "Cadastrar um attendee em um evento",
      tags: ["Attendees"],
      body: z.object({
        name: z.string().min(4),
        email: z.string().email()
      }),
      params: z.object({
        eventId: z.string().uuid()
      }),
      response: {
        201: z.object({
          attendeeId: z.number()
        })
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const { name, email } = request.body;
    const [event, amountOfAttendeesForEvent] = await Promise.all([
      await prisma.event.findUnique({
        where: {
          id: eventId
        }
      }),
      await prisma.attendee.count({
        where: {
          eventId
        }
      })
    ]);
    const attendeeFromEmail = await prisma.attendee.findFirst({
      where: {
        email,
        eventId
      }
    });
    if (attendeeFromEmail !== null) {
      throw new BadRequest("Este e-mail j\xE1 est\xE1 cadastrado em um evento");
    }
    if (event?.maximumAtteends && amountOfAttendeesForEvent >= event.maximumAtteends) {
      throw new BadRequest("N\xFAmero m\xE1ximo de pessoas por evento alcan\xE7ado.");
    }
    const attendee = await prisma.attendee.create({
      data: {
        name,
        email,
        eventId
      }
    });
    return reply.status(201).send({ attendeeId: attendee.id });
  });
}
export {
  registerForEvent
};
