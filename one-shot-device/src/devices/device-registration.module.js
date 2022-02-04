"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DeviceRegistrationModule = void 0;
var common_1 = require("@nestjs/common");
var mongoose_1 = require("@nestjs/mongoose");
var config_1 = require("@nestjs/config");
var device_registration_controller_1 = require("./device-registration.controller");
var device_registration_service_1 = require("./device-registration.service");
var device_registration_schema_1 = require("./schemas/device-registration.schema");
var DeviceRegistrationModule = /** @class */ (function () {
    function DeviceRegistrationModule() {
    }
    DeviceRegistrationModule = __decorate([
        (0, common_1.Module)({
            imports: [
                mongoose_1.MongooseModule.forFeature([
                    { name: device_registration_schema_1.DeviceRegistration.name, schema: device_registration_schema_1.DeviceRegistrationSchema },
                ]),
            ],
            controllers: [device_registration_controller_1.DeviceRegistrationController],
            providers: [device_registration_service_1.DeviceRegistrationService, config_1.ConfigService]
        })
    ], DeviceRegistrationModule);
    return DeviceRegistrationModule;
}());
exports.DeviceRegistrationModule = DeviceRegistrationModule;
