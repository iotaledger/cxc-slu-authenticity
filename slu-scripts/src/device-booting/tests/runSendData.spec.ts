import { runSendData } from '../runSendData';
import * as vpuf from '../../vpuf/vpuf';
import * as fs from 'fs';
import * as child_process from 'child_process';

jest.mock('child_process');

describe('Send-data tests during device startup', () => {
	let keyFile = process.env.KEY_FILE;
	let inputEnc = process.env.INPUT_ENC;
	let collectorBaseUrl = process.env.COLLECTOR_BASE_URL;
	let scriptsPath = process.env.SCRIPTS_PATH;
	let isApiKey = process.env.IS_API_KEY;
	let isBaseUrl = process.env.IS_BASE_URL;
	let isAuthUrl = process.env.IS_AUTH_URL;
	let sendDataInterval = process.env.SEND_DATA_INTERVAL;
	let sensorData = process.env.SENSOR_DATA;

	beforeEach(async () => {
		const key = vpuf.createKey('./test-data/unclonable.txt');
		vpuf.encrypt('./test-data/data.json', key, './test-data');
	});

	it('should not run because of missing env vars', async () => {
		const processSpy = jest.spyOn(process, 'exit').mockImplementationOnce((number) => {
			throw new Error('process.exit: ' + number);
		});
		try {
			runSendData('', inputEnc, isApiKey, isBaseUrl, isAuthUrl, sendDataInterval, sensorData, collectorBaseUrl, scriptsPath);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log.txt', 'utf-8');
		expect(logFile).toContain('Not all env vars are provided for sending the data');
	});

	it('should not run because of wrong path for key file', async () => {
		const processSpy = jest.spyOn(process, 'exit').mockImplementationOnce((number) => {
			throw new Error('process.exit: ' + number);
		});

		try {
			runSendData('/wrongPath', inputEnc, isApiKey, isBaseUrl, isAuthUrl, sendDataInterval, sensorData, collectorBaseUrl, scriptsPath);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log.txt', 'utf-8');
		expect(logFile).toContain(`Error: ENOENT: no such file or directory, open '/wrongPath`);
	});

	it('should run send-data script', async () => {
		fs.rmSync('log.txt');

		const execSyncSpy = jest.spyOn(child_process, 'execSync');

		runSendData(keyFile, inputEnc, isApiKey, isBaseUrl, isAuthUrl, sendDataInterval, sensorData, collectorBaseUrl, scriptsPath);

		try {
			fs.readFileSync('log.txt', 'utf-8');
		} catch (ex: any) {
			expect(ex.message).toBe(`ENOENT: no such file or directory, open 'log.txt'`);
		}
		expect(execSyncSpy).toBeCalledWith(
			`cd / && npm run send-data --key_file=./test-data/unclonable.txt --interval=1000 --input_enc=./test-data/data.json.enc --collector_base_url=https://cxc.iota.cafe/api/v1/authenticity --is_api_key=1cfa3bce-654d-41f6-a82a-94308dc4adf8 --is_base_url=https://demo.integration-services.cafe/ --is_auth_url=https://demo.integration-services.cafe/api/v0.1/authentication/prove-ownership/ --sensor_data=./test-data/sensorData.json`
		);
	});

	afterEach(() => {
		fs.rmSync('./test-data/data.json.enc');
	});
});
