import { config } from 'dotenv';
import Fastify from 'fastify';
import { sql } from 'slonik';
import { test } from 'tap';
import fastifySlonik from '../src/index';
config();

const connectionString = process.env.DATABASE_URL as string;
const BAD_DB_NAME = 'db_that_does_not_exist';
const connectionStringBadDbName = connectionString.replace(
  /\/[^/]+$/,
  '/' + BAD_DB_NAME
);

declare module 'fastify' {
  interface FastifyInstance {
    slonik: any;
    sql: typeof sql;
  }
}

test('Namespace should exist:', async tap => {
  const fastify = Fastify();

  // @ts-ignore
  tap.teardown(() => fastify.close());

  fastify.register(fastifySlonik, { connectionString, queryLogging: true });
  await fastify.ready();

  tap.ok(fastify.hasDecorator('slonik'), 'has slonik decorator');
  tap.ok(fastify.slonik.pool);
  tap.ok(fastify.slonik.connect);
  tap.ok(fastify.slonik.query);
  tap.ok(fastify.slonik.transaction);
  tap.ok(fastify.slonik.exists);
  tap.ok(fastify.hasDecorator('sql'), 'has sql decorator');
});

test('When fastify.slonik root namespace is used:', async t => {
  const testName = 'foobar';

  const fastify = Fastify();

  t.teardown(async () => {
    const removeUser = fastify.sql`
      DELETE FROM
        users
      WHERE
        username=${testName};
    `;
    await fastify.slonik.transaction(removeUser);
    fastify.close();
  });

  fastify.register(fastifySlonik, { connectionString });
  await fastify.ready();

  t.test('should be able to make a query', async t => {
    const queryString = fastify.sql`
      SELECT 1 as one
    `;
    const queryResult = await fastify.slonik.query(queryString);
    const {
      rows: [{ one }],
    } = queryResult;
    t.equal(one, 1);
  });

  t.test('should be able to make a transaction', async t => {
    const queryString = fastify.sql`
      INSERT INTO
        users(username)
      VALUES
        (${testName})
      RETURNING
        *;
    `;
    const queryResult = await fastify.slonik.transaction(queryString);
    const {
      rows: [{ username }],
    } = queryResult;
    t.equal(username, testName);
  });

  t.test('should be able to make a exists query', async t => {
    const queryString = fastify.sql`
      SELECT
        1
      FROM
        users
      WHERE
        username=${testName}
    `;
    const queryResult = await fastify.slonik.exists(queryString);
    t.ok(queryResult);
  });
});

test('should throw error when pg fails to perform an operation', async t => {
  const fastify = Fastify();
  // @ts-ignore
  t.teardown(() => fastify.close());

  fastify.register(fastifySlonik, {
    connectionString: connectionStringBadDbName,
  });

  await fastify.ready();

  const queryString = fastify.sql`
    SELECT 1 as one
  `;

  try {
    const queryResult = await fastify.slonik.query(queryString);
    t.fail(queryResult);
  } catch (err) {
    t.ok(err);
    if (err.message === `FATAL:  database "${BAD_DB_NAME}" does not exist`)
      t.ok(err.message);
  }
});
