import * as vpuf from '../vpuf/vpuf';

export function encryptData() {
	const keyFilePath: string | undefined = process.env.KEY;
	const inputData: string | undefined = process.env.INPUT;
	const destination: string | undefined = process.env.DEST;

	if (keyFilePath && inputData && destination) {
		const key = vpuf.createKey(keyFilePath!);
		vpuf.encrypt(inputData, key, destination);
	} else {
		throw Error('One or all of the env variables are not provided: KEY, INPUT, DEST');
	}
}

encryptData();




