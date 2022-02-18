import * as fs from 'fs';
import { decryptData, sendAuthProof, encryptData } from '../auth-proof';
import axios from 'axios';

jest.mock('axios');

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const inputDataPath: string | undefined = process.env.npm_config_input;
const destinationPath: string | undefined = process.env.npm_config_dest;
const collectorUrl: string | undefined = process.env.npm_config_collector_url;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
describe('Encrypt data', () => {


	it('should encrypt data', () => {
		encryptData(keyFilePath, inputDataPath, destinationPath);
		const encryptedData = fs.readFileSync(encryptedDataPath!, 'utf-8');
		expect(encryptedData).toContain('U2FsdGVkX1');
	});

	it('should decrypt data and send successfully auth proof', async () => {
		const response = {
			data: {},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.post = jest.fn().mockResolvedValue(response);

		encryptData(keyFilePath, inputDataPath, destinationPath);
		const body = await decryptData(encryptedDataPath, keyFilePath);
		const result = await sendAuthProof(body!, collectorUrl);

		expect(axios.post).toBeCalledWith('/', body);
		expect(result?.status).toBe(200);
	});

	it('should send auth proof three times', () => {
		jest.useFakeTimers();

		const proofRequest = jest.spyOn(axios, 'post');
		const body = { did: 'did:iota:..', timestamp: new Date(), signature: 'isdnfcd' };

		setInterval(sendAuthProof, 1000, body, '/');

		jest.advanceTimersByTime(2000);

		expect(proofRequest).toBeCalledWith('/', body);
		expect(proofRequest).toBeCalled();
		expect(proofRequest).toHaveBeenCalledTimes(3);

		jest.useRealTimers();
	});

	it('shoudl fail to encrypt data', () => {
		try {
			encryptData(keyFilePath, '', destinationPath);
		} catch (ex: any) {
			expect(ex.message).toBe('One or all of the env variables are not provided: --key_file, --input, --dest');
		}
	});

	it('decrypt should throw error', async () => {
		try {
			await decryptData(encryptedDataPath, '');
		} catch (ex: any) {
			expect(ex.message).toBe('One or all of the env variables are not provided: --input_enc, --key_file');
		}
	});

	it('sendAuthProof should throw error', async () => {
		try {
			await sendAuthProof({ did: 'did:iota:..', timestamp: new Date(), signature: 'isdnfcd' }, '');
		} catch (ex: any) {
			expect(ex.message).toBe('Collector url for post request is not provided');
		}
	});
});
afterAll(() => {
	try{
		fs.rmSync(destinationPath! + '/data.json.enc');
	}catch(ex: any){
		
	}
});