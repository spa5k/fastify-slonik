"use strict";
exports.__esModule = true;
var tslib_1 = require("tslib");
var dotenv_1 = require("dotenv");
// require('dotenv').config();
var fastify_1 = tslib_1.__importDefault(require("fastify"));
var tap_1 = require("tap");
var index_1 = tslib_1.__importDefault(require("../src/index"));
dotenv_1.config();
var connectionString = process.env.DATABASE_URL;
var BAD_DB_NAME = 'db_that_does_not_exist';
var connectionStringBadDbName = connectionString.replace(/\/[^/]+$/, '/' + BAD_DB_NAME);
tap_1.test('Namespace should exist:', function (tap) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var fastify;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fastify = fastify_1["default"]();
                // @ts-ignore
                tap.teardown(function () { return fastify.close(); });
                fastify.register(index_1["default"], { connectionString: connectionString, queryLogging: true });
                return [4 /*yield*/, fastify.ready()];
            case 1:
                _a.sent();
                tap.ok(fastify.hasDecorator('slonik'), 'has slonik decorator');
                tap.ok(fastify.slonik.pool);
                tap.ok(fastify.slonik.connect);
                tap.ok(fastify.slonik.query);
                tap.ok(fastify.slonik.transaction);
                tap.ok(fastify.slonik.exists);
                tap.ok(fastify.hasDecorator('sql'), 'has sql decorator');
                return [2 /*return*/];
        }
    });
}); });
tap_1.test('When fastify.slonik root namespace is used:', function (t) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var testName, fastify;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                testName = 'foobar';
                fastify = fastify_1["default"]();
                t.teardown(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var removeUser;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                removeUser = fastify.sql(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n      DELETE FROM\n        users\n      WHERE\n        username=", ";\n    "], ["\n      DELETE FROM\n        users\n      WHERE\n        username=", ";\n    "])), testName);
                                return [4 /*yield*/, fastify.slonik.transaction(removeUser)];
                            case 1:
                                _a.sent();
                                fastify.close();
                                return [2 /*return*/];
                        }
                    });
                }); });
                fastify.register(index_1["default"], { connectionString: connectionString });
                return [4 /*yield*/, fastify.ready()];
            case 1:
                _a.sent();
                t.test('should be able to make a query', function (t) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var queryString, queryResult, one;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                queryString = fastify.sql(templateObject_2 || (templateObject_2 = tslib_1.__makeTemplateObject(["\n      SELECT 1 as one\n    "], ["\n      SELECT 1 as one\n    "])));
                                return [4 /*yield*/, fastify.slonik.query(queryString)];
                            case 1:
                                queryResult = _a.sent();
                                one = queryResult.rows[0].one;
                                t.equal(one, 1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                t.test('should be able to make a transaction', function (t) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var queryString, queryResult, username;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                queryString = fastify.sql(templateObject_3 || (templateObject_3 = tslib_1.__makeTemplateObject(["\n      INSERT INTO\n        users(username)\n      VALUES\n        (", ")\n      RETURNING\n        *;\n    "], ["\n      INSERT INTO\n        users(username)\n      VALUES\n        (", ")\n      RETURNING\n        *;\n    "])), testName);
                                return [4 /*yield*/, fastify.slonik.transaction(queryString)];
                            case 1:
                                queryResult = _a.sent();
                                username = queryResult.rows[0].username;
                                t.equal(username, testName);
                                return [2 /*return*/];
                        }
                    });
                }); });
                t.test('should be able to make a exists query', function (t) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var queryString, queryResult;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                queryString = fastify.sql(templateObject_4 || (templateObject_4 = tslib_1.__makeTemplateObject(["\n      SELECT\n        1\n      FROM\n        users\n      WHERE\n        username=", "\n    "], ["\n      SELECT\n        1\n      FROM\n        users\n      WHERE\n        username=", "\n    "])), testName);
                                return [4 /*yield*/, fastify.slonik.exists(queryString)];
                            case 1:
                                queryResult = _a.sent();
                                t.ok(queryResult);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
tap_1.test('should throw error when pg fails to perform an operation', function (t) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var fastify, queryString, queryResult, err_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fastify = fastify_1["default"]();
                // @ts-ignore
                t.teardown(function () { return fastify.close(); });
                fastify.register(index_1["default"], {
                    connectionString: connectionStringBadDbName
                });
                return [4 /*yield*/, fastify.ready()];
            case 1:
                _a.sent();
                queryString = fastify.sql(templateObject_5 || (templateObject_5 = tslib_1.__makeTemplateObject(["\n    SELECT 1 as one\n  "], ["\n    SELECT 1 as one\n  "])));
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, fastify.slonik.query(queryString)];
            case 3:
                queryResult = _a.sent();
                t.fail(queryResult);
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                t.ok(err_1);
                if (err_1.message === "FATAL:  database \"" + BAD_DB_NAME + "\" does not exist")
                    t.ok(err_1.message);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
//# sourceMappingURL=index.test.js.map