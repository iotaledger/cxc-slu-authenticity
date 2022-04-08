## SLU-Scripts

The slu-scripts folder provides multiple scripts which can 
 + encrypt data
 + bootstraping the device by requesting the identity and save it encrypted on the device
 + sending authentication proof of the device
 + send the sensor data to the authenticity-collector service and write it to his own channel.


The above listed scripts can run via the following commands:

1. encrypting a file:

```
npm run encrypt-file
 --key_file: The key file used to encrypt the data 
 --input: Location of the data that should be encrypted
 --dest: Location where the encrypted data should be saved
```

2. bootstraping a device:
 
 ```
npm run bootstrap
 --key_file: The key file used to encrypt the data 
 --dest: Location where the encrypted data should be saved
 --one-shot-device-url: The url endpoint of the one-shot-device to get the device identity by providing the nonce as the paramter of the url
 --nonce: Nonce of the device
  ![alt text](../diagrams/sequence.png)
```
 ![alt text](https://github.com/iotaledger/cxc-slu-authenticity/blob/69-description-of-slu-scripts/slu-scripts/diagrams/sequence.png)

3. sending authentication proof:

```
npm run send-proof
 --key_file: The key file used to encrypt the data 
 --interval: Interval in milliseconds during the proof is send to the authenticity-collecotr microservice. HERE ist the default value 600000ms which are 10 minutes. 
 --input_enc: The location of the encrypted device identity.
 --collector_base_url: The base url of the authenticity-collector microservice
 ```

4. sending sensor data:

```
npm run send-data
 --key_file: The key file used to encrypt the data.
 --input_enc: The location of the encrypted device identity.
 --interval: Intervalmilliseconds during the data is written into the channel and send to the slu-status microservice. Here is the default value 300000ms which are 5 minutes.
 --collector_base_url: The base url of the authenticity-collector microservice.
 --is_api_key: The api key of the integration services
 --is_base_url: The base url of the integration services
 --jwt: The jwt token of the device to verify itslef by the authenticity-collector microservice.
```

The options for each command are not optional and are required but some have default values and are not of necessity to provide them. They will be highlighted out in the following documentation.

For more information about the available commands and options you can run:

```
npm run -- --help
```





