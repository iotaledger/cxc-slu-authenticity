#!/usr/bin/env node
import yargs from 'yargs';
import { encryptData, decryptData, sendAuthProof } from './auth-proof/auth-proof';
import { bootstrap } from './bootstrap/bootstrap';

const argv = yargs
	.command('encrypt', 'Encrypting data', (yargs) =>
		yargs
			.option('key_file', { describe: 'The location of the key file.' })
			.option('input', { describe: 'The location of the data to encrypt.' })
			.option('dest', { describe: 'The destination where the encrypted data has to be stored.' })
	)
	.command('send-proof', 'Decrypt data and send auth proof of device', (yargs) =>
		yargs
			.option('key_file', { describe: 'The location of the key file.' })
			.option('interval', { describe: 'The interval in millisecond during requests to the collector microservice are done.' })
			.option('input_enc', { describe: 'The location of the encrypted data.' })
			.option('collector_url', { describe: 'The url of the collector microservice.' })
	)
	.command('bootstrap', 'Requests the nonce from device registration microservice and saves it encrypted on the device.', (yargs) => {
		yargs
			.option('key_file', { describe: 'The location of the key file.' })
			.option('dest', { describe: 'The destination where the encrypted data has to be stored.' })
			.option('reqistration_url', { describe: 'The url of device registration microservice.' });
	})
	.help().argv;

export async function execScript(argv: any) {
	const keyFilePath: string | undefined = process.env.npm_config_key_file;
	const inputData: string | undefined = process.env.npm_config_input;
	const destination: string | undefined = process.env.npm_config_dest;
	const interval: string | undefined = process.env.npm_config_interval;
	const collectorUrl: string | undefined = process.env.npm_config_collector_url;
	const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
	const registrationUrl: string | undefined = process.env.npm_config_registration_url;
	if (argv._.includes('encrypt')) {
		try {
			encryptData(keyFilePath, inputData, destination);
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else if (argv._.includes('send-proof')) {
		try {
			const decryptedData = await decryptData(encryptedDataPath, keyFilePath);
			if (decryptedData && interval) {
				setInterval(sendAuthProof, Number(interval), decryptedData, collectorUrl);
			} else {
				throw Error('No --input_enc or no --interval in ms provided.');
			}
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else if (argv._.includes('bootstrap')) {
		try {
			await bootstrap(registrationUrl, keyFilePath, destination);
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else {
		yargs.showHelp('log');
	}
}

execScript(argv);
