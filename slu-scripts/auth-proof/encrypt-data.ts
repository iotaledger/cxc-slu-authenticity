import * as vpuf from '../vpuf/vpuf';

const keyFilePath: string | undefined = process.env.npm_config_key;
const inputData: string | undefined = process.env.npm_config_input;
const destination: string | undefined = process.env.npm_config_dest;

export function encryptData(keyFilePath: string | undefined, inputData: string | undefined, destination: string | undefined) {
	if (keyFilePath && inputData && destination) {
		const key = vpuf.createKey(keyFilePath!);
		vpuf.encrypt(inputData, key, destination);
	} else {
		throw Error('One or all of the env variables are not provided: KEY, INPUT, DEST');
	}
}

encryptData(keyFilePath, inputData, destination);
