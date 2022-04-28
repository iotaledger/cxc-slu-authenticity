import { ApiVersion, ClientConfig } from '@iota/is-client';

let jwt = '';

function setJwt(value: string) {
	jwt = value;
}

let currentSensorData = '';

function setSensorData(value: any) {
	currentSensorData = value;
}

function getClientConfiguration(isApiKey: string, isBaseUrl: string): ClientConfig {
	return {
		apiKey: isApiKey,
		isGatewayUrl: isBaseUrl,
		apiVersion: ApiVersion.v01
	};
}

export { jwt, setJwt, getClientConfiguration, currentSensorData, setSensorData };
