import fastify from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { createEvent } from './routes/create-event';
import { registerForEvent } from './routes/register-for-event';
import { getEvent } from './routes/get-event';
import { getAttendeeBagde } from './routes/get-attendee-badge';
import { getAllEvents } from './routes/get-all-events';
import { checkIn } from './routes/check-in';
import { getEventAttendees } from './routes/get-event-attendees';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { errorHandler } from './error-handler';
import fastifyCors from '@fastify/cors';

const app = fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, {
	origin: '*'
})

app.register(fastifySwagger, {
	swagger: {
		consumes: ['application/json'],
		produces: ['application/json'],
		info: {
			title: 'pass.in',
			description: 'Especificações da API Pass.in',
			version: '1.0'
		},
	},
	transform: jsonSchemaTransform
});

app.register(fastifySwaggerUi, {
	routePrefix: '/docs'
})

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
	host: '0.0.0.0'
})
.then(() => console.log(`Server running in port 3333`))


