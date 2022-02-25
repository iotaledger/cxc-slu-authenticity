import { Test, TestingModule } from '@nestjs/testing';
import { SluStatusService } from './slu-status.service';
import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus, SluStatusDocument, SluStatusSchema } from './schema/slu-status.schema';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { Status } from './model/Status';
import { BadRequestException } from '@nestjs/common';

describe('StatusService', () => {
	let service: SluStatusService;
	let body: SluStatusDto;
	let mongod: MongoMemoryServer;
	let connection: Connection;
	let sluStatusModel: Model<SluStatusDocument>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create();
						let mongoUri = mongod.getUri();
						return {
							uri: mongoUri
						};
					}
				}),
				MongooseModule.forFeature([{ name: SluStatus.name, schema: SluStatusSchema }])
			],
			providers: [SluStatusService]
		}).compile();

		service = module.get<SluStatusService>(SluStatusService);
		connection = module.get<Connection>(getConnectionToken());
		sluStatusModel = module.get<Model<SluStatusDocument>>(getModelToken(SluStatus.name));

		body = {
			id: 'did:iota:1223455',
			status: Status.CREATED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should save SluStatus', async () => {
		const response = await service.saveSluStatus(body);
		const dbResult = await sluStatusModel.find({ id: body.id }).lean();
		delete dbResult[0]._id;
		expect(response).toEqual(dbResult[0]);
	});

	it('should throw error because of duplicate key error', async () => {
		await service.saveSluStatus(body);
		const duplicateSave = service.saveSluStatus(body);
		await expect(duplicateSave).rejects.toThrow(BadRequestException);
	});

	it('should update slu-status', async () => {
		await service.saveSluStatus(body);
		const update = {
			id: 'did:iota:1223455',
			status: Status.INSTALLED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		const result = await service.updateSluStatus(update.id, update.status);
		expect(result).toEqual(update);
	});

	it('should throw error because of wrong id', async () => {
		await service.saveSluStatus(body);
		const update = {
			id: 'id:iota:1223455',
			status: Status.INSTALLED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		const result = service.updateSluStatus(update.id, update.status);
		await expect(result).rejects.toThrow(BadRequestException);
	});

	it('should return status', async () => {
		const savedSluStatus = await service.saveSluStatus(body);
		const getSavedSluStatus = await service.getSluStatus(body.id);
		expect(getSavedSluStatus).toBe(savedSluStatus.status);
	});

	it('wrong id should throw error', async () => {
		const getSavedSluStatus = service.getSluStatus('id:iota:1223456');
		await expect(getSavedSluStatus).rejects.toThrow(BadRequestException);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
