import {bootstrap} from '../bootstrap'
import axios from 'axios';
import * as fs from 'fs';
import * as vpuf from '../../vpuf/vpuf'

jest.mock('axios')

describe('bootstrap on device', () => {

    it('should get and encrypt data', async () => {
        process.env.URL='/'
	    process.env.KEY='../../vpuf/tests/data/unclonable.txt'
	    process.env.DEST='../../vpuf/tests/data'
        const body: any = {
            nonce: "anyNonce",
            channelId: "did:iota:121",
            channelSeed: "string",
            identityKeys: "IdentityKeys"
        }
        axios.get = jest.fn().mockResolvedValue(body)

        await bootstrap();

        const encryptedData = fs.readFileSync(process.env.DEST + '/data.json.enc', 'utf-8');
        expect(encryptedData).not.toBeUndefined();
        expect(encryptedData).not.toBeNull();

        const key = vpuf.createKey(process.env.KEY);
        const data = vpuf.decrypt(encryptedData, key);
        const toBeBody = JSON.stringify(body);
        expect(data).toBe(toBeBody);

    })

    it('should fail to bootstrap: wrong file path', async () =>  {
        process.env.KEY='../../vpuf/tests/data/unclonable.ts';
        const consoleSpy = jest.spyOn(console, 'log');
        const msg = "ENOENT: no such file or directory, open '../../vpuf/tests/data/unclonable.ts'";

        await bootstrap();
     
        expect(consoleSpy).toHaveBeenLastCalledWith(msg);
    })

    it('should fail to bootstrap: no env var provided', async () =>  {
        process.env.KEY='';
        const consoleSpy = jest.spyOn(console, 'log');
        const msg = 'One of the following env variables are not declared: URL, KEY, DEST';

        await bootstrap();
     
        expect(consoleSpy).toHaveBeenLastCalledWith(msg);
    })


    
})
