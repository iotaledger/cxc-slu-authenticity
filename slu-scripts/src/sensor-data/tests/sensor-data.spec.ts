import { encryptData } from '../../auth-proof/auth-proof';
import { sendData } from '../sensor-data';
import { ChannelClient, ChannelData } from '@iota/is-client';
import fs from 'fs';
import axios from 'axios';

jest.mock('axios');

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const inputData: string | undefined = process.env.npm_config_input;
const destination: string | undefined = process.env.npm_config_dest;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
const isConfigPath: string | undefined = process.env.npm_config_is_config_file;
const collectorBaseUrl: string | undefined = process.env.npm_config_collector_base_url;

describe('Send sensor data tests', () => {
	beforeAll(() => {
		encryptData(keyFilePath, inputData, destination);
	});

	it('should fail to send data: no valid api key provided', async () => {
		try {
			await sendData(encryptedDataPath, keyFilePath, isConfigPath, collectorBaseUrl, {});
		} catch (ex: any) {
			expect(ex.response.status).toBe(401);
		}
	});
	it('should fail to send data: env variable not provided', async () => {
		try {
			await sendData(encryptedDataPath, keyFilePath, '', collectorBaseUrl, { temperature: '60 degrees' });
		} catch (ex: any) {
			expect(ex.message).toBe('One or all of the env variables are not provided: --input_enc, --key_file, --config, --collector_data_url');
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
		axios.post = jest.fn().mockResolvedValue({});
		const autheticateSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValue();
		const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData);
		const response = await sendData(encryptedDataPath, keyFilePath, isConfigPath, collectorBaseUrl, payloadData);
		expect(autheticateSpy).toHaveBeenCalledWith(data.identity.doc.id, data.identity.key.secret);
		expect(writeSpy).toHaveBeenCalledWith(data.channelAddress, { payload: payloadData });
		expect(response).toBe(channelData);
	});

	afterAll(() => {
		fs.rmSync(destination! + '/data.json.enc');
	});
});
