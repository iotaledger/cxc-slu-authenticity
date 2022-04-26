import * as fs from 'fs';
import { execSync } from 'child_process';
import 'dotenv/config'

const keyFile = process.env.KEY_FILE;
const sendAuthInterval = process.env.SEND_AUTH_INTERVAL;
const inputEnc = process.env.INPUT_ENC;
const collectorBaseUrl = process.env.COLLECTOR_BASE_URL;
const isApiKey = process.env.IS_API_KEY;
const isBaseUrl = process.env.IS_BASE_URL;
const isAuthUrl = process.env.IS_AUTH_URL;
const jwt = process.env.JWT;
const sendDataInterval = process.env.SEND_DATA_INTERVAL;
const dataLocation = process.env.DATA_LOCATION;


function runSendProof() {
    if (keyFile && sendAuthInterval && inputEnc && collectorBaseUrl) {

        try {
            const identity = fs.readFileSync(inputEnc, 'utf-8');
            const vpuf = fs.readFileSync(keyFile, 'utf-8');

            execSync(`cd ~/cxc-slu-authenticity/slu-scripts && npm run send-proof --key_file=${keyFile} --interval=${sendAuthInterval} --input_enc=${inputEnc} --collector_base_url=${collectorBaseUrl}`);
        }
        catch (ex) {
            fs.writeFileSync('log.txt',new Date().toUTCString() + ': ' + 'No identity or vpuf provided \n', { flag: 'a' });
            process.exit(1);
        }
    } else {
        fs.writeFileSync('log.txt', new Date().toUTCString() + ': ' + 'No all env vars are provided for sending authentication proof \n', { flag: 'a' });
        process.exit(1);
    }
}

function sendData() {

    if (keyFile && inputEnc && isApiKey && isBaseUrl && sendDataInterval && collectorBaseUrl && isAuthUrl && jwt && dataLocation) {
        execSync(`cd ~/cxc-slu-authenticity/slu-scripts && npm run send-data --key_file=${keyFile} --interval=${sendDataInterval} --input_enc=${inputEnc} --collector_base_url=${collectorBaseUrl} --is_api_key=${isApiKey} --is_base_url=${isBaseUrl} --is_auth_url=${isAuthUrl} --jwt=${jwt}`);
    }
    else {
        fs.writeFileSync('log.txt', new Date().toUTCString() + ': ' + 'Not all env vars are provided for sending the data \n', { flag: 'a' });
        process.exit(1);
    }

}

runSendProof();
sendData();


