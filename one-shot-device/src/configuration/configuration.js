"use strict";
exports.__esModule = true;
exports.defaultManagerConfig = exports.defaultConfig = void 0;
var iota_is_sdk_1 = require("iota-is-sdk");
var dotenv = require("dotenv");
dotenv.config();
exports.defaultConfig = {
    apiKey: process.env.API_KEY,
    baseUrl: process.env.API_URL,
    apiVersion: iota_is_sdk_1.ApiVersion.v01
};
exports.defaultManagerConfig = {
    mongoURL: process.env.MONGO_URL,
    databaseName: process.env.DB_NAME,
    secretKey: process.env.SECRET_KEY
};
