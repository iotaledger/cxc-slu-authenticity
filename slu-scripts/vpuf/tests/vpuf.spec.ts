import * as vpuf from '../vpuf';
import * as fs from 'fs';

describe('VPUF Tests', () => {
	let key: string;
	let encryptedData: string;
	let decryptedData: string;
	let data: string;
	let storedEncryptedData: string;

	beforeEach(() => {
		key = vpuf.createKey('./vpuf/tests/data/unclonable.txt');
		encryptedData = vpuf.encrypt('./vpuf/tests/data/data.json', key, './vpuf/tests/data');
		storedEncryptedData = fs.readFileSync('./vpuf/tests/data/data.json.enc', 'utf-8');
		decryptedData = vpuf.decrypt(storedEncryptedData, key);
		data = fs.readFileSync('./vpuf/tests/data/data.json', 'utf-8');	
	});
	test('should create the same key', () => {
		const key2 = vpuf.createKey('./vpuf/tests/data/unclonable.txt');
		expect(key).toBe(key2);
	});
	test('should encrypt data', () => {
		expect(storedEncryptedData).toBe(encryptedData)
		expect(encryptedData).not.toBe(data);
		expect(encryptedData).toContain('U2FsdGVkX1');

	});
	test('should decrypt data', () => {
		expect(decryptedData).toBe(data);
		expect(decryptedData).not.toContain('U2FsdGVkX1');
	});

	afterAll(() => {
		fs.rmSync('./vpuf/tests/data/data.json.enc')
	})
});
