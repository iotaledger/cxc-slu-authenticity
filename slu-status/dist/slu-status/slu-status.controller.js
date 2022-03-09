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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SluStatusController = void 0;
const common_1 = require("@nestjs/common");
const SluStatusDto_1 = require("./model/SluStatusDto");
const Status_1 = require("./model/Status");
const slu_status_validation_pipe_1 = require("./pipes/slu-status-validation.pipe");
const slu_status_service_1 = require("./slu-status.service");
let SluStatusController = class SluStatusController {
    constructor(statuService) {
        this.statuService = statuService;
    }
    async createSluStatus(body) {
        return await this.statuService.saveSluStatus(body);
    }
    async updateSluStatus(id, status) {
        return await this.statuService.updateSluStatus(id, status);
    }
    async getStatusInfo(id) {
        return await this.statuService.getSluStatus(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new slu_status_validation_pipe_1.SluStatusValidationPipe()),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SluStatusDto_1.SluStatusDto]),
    __metadata("design:returntype", Promise)
], SluStatusController.prototype, "createSluStatus", null);
__decorate([
    (0, common_1.Put)(':id/:status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('status', new common_1.ParseEnumPipe(Status_1.Status))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SluStatusController.prototype, "updateSluStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SluStatusController.prototype, "getStatusInfo", null);
SluStatusController = __decorate([
    (0, common_1.Controller)('status'),
    __metadata("design:paramtypes", [slu_status_service_1.SluStatusService])
], SluStatusController);
exports.SluStatusController = SluStatusController;
//# sourceMappingURL=slu-status.controller.js.map