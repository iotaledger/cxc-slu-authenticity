<script lang="ts">
	import { getDeviceDetails } from '$lib';
	import type { Device } from '$lib/types';
	import {
		authenticationData,
		BoxColor,
		ChannelMessages,
		ChannelSubscriptions,
		Icon,
		selectedChannelData,
		stopReadingChannel
	} from 'boxfish-studio--is-ui-components';
	import { onDestroy, onMount } from 'svelte';

	export let device: Device = {};

	let status: string;
	let subscriptions: any;
	let nonce: string;
	let isAuthentic: boolean = false;

	onMount(async () => {
		let deviceDetails = await getDeviceDetails(device.id, device.channelAddress);
		status = deviceDetails?.status;
		subscriptions = deviceDetails?.subscriptions;
		nonce = deviceDetails?.nonce;
		isAuthentic = deviceDetails?.isAuthentic;
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
				<div class="fw-bold text-break">{device?.id}</div>
				<div class="text-secondary fst-italic mt-1 text-break">Nonce: {nonce ?? '-'}</div>
				<div class="text-secondary fst-italic mt-1 text-break">Status: {status ?? '-'}</div>
				<div class="text-secondary fst-italic mt-1 text-break">
					Is authentic: {isAuthentic}
				</div>
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
