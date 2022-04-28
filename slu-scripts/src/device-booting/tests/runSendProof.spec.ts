import * as child_process from 'child_process';
import * as fs from 'fs';
import * as vpuf from '../../vpuf/vpuf';
import { runSendProof } from '../runSendProof';

jest.mock('child_process');

describe('Send-proof tests during device startup', () => {
	let keyFile = process.env.KEY_FILE;
	let authInterval = process.env.SEND_AUTH_INTERVAL;
	let inputEnc = process.env.INPUT_ENC;
	let collectorBaseUrl = process.env.COLLECTOR_BASE_URL;
	let scriptsPath = process.env.SCRIPTS_PATH;

	beforeEach(async () => {
		const key = vpuf.createKey('./test-data/unclonable.txt');
		vpuf.encrypt('./test-data/data.json', key, './test-data');
	});

	it('should not run because of missing env vars', async () => {
		const processSpy = jest.spyOn(process, 'exit').mockImplementationOnce((number) => {
			throw new Error('process.exit: ' + number);
		});
		try {
			runSendProof(keyFile, '', inputEnc, collectorBaseUrl, scriptsPath);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log.txt', 'utf-8');
		expect(logFile).toContain('Not all env vars are provided for sending authentication proof ');
	});

	it('should not run because of wrong path for key file', async () => {
		const processSpy = jest.spyOn(process, 'exit').mockImplementationOnce((number) => {
			throw new Error('process.exit: ' + number);
		});

		try {
			runSendProof('/wrongPath', authInterval, inputEnc, collectorBaseUrl, scriptsPath);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log.txt', 'utf-8');
		expect(logFile).toContain(`Error: ENOENT: no such file or directory, open '/wrongPath`);
	});

	it('should run send-proof script', async () => {
		fs.rmSync('log.txt');

		const execSyncSpy = jest.spyOn(child_process, 'execSync');

		runSendProof(keyFile, authInterval, inputEnc, collectorBaseUrl, scriptsPath);

		try {
			fs.readFileSync('log.txt', 'utf-8');
		} catch (ex: any) {
			expect(ex.message).toBe(`ENOENT: no such file or directory, open 'log.txt'`);
		}
		expect(execSyncSpy).toBeCalledWith(
			`cd / && npm run send-proof --key_file=./test-data/unclonable.txt --interval=1000 --input_enc=./test-data/data.json.enc --collector_base_url=https://cxc.iota.cafe/api/v1/authenticity`
		);
	});

	afterEach(() => {
		fs.rmSync('./test-data/data.json.enc');
	});
});
