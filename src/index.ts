import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { createPool, sql, TaggedTemplateLiteralInvocationType } from "slonik";
import { createQueryLoggingInterceptor } from "slonik-interceptor-query-logging";

type SlonikOptions = {
  connectionString: string;
  queryLogging?: boolean;
};

const fastifySlonik = async (
  fastify: FastifyInstance,
  options: SlonikOptions
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const interceptors = [createQueryLoggingInterceptor()];
  const { connectionString, queryLogging } = options;
  const pool = createPool(connectionString, {
    interceptors: queryLogging ? interceptors : [],
  });

  try {
    // eslint-disable-next-line @typescript-eslint/require-await
    await pool.connect(async () => {
      fastify.log.info("Connected to Postgres DB");
    });
  } catch (err) {
    fastify.log.error("Error happened while connecting to Postgres DB", err);
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
