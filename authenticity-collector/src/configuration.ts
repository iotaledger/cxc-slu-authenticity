import { ApiVersion, ClientConfig } from '@iota/is-client';

export const defaultConfig: ClientConfig = {
	apiKey: process.env.IS_API_KEY,
	// auditTrailUrl: process.env.IS_API_URL + "/audit-trail-gw",
	// ssiBridgeUrl: process.env.IS_API_URL + "/ssi-bridge",
	isGatewayUrl: process.env.IS_API_URL,
	apiVersion: ApiVersion.v01
};