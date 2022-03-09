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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SluStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SluStatusService = void 0;
const common_1 = require("@nestjs/common");
const slu_status_schema_1 = require("./schema/slu-status.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let SluStatusService = SluStatusService_1 = class SluStatusService {
    constructor(sluStatusModel) {
        this.sluStatusModel = sluStatusModel;
        this.logger = new common_1.Logger(SluStatusService_1.name);
    }
    async saveSluStatus(sluStatus) {
        return await new this.sluStatusModel(sluStatus).save();
    }
    async updateSluStatus(id, status) {
        return await this.sluStatusModel.findOneAndUpdate({ id: id }, { status: status }, { new: true, fields: { _id: 0 } });
    }
    async getSluStatus(id) {
        var _a;
        const slu = await this.sluStatusModel.find({ id: id }, undefined, { fields: { _id: 0 } }).lean();
        return (_a = slu[0]) === null || _a === void 0 ? void 0 : _a.status;
    }
};
SluStatusService = SluStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(slu_status_schema_1.SluStatus.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SluStatusService);
exports.SluStatusService = SluStatusService;
//# sourceMappingURL=slu-status.service.js.map