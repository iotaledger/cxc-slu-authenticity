import { bootstrap } from '../bootstrap';
import axios from 'axios';
import * as fs from 'fs';
import * as vpuf from '../../vpuf/vpuf';

jest.mock('axios');
const keyFilePath: string | undefined = process.env.npm_config_key_file;
const destinationPath: string | undefined = process.env.npm_config_dest;
const registrationUrl: string | undefined = process.env.npm_config_registration_url;
const nonce: string | undefined = process.env.npm_config_nonce;

describe('bootstrap on device', () => {
	it('should get and encrypt data', async () => {
		const response = {
			data: {
				"success": true,
				"channelId": "100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8",
				"channelSeed": "aklfuwikrvquowywyznhlmstimkzimytuvrgstdynrdgcwzcspweuoskslyfgcmkfhhitfig",
				"identityKeys": {
					"id": "did:iota:FJKwRVsx3gxTUqryCmsdREZiAuXX4xYYDDyiYa8T35w7",
					"key": {
						"type": "ed25519",
						"public": "C9VKC424LHdLnnvGsjMEBf82Ho4SQAtzjW9iBgwF29Kg",
						"secret": "AdxMYDJwzSo4Arn21uysKpfjdZGEUFxLwPFpVcn1CRsw",
						"encoding": "base58"
					}
				},
				"nonce": "c7b732a4-d9be-449e-bf28-73d31b68b512",
				"subscriptionLink": "100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:6a1e113d99e13dc967fc32d0"
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.get = jest.fn().mockResolvedValue(response);

		await bootstrap(registrationUrl, keyFilePath, destinationPath, nonce);

		const encryptedData = fs.readFileSync(destinationPath + '/data.json.enc', 'utf-8');
		expect(encryptedData).not.toBeUndefined();
		expect(encryptedData).not.toBeNull();

		const key = vpuf.createKey(keyFilePath!);
		const data = vpuf.decrypt(encryptedData, key);
		const toBeBody = JSON.stringify(response.data);
		expect(data).toBe(toBeBody);
	});

	it('should fail to bootstrap: Failed to get identity', async () => {
		const response = {
			data: {
				"success": false,
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};
		axios.get = jest.fn().mockResolvedValue(response);

		try {
			await bootstrap(registrationUrl, keyFilePath, destinationPath, nonce);
		} catch (ex: any) {
			expect(ex.message).toBe('Failed to get identity');
		}
	});

	it('should fail to bootstrap: wrong file path', async () => {
		const wrongKey = '../../vpuf/tests/data/unclonable.ts';
		const msg = "ENOENT: no such file or directory, open '../../vpuf/tests/data/unclonable.ts'";
		const response = {
			data: {
				"success": true,
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};
		axios.get = jest.fn().mockResolvedValue(response);
		try {
			await bootstrap(registrationUrl, wrongKey, destinationPath, nonce);
		} catch (ex: any) {
			expect(ex.message).toBe(msg);
		}
	});

	it('should fail to bootstrap: no env var provided', async () => {
		const noKey = '';
		const msg = 'One or all of the env variables are not provided: --key_file, --registration_url, --dest, --nonce';
		try {
			await bootstrap(registrationUrl, noKey, destinationPath, nonce);
		} catch (ex: any) {
			expect(ex.message).toBe(msg);
		}
	});

});
afterAll(() => {
	try {
		fs.rmSync(destinationPath! + '/data.json.enc');
	} catch (ex: any) {}
});
