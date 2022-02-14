import axios from 'axios';
import * as vpuf from '../vpuf/vpuf';

export async function bootstrap(url: string, keyPath: string, dest: string): Promise<void> {
	const data = await axios.get(url);
	const key = vpuf.createKey(keyPath);
	const encryptedData = vpuf.encryptBodyData(data, key, dest);
}
