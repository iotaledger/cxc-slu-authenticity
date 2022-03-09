import { Test, TestingModule } from '@nestjs/testing';
import { SluStatusService } from './slu-status.service';
import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus, SluStatusDocument, SluStatusSchema } from './schema/slu-status.schema';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { Status } from './model/Status';

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
						const mongoUri = mongod.getUri();
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
		const savedSluStatus = await service.saveSluStatus(body);
		const dbResult = await sluStatusModel.find({ id: body.id });
		expect(dbResult[0].toJSON()).toEqual(savedSluStatus.toJSON());
	});

	it('should throw error because of duplicate key error', async () => {
		await service.saveSluStatus(body);
		const duplicateSave = service.saveSluStatus(body);
		// eslint-disable-next-line prettier/prettier
		const errorMessage = 'E11000 duplicate key error collection: test.slu_status index: id_1 dup key: { id: "did:iota:1223455" }';
		await expect(duplicateSave).rejects.toThrow(errorMessage);
	});

	it('should update slu-status', async () => {
		await service.saveSluStatus(body);
		const update = {
			id: 'did:iota:1223455',
			status: Status.INSTALLED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		const result = await service.updateSluStatus(update.id, update.status);
		expect(result.toJSON()).toEqual(update);
	});

	it('should be null: no slu under this id', async () => {
		await service.saveSluStatus(body);
		const update = {
			id: 'id:iota:1223455',
			status: Status.INSTALLED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		const result = await service.updateSluStatus(update.id, update.status);
		expect(result).toBeNull();
	});

	it('should return status', async () => {
		const savedSluStatus = await service.saveSluStatus(body);
		const getSavedSluStatus = await service.getSluStatus(body.id);
		expect(getSavedSluStatus).toBe(savedSluStatus.status);
	});

	it('should be undefined: no status under this id', async () => {
		const getSavedSluStatus = await service.getSluStatus('id:iota:1223456');
		expect(getSavedSluStatus).toBeUndefined();
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
