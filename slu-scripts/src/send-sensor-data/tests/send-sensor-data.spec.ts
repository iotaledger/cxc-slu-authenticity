import { encryptData, decryptData } from "../../auth-proof/auth-proof"
import { sendData } from "../send-sensor-data";
import { ClientConfig, ChannelClient, ChannelData} from 'iota-is-sdk'
import fs from 'fs'
import { createKey, decrypt } from '../../vpuf/vpuf'


const keyFilePath: string | undefined = process.env.npm_config_key_file;
const inputData: string | undefined = process.env.npm_config_input;
const destination: string | undefined = process.env.npm_config_dest;
const interval: string | undefined = process.env.npm_config_interval;
const collectorUrl: string | undefined = process.env.npm_config_collector_url;
const encryptedDataPath: string | undefined = process.env.npm_config_input_enc;
const registrationUrl: string | undefined = process.env.npm_config_registration_url;
const isConfiguration: string | undefined = process.env.npm_config_config;
describe('Send sensor data tests', () => {
    it('should send data', async () => {
        encryptData(keyFilePath, inputData, destination)
        const dataString = fs.readFileSync(inputData!, 'utf-8');
        const data = JSON.parse(dataString)
        const channelData: ChannelData = {
            link: "",
            imported: "",
            messageId: "",
            log: {
                payload: ""
            }
        }
        const autheticateSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValue();
        const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData)
        const response = await sendData(encryptedDataPath, keyFilePath, isConfiguration)
        expect(autheticateSpy).toHaveBeenCalledWith(data.identity.doc.id, data.identity.key.secret);
        expect(writeSpy).toHaveBeenCalledWith(data.channelAddress, { payload: { temperature: "60 degrees" } })
        expect(response).toBe(channelData)
    })
})
afterAll(() => {
	try{
		fs.rmSync(destination! + '/data.json.enc');
	}catch(ex: any){
		
	}
});
