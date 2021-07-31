"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var fastify_plugin_1 = tslib_1.__importDefault(require("fastify-plugin"));
var slonik_1 = require("slonik");
var slonik_interceptor_query_logging_1 = require("slonik-interceptor-query-logging");
var fastifySlonik = function (fastify, options) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    function transaction(
    // @ts-ignore
    connection) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, pool.query(connection)];
            });
        });
    }
    var interceptors, connectionString, queryLogging, pool, err_1, db;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                interceptors = [slonik_interceptor_query_logging_1.createQueryLoggingInterceptor()];
                connectionString = options.connectionString, queryLogging = options.queryLogging;
                pool = slonik_1.createPool(connectionString, {
                    interceptors: queryLogging ? interceptors : []
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, pool.connect(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        return tslib_1.__generator(this, function (_a) {
                            fastify.log.info('Connected to Postgres DB Using -> ', connectionString);
                            return [2 /*return*/];
                        });
                    }); })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                fastify.log.error('Error happened while connecting to Postgres DB -> ', err_1);
                return [3 /*break*/, 4];
            case 4:
                db = {
                    connect: pool.connect.bind(pool),
                    pool: pool,
                    query: pool.query.bind(pool),
                    transaction: transaction.bind(pool),
                    exists: pool.exists.bind(pool)
                };
                fastify.decorate('slonik', db);
                fastify.decorate('sql', slonik_1.sql);
                return [2 /*return*/];
        }
    });
}); };
exports["default"] = fastify_plugin_1["default"](fastifySlonik, {
    fastify: '3.x',
    name: 'fastify-slonik'
});
//# sourceMappingURL=index.js.map