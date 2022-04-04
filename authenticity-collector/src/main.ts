import { NestFactory } from '@nestjs/core';
import { IdentityClient, User } from 'iota-is-sdk/lib';
import { AppModule } from './app.module';
import { ChannelSubscriptionService } from './channel-subscription/channel-subscription.service';

let identityClient: IdentityClient;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.port || 3000);
	checkCollectorIdentity();
	const channelSubscription = app.get(ChannelSubscriptionService);
	identityClient = app.get('IdentityClient');
	channelSubscription.channelSubscription();
}
async function checkCollectorIdentity(){
	if(!process.env.COLLECTOR_DID || !process.env.COLLECTOR_SECRET){
		const collectorId: User = (await identityClient.search({ username: 'cxc-authenticity-collector-id' })) as unknown as User;
		if(collectorId){
			process.env.COLLECTOR_DID = collectorId.id;
		}

	}
	
}

bootstrap();

