"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CreateDeviceRegistrationDto = exports.IdentityKeysData = exports.IdentityKeyObject = void 0;
var identity_1 = require("../../../node_modules/iota-is-sdk/lib/models/schemas/identity");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var IdentityKeyObject = /** @class */ (function () {
    function IdentityKeyObject() {
    }
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)()
    ], IdentityKeyObject.prototype, "type");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)()
    ], IdentityKeyObject.prototype, "public");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)()
    ], IdentityKeyObject.prototype, "secret");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsEnum)(identity_1.Encoding)
    ], IdentityKeyObject.prototype, "encoding");
    return IdentityKeyObject;
}());
exports.IdentityKeyObject = IdentityKeyObject;
var IdentityKeysData = /** @class */ (function () {
    function IdentityKeysData() {
    }
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)()
    ], IdentityKeysData.prototype, "id");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsObject)()
    ], IdentityKeysData.prototype, "key");
    return IdentityKeysData;
}());
exports.IdentityKeysData = IdentityKeysData;
var CreateDeviceRegistrationDto = /** @class */ (function () {
    function CreateDeviceRegistrationDto() {
    }
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)()
    ], CreateDeviceRegistrationDto.prototype, "nonce");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)()
    ], CreateDeviceRegistrationDto.prototype, "channelId");
    __decorate([
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)()
    ], CreateDeviceRegistrationDto.prototype, "channelSeed");
    __decorate([
        (0, class_transformer_1.Type)(function () { return IdentityKeysData; }),
        (0, class_validator_1.ValidateNested)({ each: true })
    ], CreateDeviceRegistrationDto.prototype, "identityKeys");
    return CreateDeviceRegistrationDto;
}());
exports.CreateDeviceRegistrationDto = CreateDeviceRegistrationDto;
