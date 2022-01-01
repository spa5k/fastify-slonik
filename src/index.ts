import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { DatabasePool } from "slonik";
import { createPool, sql } from "slonik";

type SlonikOptions = {
  connectionString: string;
};

const plugin = async (fastify: FastifyInstance, options: SlonikOptions) => {
  const { connectionString } = options;
  let pool: DatabasePool;
  try {
    pool = createPool(connectionString);
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

  fastify.decorate("slonik", db);
  fastify.decorate("sql", sql);
};

export const fastifySlonik = fastifyPlugin(plugin, {
  fastify: "3.x",
  name: "fastify-slonik",
});
