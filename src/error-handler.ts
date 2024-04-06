import { FastifyInstance } from 'fastify';
import { BadRequest } from './routes/_errors/bad-request';
import { ZodError } from 'zod';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {

	if (error instanceof ZodError) {
		return reply.status(400).send({ 
			message: `Erro na validação`,
			errors: error.flatten().fieldErrors
		})
	}

	return reply.status(500).send({ message: "Um erro aconteceu" })
}