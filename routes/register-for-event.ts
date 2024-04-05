import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function registerForEvent(app: FastifyInstance){
	app.withTypeProvider<ZodTypeProvider>()
	.post('/events/:eventId/attendees', {
		schema: {
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

		const event = await prisma.event.findUnique({
			where: {
				id: eventId
			}
		});

		const amountOfAttendeesForEvent = await prisma.attendee.count({
			where: {
				eventId,
			}
		})

		const attendeeFromEmail = await prisma.attendee.findFirst({
			where: {
				email,
				eventId
			}
		});

		if (attendeeFromEmail !== null){
			throw new Error("Este e-mail já está cadastrado em um evento")
		}

		if (event?.maximumAtteends && amountOfAttendeesForEvent >= event.maximumAtteends){
			throw new Error("Número máximo de pessoas por evento alcançado.")
		}

		const attendee = await prisma.attendee.create({
			data: {
				name,
				email,
				eventId
			}
		})

		return reply.status(201).send({ attendeeId: attendee.id })
	})
}