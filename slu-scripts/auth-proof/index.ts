import yargs from 'yargs';
import { decryptData, sendAuthProof } from './auth-proof';
import { encryptData } from './encrypt-data';

const argv = yargs.command('encrypt', 'Encrypt for encrypting', {}).command('setup-api', 'Setups the API', {}).help().argv;

// encrypt script in pkg.json
// node dist/intex.js encrypt
// --keys=easefa --interval=234234

if (argv._.includes('encrypt')) {
	// care about arguments here
	const keyFilePath: string | undefined = process.env.npm_config_keys;
	const interval: string | undefined = process.env.mpm_config_interval;
	const requestUrl: string | undefined = process.env.URL;
	encryptData();
} else if (argv._.includes('decrypt')) {
	// care about arguments here
	decryptData();
} else if (argv._.includes('proof')) {
	// care about arguments here
	sendAuthProof();
} else {
	yargs.showHelp();
}
