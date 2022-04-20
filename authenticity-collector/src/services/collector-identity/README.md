# Collector identity

The collector identity should be created before using this service with the CLI @iota/is-client.
Documentation how to use it is provided on https://www.npmjs.com/package/@iota/is-client.

If created the values "id" and "secret" of the identity should be provided via the env variables 
COLLECTOR_DID and COLLECTOR_SECRET.

If running the service standalone provide the env vars in the .env file of the service 
and if setup by docker-compose then provide them in the associated .env file of docker-compose.yml.