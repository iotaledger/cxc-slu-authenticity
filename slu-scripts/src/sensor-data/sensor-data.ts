import fs from 'fs';
import { ClientConfig, ChannelClient, ChannelData } from 'iota-is-sdk';
import { createKey, decrypt } from '../vpuf/vpuf';

export async function sendData(
	encryptedDataPath: string | undefined,
	keyFilePath: string | undefined,
	isConfiguration: string | undefined
): Promise<ChannelData> {
	if (isConfiguration && encryptedDataPath && keyFilePath) {
		const encryptedData = fs.readFileSync(encryptedDataPath, 'utf-8');
		const key = createKey(keyFilePath);
		const decryptedData = decrypt(encryptedData, key);
		const data = JSON.parse(decryptedData);
		const identity = data.identity;
		const channelAddress = data.channelAddress;
		let isConfig = fs.readFileSync(isConfiguration, 'utf-8');
		isConfig = Buffer.from(isConfig).toString('utf-8');
		const clientConfig: ClientConfig = JSON.parse(isConfig);
		try {
			const client = new ChannelClient(clientConfig);
			await client.authenticate(identity.doc.id, identity.key.secret);
			const response = await client.write(channelAddress, {
				payload: { temperature: '60 degrees' }
			});
			return response;
		} catch (ex: any) {
			throw ex;
		}
	} else {
		throw Error('One or all of the env variables are not provided: --input_enc, --key_file, --config');
	}
}
