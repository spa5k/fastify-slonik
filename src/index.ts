/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { DatabasePool } from "slonik";
import { createPool, sql } from "slonik";
import type {
  ConnectionRoutine,
  QueryFunction,
  SqlTaggedTemplate,
} from "slonik/dist/src/types";

type SlonikOptions = {
  connectionString: string;
};

// using declaration merging, add your plugin props to the appropriate fastify interfaces
declare module "fastify" {
  interface FastifyRequest {
    slonik: {
      connect: <T>(connectionRoutine: ConnectionRoutine<T>) => Promise<T>;
      pool: DatabasePool;
      query: QueryFunction;
    };
    sql: SqlTaggedTemplate;
  }
  interface FastifyInstance {
    slonik: {
      connect: <T>(connectionRoutine: ConnectionRoutine<T>) => Promise<T>;
      pool: DatabasePool;
      query: QueryFunction;
    };
    sql: SqlTaggedTemplate;
  }
}

const plugin = async (fastify: FastifyInstance, options: SlonikOptions) => {
  const { connectionString } = options;
  let pool: DatabasePool;
  try {
    pool = await createPool(connectionString);
  } catch (error) {
    fastify.log.error("🔴 Error happened while connecting to Postgres DB");
    throw new Error(error as string);
  }

  try {
    await pool.connect(async () => {
      fastify.log.info("✅ Connected to Postgres DB");
    });
  } catch {
    fastify.log.error("🔴 Error happened while connecting to Postgres DB");
  }

  const db = {
    connect: pool.connect.bind(pool),
    pool,
    query: pool.query.bind(pool),
  };

  if (!fastify.hasDecorator("slonik") && !fastify.hasDecorator("sql")) {
    fastify.decorate("slonik", db);
    fastify.decorate("sql", sql);
  }

  if (
    !fastify.hasRequestDecorator("slonik") &&
    !fastify.hasRequestDecorator("sql")
  ) {
    fastify.decorateRequest("slonik", null);
    fastify.decorateRequest("sql", null);

    fastify.addHook("onRequest", async (req) => {
      req.slonik = db;
      req.sql = sql;
    });
  }
};

export const fastifySlonik = fastifyPlugin(plugin, {
  fastify: "4.x",
  name: "fastify-slonik",
});

// eslint-disable-next-line import/no-default-export
export default fastifyPlugin(plugin, {
  fastify: "4.x",
  name: "fastify-slonik",
});
