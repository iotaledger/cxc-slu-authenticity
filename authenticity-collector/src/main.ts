import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ChannelClient } from 'iota-is-sdk';
import { defaultConfig } from './configuration/configuration';
import * as fs from 'fs';
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(4000);
}

async function channelSubscription(){
	const collectorJson = fs.readFileSync('./src/collector-did/collector-did.json', 'utf-8');
	const collector = JSON.parse(collectorJson);
	const channelClient = new ChannelClient(defaultConfig);
	channelClient.authenticate(collector.doc.id, collector.key.secret);
	try{
		const channel = await channelClient.create({
			topics: [{ type: 'example-data', source: 'data-creator' }]
		  });
		console.log(channel)
	}catch(ex: any){
		console.log(ex)
	}
}



bootstrap();
channelSubscription();
