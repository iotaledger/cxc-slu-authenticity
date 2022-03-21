import { encryptData } from '../../auth-proof/auth-proof';
import { sendData } from '../sensor-data';
import { ChannelClient, ChannelData } from 'iota-is-sdk';
import * as AuthProof from '../../auth-proof/auth-proof';
import fs from 'fs';
import axios from 'axios';

jest.mock('axios');

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const inputData: string | undefined = process.env.npm_config_input;
const destination: string | undefined = process.env.npm_config_dest;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
const isConfigPath: string | undefined = process.env.npm_config_is_config_file;
const collectorBaseUrl: string | undefined = process.env.npm_config_collector_base_url;
const isAuthUrl: string | undefined = process.env.npm_config_is_auth_url;
const apiKey: string | undefined = process.env.npm_config_api_key;
const jwt: string | undefined = process.env.npm_config_jwt;

describe('Send sensor data tests', () => {
	beforeAll(() => {
		encryptData(keyFilePath, inputData, destination);
	});

	it('should fail to send data: env variable not provided', async () => {
		try {
			await sendData(encryptedDataPath, keyFilePath, '', collectorBaseUrl, { temperature: '60 degrees' }, isAuthUrl, apiKey, jwt);
		} catch (ex: any) {
			expect(ex.message).toBe(
				'One or all of the env variables are not provided: --input_enc, --key_file, --config, --collector_data_url, --collector_url, --is_url, --api_key, --jwt'
			);
		}
	});

	it('should send data', async () => {
		const payloadData = JSON.parse('{"temperature": "100 degree"}');
		const dataString = fs.readFileSync(inputData!, 'utf-8');
		const data = JSON.parse(dataString);
		const channelData: ChannelData = {
			link: '',
			imported: '',
			messageId: '',
			log: {
				payload: ''
			}
		};

		const resp = {
			data: {},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.post = jest.fn().mockResolvedValue(resp);
		const autheticateSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValue();
		const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData);

		const response = await sendData(encryptedDataPath, keyFilePath, isConfigPath, collectorBaseUrl, payloadData, isAuthUrl, apiKey, jwt);

		expect(autheticateSpy).toHaveBeenCalledWith(data.identityKeys.id, data.identityKeys.key.secret);
		expect(writeSpy).toHaveBeenCalledWith(data.channelId, { payload: payloadData });
		expect(response).toBe(channelData);
	});

	it('should send data with retry: auth prove expired', async () => {
		const payloadData = JSON.parse('{"temperature": "100 degree"}');
		const dataString = fs.readFileSync(inputData!, 'utf-8');
		const data = JSON.parse(dataString);
		const channelData: ChannelData = {
			link: '',
			imported: '',
			messageId: '',
			log: {
				payload: ''
			}
		};
		const resp = {
			data: {},
			headers: {},
			config: {},
			status: 409,
			statusText: 'Conflict'
		};
		axios.post = jest.fn().mockResolvedValue(resp);
		const autheticateSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValue();
		const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData);
		const sendAuthProveSpy = jest.spyOn(AuthProof, 'sendAuthProof');

		const response = await sendData(encryptedDataPath, keyFilePath, isConfigPath, collectorBaseUrl, payloadData, isAuthUrl, apiKey, jwt);

		expect(sendAuthProveSpy).toBeCalled();
		expect(autheticateSpy).toHaveBeenCalledWith(data.identityKeys.id, data.identityKeys.key.secret);
		expect(writeSpy).toHaveBeenCalledWith(data.channelId, { payload: payloadData });
		expect(response).toBe(channelData);
	});

	it('should fail to send data: nonce !== 40', async () => {
		const payloadData = JSON.parse('{"temperature": "100 degree"}');

		const postResp = {
			data: {},
			headers: {},
			config: {},
			status: 401,
			statusText: 'Unauthorized'
		};

		const getResp = {
			data: { nonce: '2ca14d78e862872422973014c1c651626ecd5e0' },
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.get = jest.fn().mockResolvedValue(getResp);
		axios.post = jest.fn().mockResolvedValue(postResp);

		try {
			await sendData(encryptedDataPath, keyFilePath, isConfigPath, collectorBaseUrl, payloadData, isAuthUrl, apiKey, jwt);
		} catch (ex: any) {
			expect(axios.post).toHaveBeenCalledTimes(1);
			expect(axios.get).toHaveBeenCalled();
			expect(ex.message).toBe('nonce does not match length of 40 characters!');
		}
	});

	it('should send data with retry: jwt expired', async () => {
		const payloadData = JSON.parse('{"temperature": "100 degree"}');
		const dataString = fs.readFileSync(inputData!, 'utf-8');
		const data = JSON.parse(dataString);
		const channelData: ChannelData = {
			link: '',
			imported: '',
			messageId: '',
			log: {
				payload: ''
			}
		};
		/**response for two different post requests:
		 * 1.request just the status is relevant for failing the if statement
		 * 2.request ist jwt relevant as the response of the other post request.
		 * **/
		const postResp = {
			data: {
				jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6NEtUZFJ1WXdBcUVrMVZ1MmFtdmFpajl3YWlWRE51NkQySFN2ek1LQVBSRDUiLCJwdWJsaWNLZXkiOiJHYXAxRGJLYVVCNEhRRlBRTTVTb25hM3JqOVpZNHlwUTEyRWlFZnFqV1NOUSIsInVzZXJuYW1lIjoiaW90YS10ZXN0LWRldmljZSIsInJlZ2lzdHJhdGlvbkRhdGUiOiIyMDIyLTAyLTIwVDIzOjU0OjU4WiIsImNsYWltIjp7InR5cGUiOiJEZXZpY2UiLCJjYXRlZ29yeSI6WyJzZW5zb3IiXSwiY29udHJvbGxlZFByb3BlcnR5IjpbImZpbGxpbmdMZXZlbCIsInRlbXBlcmF0dXJlIl0sImNvbnRyb2xsZWRBc3NldCI6WyJ3YXN0ZWNvbnRhaW5lci1Pc3VuYS0xMDAiXSwiaXBBZGRyZXNzIjpbIjE5Mi4xNC41Ni43OCJdLCJtY2MiOiIyMTQiLCJtbmMiOiIwNyIsInNlcmlhbE51bWJlciI6Ijk4NDVBIiwicmVmRGV2aWNlTW9kZWwiOiJteURldmljZS13YXN0ZWNvbnRhaW5lci1zZW5zb3ItMzQ1IiwiZGF0ZUZpcnN0VXNlZCI6IjIwMTQtMDktMTFUMTE6MDA6MDBaIiwib3duZXIiOlsiZGlkOmlvdGE6QjRqZEFramJhOUJHcEEyZnRObTVDaHhvQ2dKNlBOYnIydmRGa0ZaTmp2ZnAiXX0sInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0NzM3OTkyNCwiZXhwIjoxNjQ3NDY2MzI0fQ.UZGr5c2dZvQmugahPKOcNhqeE92CeQZhaEuZ3YRmwJ4'
			},
			headers: {},
			config: {},
			status: 401,
			statusText: 'Unauthorized'
		};

		const getResp = {
			data: { nonce: '2ca14d78e862872422973014c1c651626ecd5e0a' },
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.get = jest.fn().mockResolvedValue(getResp);
		axios.post = jest.fn().mockResolvedValue(postResp);
		const autheticateSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValue();
		const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData);

		const response = await sendData(encryptedDataPath, keyFilePath, isConfigPath, collectorBaseUrl, payloadData, isAuthUrl, apiKey, jwt);

		expect(axios.post).toHaveBeenCalledTimes(3);
		expect(axios.get).toHaveBeenCalled();
		expect(autheticateSpy).toHaveBeenCalledWith(data.identityKeys.id, data.identityKeys.key.secret);
		expect(writeSpy).toHaveBeenCalledWith(data.channelId, { payload: payloadData });
		expect(response).toBe(channelData);
	});

	it('should fail to send data with retry: jwt not received', async () => {
		const payloadData = JSON.parse('{"temperature": "100 degree"}');

		const postResp = {
			data: {},
			headers: {},
			config: {},
			status: 401,
			statusText: 'Unauthorized'
		};
		const getResp = {
			data: { nonce: '2ca14d78e862872422973014c1c651626ecd5e0a' },
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		axios.get = jest.fn().mockResolvedValue(getResp);
		axios.post = jest.fn().mockResolvedValue(postResp);

		try {
			await sendData(encryptedDataPath, keyFilePath, isConfigPath, collectorBaseUrl, payloadData, isAuthUrl, apiKey, jwt);
		} catch (ex: any) {
			expect(axios.post).toHaveBeenCalledTimes(2);
			expect(axios.get).toBeCalled();
			expect(ex.message).toBe('No jwt token received');
		}
	});

	afterAll(() => {
		fs.rmSync(destination! + '/data.json.enc');
	});
});
