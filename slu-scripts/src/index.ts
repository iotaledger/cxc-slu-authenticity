import yargs from 'yargs';
import { encryptData, decryptData, sendAuthProof } from './auth-proof/auth-proof';

const argv = yargs
	.command('encrypt', 'Encrypt for encrypting')
	.command('send-proof', 'Decrypt data and send auth proof of device')
	.help().argv;

export async function sendingProof() {
	if (argv._.includes('encrypt')) {
		const keyFilePath: string | undefined = process.env.npm_config_key;
		const inputData: string | undefined = process.env.npm_config_input;
		const destination: string | undefined = process.env.npm_config_dest;
		try {
			encryptData(keyFilePath, inputData, destination);
		} catch (ex: any) {
			console.log(ex.message);
		}
	} else if (argv._.includes('send-proof')) {
		const interval: string | undefined = process.env.npm_config_interval;
		const requestUrl: string | undefined = process.env.npm_config_url;
		const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
		const keyFilePath: string | undefined = process.env.npm_config_key;
		try {
			const decryptedData = await decryptData(encryptedDataPath, keyFilePath);
			if (decryptedData && interval) {
				setInterval(sendAuthProof, Number(interval), decryptedData, requestUrl);
			} else {
				console.log('No decrypted data provided or no interval in ms provided.');
			}
		} catch (ex: any) {
			console.log(ex.message);
		}
	} else {
		yargs.showHelp('log');
	}
}

sendingProof();
