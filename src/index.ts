import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import {
  createPool,
  DatabasePoolType,
  sql,
  TaggedTemplateLiteralInvocationType,
} from "slonik";

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
    throw new Error(error);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/require-await
    await pool.connect(async () => {
      fastify.log.info("✅ Connected to Postgres DB");
    });
  } catch (err) {
    fastify.log.error("🔴 Error happened while connecting to Postgres DB");
  }

  async function transaction(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    connection: TaggedTemplateLiteralInvocationType<unknown>
  ) {
    return pool.query(connection);
  }

  const db = {
    connect: pool.connect.bind(pool),
    pool,
    query: pool.query.bind(pool),
    transaction: transaction.bind(pool),
    exists: pool.exists.bind(pool),
  };

  fastify.decorate("slonik", db);
  fastify.decorate("sql", sql);
};

export default fastifyPlugin(fastifySlonik, {
  fastify: "3.x",
  name: "fastify-slonik",
});
