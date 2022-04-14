## SLU-Scripts

The slu-scripts folder provides multiple scripts which can 
 + encrypt data
 + bootstraping the device by requesting the identity and save it encrypted on the device
 + sending authentication proof of the device
 + send the sensor data to the authenticity-collector service where it is written into the collecor channel and write it to the channel of the device.

To use the scripts run first:
```
npm run install
npm run build
```

The above listed scripts can then be run via the following commands:

1. encrypting a file:

```
npm run encrypt-file
 --key_file: The key file used to encrypt/decrypt the data 
 --input: Location of the data that should be encrypted
 --dest: Location where the encrypted data should be saved
```

Example:

```
npm run encrypt-file --key_file=./test-data/unclonable.txt --input=./test-data/data.json
--dest=./test-data
```

2. bootstraping a device:
 
 ```
npm run bootstrap
 --key_file: The key file used to encrypt/decrypt the data 
 --dest: Location where the encrypted data should be saved
 --one-shot-device-url: The url endpoint of the one-shot-device to get the device identity
 --nonce: Nonce of the device
```

Example:
```
npm run bootstrap --key_file=./test-data/unclonable.txt --dest=./test-data 
--one-shot-device-url=http://localhost:3000/api/v1/one-shot-device --nonce=46f45a2c-114a-4cea-a570-b379fe3a4a95
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

 Example:
```

npm run send-proof --key_file=./test-data/unclonable.txt --interval=240000 --input_enc=./test-data/data.json.enc
--collector_base_url=http://localhost:3000/api/v1/authenticity 

```
 <p align="center">
  <img src="https://github.com/iotaledger/cxc-slu-authenticity/blob/69-description-of-slu-scripts/slu-scripts/diagrams/send-proof.png" alt="auth-proof-script sequence diagram"/>
</p>
 

4. sending sensor data:

```
npm run send-data
 --key_file: The key file used to encrypt/decrypt the data.
 --input_enc: The location of the encrypted device identity.
 --interval: Interval in milliseconds during the data is written into the channel and send to the slu-status microservice. 
 --collector_base_url: The base url of the authenticity-collector microservice.
 --is_api_key: The api key of the integration services
 --is_base_url: The base url of the integration services
 --jwt: The jwt token of the device to verify itslef by the authenticity-collector microservice.
 --is_auth_url: The integration services authentication url for post request to get a jwt token
```

 Example:
```

npm run send-proof --key_file=./test-data/unclonable.txt  --input_enc=./test-data/data.json.enc --interval=480000
--collector_base_url=http://localhost:3000/api/v1/authenticity --is_api_key=b85e51a2-9981-11ec-8770-4b8f01948e9b --is_base_url=https://demo-integration-services.iota.cafe 
--is_auth_url=https://demo-integration-services.iota.cafe/api/v0.1/authentication/prove-ownership --jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6RDlOamhYTU1kRW1MNER6M3hZdDlrRWttZm5wUHlVa0F1OWRDRVNNaTU3cGEiLCJwdWJsaWNLZXkiO
iJGQ2NuMnZEZk5YeGdiR1JmWjZ4M0IxZlltZEdIRXFIUnNGYm9iZnc5aGpYRiIsInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0ODgxMzk2MCwiZXhwIj
oxNjQ4OTAwMzYwfQ.lR0PMq5_Q0NM_-NTHyoTMUeusGZ8w_y0pncVtwb5wPM

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





