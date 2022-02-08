import * as fs from 'fs';
import * as enc from '../encrypt-data';

describe('Encrypt data', () => {
	it('should encrypt data', () => {
		enc.encryptData();
		const encryptedData = fs.readFileSync(process.env.INPUT_ENC!, 'utf-8');
		expect(encryptedData).toContain('U2FsdGVkX1');
	});

	it('shoudl fail to encrypt data', () => {
		process.env.INPUT = '';
		try {
			enc.encryptData();
		} catch (ex: any) {
			expect(ex.message).toBe('One or all of the env variables are not provided: KEY, INPUT, DEST');
		}
	});

	afterAll(() => {
		fs.rmSync(process.env.DEST! + '/data.json.enc');
	});
});
