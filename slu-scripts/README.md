## SLU-Scripts

The slu-scripts folder provides multiple scripts which can 
 + encrypt data
 + bootstraping the device by requesting the identity and save it encrypted on the device
 + sending authentication proof of the device
 + send the sensor data to the authenticity-collector service where it is written into the collecor channel and write it to his own channel.


The above listed scripts can run via the following commands:

1. encrypting a file:

```
npm run encrypt-file
 --key_file: The key file used to encrypt/decrypt the data 
 --input: Location of the data that should be encrypted
 --dest: Location where the encrypted data should be saved
```

2. bootstraping a device:
 
 ```
npm run bootstrap
 --key_file: The key file used to encrypt/decrypt the data 
 --dest: Location where the encrypted data should be saved
 --one-shot-device-url: The url endpoint of the one-shot-device to get the device identity by providing the nonce as the paramter of the url
 --nonce: Nonce of the device
```

<p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/69-description-of-slu-scripts/slu-scripts/diagrams/sequence1.png" alt="bootstrap-script sequence diagram"/>
</p>

 
3. sending authentication proof:

```
npm run send-proof
 --key_file: The key file used to encrypt/decrypt the data 
 --interval: Interval in milliseconds during the proof is send to the authenticity-collecotr microservice. 
 --input_enc: The location of the encrypted device identity.
 --collector_base_url: The base url of the authenticity-collector microservice
 ```
 <p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/69-description-of-slu-scripts/slu-scripts/diagrams/send-proof.png" alt="auth-proof-script sequence diagram"/>
</p>
 

4. sending sensor data:

```
npm run send-data
 --key_file: The key file used to encrypt/decrypt the data.
 --input_enc: The location of the encrypted device identity.
 --interval: Intervalmilliseconds during the data is written into the channel and send to the slu-status microservice. 
 --collector_base_url: The base url of the authenticity-collector microservice.
 --is_api_key: The api key of the integration services
 --is_base_url: The base url of the integration services
 --jwt: The jwt token of the device to verify itslef by the authenticity-collector microservice.
 --is_auth_url: The integration services authentication url for post request to get a jwt token
```
 <p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/69-description-of-slu-scripts/slu-scripts/diagrams/send-data%20(3).png" alt="auth-proof-script sequence diagram"/>
</p>

If the device authentication expired, the device will authenticate itself again and try to send the data again:

 <p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/69-description-of-slu-scripts/slu-scripts/diagrams/send-data-with-retry%20(2).png" alt="auth-proof-script sequence diagram"/>
</p>

if the jwt token expires, the device will request a new one from the integration services and try to send the data again:

 <p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/69-description-of-slu-scripts/slu-scripts/diagrams/send-data-with-jwt-retry.png" alt="auth-proof-script sequence diagram"/>
</p>

The options for each command are not optional and are required.
For more information about the available commands and options you can run:

```
npm run -- --help
```





