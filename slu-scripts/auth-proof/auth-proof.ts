import * as fs from 'fs';
import * as vpuf from '../vpuf/vpuf';
import * as bs58 from 'bs58';
import * as ed from '@noble/ed25519';
import { Axios } from 'axios';

const encryptedDataPath: string | undefined = process.env.INPUT_ENC;
const interval: string | undefined = process.env.INTERVAL;
const keyFilePath: string | undefined = process.env.KEY;
const axios = new Axios();
let did: string;
let timestamp: Date;
let signature: string;

export async function decryptData() {
	try {
		if (encryptedDataPath && interval && keyFilePath) {
			const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
			const key = vpuf.createKey(keyFilePath);
			const decryptedData = vpuf.decrypt(encryptedData, key);
			const identity = JSON.parse(decryptedData).identity;
			did = identity?.doc?.id;
			timestamp = new Date();
			const privateKey = bs58.decode(identity?.key?.secret);
			const signatureBuffer = await ed.sign(Buffer.from(timestamp.getTime().toString()), privateKey);
			signature = Buffer.from(signatureBuffer).toString('hex');
		} else {
			throw Error('One or all of the env variables are not provided: INPUT_ENC, INTERVAL, KEY');
		}
	} catch (ex: any) {
		console.log(ex);
	}
}

export async function sendAuthProof() {
	try {
		const response = await axios.post(process.env.URL!, {
			did: did,
			timestamp: timestamp,
			signature: signature
		});
        console.log(response)
        return response.status
	} catch (ex: any) {
		console.log(ex);
	}
}

decryptData();
setInterval(sendAuthProof, Number(interval));
