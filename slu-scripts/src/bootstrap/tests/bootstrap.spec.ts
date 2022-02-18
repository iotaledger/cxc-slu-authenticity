import { bootstrap } from '../bootstrap';
import axios from 'axios';
import * as fs from 'fs';
import * as vpuf from '../../vpuf/vpuf';

jest.mock('axios');
const keyFilePath: string | undefined = process.env.npm_config_key_file;
const destinationPath: string | undefined = process.env.npm_config_dest;
const registrationUrl: string | undefined = process.env.npm_config_registration_url;

describe('bootstrap on device', () => {


	it('should get and encrypt data', async () => {
		const response = {
			data: {
				nonce: 'anyNonce',
				channelId: 'did:iota:121',
				channelSeed: 'string',
				identityKeys: 'IdentityKeys'
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.get = jest.fn().mockResolvedValue(response);

		await bootstrap(registrationUrl, keyFilePath, destinationPath);

		const encryptedData = fs.readFileSync(destinationPath + '/data.json.enc', 'utf-8');
		expect(encryptedData).not.toBeUndefined();
		expect(encryptedData).not.toBeNull();

		const key = vpuf.createKey(keyFilePath!);
		const data = vpuf.decrypt(encryptedData, key);
		const toBeBody = JSON.stringify(response.data);
		expect(data).toBe(toBeBody);
	});

	it('should fail to bootstrap: wrong file path', async () => {
		const wrongKey = '../../vpuf/tests/data/unclonable.ts';
		const msg = "ENOENT: no such file or directory, open '../../vpuf/tests/data/unclonable.ts'";
		try {
			await bootstrap(registrationUrl, wrongKey, destinationPath);
		} catch (ex: any) {
			expect(ex.message).toBe(msg);
		}
	});

	it('should fail to bootstrap: no env var provided', async () => {
		const noKey = '';
		const msg = 'One or all of the env variables are not provided: --key_file, --registration_url, --dest';
		try {
			await bootstrap(registrationUrl, noKey, destinationPath);
		} catch (ex: any) {
			expect(ex.message).toBe(msg);
		}
	});

});	
afterAll(() => {
	try{
		fs.rmSync(destinationPath! + '/data.json.enc');
	}catch(ex: any){
		
	}
});
