## How to use the environment variable file with jest for One-Shot-Device Microservice

To run the tests for One-Shot-Device Microservice you need to copy the example.setEnvVars.ts

```bash
cp example.setEnvVars.ts .setEnvVars.ts
```

and populate the fields:

process.env.SLU_STATUS_API_KEY = 'SLU-STATUS MS api-key'; - a string with api-key value of the slu-status microservice

process.env.MONGO_URL = 'MONGO DB url'; - a string with the url to your MongoDB database

process.env.DB_NAME = 'slu'; - the default name of the MongoDB database for the CxC slu authenticity,

process.env.IS_API_URL = 'INTEGRATION-SERVICE url'; - a string with api-key value of the Integration Service API

process.env.SLU_STATUS_URL = 'SLU-STATUS MS url'; - a string with the base url for SLU-Status Microservice

process.env.PORT = 'ONE-SHOT-DEVICE MS port'; - same port as One-Shot-Device Microservice is using

## Test

```bash
# unit tests

$ npm run test

# e2e tests

$ npm run test:e2e

# test coverage

$ npm run test:cov
```
