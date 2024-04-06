import {
  prisma
} from "./chunk-VWXOSHTU.mjs";
import {
  BadRequest
} from "./chunk-I7QCHM34.mjs";

// routes/check-in.ts
import { z } from "zod";
async function checkIn(app) {
  app.withTypeProvider().get("/attendees/:attendeeId/check-in", {
    schema: {
      summary: "Criar checkin para um attendee",
      tags: ["CheckIn"],
      params: z.object({
        attendeeId: z.coerce.number().int()
      }),
      response: {
        201: z.null()
      }
    }
  }, async (request, reply) => {
    const { attendeeId } = request.params;
    const attendeeCheckIn = await prisma.checkIn.findUnique({
      where: {
        attendeeId
      }
    });
    if (attendeeCheckIn !== null) {
      throw new BadRequest("O usu\xE1rio j\xE1 fez check in");
    }
    await prisma.checkIn.create({
      data: {
        attendeeId
      }
    });
    return reply.status(201).send();
  });
}
export {
  checkIn
};
