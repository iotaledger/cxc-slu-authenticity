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
		startReadingChannel,
		stopReadingChannel
	} from '@iota/is-ui-components';
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
			<Icon size={32} boxed boxColor={BoxColor.Transparent} type="person-badge" />
			<div class="ms-4 me-4">
				<div>
					<div class="fw-bold text-break">{device?.id}</div>
					<div class="pills">
						{#if status}
							<Badge pill color="primary">{status}</Badge>
						{/if}
						<Badge pill color={`${isAuthentic ? 'success' : 'danger'}`}>
							{!isAuthentic ? 'Not authentic' : 'Authentic'}
						</Badge>
					</div>
				</div>
			</div>
		</div>
	</div>
	{#if nonce}
		<div class="bg-light rounded px-4 pt-3 pb-4">
			<div class="text-primary">Nonce</div>
			<div>
				{nonce}
			</div>
		</div>
	{/if}
	{#if device.channelAddress}
		<div class="bg-light rounded px-4 pt-3 pb-4">
			<div class="text-primary">Related channel address</div>
			<div class="text-break">
				{device.channelAddress}
			</div>
		</div>
	{/if}
	<!-- TODO: improve channel prop -->
	<ChannelSubscriptions
		{subscriptions}
		channel={{ topics: [], name: '', channelAddress: '', authorId: $authenticationData?.did }}
	/>
	<div class="pt-4 text-break">
		<h5>Messages</h5>
		<ChannelMessages channelData={$selectedChannelData} />
	</div>
</div>

<style lang="scss">
	.pills {
		text-transform: capitalize;
	}
</style>
