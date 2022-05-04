# Demo

```
http POST localhost:3000/api/v1/one-shot-device/create/60203be82813d1bcaf78dc697c26426903dd9b2ae13d09044d693bb5bbcc3bb20000000000000000:701d72c1f67d49c28933ad75/did:iota:D9NjhXMMdEmL4Dz3xYt9kEkmfnpPyUkAu9dCESMi57pa
```

returns

```
{
    "channelAddress": "60203be82813d1bcaf78dc697c26426903dd9b2ae13d09044d693bb5bbcc3bb20000000000000000:701d72c1f67d49c28933ad75",
    "id": "did:iota:Efoo3ckLcJTSyzVHqTgZ1Cq46A5vGG6r6ALXoQqyJ1vE",
    "nonce": "4f841f35-bcd0-4b46-a167-922fac8f933c",
    "success": true
}
{
    "channelAddress": "60203be82813d1bcaf78dc697c26426903dd9b2ae13d09044d693bb5bbcc3bb20000000000000000:701d72c1f67d49c28933ad75",
    "id": "did:iota:45tbUuWyr6P3dUka8ZxAvPYin16Jt9D7WqijzbhLWDfq",
    "nonce": "50e0c82d-0e94-4042-9817-1d82baba7839",
    "success": true
}
```

```
http://localhost:3000/api/v1/slu-nonce/<identity>/did:iota:D9NjhXMMdEmL4Dz3xYt9kEkmfnpPyUkAu9dCESMi57pa X-API-KEY:<apikey>
```

returns

```
{
    "creator": "did:iota:D9NjhXMMdEmL4Dz3xYt9kEkmfnpPyUkAu9dCESMi57pa",
    "nonce": "4f841f35-bcd0-4b46-a167-922fac8f933c",
    "sluId": "did:iota:Efoo3ckLcJTSyzVHqTgZ1Cq46A5vGG6r6ALXoQqyJ1vE"
}
```


Get nonce (if you are the creator)

http POST http://localhost:3000/api/v1/slu-nonce/did:iota:D9NjhXMMdEmL4Dz3xYt9kEkmfnpPyUkAu9dCESMi57pa X-API-KEY:foobar sluIds[]=did:iota:Efoo3ckLcJTSyzVHqTgZ1Cq46A5vGG6r6ALXoQqyJ1vE sluIds[]=did:iota:45tbUuWyr6P3dUka8ZxAvPYin16Jt9D7WqijzbhLWDfq

[
    {
        "creator": "did:iota:D9NjhXMMdEmL4Dz3xYt9kEkmfnpPyUkAu9dCESMi57pa",
        "nonce": "4f841f35-bcd0-4b46-a167-922fac8f933c",
        "sluId": "did:iota:Efoo3ckLcJTSyzVHqTgZ1Cq46A5vGG6r6ALXoQqyJ1vE"
    },
    {
        "creator": "did:iota:D9NjhXMMdEmL4Dz3xYt9kEkmfnpPyUkAu9dCESMi57pa",
        "nonce": "50e0c82d-0e94-4042-9817-1d82baba7839",
        "sluId": "did:iota:45tbUuWyr6P3dUka8ZxAvPYin16Jt9D7WqijzbhLWDfq"
    }
]


________________________________________________________________________________________________________________________________

# TESTS REQUIREMENTS AND STEPS FOR THE SEND-DATA SCRIPT:

# Manual steps:

    1.  Create an identity
        ```
        http POST localhost:3000/api/v1/one-shot-device/create/60203be82813d1bcaf78dc697c26426903dd9b2ae13d09044d693bb5bbcc3bb20000000000000000:701d72c1f67d49c28933ad75/did:iota:D9NjhXMMdEmL4Dz3xYt9kEkmfnpPyUkAu9dCESMi57pa
        ```
        returns for example:

            {
            "success": true,
             "nonce": "46f45a2c-114a-4cea-a570-b379fe3a4a95",
             "channelAddress": "60203be82813d1bcaf78dc697c26426903dd9b2ae13d09044d693bb5bbcc3bb20000000000000000:701d72c1f67d49c28933ad75",
             "id": "did:iota:5o8mejo8b4bzpbzS8zZ5YtmP8Tmj1xPidYUXGxz9TdfN"
            } 

    2. Now the new created identity must be authorised to write into the channel             60203be82813d1bcaf78dc697c26426903dd9b2ae13d09044d693bb5bbcc3bb20000000000000000:701d72c1f67d49c28933ad75.
     This can be done with our new created CLI. We skip how to do it here to make this instructions not too long. The CLI is easy to use. Later it is done by the manager through the UI.

    3. In the next step we first need to run the bootstrap-script with the nonce of our new created identity in the first step:

    The --nonce in this example is from the identity above. If new identity is created --nonce should be exchanged with the nonce of the new identity

    NOTICE: Once the bootstrap script is run. You can't use the nonce of the identity anymore because it is deleted on the DB by one-shot-device. So it is just a initial step from the beginning. If you already bootstraped one identity from    one-shot-device and saved it under data.json.enc you can just proceed with step 4.

    The bootstrap script will get the identity, encrypt it and save it under --dest=./test-data  named 'data.json.enc'.

    ````
        npm run bootstrap --key-file=./test-data/unclonable.txt --dest=./test-data --one_shot_device_url=http://localhost:3000/api/v1/one-shot-device/bootstrap --nonce=46f45a2c-114a-4cea-a570-b379fe3a4a95
    ``` 

    4. Now we can run the send-data script:

        ####First we need an jwt token. This can be done with this small function in a node script: 

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

                The JWT_SECRET in dokcer-compose.yml is the JWT_SECRET key from the integration-service. If you run it locally you should know it. If using https://demo-integration-services.iota.cafe there should be one defined of whom I am not aware of now. But is needed to verify the jwt by the collector middleware.

    ``` 
        npm run send-data --key-file=./test-data/unclonable.txt --input_enc=./test-data/data.json.enc --is_api_key=b85e51a2-9981-11ec-8770-4b8f01948e9b --is_base_url=https://demo-integration-services.iota.cafe --interval=30000 --collector_base_url=http://localhost:3000/authenticity --is_auth_url=https://demo-integration-services.iota.cafe --jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6RDlOamhYTU1kRW1MNER6M3hZdDlrRWttZm5wUHlVa0F1OWRDRVNNaTU3cGEiLCJwdWJsaWNLZXkiOiJGQ2NuMnZEZk5YeGdiR1JmWjZ4M0IxZlltZEdIRXFIUnNGYm9iZnc5aGpYRiIsInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0ODgxMzk2MCwiZXhwIjoxNjQ4OTAwMzYwfQ.lR0PMq5_Q0NM_-NTHyoTMUeusGZ8w_y0pncVtwb5wPM'

    ```


