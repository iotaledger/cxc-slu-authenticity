import axios from 'axios';
import * as vpuf from '../vpuf/vpuf';

export async function bootstrap(
	registrationUrl: string | undefined,
	keyPath: string | undefined,
	dest: string | undefined,
	nonce: string | undefined
) {
	if (registrationUrl && keyPath && dest && nonce) {
		const response = await axios.get(registrationUrl, { params: { nonce: nonce } });
		if (response.data.success) {
			const key = vpuf.createKey(keyPath);
			vpuf.encryptBodyData(response.data, key, dest);
		} else {
			throw Error('Failed to get identity');
		}
	} else {
		throw Error('One or all of the env variables are not provided: --key_file, --registration_url, --dest, --nonce');
	}
}
