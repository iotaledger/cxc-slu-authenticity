import * as fs from 'fs';
import { decryptData, sendAuthProof, intervalRequests } from '../auth-proof';
import { encryptData } from '../encrypt-data';
import axios from 'axios';

jest.mock('axios');

describe('Encrypt data', () => {
	it('should send auth proof three times', async () => {
		jest.useFakeTimers();

		const proofRequest = jest.spyOn(axios, 'post');

		encryptData();
		const body = await decryptData();

		await intervalRequests();

		jest.advanceTimersByTime(3000);

		expect(proofRequest).toBeCalledWith('/', body);
		expect(proofRequest).toBeCalled();
		expect(proofRequest).toHaveBeenCalledTimes(3);

		jest.useRealTimers();
	});

	it('should decrypt and send successfully auth proof', async () => {
		const response = {
			data: {},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.post = jest.fn().mockResolvedValue(response);

		encryptData();
		const body = await decryptData();
		const result = await sendAuthProof(body!);

		expect(axios.post).toBeCalledWith('/', body);
		expect(result?.status).toBe(200);
	});

	it('intervalRequests should throw error', async () => {
		process.env.INTERVAL = '';
		try {
			await intervalRequests();
		} catch (ex: any) {
			expect(ex.message).toBe('Interval in ms is not provided');
		}
	});

	it('decrypt should throw error', async () => {
		process.env.INPUT_ENC = '';
		try {
			await decryptData();
		} catch (ex: any) {
			expect(ex.message).toBe('One or all of the env variables are not provided: INPUT_ENC, KEY');
		}
	});

	it('sendAuthProof should throw error', async () => {
		process.env.URL = '';
		try {
			await sendAuthProof({ did: 'did:iota:..', timestamp: new Date(), signature: 'isdnfcd' });
		} catch (ex: any) {
			expect(ex.message).toBe('Url for post request is not provided');
		}
	});

	afterAll(() => {
		fs.rmSync(process.env.DEST! + '/data.json.enc');
	});
});
