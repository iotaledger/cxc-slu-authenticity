import { ApiVersion, ClientConfig } from '@iota/is-client';

export const defaultConfig: ClientConfig = {
	apiKey: process.env.IS_API_KEY,
	isGatewayUrl: process.env.IS_API_URL,
	apiVersion: ApiVersion.v01
};