import fs from 'fs';
import { ClientConfig, ChannelClient, ChannelData } from 'iota-is-sdk';
import { createKey, decrypt } from '../vpuf/vpuf';
import { Axios } from 'axios';
import { decryptData, sendAuthProof } from 'src/auth-proof/auth-proof';

const axios = new Axios();

export async function sendData(
	encryptedDataPath: string | undefined,
	keyFilePath: string | undefined,
	isConfigPath: string | undefined,
	collectorBaseUrl: string | undefined,
	payloadData: any
): Promise<void> {
	if (isConfigPath && encryptedDataPath && keyFilePath && collectorBaseUrl) {
		const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
		const key = createKey(keyFilePath);
		const decryptedData = decrypt(encryptedData, key);
		const { identity, channelAddress } = JSON.parse(decryptedData);
		let isConfig = fs.readFileSync(isConfigPath, 'utf-8');
		const clientConfig: ClientConfig = JSON.parse(isConfig);
		try {
			const client = new ChannelClient(clientConfig);
			await client.authenticate(identity.doc.id, identity.key.secret);
			await client.write(channelAddress, {
				payload: payloadData
			});
			await axios.post(collectorBaseUrl + '/data', { payload: payloadData, deviceId: identity.doc.id }, {headers: {'authorisation': 'Bearer' + 'string'}});
		} catch (ex: any) {
			if(ex.message.equals('authentication prove expired')){
				const body = await decryptData(encryptedData, keyFilePath);
				await sendAuthProof(body, collectorBaseUrl + '/prove');
				await axios.post(collectorBaseUrl + '/data', { payload: payloadData, deviceId: identity.doc.id });
			}else{
				throw ex;
			}
		}
	} else {
		throw Error('One or all of the env variables are not provided: --input_enc, --key_file, --config, --collector_data_url, --collector_url');
	}
}
