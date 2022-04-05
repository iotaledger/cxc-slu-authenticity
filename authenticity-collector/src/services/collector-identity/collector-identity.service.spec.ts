import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityClient, IdentityJson } from 'iota-is-sdk/lib';
import { defaultConfig } from '../../configuration';
import { CollectorIdentityService } from './collector-identity.service';
import * as fs from 'fs';

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

	it('provided with the right id and secret', async () => {
		const identityClientSpy = jest.spyOn(IdentityClient.prototype, 'authenticate').mockResolvedValue();

		await service.checkCollectorIdentity();

		expect(identityClientSpy).toBeCalled();
	});

	it('provided env vars are matching with identitiy file', async () => {
		const identityJson: IdentityJson = {
			doc: {
				id: 'iota:did:12345'
			},
			key: {
				secret: 'secret'
			}
		} as IdentityJson;

		fs.writeFileSync('./collector-identity.json', JSON.stringify(identityJson));
		const identityClientSpy = jest.spyOn(IdentityClient.prototype, 'authenticate').mockResolvedValue();

		await service.checkCollectorIdentity();

		expect(identityClientSpy).toBeCalled();
	});

	it('provided COLLECTOR_DID are not matching the id of identity file', async () => {
		process.env.COLLECTOR_DID = 'did:iota:wrong';
		const identityJson: IdentityJson = {
			doc: {
				id: 'did:iota54321'
			},
			key: {
				secret: 'secret'
			}
		} as IdentityJson;

		fs.writeFileSync('./collector-identity.json', JSON.stringify(identityJson));

		await service.checkCollectorIdentity();

		expect(process.env.COLLECTOR_DID).toBe(identityJson.doc.id);
	});

	it('provided COLLECTOR_SECRET are not matching the secret of identity file', async () => {
		process.env.COLLECTOR_SECRET = 'wrongSecret';
		const identityJson: IdentityJson = {
			doc: {
				id: 'iota:did:12345'
			},
			key: {
				secret: 'secret'
			}
		} as IdentityJson;

		fs.writeFileSync('./collector-identity.json', JSON.stringify(identityJson));

		await service.checkCollectorIdentity();

		expect(process.env.COLLECTOR_SECRET).toBe(identityJson.key.secret);
	});

	it('should create new identity: no env vars provided', async () => {
		process.env.COLLECTOR_DID = '';
		process.env.COLLECTOR_SECRET = '';
		const identityJson: IdentityJson = {
			doc: {
				id: 'did:iota54321'
			},
			key: {
				secret: 'otherSecret'
			}
		} as IdentityJson;

		const identitiyClientSpy = jest.spyOn(IdentityClient.prototype, 'create').mockResolvedValue(identityJson);
		const writeFileSpy = jest.spyOn(fs, 'writeFileSync');

		await service.checkCollectorIdentity();

		expect(process.env.COLLECTOR_DID).toBe(identityJson.doc.id);
		expect(process.env.COLLECTOR_SECRET).toBe(identityJson.key.secret);
		expect(identitiyClientSpy).toBeCalled();
		expect(writeFileSpy).toBeCalled();
	});

	afterAll(() => {
		fs.rmSync('collector-identity.json');
	})
});
