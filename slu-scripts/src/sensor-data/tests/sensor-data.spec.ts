import { encryptData } from '../../auth-proof/auth-proof';
import { sendData } from '../sensor-data';
import { ChannelClient, ChannelData } from 'iota-is-sdk';
import fs from 'fs';

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const inputData: string | undefined = process.env.npm_config_input;
const destination: string | undefined = process.env.npm_config_dest;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
const isConfiguration: string | undefined = process.env.npm_config_config;

describe('Send sensor data tests', () => {
	beforeAll(() => {
		encryptData(keyFilePath, inputData, destination);
	});

	it('should fail to send data: connection error', async () => {
		try {
			await sendData(encryptedDataPath, keyFilePath, isConfiguration);
		} catch (ex: any) {
			expect(ex.code).toBe('ECONNREFUSED');
		}
	});
	it('should fail to send data: env variable not provided', async () => {
		try {
			await sendData(encryptedDataPath, keyFilePath, '');
		} catch (ex: any) {
			expect(ex.message).toBe('One or all of the env variables are not provided: --input_enc, --key_file, --config');
		}
	});

	it('should send data', async () => {
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
		const response = await sendData(encryptedDataPath, keyFilePath, isConfiguration);
		expect(autheticateSpy).toHaveBeenCalledWith(data.identity.doc.id, data.identity.key.secret);
		expect(writeSpy).toHaveBeenCalledWith(data.channelAddress, { payload: { temperature: '60 degrees' } });
		expect(response).toBe(channelData);
	});

	afterAll(() => {
		fs.rmSync(destination! + '/data.json.enc');
	});
});
