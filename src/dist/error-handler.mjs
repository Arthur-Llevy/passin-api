// error-handler.ts
import { ZodError } from "zod";
var errorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: `Erro na valida\xE7\xE3o`,
      errors: error.flatten().fieldErrors
    });
  }
  return reply.status(500).send({ message: "Um erro aconteceu" });
};
export {
  errorHandler
};
