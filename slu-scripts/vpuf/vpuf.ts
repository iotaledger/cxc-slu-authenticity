import * as fs from 'fs';
import * as cryptoJs from 'crypto-js';

const createKey = (filePath: string): string => {
	const seed = fs.readFileSync(filePath, 'utf-8');
	const key = cryptoJs.SHA256(seed).toString();
	return key;
};
const encrypt = (filePath: string, key: string, dest: string): string => {
	const data = fs.readFileSync(filePath, 'utf-8');
	var encryptedData = cryptoJs.AES.encrypt(data, key).toString();
	fs.writeFileSync(dest + '/data.json.enc', encryptedData, 'utf-8');
	return encryptedData;
};

const encryptBodyData = (body: any, key: string, dest: string) => {
	var encryptedData = cryptoJs.AES.encrypt(body, key).toString();
	fs.writeFileSync(dest + '/data.json.enc', encryptedData, 'utf-8');
	return encryptedData;
};

const decrypt = (encrypted: string, key: string): string => {
	var decryptedData = cryptoJs.AES.decrypt(encrypted, key).toString(cryptoJs.enc.Utf8);
	return decryptedData;
};

export { createKey, encrypt, decrypt, encryptBodyData };
