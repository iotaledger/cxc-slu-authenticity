<script lang="ts">
	import { getDeviceDetails } from '$lib/device';
	import type { Device } from '$lib/device/types';
	import {
		authenticationData,
		BoxColor,
		ChannelMessages,
		ChannelSubscriptions,
		Icon,
		selectedChannelData,
		startReadingChannel,
		stopReadingChannel
	} from 'boxfish-studio--is-ui-components';
	import { onDestroy, onMount } from 'svelte';
	import { Badge } from 'sveltestrap';

	export let device: Device = {};

	let status: string;
	let subscriptions: any;
	let nonce: string;
	let isAuthentic: boolean = false;

	onMount(async () => {
		const deviceDetails = await getDeviceDetails(device.id, device.channelAddress);
		status = deviceDetails?.status;
		subscriptions = deviceDetails?.subscriptions;
		nonce = deviceDetails?.nonce;
		isAuthentic = deviceDetails?.isAuthentic;
		startReadingChannel(device.channelAddress);
	});

	onDestroy(() => {
		stopReadingChannel();
	});
</script>

<div class="identity-details w-100">
	<div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4">
		<div class="d-flex align-items-center">
			<Icon size={64} boxed boxColor={BoxColor.Green} type="nut" />
			<div class="details ms-4 me-4">
				<div>
					<div class="fw-bold text-break">{device?.id}</div>
					<Badge pill color="primary">Nonce: {nonce ?? '-'}</Badge>
					<Badge pill color="dark">{status ?? '-'}</Badge>
					<Badge pill color="secondary">Is authentic: {isAuthentic}</Badge>
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

<style lang="scss">
	.details {
		width: 100%;
		display: flex;
		flex-direction: column;
		@media (min-width: 1024px) {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}
	}
</style>
