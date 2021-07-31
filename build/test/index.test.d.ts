import { sql } from 'slonik';
declare module 'fastify' {
    interface FastifyInstance {
        slonik: any;
        sql: typeof sql;
    }
}
