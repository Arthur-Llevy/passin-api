import {
  prisma
} from "./chunk-VWXOSHTU.mjs";

// routes/get-event-attendees.ts
import { z } from "zod";
async function getEventAttendees(app) {
  app.withTypeProvider().get("/events/:eventId/attendees", {
    schema: {
      summary: "Pegar informa\xE7\xF5es dos attendees de um evento",
      tags: ["Events"],
      params: z.object({
        eventId: z.string().uuid()
      }),
      querystring: z.object({
        pageIndex: z.string().nullable().default("0").transform(Number),
        query: z.string().nullish()
      }),
      response: {
        200: z.object({
          attendees: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.date(),
              checkInAt: z.date().nullable()
            })
          )
        })
      }
    }
  }, async (request, reply) => {
    const { eventId } = request.params;
    const { pageIndex, query } = request.query;
    const attendees = await prisma.attendee.findMany({
      select: {
        name: true,
        email: true,
        id: true,
        createdAt: true,
        checkIn: {
          select: {
            createdAt: true
          }
        }
      },
      where: query ? {
        eventId,
        name: {
          contains: query
        }
      } : {
        eventId
      },
      take: 10,
      skip: pageIndex * 10,
      orderBy: {
        createdAt: "desc"
      }
    });
    return reply.send({
      attendees: attendees.map((attendee) => {
        return {
          id: attendee.id,
          name: attendee.name,
          email: attendee.email,
          createdAt: attendee.createdAt,
          checkInAt: attendee.checkIn?.createdAt ?? null
        };
      })
    });
  });
}
export {
  getEventAttendees
};
