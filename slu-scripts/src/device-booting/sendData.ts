import * as fs from 'fs';
import { execSync } from 'child_process';
import 'dotenv/config'

const keyFile = process.env.KEY_FILE;
const inputEnc = process.env.INPUT_ENC;
const isApiKey = process.env.IS_API_KEY;
const isBaseUrl = process.env.IS_BASE_URL;
const isAuthUrl = process.env.IS_AUTH_URL;
const sendDataInterval = process.env.SEND_DATA_INTERVAL;
const sensorData = process.env.SENSOR_DATA;
const collectorBaseUrl = process.env.COLLECTOR_BASE_URL;
const scriptsPath = process.env.SCRIPTS_PATH;

function sendData() {

    if (keyFile && inputEnc && isApiKey && isBaseUrl && sendDataInterval && collectorBaseUrl && isAuthUrl && sensorData) {
        try{
            fs.readFileSync(inputEnc, 'utf-8');
            fs.readFileSync(keyFile, 'utf-8');
            execSync(`cd ${scriptsPath} && npm run send-data --key_file=${keyFile} --interval=${sendDataInterval} --input_enc=${inputEnc} --collector_base_url=${collectorBaseUrl} --is_api_key=${isApiKey} --is_base_url=${isBaseUrl} --is_auth_url=${isAuthUrl} --sensor_data=${sensorData}`);
        }catch(ex: any){
            fs.writeFileSync('log.txt',new Date().toUTCString() + ': ' + ex + '\n', { flag: 'a' });
            process.exit(1);
        }     
    }
    else {
        fs.writeFileSync('log.txt', new Date().toUTCString() + ': ' + 'Not all env vars are provided for sending the data \n', { flag: 'a' });
        process.exit(1);
    }

}

sendData();