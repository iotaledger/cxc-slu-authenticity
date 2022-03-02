import { ApiVersion, ClientConfig } from 'iota-is-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export const defaultConfig: ClientConfig = {
	apiKey: process.env.API_KEY,
	baseUrl: process.env.API_URL,
	apiVersion: ApiVersion.v01
};
