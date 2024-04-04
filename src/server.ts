import fastify from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { createEvent } from '../routes/create-event';
import { getAllEvents } from '../routes/getAllEvents';

const app = fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(getAllEvents);
app.register(createEvent);



app.listen({
	port: 3333
})
.then(() => console.log(`Server running in port 3333`))


