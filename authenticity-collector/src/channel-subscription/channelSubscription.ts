import { ChannelClient, ChannelInfo } from 'iota-is-sdk';
import { defaultConfig } from '../configuration/configuration';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

export async function channelSubscription() {
	try {
		const collectorJson = fs.readFileSync(process.env.COLLECTOR_ID, 'utf-8');
		const collector = JSON.parse(collectorJson);
		const channelClient = new ChannelClient(defaultConfig);
		await channelClient.authenticate(collector.doc.id, collector.key.secret);
		const channelInfo: ChannelInfo[] = await channelClient.search({ authorId: collector.doc.id });
		if (channelInfo.length != 0) {
			console.log(channelInfo[0].channelAddress);
		} else {
			await channelClient.create({
				topics: [{ type: 'slu-data', source: 'slu' }]
			});
		}
	} catch (ex: any) {
		console.error(ex.message);
	}
}
