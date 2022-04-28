import * as fs from 'fs';
import { execSync } from 'child_process';
import 'dotenv/config'

const keyFile = process.env.KEY_FILE;
const sendAuthInterval = process.env.SEND_AUTH_INTERVAL;
const inputEnc = process.env.INPUT_ENC;
const collectorBaseUrl = process.env.COLLECTOR_BASE_URL;
const scriptsPath = process.env.SCRIPTS_PATH;

function runSendProof() {
    if (keyFile && sendAuthInterval && inputEnc && collectorBaseUrl) {
        try {
            fs.readFileSync(inputEnc, 'utf-8');
            fs.readFileSync(keyFile, 'utf-8');
            execSync(`cd ${scriptsPath} && npm run send-proof --key_file=${keyFile} --interval=${sendAuthInterval} --input_enc=${inputEnc} --collector_base_url=${collectorBaseUrl}`);
        }
        catch (ex) {
            fs.writeFileSync('log.txt',new Date().toUTCString() + ': ' + ex + '\n', { flag: 'a' });
            process.exit(1);
        }
    } else {
        fs.writeFileSync('log.txt', new Date().toUTCString() + ': ' + 'Not all env vars are provided for sending authentication proof \n', { flag: 'a' });
        process.exit(1);
    }
}

runSendProof();


