import * as vpuf from '../vpuf';
import * as fs from 'fs';

describe('VPUF Tests', () => {
	let key: string;
	let encryptedData: string;
	let decryptedData: string;
	let data: string;

	beforeEach(() => {
		key = vpuf.createKey('./tests/data/unclonable.txt');
		encryptedData = vpuf.encrypt('./tests/data/data.json', key);
		decryptedData = vpuf.decrypt(encryptedData, key);
		data = fs.readFileSync('./tests/data/data.json', 'utf-8');
	});
	test('should create the same key', () => {
		const key2 = vpuf.createKey('./tests/data/unclonable.txt');
		expect(key).toBe(key2);
	});
	test('should encrypt data', () => {
		expect(encryptedData).not.toBe(data);
		expect(encryptedData).toContain('U2FsdGVkX1');
	});
	test('should decrypt data', () => {
		expect(decryptedData).toBe(data);
		expect(decryptedData).not.toContain('U2FsdGVkX1');
	});
});
