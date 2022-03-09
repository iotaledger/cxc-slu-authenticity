import fs from 'fs';
import { ClientConfig, ChannelClient, ChannelData } from 'iota-is-sdk';
import { createKey, decrypt } from '../vpuf/vpuf';
import { Axios } from 'axios';

const axios = new Axios();

export async function sendData(
	encryptedDataPath: string | undefined,
	keyFilePath: string | undefined,
	isConfigPath: string | undefined,
	collectorUrl: string | undefined,
	payloadData: {hashedData: string, deviceId: string}
): Promise<ChannelData> {
	if (isConfigPath && encryptedDataPath && keyFilePath && collectorUrl) {
		await axios.post(collectorUrl, payloadData);
		const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
		const key = createKey(keyFilePath);
		const decryptedData = decrypt(encryptedData, key);
		const { identity, channelAddress } = JSON.parse(decryptedData);
		let isConfig = fs.readFileSync(isConfigPath, 'utf-8');
		const clientConfig: ClientConfig = JSON.parse(isConfig);
		try {
			const client = new ChannelClient(clientConfig);
			await client.authenticate(identity.doc.id, identity.key.secret);
			const response = await client.write(channelAddress, {
				payload: payloadData
			});
			return response;
		} catch (ex: any) {
			throw ex;
		}
	} else {
		throw Error('One or all of the env variables are not provided: --input_enc, --key_file, --config');
	}
}
