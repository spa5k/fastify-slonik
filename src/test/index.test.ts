/* eslint-disable import/order */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { config } from "dotenv";
import fastify from "fastify";
import type { sql } from "slonik";
import { test } from "tap";
import fastifySlonik from "..";

config();

const DATABASE_URL = process.env.DATABASE_URL as string;
const BAD_DB_NAME = "db_that_does_not_exist";
const connectionStringBadDbName = DATABASE_URL.replace(
  /\/[^/]+$/u,
  `/${BAD_DB_NAME}`
);

declare module "fastify" {
  interface FastifyInstance {
    slonik: any;
    sql: typeof sql;
  }
}

const main = async () => {
  try {
    await test("Namespace should exist:", async (tap) => {
      const app = fastify();

      // @ts-expect-error
      tap.teardown(() => app.close());

      await app.register(fastifySlonik, {
        connectionString: DATABASE_URL,
      });
      await app.ready();

      tap.ok(app.hasDecorator("slonik"), "has slonik decorator");
      tap.ok(app.slonik.pool);
      tap.ok(app.slonik.connect);
      tap.ok(app.slonik.query);
      tap.ok(app.slonik.transaction);
      tap.ok(app.slonik.exists);
      tap.ok(app.hasDecorator("sql"), "has sql decorator");
    });
  } catch (error) {
    console.log("Namespace should exist failed");
    throw new Error(error);
  }

  try {
    await test("When fastify.slonik root namespace is used:", async (t) => {
      const testName = "foobar";

      const app = fastify();

      t.teardown(async () => {
        const removeUser = app.sql`
        DELETE FROM
          users
        WHERE
          username=${testName};
      `;
        await app.slonik.transaction(removeUser);
        await app.close();
      });

      await app.register(fastifySlonik, { connectionString: DATABASE_URL });
      await app.ready();

      await t.test("should be able to make a query", async (t0) => {
        const queryString = app.sql`
        SELECT 1 as one
      `;
        const queryResult = await app.slonik.query(queryString);
        const {
          rows: [{ one }],
        } = queryResult;
        t0.equal(one, 1);
      });

      await t.test("should be able to make a transaction", async (t1) => {
        const queryString = app.sql`
        INSERT INTO
          users(username)
        VALUES
          (${testName})
        RETURNING
          *;
      `;
        const queryResult = await app.slonik.transaction(queryString);
        const {
          rows: [{ username }],
        } = queryResult;
        t1.equal(username, testName);
      });

      await t.test("should be able to make a exists query", async (t2) => {
        const queryString = app.sql`
        SELECT
          1
        FROM
          users
        WHERE
          username=${testName}
      `;
        const queryResult = await app.slonik.exists(queryString);
        t2.ok(queryResult);
      });
    });
  } catch (error) {
    console.log("When fastify.slonik root namespace is used: Failed");
    throw new Error(error);
  }

  try {
    await test("should throw error when pg fails to perform an operation", async (t) => {
      const app = fastify();
      // @ts-expect-error
      t.teardown(() => app.close());

      await app.register(fastifySlonik, {
        connectionString: connectionStringBadDbName,
      });

      await app.ready();

      const queryString = app.sql`
      SELECT 1 as one
    `;

      try {
        const queryResult = await app.slonik.query(queryString);
        t.fail(queryResult);
      } catch (error) {
        t.ok(error);
        if (
          error.message === `FATAL:  database "${BAD_DB_NAME}" does not exist`
        ) {
          t.ok(error.message);
        }
      }
    });
  } catch (error) {
    console.log(
      "should throw error when pg fails to perform an operation: Failed"
    );
    throw new Error(error);
  }
};

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.log(error);
});
