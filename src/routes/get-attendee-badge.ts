import { FastifyInstance } from 'fastify';
import{ ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequest } from './_errors/bad-request';

export async function getAttendeeBagde(app: FastifyInstance){
	app.withTypeProvider<ZodTypeProvider>()
	.get('/attendees/:attendeeId/badge', {
		schema: {
			summary: "Pegar informações de um attendee",
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
	},  async (request, reply) => {
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
		})

		if (attendee === null) {
			throw new BadRequest("Cliente não encontrado");
		}

		const baseURL = `${request.protocol}://${request.hostname}`;

		const checkInURL = new URL(`/attendees/${attendeeId}/check/in`, baseURL)

		return reply.status(200).send({
			badge: {
				name: attendee.name,
				email: attendee.email,
				eventTitle: attendee.event.title,
				checkInURL: checkInURL.toString()
			}
		})
	})
}