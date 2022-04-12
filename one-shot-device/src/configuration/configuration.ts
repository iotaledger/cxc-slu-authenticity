import { ApiVersion, ClientConfig } from '@iota/is-client';
import * as dotenv from 'dotenv';

dotenv.config();

export const defaultConfig: ClientConfig = {
	apiKey: process.env.IS_API_KEY,
	isGatewayUrl: process.env.IS_API_URL,
	apiVersion: ApiVersion.v01
};
