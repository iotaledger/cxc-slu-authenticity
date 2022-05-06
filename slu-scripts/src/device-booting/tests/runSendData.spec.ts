import { runSendData } from '../runSendData';
import * as vpuf from '../../vpuf/vpuf';
import * as fs from 'fs';
import * as sendData from '../../sensor-data/sensor-data'


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
			runSendData('', inputEnc!, isApiKey!, isBaseUrl!, isAuthUrl!, sendDataInterval!, sensorData!, collectorBaseUrl!);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log-cxc.txt', 'utf-8');
		expect(logFile).toContain('Not all env vars are provided for sending the data');
	});

	it('should not run because of wrong path for key file', async () => {
		const processSpy = jest.spyOn(process, 'exit').mockImplementationOnce((number) => {
			throw new Error('process.exit: ' + number);
		});

		try {
			runSendData('/wrongPath', inputEnc!, isApiKey!, isBaseUrl!, isAuthUrl!, sendDataInterval!, sensorData!, collectorBaseUrl!);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log-cxc.txt', 'utf-8');
		expect(logFile).toContain(`Error: ENOENT: no such file or directory, open '/wrongPath`);
	});

	it('should run send-data script', async () => {
		fs.rmSync('log-cxc.txt');

		const sendDataSpy = jest.spyOn(sendData, 'sendData').mockResolvedValue();

		jest.useFakeTimers()
		runSendData(keyFile!, inputEnc!, isApiKey!, isBaseUrl!, isAuthUrl!, sendDataInterval!, sensorData!, collectorBaseUrl!);
		jest.advanceTimersByTime(3000);

		try {
			fs.readFileSync('log.txt', 'utf-8');
		} catch (ex: any) {
			expect(ex.message).toBe(`ENOENT: no such file or directory, open 'log.txt'`);
		}
		expect(sendDataSpy).toBeCalledWith(
			inputEnc, keyFile, isApiKey, isBaseUrl, collectorBaseUrl, sensorData, isAuthUrl
		);
		expect(sendDataSpy).toBeCalledTimes(3);

		jest.useRealTimers();
	});

	afterEach(() => {
		fs.rmSync('./test-data/data.json.enc');
	});
});
