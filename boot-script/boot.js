
const fs = require('fs');
const { execSync } = require('child_process');

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
            const vpuf = fs.readFile(keyFile, 'utf-8');

            execSync(`npm run --key_file=${key_file} --interval=${sendAuthInterval} --input_enc=${inputEnc} --colelctor_base_url=${collectorBaseUrl}`);
        }
        catch (ex) {
            fs.writeFileSync('log.txt', 'No identity or vpuf provided', {flag: 'a'});
            process.exit(1);
        }
    } else {
        fs.writeFileSync('log.txt', 'No all env vars are provided for sending authentication proof \n');
        process.exit(1);
    }
}

function sendData(){

    if(keyFile && inputEnc && isApiKey && isBaseUrl && sendDataInterval && collectorBaseUrl && isAuthUrl && jwt && dataLocation){
            execSync(`npm run --key_file=${key_file} --interval=${sendDataInterval} --input_enc=${inputEnc} --colelctor_base_url=${collectorBaseUrl} --is_api_key=${isApiKey} --is_base_url=${isBaseUrl} --is_auth_url=${isAuthUrl} --jwt=${jwt}`);
    }
    else{
        fs.writeFileSync('log.txt', 'Not all env vars are provided for sending the data \n', {flag: 'a'});
        process.exit(1);
    }

}

runSendProof();
sendData();


