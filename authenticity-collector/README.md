## Description

Authenticity Collector is a microservice that allows the creator manage the authentication proof of the devices in the CityXChange. It also connects to MPower connector microservice to receive and save sensor data. It uses Integration Services and IOTA SSI.

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

Then we have two services in the services folder. They are used when the microservices are starting. They used in main.ts. So collector-identity service checks if the collector_did and secret is provided and channel-subscription service checks if the collector has one channel already if not it creates one

We have two different endpoints one is the identity folder and the other sludata folder.

1. The identity service:
   has two method POST and GET. So POST is therefore that the device can send the authentication proof and GET to get the database entries between a timeframe. It is used in the dashboard for example to change the badge 'Not Authentic' to 'Authentic'

- POST /api/v1/authenticity/prove

- GET /api/v1/authenticity/prove

2. The sludata controller has one method POST where it first checks if the device is approved by requesting the database of the identity. If approved it send the data to MPOWER_CONNECTOR and writes the data of his own channel.

- POST /api/v1/authenticity/data
