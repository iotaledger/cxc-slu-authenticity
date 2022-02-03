import * as fs from 'fs';
import * as cryptoJs from 'crypto-js';

const createKey = (filePath: string): string => {
	const seed = fs.readFileSync(filePath, 'utf-8');
	const key = cryptoJs.SHA256(seed).toString();
	return key;
};
const encrypt = (filePath: string, key: string): string => {
	const data = fs.readFileSync(filePath, 'utf-8');
	var encryptedData = cryptoJs.AES.encrypt(data, key).toString();
	return encryptedData;
};
const decrypt = (encrypted: string, key: string): string => {
	var decryptedData = cryptoJs.AES.decrypt(encrypted, key).toString(cryptoJs.enc.Utf8);
	return decryptedData;
};

export { createKey, encrypt, decrypt };
