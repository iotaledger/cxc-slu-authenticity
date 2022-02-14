#!/usr/bin/env node
import yargs from 'yargs';
import { encryptData, decryptData, sendAuthProof } from './auth-proof/auth-proof';

const argv = yargs
	.command('encrypt', 'Encrypting data')
	.option('key_file',{describe: 'The location of the key file.'})
	.option('input',{describe: 'The location of the data to encrypt.'})
	.option('dest', {describe: 'The destination where the encrypted data has to be stored.'})
	.command('send-proof', 'Decrypt data and send auth proof of device')
	.option('key_file',{describe: 'The location of the key file.'})
	.option('interval', {describe: 'The interval in millisecond during requests to the collector microservice are done.'})
	.option('input_enc', {describe: 'The location of the encrypted data.'})
	.option('collector_url', {describe: 'The url of the microservice collector'})
	.help().argv;

export async function sendingProof() {
	if (argv._.includes('encrypt')) {
		const keyFilePath: string | undefined = process.env.npm_config_key_file;
		const inputData: string | undefined = process.env.npm_config_input;
		const destination: string | undefined = process.env.npm_config_dest;
		try {
			encryptData(keyFilePath, inputData, destination);
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1)
		}
	} else if (argv._.includes('send-proof')) {
		const interval: string | undefined = process.env.npm_config_interval;
		const requestUrl: string | undefined = process.env.npm_config_collector_url;
		const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
		const keyFilePath: string | undefined = process.env.npm_config_key_file;
		try {
			const decryptedData = await decryptData(encryptedDataPath, keyFilePath);
			if (decryptedData && interval) {
				setInterval(sendAuthProof, Number(interval), decryptedData, requestUrl);
			} else {
				console.log('No --input_enc or no --interval in ms provided.');
			}
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1)
		}
	} else {
		yargs.showHelp('log');
	}
}

sendingProof();
