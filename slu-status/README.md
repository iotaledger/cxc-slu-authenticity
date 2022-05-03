## Slu-Status Microservice

The slu-status microservice stores the status and nonce of devices. 
Currently one device can have two different statuses: "created" and "installed". When a device is created by the creator the status is automatically set to "created" by the one-shot-device microservice and is changed to "installed" when the bootstrap script has run. 
The nonce is also set by the one-shot-device microservice when one device is created.


<p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/68-api-reference-slu-status/slu-status/diagrams/slu-status.png" alt="slu-status diagram"/>
</p>


The functionalities of each module is provided in this image:

<p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/68-api-reference-slu-status/slu-status/diagrams/slu-status-module.png" alt="slu-status modules diagram"/>
</p>


## Local Setup

# Download the project

1. Clone the project:
````
git clone https://github.com/iotaledger/cxc-slu-authenticity.git
````

2. Go to the slu-status directory:
```
cd slu-status
```

3. Create an .env file where you provide for example the following variables:
````
API_KEY=2b3fe07d-b7db-49cb-8300-d32139e3d435
DATABASE_URL=mongodb://root:rootpassword@mongo:27017
DATABASE_NAME=slu-status
PORT:3000
````

If the endpoints are tested manually provide one header "X-API-KEY" with the API-KEY value of the .env file.

4. Install and build the project:
````
npm install
npm run build
````

5. Run the service:
````
npm run start
````

