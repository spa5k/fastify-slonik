/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from "dotenv";
import fastify from "fastify";
import { test } from "tap";
import { fastifySlonik } from "..";

config();

const DATABASE_URL = process.env.DATABASE_URL as string;
const BAD_DB_NAME = "db_that_does_not_exist";
const connectionStringBadDbName = DATABASE_URL.replace(
  /\/[^/]+$/u,
  `/${BAD_DB_NAME}`
);

const main = async () => {
  try {
    await test("Namespace should exist:", async (tap) => {
      const app = await fastify();

      tap.teardown(() => app.close());

      await app.register(fastifySlonik, {
        connectionString: DATABASE_URL,
      });
      await app.ready();

      tap.ok(app.hasDecorator("slonik"), "has slonik decorator");
      tap.ok(app.slonik.pool);
      tap.ok(app.slonik.connect);
      tap.ok(app.slonik.query);
      tap.ok(app.hasDecorator("sql"), "has sql decorator");
      tap.ok(app.sql);
      tap.ok(app.hasRequestDecorator("sql"), "has sql decorator");
      tap.ok(app.hasRequestDecorator("slonik"), "has slonik decorator");
    });
  } catch (error) {
    console.log("Namespace should exist failed");
    throw new Error(error as string);
  }

  try {
    await test("When fastify.slonik root namespace is used:", async (t) => {
      const testName = "foobar";

      const app = await fastify();

      t.teardown(async () => {
        const removeUser = app.sql`
        DELETE FROM
          users
        WHERE
          username=${testName};
      `;
        await app.slonik.query(removeUser);
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
    });
  } catch (error) {
    console.log("When fastify.slonik root namespace is used: Failed");
    throw new Error(error as string);
  }

  try {
    await test("should throw error when pg fails to perform an operation", async (t) => {
      const app = await fastify();
      t.teardown(() => app.close());

      try {
        // Below line fails when such db name does not exist in slonik v30.0.0 and above
        await app.register(fastifySlonik, {
          connectionString: connectionStringBadDbName,
        });

        await app.ready();

        const queryString = app.sql`
        SELECT 1 as one
        `;

        const queryResult = await app.slonik.query(queryString);
        // @ts-expect-error Query result failed
        t.fail(queryResult);
      } catch (error: any) {
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
    throw new Error(error as string);
  }
};

main().catch((error) => {
  console.log(error);
});
