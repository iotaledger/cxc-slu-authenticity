<script lang="ts">
	import type { Device } from '$lib/device/types';
	import { getStatus, getDeviceNonce } from '$lib/device';
	import {
		authenticationData,
		BoxColor,
		ChannelMessages,
		Icon,
		startReadingChannel,
		selectedChannelData
	} from '@iota/is-ui-components';
	import { onMount } from 'svelte';
	export let device: Device = {};
	export let channelAddress: string = '';

	let status: string = '';
	let nonce: string = '';
	onMount(async () => {
		status = await getStatus(device.id);
		nonce = await getDeviceNonce(device.id, $authenticationData?.did);
		console.log('Reading channel', channelAddress);
		startReadingChannel(channelAddress);
	});
</script>

<div class="identity-details w-100">
	<div class="d-xl-flex align-items-center justify-content-between bg-light rounded p-4">
		<div class="d-flex align-items-center">
			<Icon size={64} boxed boxColor={BoxColor.Green} type="nut" />
			<div class="ms-4 me-4">
				<div class="fw-bold text-break">ID: {device.id}</div>
				<div class="text-secondary fst-italic mt-1 text-break">STATUS: {status}</div>
			</div>
		</div>
	</div>
	<div class="p-4 text-break">NONCE: {nonce}</div>
	<ChannelMessages channelData={$selectedChannelData} />
</div>
