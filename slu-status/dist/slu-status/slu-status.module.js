"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SluStatusModule = void 0;
const common_1 = require("@nestjs/common");
const slu_status_controller_1 = require("./slu-status.controller");
const slu_status_service_1 = require("./slu-status.service");
const mongoose_1 = require("@nestjs/mongoose");
const slu_status_schema_1 = require("./schema/slu-status.schema");
let SluStatusModule = class SluStatusModule {
};
SluStatusModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: slu_status_schema_1.SluStatus.name, schema: slu_status_schema_1.SluStatusSchema }])],
        controllers: [slu_status_controller_1.SluStatusController],
        providers: [slu_status_service_1.SluStatusService]
    })
], SluStatusModule);
exports.SluStatusModule = SluStatusModule;
//# sourceMappingURL=slu-status.module.js.map