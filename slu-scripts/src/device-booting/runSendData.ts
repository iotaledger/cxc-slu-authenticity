import * as fs from 'fs';
import 'dotenv/config';
import { sendData } from '../sensor-data/sensor-data';

const keyFile = process.env.KEY_FILE;
const inputEnc = process.env.INPUT_ENC;
const isApiKey = process.env.IS_API_KEY;
const isBaseUrl = process.env.IS_BASE_URL;
const isAuthUrl = process.env.IS_AUTH_URL;
const sendDataInterval = process.env.SEND_DATA_INTERVAL;
const sensorData = process.env.SENSOR_DATA;
const collectorBaseUrl = process.env.COLLECTOR_BASE_URL;

export function runSendData(
	keyFile: string,
	inputEnc: string,
	isApiKey: string,
	isBaseUrl: string,
	isAuthUrl: string,
	sendDataInterval: string,
	sensorData: string,
	collectorBaseUrl: string,
) {
	if (keyFile && inputEnc && isApiKey && isBaseUrl && sendDataInterval && collectorBaseUrl && isAuthUrl && sensorData) {
		try {
			fs.readFileSync(inputEnc, 'utf-8');
			fs.readFileSync(keyFile, 'utf-8');
			setInterval(
				async () => await sendData(inputEnc, keyFile, isApiKey, isBaseUrl, collectorBaseUrl, sensorData, isAuthUrl),
				Number(sendDataInterval)
			);
		} catch (ex: any) {
			fs.writeFileSync('log-cxc.txt', new Date().toUTCString() + ': ' + ex + '\n', { flag: 'a' });
			process.exit(1);
		}
	} else {
		fs.writeFileSync('log-cxc.txt', new Date().toUTCString() + ': ' + 'Not all env vars are provided for sending the data \n', { flag: 'a' });
		process.exit(1);
	}
}

export function execute() {
	runSendData(keyFile!, inputEnc!, isApiKey!, isBaseUrl!, isAuthUrl!, sendDataInterval!, sensorData!, collectorBaseUrl!);
}
