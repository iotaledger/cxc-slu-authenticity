import {bootstrap} from '../bootstrap'
import axios from 'axios';
import * as fs from 'fs';
import * as vpuf from '../../vpuf/vpuf'

jest.mock('axios')

describe('bootstrap on device', () => {
    const url = process.env.URL='/'
    const keyPath = process.env.KEY='../../vpuf/tests/data/unclonable.txt'
    const dest = process.env.DEST='../../vpuf/tests/data'

    it('should get and encrypt data', async () => {
   
        const body: any = {
            nonce: "anyNonce",
            channelId: "did:iota:121",
            channelSeed: "string",
            identityKeys: "IdentityKeys"
        }
        axios.get = jest.fn().mockResolvedValue(body)

        await bootstrap(url, keyPath, dest);

        const encryptedData = fs.readFileSync(process.env.DEST + '/data.json.enc', 'utf-8');
        expect(encryptedData).not.toBeUndefined();
        expect(encryptedData).not.toBeNull();

        const key = vpuf.createKey(keyPath);
        const data = vpuf.decrypt(encryptedData, key);
        const toBeBody = JSON.stringify(body);
        expect(data).toBe(toBeBody);

    })

    it('should fail to bootstrap: wrong file path', async () =>  {
        const wrongKey = '../../vpuf/tests/data/unclonable.ts';
        const msg = "ENOENT: no such file or directory, open '../../vpuf/tests/data/unclonable.ts'";
        try{
            await bootstrap(url, wrongKey, dest);
        }catch(ex: any){
            expect(ex.message).toBe(msg)
        }
    })

    it('should fail to bootstrap: no env var provided', async () =>  {
        const noKey = '';
        const msg = 'One or all of the env variables are not provided: --key_file, --registration_url, --dest';
        try{
            await bootstrap(url, noKey, dest);
        }catch(ex: any){
            expect(ex.message).toBe(msg);
        }
    })
})
