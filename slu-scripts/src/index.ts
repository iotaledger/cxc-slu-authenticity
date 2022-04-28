#!/usr/bin/env node
import * as fs from 'fs';
import yargs from 'yargs';
import { encryptData, decryptAndSendProof } from './auth-proof/auth-proof';
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
			.option('input_enc', { describe: 'The location of the encrypted device identity.' })
			.option('collector_base_url', { describe: 'The url of the collector microservice.' })
	)
	.command('bootstrap', 'Requests the nonce from one-shot-device microservice and saves it encrypted on the device.', (yargs) => {
		yargs
			.option('key_file', { describe: 'The location of the key file.' })
			.option('dest', { describe: 'The destination where the encrypted data has to be stored.' })
			.option('one_shot_device_url', { describe: 'The url endpoint of .../api/v1/one-shot-device/bootstrap' })
			.option('nonce', { describe: 'Nonce of the device' });
	})
	.command('send-data', 'Send sensor data to integration service', (yargs) =>
		yargs
			.option('key_file', { describe: 'The location of the key file.' })
			.option('input_enc', { describe: 'The location of the encrypted device identity.' })
			.option('is_api_key', { describe: 'Api key of the integration services' })
			.option('is_base_url', { describe: 'The base url of the integration services' })
			.option('interval', {
				describe: 'The interval in millisecond during data is written to the channel and send to the collector',
				default: '300000'
			})
			.option('collector_base_url', { describe: 'The url of the collector microservice.' })
			.option('is_auth_url', { describe: 'The integration services authentication url for post request to get a jwt token' })
			.option('sensor_data', { describe: 'Path to the sensor data of the device' })
	)
	.help().argv;

export async function execScript(argv: any) {
	const keyFilePath: string | undefined = process.env.npm_config_key_file;
	const inputData: string | undefined = process.env.npm_config_input;
	const destination: string | undefined = process.env.npm_config_dest;
	const interval: string | undefined = process.env.npm_config_interval;
	const collectorBaseUrl: string | undefined = process.env.npm_config_collector_base_url;
	const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
	const oneShotDeviceUrl: string | undefined = process.env.npm_config_one_shot_device_url;
	const isApiKey: string | undefined = process.env.npm_config_is_api_key;
	const isBaseUrl: string | undefined = process.env.npm_config_is_base_url;
	const isAuthUrl: string | undefined = process.env.npm_config_is_auth_url;
	const nonce: string | undefined = process.env.npm_config_nonce;
	const sensorDataPath: string | undefined = process.env.npm_config_sensor_data;

	if (argv._.includes('encrypt')) {
		try {
			encryptData(keyFilePath, inputData, destination);
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else if (argv._.includes('send-proof')) {
		try {
			if (interval) {
				setInterval(async () => await decryptAndSendProof(encryptedDataPath!, keyFilePath!, collectorBaseUrl!), Number(interval));
			} else {
				throw Error('No --interval in ms provided.');
			}
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else if (argv._.includes('bootstrap')) {
		try {
			await bootstrap(oneShotDeviceUrl, keyFilePath, destination, nonce);
		} catch (ex: any) {
			console.error(ex.message);
			process.exit(1);
		}
	} else if (argv._.includes('send-data')) {
		try {
			if (interval) {
				setInterval(
					async () => await sendData(encryptedDataPath, keyFilePath, isApiKey, isBaseUrl, collectorBaseUrl, sensorDataPath, isAuthUrl),
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
