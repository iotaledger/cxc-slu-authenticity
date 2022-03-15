import * as fs from 'fs';
import * as vpuf from '../vpuf/vpuf';
import * as bs58 from 'bs58';
import * as ed from '@noble/ed25519';
import { AxiosResponse } from 'axios';
import axios from 'axios';

export function encryptData(keyFilePath: string | undefined, inputData: string | undefined, destination: string | undefined) {
	if (keyFilePath && inputData && destination) {
		const key = vpuf.createKey(keyFilePath!);
		vpuf.encrypt(inputData, key, destination);
	} else {
		throw Error('One or all of the env variables are not provided: --key_file, --input, --dest');
	}
}

export async function decryptData(
	encryptedDataPath: string | undefined,
	keyFilePath: string | undefined
): Promise<{ did: string; timestamp: Date; signature: string } | undefined> {
	if (encryptedDataPath && keyFilePath) {
		const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
		const key = vpuf.createKey(keyFilePath);
		const decryptedData = vpuf.decrypt(encryptedData, key);
		const identity = JSON.parse(decryptedData).identity;
		const did = identity?.doc?.id;
		const timestamp = new Date();
		const privateKey = bs58.decode(identity?.key?.secret);
		const signatureBuffer = await ed.sign(Buffer.from(timestamp.getTime().toString()), privateKey);
		const signature = Buffer.from(signatureBuffer).toString('hex');
		const body = {
			did: did,
			timestamp: timestamp,
			signature: signature
		};
		return body;
	} else {
		throw Error('One or all of the env variables are not provided: --input_enc, --key_file');
	}
}

export async function sendAuthProof(
	body: {
		did: string;
		timestamp: Date;
		signature: string;
	},
	collectorBaseUrl: string | undefined
): Promise<AxiosResponse<any, any> | undefined> {
	if (collectorBaseUrl) {
		return await axios.post(collectorBaseUrl + '/prove', body);
	} else {
		throw Error('Collector url for post request is not provided');
	}
}
