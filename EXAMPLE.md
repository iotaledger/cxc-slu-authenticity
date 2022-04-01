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
