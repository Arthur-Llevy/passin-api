import { FastifyInstance } from 'fastify';
import{ ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export async function getAttendeeBagde(app: FastifyInstance){
	app.withTypeProvider<ZodTypeProvider>()
	.get('/attendees/:attendeeId/badge', {
		schema: {
			params: z.object({
				attendeeId: z.coerce.number().int()
			}),
			
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
			throw new Error("Cliente não encontrado");
		}

		return reply.status(200).send({ attendee })
	})
}