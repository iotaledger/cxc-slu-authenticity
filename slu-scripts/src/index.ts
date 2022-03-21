#!/usr/bin/env node
import yargs from 'yargs';
import { encryptData, decryptData, sendAuthProof } from './auth-proof/auth-proof';
import { bootstrap } from './bootstrap/bootstrap';
import { sendData } from './sensor-data/sensor-data';

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
			.option('interval', {
				describe: 'The interval in millisecond during requests to the collector microservice are done.',
				default: '600000'
			})
			.option('input_enc', { describe: 'The location of the encrypted data.' })
			.option('collector_base_url', { describe: 'The url of the collector microservice.' })
	)
	.command('bootstrap', 'Requests the nonce from device registration microservice and saves it encrypted on the device.', (yargs) => {
		yargs
			.option('key_file', { describe: 'The location of the key file.' })
			.option('dest', { describe: 'The destination where the encrypted data has to be stored.' })
			.option('reqistration_url', { describe: 'The url of device registration microservice.' })
			.option('nonce', { describe: 'Nonce of the device' });
	})
	.command('send-data', 'Send sensor data to integration service', (yargs) =>
		yargs
			.option('key_file', { describe: 'The location of the key file.' })
			.option('input_enc', { describe: 'The location of the encrypted data.' })
			.option('config', { describe: 'Location of configuration file for the integration service.' })
			.option('interval', { describe: 'The interval in millisecond during data is written to the channel', default: '300000' })
			.option('collector_base_url', { describe: 'The url of the collector microservice.' })
			.option('is_auth_url', { describe: 'The integration services authentication url for post request to get an auth token' })
			.option('api_key', { describe: 'Api key for integration services' })
			.option('jwt', { describe: 'JWT of the device' })
	)
	.help().argv;

export async function execScript(argv: any) {
	const keyFilePath: string | undefined = process.env.npm_config_key_file;
	const inputData: string | undefined = process.env.npm_config_input;
	const destination: string | undefined = process.env.npm_config_dest;
	const interval: string | undefined = process.env.npm_config_interval;
	const collectorBaseUrl: string | undefined = process.env.npm_config_collector_base_url;
	const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
	const registrationUrl: string | undefined = process.env.npm_config_registration_url;
	const isConfigFile: string | undefined = process.env.npm_config_is_config_file;
	const isAuthUrl: string | undefined = process.env.npm_config_is_auth_url;
	const apiKey: string | undefined = process.env.npm_config_api_key;
	const nonce: string | undefined = process.env.npm_config_nonce;
	const jwt: string | undefined = process.env.npm_config_jwt;

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
			if (interval) {
				setInterval(() => sendAuthProof(decryptedData!, collectorBaseUrl), Number(interval));
			} else {
				throw Error('No --interval in ms provided.');
			}
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else if (argv._.includes('bootstrap')) {
		try {
			await bootstrap(registrationUrl, keyFilePath, destination, nonce);
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else if (argv._.includes('send-data')) {
		try {
			if (interval) {
				let payloadObject: any;
				try {
					payloadObject = await JSON.parse('{"temperature": "100 degree"}');
				} catch (e: any) {
					console.error(e.message);
					throw new Error('Could not parse payload, please provide an object as a string');
				}
				setInterval(
					() => sendData(encryptedDataPath, keyFilePath, isConfigFile, collectorBaseUrl, payloadObject, isAuthUrl, apiKey, jwt),
					Number(interval)
				);
			} else {
				throw Error('No --interval in ms.');
			}
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else {
		yargs.showHelp('log');
	}
}

execScript(argv);
