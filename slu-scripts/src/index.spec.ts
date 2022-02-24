import * as fs from 'fs';
import * as authProof from './auth-proof/auth-proof';
import axios from 'axios';
import { execScript } from './index';
import yargs from 'yargs';
import * as vpuf from './vpuf/vpuf';
import * as sendData from './sensor-data/sensor-data';
import { ChannelData } from 'iota-is-sdk';

jest.mock('axios');

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const destinationPath: string | undefined = process.env.npm_config_dest;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
const isConfigFile: string | undefined = process.env.npm_config_is_config_file;
const payload: any = process.env.npm_config_payload;

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
		axios.post = jest.fn().mockResolvedValue(response);
		const sendAuthProof = jest.spyOn(authProof, 'sendAuthProof');
		const decryptData = jest.spyOn(authProof, 'decryptData');

		jest.useFakeTimers();
		await execScript(argv);
		jest.advanceTimersByTime(3000);

		expect(sendAuthProof).toHaveBeenCalledTimes(3);
		expect(decryptData).toHaveBeenCalledWith(encryptedDataPath, keyFilePath);

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
				nonce: 'nonce',
				channelId: 'channelId',
				channelSeed: 'channelSeed',
				identityKeys: 'identityKeys'
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
		const oldVal = process.env.npm_config_registration_url;
		process.env.npm_config_registration_url = '';
		process.argv[2] = 'bootstrap';
		const argv = yargs.parse(process.argv[2]);
		const mockExit = jest.spyOn(process, 'exit').mockImplementation();
		const errorLog = jest.spyOn(console, 'error');
		await execScript(argv);
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(errorLog).toBeCalledWith('One or all of the env variables are not provided: --key_file, --registration_url, --dest');
		process.env.npm_config_registration_url = oldVal;
	});
});

describe('Send sensor data tests', () => {
	it('send-data should execute', async () => {
		process.argv[2] = 'send-data';
		const argv = yargs.parse(process.argv[2]);
		const payloadObject = JSON.parse(payload);
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
		expect(sendDataSpy).toHaveBeenLastCalledWith(encryptedDataPath, keyFilePath, isConfigFile, payloadObject);
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
		expect(consoleSpy).toBeCalledWith('No --interval in ms or no --payload provided.');
		expect(processSpy).toBeCalledWith(1);
		process.env.npm_config_interval = oldVal;
	});

	it('send sensor data should fail because of false payload format', async () => {
		const oldVal = process.env.npm_config_payload;
		process.env.npm_config_payload = 'wrongFormat';
		process.argv[2] = 'send-data';
		const argv = yargs.parse(process.argv[2]);
		const consoleSpy = jest.spyOn(console, 'error');
		const processSpy = jest.spyOn(process, 'exit');
		await execScript(argv);
		expect(consoleSpy).toBeCalledWith('Unexpected token w in JSON at position 0');
		expect(processSpy).toBeCalledWith(1);
		process.env.npm_config_payload = oldVal;
	});
});

afterAll(() => {
	fs.rmSync(destinationPath! + '/data.json.enc');
});
