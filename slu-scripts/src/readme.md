# Requirements and steps in order to run the slu-scripts:

1) Create one identity with the one-shot-device service via postman or how you like.

2) Run the bootstrap script with the nonce of the created identity (exchange the nonce here with your nonce):

````
npm run bootstrap --key-file=./test-data/unclonable.txt --dest=./test-data --one_shot_device_url=http://localhost:3000/api/v1/one-shot-device/bootstrap --nonce=46f45a2c-114a-4cea-a570-b379fe3a4a95

````

3) Run the authentication process with send-proof:

``` 
npm run send-proof --key_file=./test-data/unclonable.txt --input_enc=./test-data/data.json.enc --collector_base_url=http://localhost:3000/api/v1/authenticity

`````

# 4) run the send-data process:

 First we need an jwt token. This can be done with this small function in a node script: 

 !!!!!!!Exchange the url  and api-key with your local integration service url and api-key!!!!!!!

    '''
         Provide here id and keySecret from your new created Identitiy. Request the identtiy doc with the IS-CLI if needed. 
          
        const fetchAuth = async (id, keySecret) => {
            console.log('requesting nonce to sign...');
            const apiKey = '?api-key=b85e51a2-9981-11ec-8770-4b8f01948e9b';
            const url = `https://demo-integration-services.iota.cafe/api/v0.1/authentication/prove-ownership/${id}${apiKey}`;

            const res = await axios.get(url);
            if (res.status !== 200) {
                console.error('didnt receive status 200 on get request for prove-ownership!');
                return;
                }
            const body = await res.data;
            const nonce = body.nonce;
            console.log('received nonce: ', nonce);

            const encodedKey = await getHexEncodedKey(keySecret);
            const signedNonce = await signNonce(encodedKey, nonce);
            console.log('signed nonce: ', signedNonce);

            console.log('requesting authentication token using signed nonce...', id);

            const response = await axios.post(`https://demo-integration-services.iota.cafe/api/v0.1/authentication/prove-ownership/${id}${apiKey}`, JSON.stringify({ signedNonce }), {
                 method: 'post',
                headers: { 'Content-Type': 'application/json' }
                });
            console.log(response.data)
        };


    After getting the jwt token with the above provided'fetchAuth' function run this sen-data script:

        What it does is to write this data into his channel and send the slu-data to the collector where the collector additionally writes this data to his channel. If during this request the auth-proof or jwt expired the slu either approves itself again or creates a new jwt token by his own and send the data again. 

        Notice:
                 --interval is set to 30s. Adjust it on your behalf.
                In the docker-compose.yml you can adjust the 'AUTH_PROVE_EXPIRATION' under authenticity-collector

                The JWT_SECRET in docker-compose.yml is the JWT_SECRET key from the integration-service. If you run it locally you should know it. If using https://demo-integration-services.iota.cafe there should be one defined of whom I am not aware of now. But is needed to verify the jwt by the collector middleware.

    
    ``` 
    Here again exchange is_base_url, is_auth_url with your IS and also the --is_api_key
    Set the --jwt you have received from calling the above mentioned function 'fetchAuth'

        npm run send-data --key-file=./test-data/unclonable.txt --input_enc=./test-data/data.json.enc --is_api_key=b85e51a2-9981-11ec-8770-4b8f01948e9b --is_base_url=https://demo-integration-services.iota.cafe --interval=30000 --collector_base_url=http://localhost:3000/authenticity --is_auth_url=https://demo-integration-services.iota.cafe --jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6RDlOamhYTU1kRW1MNER6M3hZdDlrRWttZm5wUHlVa0F1OWRDRVNNaTU3cGEiLCJwdWJsaWNLZXkiOiJGQ2NuMnZEZk5YeGdiR1JmWjZ4M0IxZlltZEdIRXFIUnNGYm9iZnc5aGpYRiIsInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0ODgxMzk2MCwiZXhwIjoxNjQ4OTAwMzYwfQ.lR0PMq5_Q0NM_-NTHyoTMUeusGZ8w_y0pncVtwb5wPM'

    ```