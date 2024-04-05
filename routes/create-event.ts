import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from '../lib/prisma';

export async function createEvent(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post('/events', {
	schema: {
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
			title: title,
			details: details,
			maximumAtteends: maximumAtteendees,
			slug: (Math.floor(Math.random() * 1000)).toString()
		},
	})

	return reply.status(201).send({ eventId: event.id })

})
}