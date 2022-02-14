import { execSync } from 'child_process';
import * as fs from 'fs';
import { encryptData } from './auth-proof/auth-proof';

const keyFilePath: string | undefined = process.env.npm_config_key_file;
const inputDataPath: string | undefined = process.env.npm_config_input;
const destinationPath: string | undefined = process.env.npm_config_dest;
const requestUrl: string | undefined = process.env.npm_config_collector_url;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
describe('testing encrypt-file script', () => {
	it('should execute', () => {
		execSync('npm run encrypt-file --key_file=./test-data/unclonable.txt --input=./test-data/data.json --dest=./test-data');
		const encryptedData = fs.readFileSync(destinationPath + '/data.json.enc', 'utf-8');
		expect(encryptedData).not.toBeNull();
		expect(encryptedData).not.toBeUndefined();
		expect(encryptedData).toContain('U2FsdGVkX1');
	});

	it('should throw error', () => {
		try{
			execSync('npm run encrypt-file');
		}catch(ex:any){
			const error = Buffer.from(ex.message).toString('utf-8')
			const expectMessage = 'One or all of the env variables are not provided: --key_file, --input, --dest';
		    expect(error).toMatch(expectMessage);
		}
		
	});
	it('testing send-proof should throw error', () => {
		const data = encryptData(keyFilePath, inputDataPath, destinationPath);
		const buffer = execSync('npm run send-proof --collector_url=/ --key_file=./test-data/unclonable.txt --input_enc=./test-data/data.json.enc');
		const errorMessage = Buffer.from(buffer).toString('utf-8');
		expect(errorMessage).toMatch('No --input_enc or no --interval in ms provided.');
	});
});

afterAll(() => {
	fs.rmSync(destinationPath! + '/data.json.enc');
});
