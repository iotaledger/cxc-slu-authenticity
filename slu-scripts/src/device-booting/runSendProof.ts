import * as fs from 'fs';
import 'dotenv/config';
import { decryptAndSendProof } from '../auth-proof/auth-proof';

const keyFile = process.env.KEY_FILE;
const sendAuthInterval = process.env.SEND_AUTH_INTERVAL;
const inputEnc = process.env.INPUT_ENC;
const collectorBaseUrl = process.env.COLLECTOR_BASE_URL;

export function runSendProof(
	keyFile: string,
	sendAuthInterval: string,
	inputEnc: string,
	collectorBaseUrl: string
) {
	if (keyFile && sendAuthInterval && inputEnc && collectorBaseUrl) {
		try {
			fs.readFileSync(inputEnc, 'utf-8');
			fs.readFileSync(keyFile, 'utf-8');
			setInterval(async () => await decryptAndSendProof(inputEnc, keyFile, collectorBaseUrl), Number(sendAuthInterval));
		} catch (ex) {
			fs.writeFileSync('log-cxc.txt', new Date().toUTCString() + ': ' + ex + '\n', { flag: 'a' });
			process.exit(1);
		}
	} else {
		fs.writeFileSync('log-cxc.txt', new Date().toUTCString() + ': ' + 'Not all env vars are provided for sending authentication proof \n', {
			flag: 'a'
		});
		process.exit(1);
	}
}

export function execute() {
	runSendProof(keyFile!, sendAuthInterval!, inputEnc!, collectorBaseUrl!);
}
