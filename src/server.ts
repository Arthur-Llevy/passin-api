import fastify from 'fastify';

const app = fastify();

app.get('/', () =>  { return process.env.DATABASE_URL })

app.listen({
	port: 3333
})
.then(() => console.log(`Server running in port 3333`))


