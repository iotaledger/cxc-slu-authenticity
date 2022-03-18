import fs from 'fs';
import { ClientConfig, ChannelClient, ChannelData } from 'iota-is-sdk';
import { createKey, decrypt } from '../vpuf/vpuf';
import { AxiosResponse } from 'axios';
import { decryptData, sendAuthProof } from '../auth-proof/auth-proof';
import crypto from 'crypto'
import * as ed from '@noble/ed25519'
import * as bs58 from 'bs58'
import axios from 'axios';

export async function sendData(
	encryptedDataPath: string | undefined,
	keyFilePath: string | undefined,
	isConfigPath: string | undefined,
	collectorBaseUrl: string | undefined,
	payloadData: any,
	isAuthUrl: string | undefined,
	apiKey: string | undefined,
	jwt: string | undefined,
): Promise<ChannelData> {
	if (isConfigPath && encryptedDataPath && keyFilePath && collectorBaseUrl && isAuthUrl && apiKey && jwt) {
		const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
		const key = createKey(keyFilePath);
		const decryptedData = decrypt(encryptedData, key);
		const { identityKeys, channelId, nonce } = JSON.parse(decryptedData);
		let isConfig = fs.readFileSync(isConfigPath, 'utf-8');
		const clientConfig: ClientConfig = JSON.parse(isConfig);
		const signedNonce = await signNonce(identityKeys.key.secret, nonce);
		let response;
		try {
			//write data into channel
			const client = new ChannelClient(clientConfig);
			await client.authenticate(identityKeys.id, identityKeys.key.secret);
			const channelData = await client.write(channelId, {
				payload: payloadData
			});
			//send to collector
			response = await postData(collectorBaseUrl, payloadData, identityKeys.id, jwt);

			//Retry to send: authentication prove expired
			if (response.status === 409) {
				const body = await decryptData(encryptedDataPath, keyFilePath);
				await sendAuthProof(body, collectorBaseUrl + '/prove');
				await postData(collectorBaseUrl, payloadData, identityKeys.id, jwt);
			}
			//Retry to send: jwt token expired
			if (response.status === 401) {
				const isResponse = await axios.post(isAuthUrl + `/${identityKeys.id}${apiKey}`, signedNonce);
				jwt = isResponse.data.jwt;
				if (jwt) {
					await postData(collectorBaseUrl, payloadData, identityKeys.id, jwt);
				} else {
					throw Error('No jwt token received')
				}
			}
			return channelData;
		} catch (ex: any) {
			throw ex;
		}
	} else {
		throw Error('One or all of the env variables are not provided: --input_enc, --key_file, --config, --collector_data_url, --collector_url, --is_url, --api_key, --jwt');
	}
}

async function postData(collectorBaseUrl: string, payloadData: any, deviceId: string, jwt: string): Promise<AxiosResponse<any, any>> {
	return axios.post(collectorBaseUrl + '/data', { payload: payloadData, deviceId: deviceId }, { headers: { 'authorisation': 'Bearer ' + jwt } });
}

async function signNonce(privateKey: string, nonce: string) {
	const decodedKey = bs58.decode(privateKey).toString('hex');
	const hash = crypto.createHash('sha256').update(nonce).digest().toString('hex');
	const signedHash = await ed.sign(hash, decodedKey);
	return ed.Signature.fromHex(signedHash).toHex();
};
