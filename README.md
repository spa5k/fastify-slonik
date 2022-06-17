# Fastify Slonik

A [Fastify](https://www.fastify.io/) plugin that uses the PostgreSQL client, [Slonik](https://www.npmjs.com/package/slonik). Slonik abstracts repeating code patterns, protects against unsafe connection handling and value interpolation, and provides a rich debugging experience.

For fastify v4, use latest version, for fastify v3, use v1.x.

[![NPM downloads](https://img.shields.io/npm/dm/fastify-slonik.svg?style=for-the-badge)](https://www.npmjs.com/package/fastify-slonik)
[![npm](https://img.shields.io/npm/v/fastify-slonik?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/fastify-slonik)
![node-current](https://img.shields.io/badge/Node-%3E=14-success?style=for-the-badge&logo=node)

## Usage

Yarn

```sh
yarn add fastify-slonik
```

NPM

```sh
npm i fastify-slonik
```

## Example:

### Import the Plugin

Both default export and named export option is available.

```js
// index.js
const { fastifySlonik } = require("fastify-slonik");

// Or
const fastifySlonik = require("fastify-slonik");
```

or

```js
import { fastifySlonik } from "fastify-slonik";

// or

import fastifySlonik from "fastify-slonik";
```

### Register the Plugin

```ts
// register fastify-slonik
try {
  await app.register(fastifySlonik, {
    connectionString: process.env.DATABASE_URL,
  });
} catch (err) {
  console.log("🔴 Failed to connect, check your Connection string");
  throw new Error(err);
}
```

### Using the plugin through decorators

FastifyInstance (this) and FastifyRequest (request) have been decorated with slonik and sql.
Use it the way you want.

```ts
// setup test route
// The decorated Fastify server is bound to this in route route handlers:
fastify.get('/users', async function (this, request, reply) {
  const { sql, slonik } = this;
  const queryText = sql`SELECT * FROM users WHERE user_id = 1`
  const user = await slonik.query(queryText)

  reply.send(user)
}
```

### Another way to access the Slonik and SQL decorator is through the request object-

```ts
fastify.get('/users', async function (request, reply) {
  const { sql, slonik } = request
  const queryText = sql`SELECT * FROM users WHERE user_id = 1`

  const user = await slonik.query(queryText)
  reply.send(user)
}
```

[Docs for This](https://www.fastify.io/docs/latest/Reference/Decorators/#decoratename-value-dependencies)

View [Slonik API](https://github.com/gajus/slonik#slonik-usage-api) for details.

## Development and Testing

[Tap](https://node-tap.org/) is used for testing. Use `pnpm test` command to run tests.

### Docker approach

```
$ docker-compose up
```

To run the tests:

- Create .env `cp .env.example .env`

```
$ yarn test
```

### Custom Postgres approach

1. Set up a database of your choice in a postgres server of your choice
2. Create the required table using
   ```sql
   CREATE TABLE users(id serial PRIMARY KEY, username VARCHAR (50) NOT NULL);
   ```
3. Create .env `cp .env.example .env` and update environment variables accordingly

## License

Licensed under [MIT](./LICENSE).
