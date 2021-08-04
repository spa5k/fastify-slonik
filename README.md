# Fastify Slonik

A [Fastify](https://www.fastify.io/) plugin that uses the PostgreSQL client, [Slonik](https://www.npmjs.com/package/slonik). Slonik abstracts repeating code patterns, protects against unsafe connection handling and value interpolation, and provides a rich debugging experience.

![npm](https://img.shields.io/npm/v/fastify-slonik?style=for-the-badge)  
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

```js
// index.js
const fastifySlonik = require("fastify-slonik");
```

or

```js
import fastifySlonik from "fastify-slonik";
```

### Register the Plugin

```js
// register fastify-slonik
try {
  fastify.register(fastifySlonik, {
  connectionString: process.env.DATABASE_URL,
  })
} catch(err) {
  console.log("🔴 Failed to connect, check your Connection string")
  throw new Error(err);
}


// setup test route
fastify.get('/users', async function (request, reply) {
  const { params: { id: userId } } = request

  const queryText = this.sql`
    SELECT * FROM users
    WHERE user_id = ${userId}
  `

  const user = await this.slonik.query(queryText)

  reply.send(user)
}
```

## API

#### Decorator

This plugin decorates fastify with `slonik` exposing `connect`, `pool`, `query`, `transaction` and `exists`.
View [Slonik API](https://github.com/gajus/slonik#slonik-usage-api) for details.

## Development and Testing

[Tap](https://node-tap.org/) is used for testing. Use `npm test` command to run tests.

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

## Inspirations

[@autotelic/fastify-slonik](https://github.com/autotelic/fastify-slonik)
