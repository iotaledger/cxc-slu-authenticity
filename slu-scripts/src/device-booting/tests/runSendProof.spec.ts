import * as fs from 'fs';
import * as vpuf from '../../vpuf/vpuf';
import { runSendProof } from '../runSendProof';
import * as sendProof from '../../auth-proof/auth-proof'


describe('Send-proof tests during device startup', () => {
	let keyFile = process.env.KEY_FILE;
	let authInterval = process.env.SEND_AUTH_INTERVAL;
	let inputEnc = process.env.INPUT_ENC;
	let collectorBaseUrl = process.env.COLLECTOR_BASE_URL;

	beforeEach(async () => {
		const key = vpuf.createKey('./test-data/unclonable.txt');
		vpuf.encrypt('./test-data/data.json', key, './test-data');
	});

	it('should not run because of missing env vars', async () => {
		const processSpy = jest.spyOn(process, 'exit').mockImplementationOnce((number) => {
			throw new Error('process.exit: ' + number);
		});
		try {
			runSendProof(keyFile!, '', inputEnc!, collectorBaseUrl!);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log-cxc.txt', 'utf-8');
		expect(logFile).toContain('Not all env vars are provided for sending authentication proof ');
	});

	it('should not run because of wrong path for key file', async () => {
		const processSpy = jest.spyOn(process, 'exit').mockImplementationOnce((number) => {
			throw new Error('process.exit: ' + number);
		});

		try {
			runSendProof('/wrongPath', authInterval!, inputEnc!, collectorBaseUrl!);
		} catch (ex: any) {
			expect(processSpy).toBeCalledWith(1);
		}

		const logFile = fs.readFileSync('log-cxc.txt', 'utf-8');
		expect(logFile).toContain(`Error: ENOENT: no such file or directory, open '/wrongPath`);
	});

	it('should run send-proof script', async () => {
		fs.rmSync('log-cxc.txt');
		const authProofSpy = jest.spyOn(sendProof, 'decryptAndSendProof').mockResolvedValue();

		jest.useFakeTimers();
		runSendProof(keyFile!, authInterval!, inputEnc!, collectorBaseUrl!);
		jest.advanceTimersByTime(3000);

		try {
			fs.readFileSync('log.txt', 'utf-8');
		} catch (ex: any) {
			expect(ex.message).toBe(`ENOENT: no such file or directory, open 'log.txt'`);
		}
		expect(authProofSpy).toBeCalledWith(inputEnc, keyFile, collectorBaseUrl);
		expect(authProofSpy).toBeCalledTimes(3);
	
});

afterEach(() => {
	fs.rmSync('./test-data/data.json.enc');
});
});
