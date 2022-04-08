import { ApiVersion, ClientConfig } from 'iota-is-sdk/lib';

export const defaultConfig: ClientConfig = {
	apiKey: process.env.IS_API_KEY,
	baseUrl: process.env.IS_API_URL,
	apiVersion: ApiVersion.v01
};