import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { BadRequest } from './_errors/bad-request';
import { prisma } from '../lib/prisma';

export async function getEvent(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>()
	.get('/events/:eventId', {
		schema: {
			summary: "Pegar informações de um evento",
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

		if (event === null){
			throw new BadRequest("Evento não encontrado");
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
		})
	})
}