"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SluStatusSchema = exports.SluStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const class_validator_1 = require("class-validator");
const Status_1 = require("../model/Status");
let SluStatus = class SluStatus {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    (0, class_validator_1.Contains)('did:iota:'),
    __metadata("design:type", String)
], SluStatus.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SluStatus.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SluStatus.prototype, "channelAddress", void 0);
SluStatus = __decorate([
    (0, mongoose_1.Schema)({ collection: 'slu_status', versionKey: false })
], SluStatus);
exports.SluStatus = SluStatus;
exports.SluStatusSchema = mongoose_1.SchemaFactory.createForClass(SluStatus);
//# sourceMappingURL=slu-status.schema.js.map