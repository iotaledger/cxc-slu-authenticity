import * as fs from 'fs'
import axios from 'axios';
import * as authProof from '../auth-proof'
import * as enc from '../encrypt-data'


jest.mock('axios');

describe('Encrypt data', () => {
 

    it('should send auth proof each ms', async () => {
        const response = {
			data: {
                success: true
			},
			headers: {},
			config: { url: 'http://localhost:3000/mockUrl' },
			status: 200,
			statusText: 'OK'
		};

        axios.post = jest.fn().mockResolvedValue(response);

        enc.encryptData();
        await authProof.decryptData();
        const res = authProof.sendAuthProof();

        //expect(res).toBe(200)

    });


    afterAll(() => {
        //fs.rmSync(process.env.DEST! + '/data.json.enc');
    })
})
