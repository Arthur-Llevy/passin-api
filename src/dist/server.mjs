// server.ts
import fastify from "fastify";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";

// routes/create-event.ts
import { z } from "zod";

// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient({
  log: ["query"]
});

// routes/create-event.ts
async function createEvent(app2) {
  app2.withTypeProvider().post("/events", {
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

// routes/register-for-event.ts
import { z as z2 } from "zod";

// routes/_errors/bad-request.ts
var BadRequest = class extends Error {
};

// routes/register-for-event.ts
async function registerForEvent(app2) {
  app2.withTypeProvider().post("/events/:eventId/attendees", {
    schema: {
      summary: "Cadastrar um attendee em um evento",
      tags: ["Attendees"],
      body: z2.object({
        name: z2.string().min(4),
        email: z2.string().email()
      }),
      params: z2.object({
        eventId: z2.string().uuid()
      }),
      response: {
        201: z2.object({
          attendeeId: z2.number()
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

// routes/get-event.ts
import { z as z3 } from "zod";
async function getEvent(app2) {
  app2.withTypeProvider().get("/events/:eventId", {
    schema: {
      summary: "Pegar informa\xE7\xF5es de um evento",
      tags: ["Events"],
      params: z3.object({
        eventId: z3.string().uuid()
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

// routes/get-attendee-badge.ts
import { z as z4 } from "zod";
async function getAttendeeBagde(app2) {
  app2.withTypeProvider().get("/attendees/:attendeeId/badge", {
    schema: {
      summary: "Pegar informa\xE7\xF5es de um attendee",
      tags: ["Attendees"],
      params: z4.object({
        attendeeId: z4.coerce.number().int()
      }),
      response: {
        200: z4.object({
          badge: z4.object({
            name: z4.string(),
            email: z4.string().email(),
            eventTitle: z4.string(),
            checkInURL: z4.string().url()
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

// routes/get-all-events.ts
import { z as z5 } from "zod";
async function getAllEvents(app2) {
  app2.withTypeProvider().get("/events", {
    schema: {
      tags: ["Events"],
      summary: "Pegar todos os eventos j\xE1 criados",
      response: {
        200: z5.object({
          events: z5.array(
            z5.object({
              id: z5.string().uuid(),
              title: z5.string(),
              details: z5.string().nullable(),
              slug: z5.string(),
              maximumAtteends: z5.number().nullable()
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

// routes/check-in.ts
import { z as z6 } from "zod";
async function checkIn(app2) {
  app2.withTypeProvider().get("/attendees/:attendeeId/check-in", {
    schema: {
      summary: "Criar checkin para um attendee",
      tags: ["CheckIn"],
      params: z6.object({
        attendeeId: z6.coerce.number().int()
      }),
      response: {
        201: z6.null()
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

// routes/get-event-attendees.ts
import { z as z7 } from "zod";
async function getEventAttendees(app2) {
  app2.withTypeProvider().get("/events/:eventId/attendees", {
    schema: {
      summary: "Pegar informa\xE7\xF5es dos attendees de um evento",
      tags: ["Events"],
      params: z7.object({
        eventId: z7.string().uuid()
      }),
      querystring: z7.object({
        pageIndex: z7.string().nullable().default("0").transform(Number),
        query: z7.string().nullish()
      }),
      response: {
        200: z7.object({
          attendees: z7.array(
            z7.object({
              id: z7.number(),
              name: z7.string(),
              email: z7.string().email(),
              createdAt: z7.date(),
              checkInAt: z7.date().nullable()
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

// server.ts
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

// error-handler.ts
import { ZodError } from "zod";
var errorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: `Erro na valida\xE7\xE3o`,
      errors: error.flatten().fieldErrors
    });
  }
  return reply.status(500).send({ message: "Um erro aconteceu" });
};

// server.ts
import fastifyCors from "@fastify/cors";
var app = fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, {
  origin: "*"
});
app.register(fastifySwagger, {
  swagger: {
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "pass.in",
      description: "Especifica\xE7\xF5es da API Pass.in",
      version: "1.0"
    }
  },
  transform: jsonSchemaTransform
});
app.register(fastifySwaggerUi, {
  routePrefix: "/docs"
});
app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeeBagde);
app.register(checkIn);
app.register(getEventAttendees);
app.register(getAllEvents);
app.setErrorHandler(errorHandler);
app.listen({
  port: 3333,
  host: "0.0.0.0"
}).then(() => console.log(`Server running in port 3333`));
