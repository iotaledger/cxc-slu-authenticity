import { CreateDeviceRegistrationDto as dto } from './dto/create-device-registration.dto';
// import { CreateChannelResponse } from '@iota/is-client';
// import { IdentityJson } from '@iota/is-client';

const generateDid = () => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < 44; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

export const mockDeviceRegistration: dto | any = {
	identityKey: {
		id: `did:iota:${generateDid()}`,
		key: {
			type: 'ed25519',
			public: 'BKU1cLqakKrN9g4ridQ6z5NyHqA7vZLLqmAygwDrSeex',
			secret: '9EXX7aqBKGpBBDvy7ND65PvHe2DHwZrq7ZLorzE8ZDvv',
			encoding: 'base58'
		}
	},
	channelSeed: 'jldirikybrxczxlhhswzikqhsafjdzejjacoqaymzmoffdrwrzmytolrwuyhwoweybnzofew',
	channelAddress: 'f48875646434e9b12019d2290bd74f0f4eae8393ada3b503202dfc713f0323070000000000000000:3cce98eb1742468ff35fde6b',
	nonce: '1b0e4a49-3a23-4e7e-99f4-97fda845ff02',
	subscriptionLink: 'somesubscriptionlink'
};

export const mockFaultyDeviceRegistrationObject: dto | any = {
	identityKey: {
		id: 'did:iota:5qmWjFWcqE3BNTB9KNCBH6reXEgig4gFUXiPENywB3wo',
		key: {
			type: 'ed25519',
			public: 'BKU1cLqakKrN9g4ridQ6z5NyHqA7vZLLqmAygwDrSeex',
			secret: '9EXX7aqBKGpBBDvy7ND65PvHe2DHwZrq7ZLorzE8ZDvv',
			encoding: 'base58'
		}
	},
	channelSeed: 'jldirikybrxczxlhhswzikqhsafjdzejjacoqaymzmoffdrwrzmytolrwuyhwoweybnzofew',
	channelAddress: 'f48875646434e9b12019d2290bd74f0f4eae8393ada3b503202dfc713f0323070000000000000000:3cce98eb1742468ff35fde6b'
};

export const nullIdentityDeviceRegistrationObject: dto | any = {
	identityKey: null,
	channelSeed: 'jldirikybrxczxlhhswzikqhsafjdzejjacoqaymzmoffdrwrzmytolrwuyhwoweybnzofew',
	channelAddress: 'f48875646434e9b12019d2290bd74f0f4eae8393ada3b503202dfc713f0323070000000000000000:3cce98eb1742468ff35fde6b',
	nonce: '1b0e4a49-3a23-4e7e-99f4-97fda845ff02'
};
export const nonceMock = '1b0e4a49-3a23-4e7e-99f4-97fda845ff02';
export const badNonceMock = '1b0e4a49-BaDD-Baddy-99f4-97fda845ff02';

export const identityMock: any = {
	doc: {
		id: `did:iota:${generateDid()}`,
		authentication: [[Object]],
		created: '2022-02-16T22:12:10Z',
		updated: '2022-02-16T22:12:10Z',
		proof: {
			type: 'JcsEd25519Signature2020',
			verificationMethod: '#key',
			signatureValue: '3qMsZZk7UEs4qiJANLqzdARwqFYdUYVgNLWZ6cshqH6pKtUs1iBEDXdaK7rXk8cxdvGVJUaRMcSmp1qEKaGdP9CX'
		}
	},
	key: {
		type: 'ed25519',
		public: 'DZvBAbf8SJHKtJgjSRy5QmUNFxstS2CBGZu2n9sGLxs',
		secret: '4VMHqY95kvNjxsW9aqEpa1Nnthf4UAxQvZiosFsGNMnp',
		encoding: 'base58'
	}
};

export const channelMock: any = {
	channelAddress: 'ed1ff8060f52f4c49dadf1a499a5ef81e5293eed161a5cb2ca4cee6b33d348ef0000000000000000:ae2c58ed2f980fbb5697be94',
	seed: 'ewlvmojzfcopwliaufpfhjcidzrlmqhzhdmfxxulctunidgznyhxepzshyjxqpagkhxwrypq'
};

export const authorizedChannelMock =
	'2e7c282c139005009b07676a0ad19f3ae504324002429116615723f4b1e990e10000000000000000:c748edb3fc0c987b407bc617';

export const subscriptionLinkMock =
	'4d56da7f5cbfd2d6dc6770fea092ce83a536000134a2f6ac0f9f93c999ca628b0000000000000000:bfd017e56cc902e843b5aaa9';

export const seedMock = 'obhzpqhoquayrsqosxdschwwuahecnrfrqyavetiobjkwetcxsuizfxxuktutqumqgvtdczz';

export const requestSubscription = {
	seed: 'exahojwtaoagvitcnlptjdamkmpyccyseeywibtvjncskpfjxblobnixyuvdjamrzmvwzqhd',
	subscriptionLink: '4d56da7f5cbfd2d6dc6770fea092ce83a536000134a2f6ac0f9f93c999ca628b0000000000000000:92139169668861075929845e'
};
