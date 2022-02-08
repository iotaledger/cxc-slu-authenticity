import axios from 'axios';
import * as vpuf from '../vpuf/vpuf';

async function bootstrap(): Promise<void> {
	const url: string | undefined = process.env.URL;
	const keyPath: string | undefined = process.env.KEY;
	const dest: string | undefined = process.env.DEST;

	try {
		if (url && keyPath && dest) {
			const data = axios.get(url);
			const key = vpuf.createKey(keyPath);
			const encryptedData = vpuf.encryptBodyData(data, key, dest);
			console.log(encryptedData);
		} else {
			throw Error('One of the following env variables are not declared: URL, KEY, DEST');
		}
	} catch (ex: any) {
		console.log(ex.message);
	}
}
