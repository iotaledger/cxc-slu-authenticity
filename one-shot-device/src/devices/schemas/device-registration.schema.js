"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DeviceRegistrationSchema = exports.DeviceRegistration = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var mongoose_2 = require("mongoose");
var DeviceRegistration = /** @class */ (function (_super) {
    __extends(DeviceRegistration, _super);
    function DeviceRegistration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, mongoose_1.Prop)({ required: true })
    ], DeviceRegistration.prototype, "nonce");
    __decorate([
        (0, mongoose_1.Prop)({ required: true })
    ], DeviceRegistration.prototype, "channelId");
    __decorate([
        (0, mongoose_1.Prop)({ required: true })
    ], DeviceRegistration.prototype, "channelSeed");
    __decorate([
        (0, mongoose_1.Prop)({ required: true })
    ], DeviceRegistration.prototype, "identityKeys");
    DeviceRegistration = __decorate([
        (0, mongoose_1.Schema)({ collection: 'slu_bootstrap', versionKey: false })
    ], DeviceRegistration);
    return DeviceRegistration;
}(mongoose_2.Document));
exports.DeviceRegistration = DeviceRegistration;
exports.DeviceRegistrationSchema = mongoose_1.SchemaFactory.createForClass(DeviceRegistration);
