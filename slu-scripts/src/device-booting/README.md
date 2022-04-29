## Scripts which aim to run during the startup of the device

# Requirements:

1. Create a file in the root of the Rapsberry Pi.
`````
touch .env

`````
2. Fill the .env file withe the necessary variables for running the scripts.

````
KEY_FILE=<Absolute path to the key file>
SEND_AUTH_INTERVAL=<Interval during authenticatgion proof is send>
INPUT_ENC=<Absolute path to the encrypted device identity>
COLLECTOR_BASE_URL=<The base url of the authenticity-collector microservice>
SENSOR_DATA=<Absolute path to the stored data>
IS_API_KEY=<Api key of the integration-services>
IS_BASE_URL=<Base url of the integration-services>
IS_AUTH_URL=<The authentication url of the integration-services: BASE_URL + /api/v0.1/authentication/prove-ownership>
SEND_DATA_INTERVAL=<Interval during the data is send to the collector and is written into the device channel>
SCRIPTS_PATH=<Absolute path to the scripts folder of cxc-slu-authenticity project>
````

3. Get the project.

`````
git clone https://github.com/iotaledger/cxc-slu-authenticity.git

`````

4. Go to the slu-scripts folder of the project and install and build it.

````
npm install 
npm run build 
````

5. For the device to be able to run the script on startup we need to provide the commands in the rc.local file

````
sudo nano /etc/rc.local
````
and in that file we paste the commands
````
sudo node -e 'require("./home/pi/cxc-slu-authenticity/slu-scripts/dist/src/device-booting/runSendProof").execute()' &
sudo node -e 'require("./home/pi/cxc-slu-authenticity/slu-scripts/dist/src/device-booting/runSendData").execute()' &
````

6. It maybe necessary to give execute rights for that go the of the the transpiled scripts or use the relative path to them and give the rights:
````
sudo chmod +x runSendData.js
sudo chmod +x runSendProof.js
````

7. Before rebooting the scripts you need to bootstrap the device with the bootstrap script. How to do that is provided in the slu-scripts folder.

8. Now you can reboot the device and the script will execute when the device boots up.
````
sudo reboot
````


## Example

The scripts can be tested with our currently deployed instance. 


1. Go to https://cxc.is.iota.cafe , login and create a device.

2. Click on the device and copy the nonce.

3. Now run the bootstrap script on the Raspberry Pi with the copied nonce.
````
npm run bootstrap --key_file=./test-data/unclonable.txt --dest=./test-data --one_shot_device_url=https://cxc.is.iota.cafe/api/v1/one-shot-device/bootstrap --nonce= < your copied nonce >
````

4. One example for the .env file. Configure the paths and interval time if needed.
````
KEY_FILE=/home/pi/cxc-slu-authenticity/slu-scripts/test-data/unclonable.txt
SEND_AUTH_INTERVAL=42000
INPUT_ENC=/home/pi/cxc-slu-authenticity/slu-scripts/test-data/data.json.enc
COLLECTOR_BASE_URL=https://cxc.is.iota.cafe/api/v1/authenticity
SENSOR_DATA=/home/pi/cxc-slu-authenticity/slu-scripts/test-data/sensorData.json
IS_API_KEY=b85e51a2-9981-11ec-8770-4b8f01948e9b
IS_BASE_URL=https://demo-integration-services.iota.cafe
IS_AUTH_URL=https://demo-integration-services.iota.cafe/api/v0.1/authentication/prove-ownership
SEND_DATA_INTERVAL=30000
SCRIPTS_PATH=/home/pi/cxc-slu-authenticity/slu-scripts
````

5. reboot the device





