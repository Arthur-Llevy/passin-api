# Iniciar o projeto

Instalar o typescript e a tipagem para o node como dependência de desenvolvimento
```
	npm i typescript @types/node -D 
	npx tsc --init
```

Se o arquivo principal estiver dentro de uma pasta, colocar o nome dela no "include" no tsconfig
ex.: "include": ["src"]

Instalar as libs que serão utilizadas: fastify, prisma, fastify-type-provider-zod
```
	npm i fastify
	npm i prisma -D
	npm i fastify-type-provider-zod
```

```
	npx prisma init --datasource-provider SQLite
	npx tsx watch --env-file file.env diretório
	npx prisma migrate dev
	npx prisma studio
	npm i fastify-type-provider-zod
```
