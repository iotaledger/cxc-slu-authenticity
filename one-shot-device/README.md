<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

One-Shot-Device is a microservice that allow the creator to register and authenticate devices to the

## Installation

CD to the one-shot-device directory and install by running:

```bash
$ npm install
```

Copy .env.example and change it's name to .env. After that provide values for the variables inside it accordingly.

Here is an example how a correct .evn file should look like:

```bash
MONGO_URL="mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
DB_NAME=slu

IS_API_KEY=94F5BA49-12A6-4E45-A487-BF91C442276D
IS_API_URL=http://localhost:3033

SLU_STATUS_URL=http://localhost:3000
SLU_STATUS_API_KEY=94F5BA49-12A6-4E45-A487-BF91C442276D

PORT=8088
```

## Running the app

```bash
$ npm run start
```

## Using the One-Shot-Device microservice

<br>

`Using Postman`

First import the Postman collection located in the `one-shot-device/postman collection`. To do that open the `File` menu, then `Import` and navigate to the microservice directory and choose `authorize-device-to-channel.postman_collection.json` and click `Import`. Make sure you provide values for the variables accordingly:

- `one-shot-device-url`: base url to the one-shot device microservice, i.e: `http://localhost:8080/api/v1/one-shot-device`
- `api-key`: you can use the following the API key: `94F5BA49-12A6-4E45-A487-BF91C442276D`
- `is-url`: base url for the Integration Services microservice, i.e: `localhost:3099/api/v0.1`

Once it is done, follow these steps to create a channel and register the device:

1. In the `Identities` tab:
   click the `Create managers id` and send the POST request, it its response look for the value `id` and copy it into the collection variable called `manager_id`. You need to also securely store the value of `secret` to be used in the next step.

2. In the `Authentication` tab:
   click on the `Prove manager's id` and sent the GET request. It returns you a nonce that you can store in the collection variables. Next in the terminal navigate to the `nonce-signer` folder:
   ```bash
    $ cd nonce-signer
   ```
   There run the following commands:
   ```bash
   $ npm install
   $ npm run start
   ```
