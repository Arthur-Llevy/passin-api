import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export async function getAllEvents(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().get('/', async (response, reply) => {
		const events = await prisma.event.findMany();

		return reply.status(201).send(events)

	})
}