import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityClient } from '@iota/is-client';
import { defaultConfig } from '../../configuration';
import { CollectorIdentityService } from './collector-identity.service';

describe('CollectorIdentityService', () => {
	let service: CollectorIdentityService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CollectorIdentityService, ConfigService, { provide: 'IdentityClient', useValue: new IdentityClient(defaultConfig) }]
		}).compile();

		service = module.get<CollectorIdentityService>(CollectorIdentityService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('provided with the right id and secret', async () => {
		const identityClientSpy = jest.spyOn(IdentityClient.prototype, 'authenticate').mockResolvedValue();

		await service.checkCollectorIdentity();

		expect(identityClientSpy).toBeCalled();
	});

	it('should throw error: no env vars provided', async () => {
		process.env.COLLECTOR_DID = '';
		process.env.COLLECTOR_SECRET = '';

		const response = service.checkCollectorIdentity();

		expect(response).rejects.toThrowError('no COLLECTOR_DID and/or COLLECTOR_SECRET is provided')

	})
});
