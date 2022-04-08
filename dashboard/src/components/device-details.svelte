<script lang="ts">
	import type { Device } from '$lib/device/types';
	import { getStatus, getDeviceNonce, getDeviceDetails } from '$lib/device';
	import {
		authenticationData,
		BoxColor,
		ChannelMessages,
		Icon,
		startReadingChannel,
		selectedChannelData,
		stopReadingChannel,
		getSubscriptions,
		ChannelSubscriptions,
		Subscription
	} from '@iota/is-ui-components';
	import { onDestroy, onMount } from 'svelte';

	export let device: Device = {};

	let status: string;
	let subscriptions: any;
	let nonce: string;
	onMount(async () => {
		let deviceDetails = await getDeviceDetails(device.id, device.channelAddress);
		status = deviceDetails?.status;
		subscriptions = deviceDetails?.subscriptions;
		nonce = deviceDetails?.nonce;
	});

	onDestroy(() => {
		stopReadingChannel();
	});
</script>

<div class="identity-details w-100">
	<div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4">
		<div class="d-flex align-items-center">
			<Icon size={64} boxed boxColor={BoxColor.Green} type="nut" />
			<div class="ms-4 me-4">
				<div class="fw-bold text-break">{device.id}</div>
				<div class="text-secondary fst-italic mt-1 text-break">Nonce: {nonce ?? '-'}</div>
				<div class="text-secondary fst-italic mt-1 text-break">Status: {status ?? '-'}</div>
			</div>
		</div>
	</div>
	<!-- TODO: improve channel prop -->
	<ChannelSubscriptions
		{subscriptions}
		channel={{ topics: [], name: '', channelAddress: '', authorId: $authenticationData?.did }}
	/>
	<div class="p-4 text-break">
		<div>Messages</div>
		<ChannelMessages channelData={$selectedChannelData} />
	</div>
</div>
