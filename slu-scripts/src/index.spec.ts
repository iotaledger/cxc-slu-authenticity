import * as fs from 'fs';
import * as authProof from './auth-proof/auth-proof';
import axios from 'axios';
import { execScript } from './index';
import yargs from 'yargs';
import * as vpuf from './vpuf/vpuf';

jest.mock('axios');

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const destinationPath: string | undefined = process.env.npm_config_dest;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;

describe('Encrypt-file tests', () => {
	it('should encrypt', async () => {
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
	it('send-proof', async () => {
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
		expect(errorLog).toBeCalledWith('No --input_enc or no --interval in ms provided.');
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

afterAll(() => {
	fs.rmSync(destinationPath! + '/data.json.enc');
});
