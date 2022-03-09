"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const slu_status_module_1 = require("./slu-status/slu-status.module");
const mongoose_1 = require("@nestjs/mongoose");
const api_key_middleware_1 = require("./middleware/api-key.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(api_key_middleware_1.ApiKeyMiddleware).forRoutes('status');
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            slu_status_module_1.SluStatusModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true
            }),
            mongoose_1.MongooseModule.forRoot(process.env.DATABASE_URL, { dbName: process.env.DATABASE_NAME })
        ]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map