import fs from 'fs';
import { ClientConfig, ChannelClient, ChannelData, ApiVersion } from 'iota-is-sdk';
import { createKey, decrypt } from '../vpuf/vpuf';
import { AxiosResponse } from 'axios';
import { decryptData, sendAuthProof } from '../auth-proof/auth-proof';
import crypto from 'crypto';
import * as ed from '@noble/ed25519';
import * as bs58 from 'bs58';
import axios from 'axios';

export async function sendData(
	encryptedDataPath: string | undefined,
	keyFilePath: string | undefined,
	isApiKey: string | undefined,
	isBaseUrl: string | undefined,
	collectorBaseUrl: string | undefined,
	payloadData: any,
	isAuthUrl: string | undefined,
	jwt: string | undefined
): Promise<ChannelData> {
	if (isApiKey && isBaseUrl && encryptedDataPath && keyFilePath && collectorBaseUrl && isAuthUrl && jwt) {
		const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
		const key = createKey(keyFilePath);
		const decryptedData = decrypt(encryptedData, key);
		let { identityKeys, channelAddress } = JSON.parse(decryptedData);
		const clientConfig: ClientConfig = {
			apiKey: isApiKey,
			baseUrl: isBaseUrl,
			apiVersion: ApiVersion.v01
		};
		let isSend = false;

		while (!isSend) {
			try {
				//send to collector
				await postData(collectorBaseUrl, payloadData, identityKeys.id, jwt!);
				isSend = true;
			} catch (ex: any) {
				//Retry to send: authentication prove expired
				if (ex.response.status === 409) {
					const body = await decryptData(encryptedDataPath, keyFilePath);
					await sendAuthProof(body, collectorBaseUrl);
				}
				//Retry to send: jwt token expired
				else if (ex.response.status === 401) {
					const res = await axios.get(isAuthUrl + `/${identityKeys.id}?api-key=${clientConfig.apiKey}`);
					const signedNonce = await signNonce(identityKeys.key.secret, res?.data?.nonce);
					const isResponse = await axios.post(
						isAuthUrl + `/${identityKeys.id}?api-key=${clientConfig.apiKey}`,
						JSON.stringify({ signedNonce }),
						{
							method: 'post',
							headers: { 'Content-Type': 'application/json' }
						}
					);
					jwt = isResponse.data.jwt;
				} else {
					throw ex;
				}
			}
		}
		return await writeToChannel(clientConfig, identityKeys, channelAddress, payloadData);
	} else {
		throw new Error(
			'One or all of the env variables are not provided: --input_enc, --key_file, --is_api_key, --is_base_url, --collector_data_url, --collector_url, --is_url, --jwt'
		);
	}
}
async function postData(collectorBaseUrl: string, payloadData: any, deviceId: string, jwt: string): Promise<AxiosResponse<any, any>> {
	return axios.post(
		collectorBaseUrl + '/data',
		{ payload: payloadData, deviceId: deviceId },
		{ headers: { authorization: 'Bearer ' + jwt } }
	);
}
async function writeToChannel(
	clientConfig: ClientConfig,
	identityKey: any,
	channelAddress: string,
	payloadData: any
): Promise<ChannelData> {
	const client = new ChannelClient(clientConfig);
	await client.authenticate(identityKey.id, identityKey.key.secret);
	return await client.write(channelAddress, {
		payload: payloadData
	});
}
async function signNonce(privateKey: string, nonce: string): Promise<String> {
	if (nonce.length !== 40) {
		throw new Error('nonce does not match length of 40 characters!');
	}
	const decodedKey = bs58.decode(privateKey).toString('hex');
	const hash = crypto.createHash('sha256').update(nonce).digest().toString('hex');
	const signedHash = await ed.sign(hash, decodedKey);
	return ed.Signature.fromHex(signedHash).toHex();
}
