import * as fs from 'fs';
import * as authProof from './auth-proof/auth-proof';
import axios from 'axios';
import { execScript } from './index';
import yargs from 'yargs';
import * as vpuf from './vpuf/vpuf';
import * as sendData from './sensor-data/sensor-data';
import { ChannelData } from '@iota/is-client';
import { setSensorData } from './sensor-data/configuration';

jest.mock('axios');

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const destinationPath: string | undefined = process.env.npm_config_dest;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
const collectorBaseUrl: string | undefined = process.env.npm_config_collector_base_url;
const isApiKey: string | undefined = process.env.npm_config_is_api_key;
const isBaseUrl: string | undefined = process.env.npm_config_is_base_url;
const isAuthUrl: string | undefined = process.env.npm_config_is_auth_url;
const sensorDataPath: string | undefined = process.env.npm_config_sensor_data;

describe('Encrypt-file tests', () => {
	it('encrypt should execute', async () => {
		process.argv[2] = 'encrypt';
		const argv = yargs.parse(process.argv[2]);

		await execScript(argv);
		const encryptedData = fs.readFileSync(destinationPath + '/data.json.enc', 'utf-8');

		expect(encryptedData).not.toBeNull();
		expect(encryptedData).not.toBeUndefined();
		expect(encryptedData).toContain('U2FsdGVkX1');
	});

	it('encrypt should throw error', async () => {
		const oldVal = process.env.npm_config_dest;
		process.env.npm_config_dest = '';
		process.argv[2] = 'encrypt';
		const argv = yargs.parse(process.argv[2]);
		const mockExit = jest.spyOn(process, 'exit').mockImplementation();
		const errorLog = jest.spyOn(console, 'error');

		await execScript(argv);

		expect(mockExit).toHaveBeenCalledWith(1);
		expect(errorLog).toBeCalledWith('One or all of the env variables are not provided: --key_file, --input, --dest');
		process.env.npm_config_dest = oldVal;
	});
});

describe('Send-proof tests', () => {
	it('send-proof should execute', async () => {
		process.argv[2] = 'send-proof';
		const argv = yargs.parse(process.argv[2]);
		const response = {
			data: {
				did: 'did:iota:123',
				timestamp: 'timestamp',
				signature: 'abc123'
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		const body = {
			did: 'did:iota:12345',
			timestamp: new Date(),
			signature: 'signature'
		};

		axios.post = jest.fn().mockResolvedValue(response);
		const decryptAndSendProof = jest.spyOn(authProof, 'decryptAndSendProof').mockResolvedValue();

		jest.useFakeTimers();
		execScript(argv);
		jest.advanceTimersByTime(3000);

		expect(decryptAndSendProof).toHaveBeenCalledTimes(3);

		jest.useRealTimers();
	});
	it('send-proof should throw error', async () => {
		const oldVal = process.env.npm_config_interval;
		process.env.npm_config_interval = '';
		process.argv[2] = 'send-proof';
		const argv = yargs.parse(process.argv[2]);
		const mockExit = jest.spyOn(process, 'exit').mockImplementation();
		const errorLog = jest.spyOn(console, 'error');

		await execScript(argv);

		expect(mockExit).toHaveBeenCalledWith(1);
		expect(errorLog).toBeCalledWith('One or all of the env variables are not provided: --key_file, --input, --dest');

		process.env.npm_config_interval = oldVal;
	});
});

describe('Bootstrap tests', () => {
	it('bootstrap should execute', async () => {
		process.argv[2] = 'bootstrap';
		const argv = yargs.parse(process.argv[2]);
		const response = {
			data: {
				success: true,
				channelId: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8',
				channelSeed: 'aklfuwikrvquowywyznhlmstimkzimytuvrgstdynrdgcwzcspweuoskslyfgcmkfhhitfig',
				identityKeys: {
					id: 'did:iota:FJKwRVsx3gxTUqryCmsdREZiAuXX4xYYDDyiYa8T35w7',
					key: {
						type: 'ed25519',
						public: 'C9VKC424LHdLnnvGsjMEBf82Ho4SQAtzjW9iBgwF29Kg',
						secret: 'AdxMYDJwzSo4Arn21uysKpfjdZGEUFxLwPFpVcn1CRsw',
						encoding: 'base58'
					}
				},
				nonce: 'c7b732a4-d9be-449e-bf28-73d31b68b512',
				subscriptionLink: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:6a1e113d99e13dc967fc32d0'
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};
		axios.get = jest.fn().mockResolvedValue(response);

		await execScript(argv);

		const enc = fs.readFileSync(encryptedDataPath!, 'utf-8');
		const key = vpuf.createKey(keyFilePath!);
		const decryptedData = vpuf.decrypt(enc, key);
		const responseData = JSON.stringify(response.data);

		expect(decryptedData).toEqual(responseData);
	});

	it('bootstrap should fail', async () => {
		const oldVal = process.env.npm_config_one_shot_device_url;
		process.env.npm_config_one_shot_device_url = '';
		process.argv[2] = 'bootstrap';
		const argv = yargs.parse(process.argv[2]);
		const mockExit = jest.spyOn(process, 'exit').mockImplementation();
		const errorLog = jest.spyOn(console, 'error');

		await execScript(argv);

		expect(mockExit).toHaveBeenCalledWith(1);
		expect(errorLog).toBeCalledWith('One or all of the env variables are not provided: --key_file, --one_shot_device_url, --dest, --nonce');

		process.env.npm_config_registration_url = oldVal;
	});
});

describe('Send sensor data tests', () => {
	beforeEach(() => {
		setSensorData({});
	});

	it('send-data should execute', async () => {
		process.argv[2] = 'send-data';
		const argv = yargs.parse(process.argv[2]);
		const response: ChannelData = {
			link: 'string',
			imported: '2022-02-18T16:29:49.670Z',
			messageId: 'string',
			log: {
				type: 'string',
				created: '2022-02-18T16:29:49.670Z',
				metadata: 'string',
				publicPayload: 'string',
				payload: { temperature: '60 degrees' }
			}
		};
		const sendDataSpy = jest.spyOn(sendData, 'sendData').mockImplementation(async () => {
			return Promise.resolve(response);
		});
		jest.useFakeTimers();
		await execScript(argv);
		jest.advanceTimersByTime(3000);

		expect(sendDataSpy).toBeCalledTimes(3);
		expect(sendDataSpy).toHaveBeenLastCalledWith(
			encryptedDataPath,
			keyFilePath,
			isApiKey,
			isBaseUrl,
			collectorBaseUrl,
			sensorDataPath,
			isAuthUrl
		);

		jest.useRealTimers();
	});

	it('send sensor data should fail because no interval provided', async () => {
		const oldVal = process.env.npm_config_interval;
		process.env.npm_config_interval = '';
		process.argv[2] = 'send-data';
		const argv = yargs.parse(process.argv[2]);
		const consoleSpy = jest.spyOn(console, 'error');
		const processSpy = jest.spyOn(process, 'exit');

		await execScript(argv);

		expect(consoleSpy).toBeCalledWith('No --interval in ms.');
		expect(processSpy).toBeCalledWith(1);

		process.env.npm_config_interval = oldVal;
	});
});

afterAll(() => {
	fs.rmSync(destinationPath! + '/data.json.enc');
});
