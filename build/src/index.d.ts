/// <reference types="node" />
declare type SlonikOptions = {
    connectionString: string;
    queryLogging?: true | boolean | null;
};
declare const _default: import("fastify").FastifyPluginAsync<SlonikOptions, import("http").Server>;
export default _default;
