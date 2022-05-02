## Description

Authenticity Collector is a microservice that saves the authentication proof of the devices of CityXChange. Furthermore it writes the sensor data, which is send by the device, to his own channel and sends it also to MPower.

<p align="center">
  <img src="./authenticity-collector-diagram.png" alt="authenticity-collector-microservice diagram"/>
</p>

## Installation

CD to the authenticity-collector directory and install by running:

```bash
$ npm install
$ npm run build
```

## Running the app

```bash
$ npm run start
```

## Using the Authenticity-Collector microservice

For using the service you need to create an identity for the collector so it is possible to create and write to his own channel. Then you need to provide the id and the secret for COLLECTOR_DID and COLLECTOR_SECRET of the identity in the .env file of the docker-compose.yml.
On startup of the service it checks if the id and secret is provided and if the service has already one channel. If there is no channel it will automatically create one.

We have two different endpoints:

1. The `identity service` has two methods:

- `POST /api/v1/authenticity/prove` - to send the authentication proof of the device

- `GET /api/v1/authenticity/prove` - to get the database entries between a timeframe by providing query with "id","from" and "to"

2. The `sludata service` has one method:

- `POST /api/v1/authenticity/data` - to write the sensor data to the collector channel and sending it to MPower
