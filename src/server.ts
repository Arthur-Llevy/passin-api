import fastify from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client'

const app = fastify();

const prisma = new PrismaClient({
	log: ['query']
})

app.get('/', () =>  { return process.env.DATABASE_URL })

app.post('/events', async (request, reply) => {

	const createEventSchema = z.object({
		title: z.string().min(5),
		details: z.string().nullable(),
		maximumAtteends: z.number().int().positive().nullable()
	});

	const data = createEventSchema.parse(request.body);

		const event = await prisma.event.create({
			data: {
				title: data.title,
				details: data.details,
				maximumAtteends: data.maximumAtteends,
				slug: (Math.floor(Math.random() * 1000)).toString()
			},
		})

	return reply.status(201).send({ eventId: event.id })

})

app.listen({
	port: 3333
})
.then(() => console.log(`Server running in port 3333`))


