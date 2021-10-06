import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { DatabasePoolType } from "slonik";
import { createPool, sql } from "slonik";

type SlonikOptions = {
  connectionString: string;
};

const fastifySlonik = async (
  fastify: FastifyInstance,
  options: SlonikOptions
) => {
  const { connectionString } = options;
  let pool: DatabasePoolType;
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

// eslint-disable-next-line import/no-default-export
export default fastifyPlugin(fastifySlonik, {
  fastify: "3.x",
  name: "fastify-slonik",
});
