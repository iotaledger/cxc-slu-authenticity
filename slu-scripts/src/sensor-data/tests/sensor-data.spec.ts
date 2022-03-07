import { encryptData } from '../../auth-proof/auth-proof';
import { sendData } from '../sensor-data';
import { ChannelClient, ChannelData } from 'iota-is-sdk';
import fs from 'fs';

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const inputData: string | undefined = process.env.npm_config_input;
const destination: string | undefined = process.env.npm_config_dest;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
const isConfigPath: string | undefined = process.env.npm_config_is_config_file;
const payload: string | undefined = process.env.npm_config_payload;

describe('Send sensor data tests', () => {
	beforeAll(() => {
		encryptData(keyFilePath, inputData, destination);
	});

	it('should fail to send data: no valid api key provided', async () => {
		try {
			await sendData(encryptedDataPath, keyFilePath, isConfigPath, {});
		} catch (ex: any) {
			expect(ex.response.status).toBe(401);
		}
	});
	it('should fail to send data: env variable not provided', async () => {
		try {
			await sendData(encryptedDataPath, keyFilePath, '', { temperature: '60 degrees' });
		} catch (ex: any) {
			expect(ex.message).toBe('One or all of the env variables are not provided: --input_enc, --key_file, --config');
		}
	});

	it('should send data', async () => {
		const payloadData = JSON.parse(payload!);
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
		const autheticateSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValue();
		const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData);
		const response = await sendData(encryptedDataPath, keyFilePath, isConfigPath, payloadData);
		expect(autheticateSpy).toHaveBeenCalledWith(data.identity.doc.id, data.identity.key.secret);
		expect(writeSpy).toHaveBeenCalledWith(data.channelAddress, { payload: payloadData });
		expect(response).toBe(channelData);
	});

	afterAll(() => {
		fs.rmSync(destination! + '/data.json.enc');
	});
});
