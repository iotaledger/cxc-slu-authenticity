import { CreateDeviceRegistrationDto as dto } from './dto/create-device-registration.dto';
export const mockDeviceRegistration: dto | any = {
	identityKeys: {
		id: 'did:iota:5qmWjFWcqE3BNTB9KNCBH6reXEgig4gFUXiPENywB3wo',
		key: {
			type: 'ed25519',
			public: 'BKU1cLqakKrN9g4ridQ6z5NyHqA7vZLLqmAygwDrSeex',
			secret: '9EXX7aqBKGpBBDvy7ND65PvHe2DHwZrq7ZLorzE8ZDvv',
			encoding: 'base58'
		}
	},
	channelSeed: 'jldirikybrxczxlhhswzikqhsafjdzejjacoqaymzmoffdrwrzmytolrwuyhwoweybnzofew',
	channelId: 'f48875646434e9b12019d2290bd74f0f4eae8393ada3b503202dfc713f0323070000000000000000:3cce98eb1742468ff35fde6b',
	nonce: '1b0e4a49-3a23-4e7e-99f4-97fda845ff02'
};

export const mockFaultyDeviceRegistrationObject: any = {
	identityKeys: {
		id: 'did:iota:5qmWjFWcqE3BNTB9KNCBH6reXEgig4gFUXiPENywB3wo',
		key: {
			type: 'ed25519',
			public: 'BKU1cLqakKrN9g4ridQ6z5NyHqA7vZLLqmAygwDrSeex',
			secret: '9EXX7aqBKGpBBDvy7ND65PvHe2DHwZrq7ZLorzE8ZDvv',
			encoding: 'base58'
		}
	},
	channelSeed: 'jldirikybrxczxlhhswzikqhsafjdzejjacoqaymzmoffdrwrzmytolrwuyhwoweybnzofew',
	channelId: 'f48875646434e9b12019d2290bd74f0f4eae8393ada3b503202dfc713f0323070000000000000000:3cce98eb1742468ff35fde6b'
};

export const nonceMock = '1b0e4a49-3a23-4e7e-99f4-97fda845ff02';
export const badNonceMock = '1b0e4a49-BaDD-Baddy-99f4-97fda845ff02';
