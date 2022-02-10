import * as fs from 'fs';
import * as vpuf from '../vpuf/vpuf';
import * as bs58 from 'bs58';
import * as ed from '@noble/ed25519';
import { AxiosResponse } from 'axios';
import axios from 'axios';

const encryptedDataPath: string | undefined = process.env.input;
const keyFilePath: string | undefined = process.env.npm_config_keys;
const interval: string | undefined = process.env.mpm_config_interval;
const requestUrl: string | undefined = process.env.URL;

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
		throw Error('One or all of the env variables are not provided: INPUT_ENC, KEY');
	}
}

export async function sendAuthProof(
	body: {
		did: string;
		timestamp: Date;
		signature: string;
	},
	requestUrl: string | undefined
): Promise<AxiosResponse<any, any> | undefined> {
	if (requestUrl) {
		return await axios.post(requestUrl, body);
	} else {
		throw Error('Url for post request is not provided');
	}
}

export async function intervalRequests(interval: string | undefined) {
	const body = await decryptData(encryptedDataPath, keyFilePath);
	if (interval) {
		setInterval(sendAuthProof, Number(interval), [body, requestUrl]);
	} else {
		throw Error('Interval in ms is not provided');
	}
}

intervalRequests(interval);
