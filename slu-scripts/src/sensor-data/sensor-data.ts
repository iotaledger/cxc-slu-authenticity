import fs from 'fs';
import { ClientConfig, ChannelClient, ChannelData } from '@iota/is-client';
import { createKey, decrypt } from '../vpuf/vpuf';
import { AxiosResponse } from 'axios';
import { decryptData, sendAuthProof } from '../auth-proof/auth-proof';
import crypto from 'crypto';
import * as ed from '@noble/ed25519';
import * as bs58 from 'bs58';
import axios from 'axios';
import { getClientConfiguration, jwt, setJwt, currentSensorData, setSensorData } from './configuration';

export async function sendData(
	encryptedDataPath: string | undefined,
	keyFilePath: string | undefined,
	isApiKey: string | undefined,
	isBaseUrl: string | undefined,
	collectorBaseUrl: string | undefined,
	sensorDataPath: string | undefined,
	isAuthUrl: string | undefined
): Promise<ChannelData | void> {
	let sensorData;

	//get the on the device stored sensor data
	if (sensorDataPath) {
		sensorData = await getSensorData(sensorDataPath);
	} else {
		throw new Error('--sensor_data was not provided');
	}

	//compare the current and new sensor data
	if (JSON.stringify(sensorData) !== JSON.stringify(currentSensorData)) {
		setSensorData(sensorData);
	} else {
		return;
	}

	//send sensor data if the value has changed
	if (isApiKey && isBaseUrl && encryptedDataPath && keyFilePath && collectorBaseUrl && isAuthUrl) {
		const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
		const key = createKey(keyFilePath);
		const decryptedData = decrypt(encryptedData, key);
		let { identityKey, channelAddress } = JSON.parse(decryptedData);
		const clientConfig: ClientConfig = getClientConfiguration(isApiKey, isBaseUrl);
		let isSend = false;

		while (!isSend) {
			try {
				//send to collector
				console.log('send data');
				await postData(collectorBaseUrl, sensorData, identityKey.id, jwt);
				isSend = true;
			} catch (ex: any) {
				//Retry to send: authentication prove expired
				if (ex.response.status === 409) {
					console.log('send proof');
					const body = await decryptData(encryptedDataPath, keyFilePath);
					await sendAuthProof(body, collectorBaseUrl);
				}
				//Retry to send: jwt token expired
				else if (ex.response.status === 401) {
					console.log('get jwt');
					const res = await axios.get(isAuthUrl + `/${identityKey.id}?api-key=${clientConfig.apiKey}`);
					const signedNonce = await signNonce(identityKey.key.secret, res?.data?.nonce);
					const isResponse = await axios.post(
						isAuthUrl + `/${identityKey.id}?api-key=${clientConfig.apiKey}`,
						JSON.stringify({ signedNonce }),
						{
							method: 'post',
							headers: { 'Content-Type': 'application/json' }
						}
					);
					setJwt(isResponse.data.jwt);
				} else {
					throw ex;
				}
			}
		}
		console.log('write into channel');
		return await writeToChannel(clientConfig, identityKey, channelAddress, sensorData);
	} else {
		throw new Error(
			'One or all of the env variables are not provided: --input_enc, --key_file, --is_api_key, --is_base_url, --collector_data_url, --collector_url, --is_url'
		);
	}
}
async function postData(collectorBaseUrl: string, payloadData: any, deviceId: string, jwt: string): Promise<AxiosResponse<any, any>> {
	return axios.post(
		collectorBaseUrl + '/data',
		{ payload: payloadData, deviceId: deviceId },
		{ headers: { authorization: `Bearer ${jwt}` } }
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

async function getSensorData(sensorDataPath: string): Promise<any> {
	try {
		const sensorDataJson = fs.readFileSync(sensorDataPath, 'utf-8');
		return await JSON.parse(sensorDataJson);
	} catch (ex: any) {
		throw new Error('Could not parse sensor data, please provide an object as a string or check path to the data');
	}
}
