import * as fs from 'fs';
import * as vpuf from '../vpuf/vpuf';
import * as bs58 from 'bs58';
import * as ed from '@noble/ed25519';
import { AxiosResponse } from 'axios';
import axios from 'axios';

export async function decryptData(): Promise<{ did: string; timestamp: Date; signature: string } | undefined> {
	const encryptedDataPath: string | undefined = process.env.INPUT_ENC;
	const keyFilePath: string | undefined = process.env.KEY;
	try {
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
	} catch (ex: any) {
		throw Error(ex.message);
	}
}

export async function sendAuthProof(body: {
	did: string;
	timestamp: Date;
	signature: string;
}): Promise<AxiosResponse<any, any> | undefined> {
	const requestUrl: string | undefined = process.env.URL;
	try {
		if (requestUrl) {
			return await axios.post(requestUrl, body);
		} else {
			throw Error('Url for post request is not provided');
		}
	} catch (ex: any) {
		throw Error(ex.message)
	}
}

export async function intervalRequests() {
	const interval: string | undefined = process.env.INTERVAL;
	const body = await decryptData();
	try {
		if (interval) {
			setInterval(sendAuthProof, Number(interval), body);
		} else {
			throw Error('Interval in ms is not provided');
		}
	} catch (ex: any) {
		console.log(ex.message);
	}
}
