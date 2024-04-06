import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { BadRequest } from './_errors/bad-request';

export async function getAllEvents(app: FastifyInstance) {
	app
	.withTypeProvider<ZodTypeProvider>()
	.get('/events', {
		schema: {
			tags: ['Events'],
			summary: 'Pegar todos os eventos já criados',
			response: {
				200: z.object({
						events: z.array(
							z.object({
								id: z.string().uuid(),
								title: z.string(),
								details: z.string().nullable(),
								slug: z.string(),
								maximumAtteends: z.number().nullable()
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
			return reply.status(500).send({ err })
		}


	})
}