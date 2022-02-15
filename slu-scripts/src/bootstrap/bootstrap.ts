import axios from 'axios';
import * as vpuf from '../vpuf/vpuf'

export async function bootstrap(registrationUrl: string | undefined, keyPath: string | undefined, dest: string | undefined): Promise<void> {
	if (registrationUrl && keyPath && dest) {
		const data = await axios.get(registrationUrl);
		const key = vpuf.createKey(keyPath);
		vpuf.encryptBodyData(data, key, dest);
	} else {
		throw Error('One or all of the env variables are not provided: --key_file, --registration_url, --dest')
	}

}
