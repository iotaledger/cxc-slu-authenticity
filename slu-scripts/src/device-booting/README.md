## Scripts which aim to run during the startup of the device

We start with the general requirements. If the device is set up you can go to the end of the file for one specific example with our deployed instances https://demo.integration-services.cafe and https://cxc.is.iota.cafe. 

# Requirements:

1. Create a file in the root of the Rapsberry Pi.
`````
touch .env
`````
2. Fill the .env file with the necessary variables for running the scripts.

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
and here we paste the commands. Configure the paths if you have stored the project somewhere else on the device.
````
sudo node -e 'require("./home/pi/cxc-slu-authenticity/slu-scripts/dist/src/device-booting/runSendProof").execute()' &
sudo node -e 'require("./home/pi/cxc-slu-authenticity/slu-scripts/dist/src/device-booting/runSendData").execute()' &
````

6. It maybe necessary to give execute rights. For that go to the folder (dist/src/device-booting) of the the transpiled scripts  or use the relative path  and give the rights:
````
sudo chmod +x runSendData.js
sudo chmod +x runSendProof.js
````

7. Before rebooting the scripts you need to bootstrap the device with the bootstrap script.
```
npm run bootstrap --key_file=<Path to the key file> --dest=<Path where to store the ecnrypted device identity> 
--one_shot_device_url=< The bootstrap url of the one-shot-device microservice> --nonce= <Nonce of the device>
```

8. Now you can reboot the device and the script will execute when the device boots up.
````
sudo reboot
````


## Example

The scripts can be tested with our currently deployed instances. 


1. Go to https://cxc.is.iota.cafe , login and create a device.

2. Click on the device and copy the nonce.

3. Now run the bootstrap script on the Raspberry Pi with the copied nonce. For that you must be in the slu-scripts folder.
````
npm run bootstrap --key_file=./test-data/unclonable.txt --dest=./test-data 
--one_shot_device_url=https://cxc.is.iota.cafe/api/v1/one-shot-device/bootstrap --nonce= < your copied nonce >
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

6. In the dashboard you will see the sensor data written to the channel of the device and the badge 'Not Authentic' should change to 'Authentic'. If the data will not change the script won't send the data again. Because we use a static file in our ecxample you can simple change the value of the sensorData.json in the test-data folder without rebooting. After the interval period you should see the new data in the messages of the device in the dashboard. 
