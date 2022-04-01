import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SluNonce, SluNonceDocument, SluNonceSchema } from './schema/slu-nonce.schema';
import { SluNonceService } from './slu-nonce.service';
import { Connection, Model } from 'mongoose';
import { DeleteResult } from 'mongodb';

describe('SluNonceService', () => {
	let service: SluNonceService;
	let mongod: MongoMemoryServer;
	let connection: Connection;
	let sluNonceModel: Model<SluNonceDocument>;
	let sluNonce: SluNonce;

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
				MongooseModule.forFeature([{ name: SluNonce.name, schema: SluNonceSchema }])
			],
			providers: [SluNonceService]
		}).compile();

		service = module.get<SluNonceService>(SluNonceService);
		connection = module.get<Connection>(getConnectionToken());
		sluNonceModel = module.get<Model<SluNonceDocument>>(getModelToken(SluNonce.name));

		sluNonce = { sluId: 'did:iota:12345', nonce: '15a3e28c-8800-4132-9042-76e24f3dce54', creator: 'did:iota:54321' };
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should save Slu-Nonce', async () => {
		const response: SluNonce = await service.saveSluNonce(sluNonce);
		expect(response).toEqual(sluNonce);
	});

	it('should get Slu-Nonce', async () => {
		await new sluNonceModel(sluNonce).save();

		const response = await service.getSluNonce('did:iota:12345', 'did:iota:54321');

		expect(response).toEqual(sluNonce);
	});

	it('should get Slu-Nonce with empty nonce', async () => {
		await new sluNonceModel(sluNonce).save();

		const response = await service.getSluNonce('did:iota:12345', 'did:iota:64321');
		sluNonce.nonce = '';

		expect(response).toEqual(sluNonce);
	});

	it('should delete Slu-Nonce', async () => {
		await new sluNonceModel(sluNonce).save();
		const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 };

		const response = await service.deleteSluNonce('did:iota:12345', 'did:iota:54321');

		expect(response).toEqual(deleteResult);
	});

	it('should fail to delete Slu-Nonce', async () => {
		await new sluNonceModel(sluNonce).save();

		const response = service.deleteSluNonce('did:iota:12345', 'did:iota:64321');

		await expect(response).rejects.toThrow('not the creator of slu-nonce');
	});

	it('should get Slu-Nonces list', async () => {
		const sluNonce2: SluNonce = { sluId: 'did:iota:123456', nonce: '15a3e28c-8800-4132-9042-76e24f3dce54', creator: 'did:iota:54321' };
		const sluNonce3: SluNonce = { sluId: 'did:iota:1234567', nonce: '15a3e28c-8800-4132-9042-76e24f3dce54', creator: 'did:iota:64321' };

		await new sluNonceModel(sluNonce).save();
		await new sluNonceModel(sluNonce2).save();
		await new sluNonceModel(sluNonce3).save();

		const result = await service.getSluNonces(['did:iota:12345', 'did:iota:123456', 'did:iota:1234567'], 'did:iota:54321');
		sluNonce3.nonce = '';

		expect(result).toEqual([sluNonce, sluNonce2, sluNonce3]);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) mongod.stop();
	});
});
